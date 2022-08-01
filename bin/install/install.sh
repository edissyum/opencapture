#!/bin/bash
# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

if [ "$EUID" -ne 0 ]; then
    echo "install.sh needed to be launch by user with root privileges"
    exit 1
fi

bold=$(tput bold)
normal=$(tput sgr0)
defaultPath=/var/www/html/opencaptureforinvoices/
imageMagickPolicyFile=/etc/ImageMagick-6/policy.xml
docserverPath=/var/docservers/
user=$(who am i | awk '{print $1}')
group=www-data

if [ -z "$user" ]; then
    printf "The user variable is empty. Please fill it with your desired user : "
    read -r user
    if [ -z "$user" ]; then
        echo 'User remain empty, exiting...'
        exit
    fi
fi

####################
# Check if custom name is set and doesn't exists already

apt install -y crudini
multiInstance='false'
while getopts "c:m:" parameters
do
    case "${parameters}" in
        c) customId=${OPTARG};;
        m) multiInstance=${OPTARG};;
        *) customId=""
    esac
done

if [ -z "$customId" ] || [ "$customId" == 'CUSTOM_ID' ] ; then
    echo "##########################################################################"
    echo "              Custom id is needed to run the installation"
    echo "      Exemple of command line call : sudo ./update.sh -c edissyum"
    echo "##########################################################################"
    exit 2
fi

if [ -L "$defaultPath/$customId" ] && [ -e "$defaultPath/$customId" ]; then
    echo "######################################################"
    echo "      Custom id \"$customId\" already exists"
    echo "######################################################"
    exit 3
fi

customIniFile=$defaultPath/custom/custom.ini
if [ ! -f "$customIniFile" ]; then
    touch $customIniFile
fi
SECTIONS=$(crudini --get $defaultPath/custom/custom.ini | sed 's/:.*//')
# shellcheck disable=SC2068
for custom_name in ${SECTIONS[@]}; do # Do not double quote it
    if [ "$custom_name" == "$customId" ]; then
       echo "######################################################"
       echo "      Custom id \"$customId\" already exists"
       echo "######################################################"
       exit 4
    fi
done

####################
# Create custom symbolic link and folders
ln -s "$defaultPath" "$defaultPath/$customId"

mkdir -p $defaultPath/custom/"$customId"/{config,bin,assets,instance}/
mkdir -p $defaultPath/custom/"$customId"/bin/{data,ldap,scripts}/
mkdir -p $defaultPath/custom/"$customId"/bin/data/tmp/
mkdir -p "$defaultPath/custom/$customId/assets/imgs/"
mkdir -p "$defaultPath/custom/$customId/bin/ldap/config/"
mkdir -p "$defaultPath/custom/$customId/instance/referencial/"
mkdir -p $defaultPath/custom/"$customId"/bin/data/{log,MailCollect}/
mkdir -p $defaultPath/custom/"$customId"/bin/data/log/Supervisor/
mkdir -p $defaultPath/custom/"$customId"/bin/scripts/{verifier_inputs,splitter_inputs}/

echo "[$customId]" >> $customIniFile
echo "path = $defaultPath/custom/$customId" >> $customIniFile
echo "isdefault = False" >> $customIniFile
echo "" >> $customIniFile

####################
# User choice
echo "Do you want to use supervisor (1) or systemd (2) ? (default : 2) "
echo "If you plan to handle a lot of files and need a reduced time of process, use supervisor"
echo "WARNING : A lot of Tesseract processes will run in parallel and it can be very resource intensive"
printf "Enter your choice [1/%s] : " "${bold}2${normal}"
read -r choice

if [[ "$choice" == "" || ("$choice" != 1 && "$choice" != 2) ]]; then
    finalChoice=2
else
    finalChoice="$choice"
fi

if [ "$finalChoice" == 1 ]; then
    echo 'You choose supervisor, how many processes you want to be run simultaneously ? (default : 3)'
    printf "Enter your choice [%s] : " "${bold}3${normal}"
    read -r choice
    if [ "$choice" == "" ]; then
        nbProcessSupervisor=3
    elif ! [[ "$choice" =~ ^[0-9]+$ ]]; then
        echo 'The input is not an integer, default value selected (3)'
        nbProcessSupervisor=3
    else
        nbProcessSupervisor="$choice"
    fi
