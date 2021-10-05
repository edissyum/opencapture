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
OS=$(lsb_release -si)
VER=$(lsb_release -r)
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
        nbProcess=3
    elif ! [[ "$choice" =~ ^[0-9]+$ ]]; then
        echo 'The input is not an integer, default value selected (3)'
        nbProcess=3
    else
        nbProcess="$choice"
    fi
fi

####################
# Install packages
if [[ "$OS" == 'Debian' && "$VER" == *'9'* ]]; then
    su -c 'cat > /etc/apt/sources.list.d/stretch-backports.list << EOF
deb http://http.debian.net/debian stretch-backports main contrib non-free
EOF'
    apt update
    apt install -y -t stretch-backports tesseract-ocr
    apt install -y -t stretch-backports tesseract-ocr-fra
    apt install -y -t stretch-backports tesseract-ocr-eng
elif [[ "$OS" == 'Ubuntu' || "$OS" == 'Debian' && $VER == *'10'* ]]; then
    apt update
    apt install -y tesseract-ocr
    apt install -y tesseract-ocr-fra
    apt install -y tesseract-ocr-eng
fi

xargs -a apt-requirements.txt apt install -y
python3 -m pip install --upgrade setuptools
python3 -m pip install --upgrade pip
python3 -m pip install -r pip-requirements.txt

cd $defaultPath || exit 1
find . -name ".gitkeep" -delete

####################
# Makes scripts executable
chmod u+x $defaultPath/bin/scripts/*.sh
chown -R "$user":"$user" $defaultPath/bin/scripts/*.sh

####################
# Create the Apache service for backend
touch /etc/apache2/sites-available/opencapture.conf
su -c "cat > /etc/apache2/sites-available/opencapture.conf << EOF
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot $defaultPath/dist/
    WSGIDaemonProcess opencapture user=$user group=$group threads=5
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
# Setting up the WSGI path
sed -i "s#§§PATH§§#$defaultPath#g" "$defaultPath"/wsgi.py

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

    sudo systemctl daemon-reload && systemctl start OCForInvoices-worker.service
    sudo systemctl daemon-reload && systemctl start OCForInvoices_Split-worker.service
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
numprocs=$nbProcess
socket_owner=$user
stopsignal=QUIT
stopasgroup=true
killasgroup=true
stopwaitsecs=10

stderr_logfile=$defaultPath/bin/data/log/Supervisor/OCForInvoices_worker_%(process_num)02d_error.log
EOF"

    su -c "cat > /etc/supervisor/conf.d/OCForInvoices_Split-worker.conf << EOF
[program:OCWorker]
command=$defaultPath/bin/scripts/service_workerOC_splitter.sh
process_name=%(program_name)s_%(process_num)02d
numprocs=$nbProcess
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
mkdir /tmp/OpenCaptureForInvoices/
chown -R "$user":"$user" /tmp/OpenCaptureForInvoices

####################
# Copy file from default one
cp $defaultPath/instance/config.ini.default $defaultPath/instance/config.ini
cp $defaultPath/instance/config/config_DEFAULT.ini.default $defaultPath/instance/config/config_DEFAULT.ini
cp $defaultPath/instance/config/mail.ini.default $defaultPath/instance/config/mail.ini
cp $defaultPath/src/assets/referencial/default_referencial_supplier_index.json.default $defaultPath/src/assets/referencial/default_referencial_supplier_index.json
cp $defaultPath/src/assets/referencial/default_referencial_supplier.ods.default $defaultPath/src/assets/referencial/default_referencial_supplier.ods

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
# Fix the rights after root launch to avoid permissions issues
chmod -R 775 $defaultPath
chmod -R g+s $defaultPath
chown -R "$user":"$group" $defaultPath

####################
# Create default verifier input script (based on default input created in data_fr.sql)
defaultScriptFile=$defaultPath/bin/scripts/verifier_inputs/default_input.sh
if ! test -f "$defaultScriptFile"; then
    cp $defaultPath/bin/scripts/verifier_inputs/script_sample_dont_touch.sh $defaultScriptFile
    sed -i "s#§§SCRIPT_NAME§§#default_input#g" $defaultScriptFile
    sed -i "s#§§OC_PATH§§#$defaultPath#g" $defaultScriptFile
    sed -i 's#"§§ARGUMENTS§§"#-input_id default_input#g' $defaultScriptFile
fi

####################
# Create default splitter input script (based on default input created in data_fr.sql)
defaultScriptFile=$defaultPath/bin/scripts/splitter_inputs/default_input.sh
if ! test -f "$defaultScriptFile"; then
    cp $defaultPath/bin/scripts/splitter_inputs/script_sample_dont_touch.sh $defaultScriptFile
    sed -i "s#§§SCRIPT_NAME§§#default_input#g" $defaultScriptFile
    sed -i "s#§§OC_PATH§§#$defaultPath#g" $defaultScriptFile
    sed -i 's#"§§ARGUMENTS§§"#-input_id default_input#g' $defaultScriptFile
fi

####################
# Create docservers
mkdir -p $docserverPath/{OpenCapture,OpenCapture_Splitter}
mkdir -p $docserverPath/OpenCapture/images/{full,thumbs}
mkdir -p $docserverPath/OpenCapture_Splitter/{batches,separated_pdf}
chmod -R 775 $docserverPath/{OpenCapture,OpenCapture_Splitter}/
chmod -R g+s $docserverPath/{OpenCapture,OpenCapture_Splitter}/
chown -R "$user":"$group" $docserverPath/{OpenCapture,OpenCapture_Splitter}/

####################
# Create default export XML folder
mkdir -p /var/share/export/{verifier,splitter}/
chmod -R 775 /var/share/export/
chown -R "$user":"$group" /var/share/export/