fi

echo ""
echo "######################################################################################################################"
echo "      _______                                                                                             _______ "
echo "     / /| |\ \                   The two following questions are for advanced users                      / /| |\ \ "
echo "    / / | | \ \          If you don't know what you're doing, skip it and keep default values           / / | | \ \ "
echo "   / /  | |  \ \     Higher values can overload your server if it doesn't have enough performances     / /  | |  \ \ "
echo "  / /   |_|   \ \          Example for a 16 vCPU / 8Go RAM server : 5 threads and 2 processes         / /   |_|   \ \ "
echo " /_/    (_)    \_\                                                                                   /_/    (_)    \_\ "
echo "######################################################################################################################"
echo ""
echo 'How many WSGI threads ? (default : 5)'
printf "Enter your choice [%s] : " "${bold}5${normal}"
read -r choice
if [ "$choice" == "" ]; then
    nbThreads=5
elif ! [[ "$choice" =~ ^[0-9]+$ ]]; then
    echo 'The input is not an integer, default value selected (5)'
    nbThreads=5
else
    nbThreads="$choice"
fi

echo 'How many WSGI processes ? (default : 1)'
printf "Enter your choice [%s] : " "${bold}1${normal}"
read -r choice
if [ "$choice" == "" ]; then
    nbProcesses=1
elif ! [[ "$choice" =~ ^[0-9]+$ ]]; then
    echo 'The input is not an integer, default value selected (1)'
    nbProcesses=1
else
    nbProcesses="$choice"
fi
echo "######################################################################################################################"

####################
# Install packages
xargs -a apt-requirements.txt apt install -y
python3 -m pip install --upgrade setuptools
python3 -m pip install --upgrade pip
python3 -m pip install -r pip-requirements.txt

cd $defaultPath || exit 1
find . -name ".gitkeep" -delete

####################
# Create the Apache service for backend
touch /etc/apache2/sites-available/opencapture.conf
su -c "cat > /etc/apache2/sites-available/opencapture.conf << EOF
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot $defaultPath
    WSGIDaemonProcess opencapture user=$user group=$group home=$defaultPath threads=$nbThreads processes=$nbProcesses
    WSGIScriptAlias /backend_oc /var/www/html/opencaptureforinvoices/wsgi.py

    <Directory $defaultPath>
        AllowOverride All
        WSGIProcessGroup opencapture
        WSGIApplicationGroup %{GLOBAL}
        WSGIPassAuthorization On
        Order deny,allow
        Allow from all
        Require all granted
    </Directory>
</VirtualHost>
EOF"

####################
# Disable default Apache2 configuration
# Enable OpenCapture configuration
# Disable default configuration to avoid conflict
# Enable mod_rewrite
# And restart Apache
a2ensite opencapture.conf
a2dissite 000-default.conf
a2enmod rewrite
systemctl restart apache2

####################
# Create the service systemd or supervisor
if [ "$finalChoice" == 2 ]; then
    touch /etc/systemd/system/OCForInvoices-worker.service
    su -c "cat > /etc/systemd/system/OCForInvoices-worker.service << EOF
[Unit]
Description=Daemon for Open-Capture for Invoices

[Service]
Type=simple

User=$user
Group=$user
UMask=0022

ExecStart=$defaultPath/bin/scripts/service_workerOC.sh
KillSignal=SIGQUIT

Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF"

    touch /etc/systemd/system/OCForInvoices_Split-worker.service
    su -c "cat > /etc/systemd/system/OCForInvoices_Split-worker.service << EOF
[Unit]
Description=Splitter Daemon for Open-Capture for Invoices

[Service]
Type=simple

User=$user
Group=$user
UMask=0022

ExecStart=$defaultPath/bin/scripts/service_workerOC_splitter.sh
KillSignal=SIGQUIT
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF"

    systemctl daemon-reload
    systemctl start OCForInvoices-worker.service
    systemctl start OCForInvoices_Split-worker.service
    sudo systemctl enable OCForInvoices-worker.service
    sudo systemctl enable OCForInvoices_Split-worker.service
else
    apt install -y supervisor
    mkdir "$defaultPath"/bin/data/log/Supervisor/
    touch /etc/supervisor/conf.d/OCForInvoices-worker.conf
    touch /etc/supervisor/conf.d/OCForInvoices_Split-worker.conf

    su -c "cat > /etc/supervisor/conf.d/OCForInvoices-worker.conf << EOF
[program:OCWorker]
command=$defaultPath/bin/scripts/service_workerOC.sh
process_name=%(program_name)s_%(process_num)02d
numprocs=$nbProcessSupervisor
user=$user
chmod=0777
chown=$user:$group
socket_owner=$user
stopsignal=QUIT
stopasgroup=true
killasgroup=true
stopwaitsecs=10

stderr_logfile=$defaultPath/bin/data/log/Supervisor/OCForInvoices_worker_%(process_num)02d_error.log
EOF"

    su -c "cat > /etc/supervisor/conf.d/OCForInvoices_Split-worker.conf << EOF
[program:OCWorker-Split]
command=$defaultPath/bin/scripts/service_workerOC_splitter.sh
process_name=%(program_name)s_%(process_num)02d
numprocs=$nbProcessSupervisor
user=$user
chmod=0777
chown=$user:$group
socket_owner=$user
stopsignal=QUIT
stopasgroup=true
killasgroup=true
stopwaitsecs=10

stderr_logfile=$defaultPath/bin/data/log/Supervisor/OCForInvoices_SPLIT_worker_%(process_num)02d_error.log
EOF"

    chmod 755 /etc/supervisor/conf.d/OCForInvoices-worker.conf
    chmod 755 /etc/supervisor/conf.d/OCForInvoices_Split-worker.conf

    systemctl restart supervisor
    systemctl enable supervisor
fi

####################
# Create a custom temp directory to cron the delete of the ImageMagick temp content
mkdir -p /tmp/OpenCaptureForInvoices/
chown -R "$user":"$user" /tmp/OpenCaptureForInvoices

####################
# Copy file from default one
cp $defaultPath/bin/ldap/config/config.ini.default "$defaultPath/custom/$customId/bin/ldap/config/config.ini"
cp $defaultPath/instance/config/mail.ini.default "$defaultPath/custom/$customId/config/mail.ini"
cp $defaultPath/instance/config/config.ini.default "$defaultPath/custom/$customId/config/config.ini"
cp $defaultPath/instance/referencial/default_referencial_supplier.ods.default $defaultPath/instance/referencial/default_referencial_supplier.ods
cp $defaultPath/instance/referencial/default_referencial_supplier_index.json.default $defaultPath/instance/referencial/default_referencial_supplier_index.json

sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/config/config.ini"

####################
# Setting up fs-watcher service (to replace incron)
mkdir -p /var/log/watcher/
touch /var/log/watcher/daemon.log
chmod -R 775 /var/log/watcher/
cp $defaultPath/instance/config/watcher.ini.default $defaultPath/instance/config/watcher.ini

touch /etc/systemd/system/fs-watcher.service
su -c "cat > /etc/systemd/system/fs-watcher.service << EOF
[Unit]
Description=filesystem watcher
After=basic.target

[Service]
ExecStart=/usr/local/bin/watcher -c $defaultPath/instance/config/watcher.ini start
ExecStop=/usr/local/bin/watcher -c $defaultPath/instance/config/watcher.ini stop
Type=simple
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF"

systemctl daemon-reload
systemctl enable fs-watcher
systemctl start fs-watcher

####################
# Fix ImageMagick Policies
if test -f "$imageMagickPolicyFile"; then
    sudo sed -i 's#<policy domain="coder" rights="none" pattern="PDF" />#<policy domain="coder" rights="read|write" pattern="PDF" />#g' $imageMagickPolicyFile
else
    echo "We could not fix the ImageMagick policy files because it doesn't exists. Please fix it manually using the informations in the README"
fi

####################
# Generate secret key for Flask and replace it in src/backend/__init.py file
secret=$(python3 -c 'import secrets; print(secrets.token_hex(16))')
sed -i "s#§§SECRET§§#$secret#g" "$defaultPath"/src/backend/__init__.py

####################
# Create default verifier input script (based on default input created in data_fr.sql)
defaultScriptFile="$defaultPath/custom/$customId/bin/scripts/verifier_inputs/default_input.sh"
if ! test -f "$defaultScriptFile"; then
    mkdir -p "$defaultPath/custom/$customId/bin/scripts/verifier_inputs/"
    cp $defaultPath/bin/scripts/verifier_inputs/script_sample_dont_touch.sh $defaultScriptFile
    sed -i "s#§§SCRIPT_NAME§§#default_input#g" $defaultScriptFile
    sed -i "s#§§OC_PATH§§#$defaultPath#g" $defaultScriptFile
    sed -i 's#"§§ARGUMENTS§§"#-input_id default_input#g' $defaultScriptFile
    sed -i "s#§§CUSTOM_ID§§#$customId#g" $defaultScriptFile
fi

####################
# Create default splitter input script (based on default input created in data_fr.sql)
defaultScriptFile="$defaultPath/custom/$customId/bin/scripts/splitter_inputs/default_input.sh"
if ! test -f "$defaultScriptFile"; then
    mkdir -p "$defaultPath/custom/$customId/bin/scripts/splitter_inputs/"
    cp $defaultPath/bin/scripts/splitter_inputs/script_sample_dont_touch.sh $defaultScriptFile
    sed -i "s#§§SCRIPT_NAME§§#default_input#g" $defaultScriptFile
    sed -i "s#§§OC_PATH§§#$defaultPath#g" $defaultScriptFile
    sed -i 's#"§§ARGUMENTS§§"#-input_id default_input#g' $defaultScriptFile
    sed -i "s#§§CUSTOM_ID§§#$customId#g" $defaultScriptFile
fi

####################
# Create default MAIL script and config
cp "$defaultPath/bin/scripts/launch_MAIL.sh.default" "$defaultPath/custom/$customId/bin/scripts/launch_MAIL.sh"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/bin/scripts/launch_MAIL.sh"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/config/mail.ini"

####################
# Create default LDAP script and config
cp $defaultPath/bin/ldap/synchronization_ldap_script.sh.default "$defaultPath/custom/$customId/bin/ldap/synchronization_ldap_script.sh"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/bin/ldap/synchronization_ldap_script.sh"

####################
# Fix the rights after root launch to avoid permissions issues
chmod -R 775 $defaultPath
chmod -R g+s $defaultPath
chown -R "$user":"$group" $defaultPath

####################
# Makes scripts executable
chmod u+x $defaultPath/bin/scripts/*.sh
chown -R "$user":"$user" $defaultPath/bin/scripts/*.sh
chmod u+x $defaultPath/custom/"$customId"/bin/scripts/verifier_inputs/*.sh
chown -R "$user":"$user" $defaultPath/custom/"$customId"/bin/scripts/verifier_inputs/*.sh
chmod u+x $defaultPath/custom/"$customId"/bin/scripts/splitter_inputs/*.sh
chown -R "$user":"$user" $defaultPath/custom/"$customId"/bin/scripts/splitter_inputs/*.sh

####################
# Create docservers
mkdir -p $docserverPath/OpenCapture/"$customId"/{verifier,splitter}
mkdir -p $docserverPath/OpenCapture/"$customId"/verifier/{original_pdf,full,thumbs,positions_masks}
mkdir -p $docserverPath/OpenCapture/"$customId"/splitter/{original_pdf,batches,separated_pdf,error}
chmod -R 775 $docserverPath/OpenCapture/
chmod -R g+s $docserverPath/OpenCapture/
chown -R "$user":"$group" $docserverPath/OpenCapture/

####################
# Create default export and input XML and PDF folder
mkdir -p /var/share/"$customId"/{entrant,export}/{verifier,splitter}/
chmod -R 775 /var/share/"$customId"/
chown -R "$user":"$group" /var/share/"$customId"/