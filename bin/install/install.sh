#!/bin/bash
# This file is part of Open-Capture.

# Open-Capture is free software: you can redistribute it and/or modify
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
defaultPath=/var/www/html/opencapture/
imageMagickPolicyFile=/etc/ImageMagick-6/policy.xml
docserverPath=/var/docservers/
user=$(who am i | awk '{print $1}')
group=www-data
INFOLOG_PATH=install_info.log
ERRORLOG_PATH=install_error.log

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

while getopts "c:" parameters
do
    case "${parameters}" in
        c) customId=${OPTARG};;
        *) customId=""
    esac
done

####################
# Replace dot with _ in custom_id to avoir python error
oldCustomId=$customId
customId=${customId//[\.\-]/_}

if [[ "$customId" =~ [[:upper:]] ]]; then
    echo "##########################################################################"
    echo "             Custom id could'nt include uppercase characters              "
    echo "##########################################################################"
    exit 1
fi

if [ -z "$customId" ]; then
    echo "##########################################################################"
    echo "              Custom id is needed to run the installation"
    echo "      Exemple of command line call : sudo ./install.sh -c edissyum"
    echo "##########################################################################"
    exit 2
fi

if [ "$customId" == 'custom' ] ; then
    echo "##########################################################################"
    echo "              Please do not create a custom called 'custom'"
    echo "      Exemple of command line call : sudo ./install.sh -c edissyum"
    echo "##########################################################################"
    exit 3
fi

if [ -L "$defaultPath/$customId" ] && [ -e "$defaultPath/$customId" ]; then
    echo "######################################################"
    echo "      Custom id \"$customId\" already exists"
    echo "######################################################"
    exit 4
fi

####################
# User choice
echo ""
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
echo "#######################################################################################################################"
echo "      _______                                                                                             _______ "
echo "     / /| |\ \                   The two following questions are for advanced users                      / /| |\ \ "
echo "    / / | | \ \          If you don't know what you're doing, skip it and keep default values           / / | | \ \ "
echo "   / /  | |  \ \     Higher values can overload your server if it doesn't have enough performances     / /  | |  \ \ "
echo "  / /   |_|   \ \          Example for a 16 vCPU / 8Go RAM server : 5 threads and 2 processes         / /   |_|   \ \ "
echo " /_/    (_)    \_\                                                                                   /_/    (_)    \_\ "
echo ""
echo "#######################################################################################################################"
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

echo ""
echo "######################################################################################################################"
echo ""

echo 'Would you use Python virtual environment ? (default : yes)'
printf "Enter your choice [%s] : " "${bold}yes${normal}/no"
read -r choice
if [ "$choice" != "no" ]; then
    pythonVenv='true'
else
    pythonVenv='false'
fi

echo ""
echo "######################################################################################################################"
echo ""

####################
# Retrieve database informations
echo "Type database informations (hostname, port, username and password)."
echo "It will be used to update path to use the custom's one"
printf "Hostname [%s] : " "${bold}localhost${normal}"
read -r choice

if [[ "$choice" == "" ]]; then
    hostname="localhost"
else
    hostname="$choice"
fi

printf "Port [%s] : " "${bold}5432${normal}"
read -r choice

if [[ "$choice" == "" ]]; then
    port=5432
else
    port="$choice"
fi

printf "Username [%s] : " "${bold}$customId${normal}"
read -r choice

if [[ "$choice" == "" ]]; then
    databaseUsername="$customId"
else
    databaseUsername="$choice"
fi

printf "Password [%s] : " "${bold}$customId${normal}"
read -r choice

if [[ "$choice" == "" ]]; then
    databasePassword="$customId"
else
    databasePassword="$choice"
fi

echo ""
echo "Postgres installation....."
apt-get update >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
apt-get install -y postgresql >>$INFOLOG_PATH 2>>$ERRORLOG_PATH

if [ "$hostname" != "localhost" ] || [ "$port" != "5432" ]; then
    printf "Postgres user Password [%s] : " "${bold}postgres${normal}"
    read -r choice

    if [[ "$choice" == "" ]]; then
        postgresPassword="postgres"
    else
        postgresPassword="$choice"
    fi
    echo ""
    echo "######################################################################################################################"
    echo ""
    echo "Create database user...."

    export PGPASSWORD=$postgresPassword && su postgres -c "psql -h$hostname -p$port -c 'CREATE ROLE $databaseUsername'" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
    export PGPASSWORD=$postgresPassword && su postgres -c "psql -h$hostname -p$port -c 'ALTER ROLE $databaseUsername WITH LOGIN'" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
    export PGPASSWORD=$postgresPassword && su postgres -c "psql -h$hostname -p$port -c 'ALTER ROLE $databaseUsername WITH CREATEDB'" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
    export PGPASSWORD=$postgresPassword && su postgres -c "psql -h$hostname -p$port -c \"ALTER ROLE $databaseUsername WITH ENCRYPTED PASSWORD '$databasePassword'\"" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
else
    echo ""
    echo "######################################################################################################################"
    echo ""
    echo "Create database user...."

    su postgres -c "psql -c 'CREATE ROLE $databaseUsername'" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
    su postgres -c "psql -c 'ALTER ROLE $databaseUsername WITH LOGIN'">>$INFOLOG_PATH 2>>$ERRORLOG_PATH
    su postgres -c "psql -c 'ALTER ROLE $databaseUsername WITH CREATEDB'">>$INFOLOG_PATH 2>>$ERRORLOG_PATH
    su postgres -c "psql -c \"ALTER ROLE $databaseUsername WITH ENCRYPTED PASSWORD '$databasePassword'\"">>$INFOLOG_PATH 2>>$ERRORLOG_PATH
fi

echo ""
echo "######################################################################################################################"
echo ""

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

customPath=$defaultPath/custom/"$customId"

mkdir -p $customPath/{config,bin,assets,instance,src}/
mkdir -p $customPath/bin/{data,ldap,scripts}/
mkdir -p $customPath/assets/imgs/
mkdir -p $customPath/bin/ldap/config/
mkdir -p $customPath/instance/referencial/
mkdir -p $customPath/bin/data/{log,MailCollect,tmp,exported_pdf,exported_pdfa}/
mkdir -p $customPath/bin/data/log/Supervisor/
mkdir -p $customPath/bin/scripts/{verifier_inputs,splitter_inputs,MailCollect}/
mkdir -p $customPath/src/backend/
touch $customPath/config/secret_key

echo "[$oldCustomId]" >> $customIniFile
echo "path = $defaultPath/custom/$customId" >> $customIniFile
echo "isdefault = False" >> $customIniFile
echo "" >> $customIniFile

####################
# Install packages
echo "System packages installation....."
xargs -a apt-requirements.txt apt-get install -y >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
echo ""
echo "######################################################################################################################"
echo ""

if [ $pythonVenv = 'true' ]; then
    echo "Python packages installation using virtual environment....."
    python3 -m venv "/home/$user/python-venv/opencapture"
    echo "source /home/$user/python-venv/opencapture/bin/activate" >> "/home/$user/.bashrc"
    "/home/$user/python-venv/opencapture/bin/python3" -m pip install --upgrade pip >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
    "/home/$user/python-venv/opencapture/bin/python3" -m pip install --upgrade setuptools >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
    "/home/$user/python-venv/opencapture/bin/python3" -m pip install -r "$defaultPath/bin/install/pip-requirements.txt" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
else
    echo "Python packages installation....."
    python3 -m pip install --upgrade pip >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
    python3 -m pip install --upgrade setuptools >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
    python3 -m pip install -r pip-requirements.txt >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
fi

cd $defaultPath || exit 1
find . -name ".gitkeep" -delete

echo ""
echo "######################################################################################################################"
echo ""

####################
# Create database using custom_id
echo "Create database and fill it with default data....."
databaseName="opencapture_$customId"
if [[ "$customId" = *"opencapture_"* ]]; then
    databaseName="$customId"
fi
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "CREATE DATABASE $databaseName WITH template=template0 encoding='UTF8'" postgres >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "\i $defaultPath/instance/sql/structure.sql" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "\i $defaultPath/instance/sql/global.sql" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "\i $defaultPath/instance/sql/data_fr.sql" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH

echo ""
echo "######################################################################################################################"
echo ""

docserverDefaultPath="/var/docservers/opencapture/"

export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path=REPLACE(path, '$docserverDefaultPath' , '/$docserverDefaultPath/$customId/')" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/bin/scripts/' WHERE docserver_id = 'SCRIPTS_PATH'" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/bin/data/tmp/' WHERE docserver_id = 'TMP_PATH'" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/bin/data/exported_pdfa/' WHERE docserver_id = 'SEPARATOR_OUTPUT_PDFA'" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/bin/data/exported_pdf/' WHERE docserver_id = 'SEPARATOR_OUTPUT_PDF'" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/instance/referencial/' WHERE docserver_id = 'REFERENTIALS_PATH'" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE inputs SET input_folder=REPLACE(input_folder, '/var/share/' , '/var/share/$customId/')" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE outputs SET data = jsonb_set(data, '{options, parameters, 0, value}', '\"/var/share/$customId/export/verifier/\"') WHERE data #>>'{options,parameters, 0, id}' = 'folder_out' AND module = 'verifier';" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE outputs SET data = jsonb_set(data, '{options, parameters, 0, value}', '\"/var/share/$customId/entrant/verifier/\"') WHERE data #>>'{options,parameters, 0, id}' = 'folder_out' AND module = 'splitter' AND output_type_id = 'export_pdf';" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE outputs SET data = jsonb_set(data, '{options, parameters, 0, value}', '\"/var/share/$customId/export/splitter/\"') WHERE data #>>'{options,parameters, 0, id}' = 'folder_out' AND module = 'splitter' AND output_type_id = 'export_xml';" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE configurations SET data = jsonb_set(data, '{value, batchPath}', '\"$customPath/bin/data/MailCollect/\"') WHERE label = 'mailCollectGeneral';" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH

####################
# Create the Apache service for backend
touch /etc/apache2/sites-available/opencapture.conf

wsgiDaemonProcessLine="WSGIDaemonProcess opencapture user=$user group=$group home=$defaultPath threads=$nbThreads processes=$nbProcesses"
if [ $pythonVenv = 'true' ]; then
    sitePackageLocation=$(/home/$user/python-venv/opencapture/bin/python3 -c 'import site; print(site.getsitepackages()[0])')
    if [ $sitePackageLocation ]; then
        wsgiDaemonProcessLine="WSGIDaemonProcess opencapture user=$user group=$group home=$defaultPath threads=$nbThreads processes=$nbProcesses python-path=$sitePackageLocation"
    fi
fi

su -c "cat > /etc/apache2/sites-available/opencapture.conf << EOF
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot $defaultPath
    $wsgiDaemonProcessLine
    WSGIScriptAlias /backend_oc $defaultPath/wsgi.py

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
# Create a custom temp directory to cron the delete of the ImageMagick temp content
mkdir -p /tmp/opencapture/
chown -R "$user":"$user" /tmp/opencapture/

####################
# Copy file from default one
cp $defaultPath/bin/ldap/config/config.ini.default "$defaultPath/custom/$customId/bin/ldap/config/config.ini"
cp $defaultPath/instance/config/config.ini.default "$defaultPath/custom/$customId/config/config.ini"
cp $defaultPath/instance/referencial/default_referencial_supplier.ods.default "$defaultPath/custom/$customId/instance/referencial/default_referencial_supplier.ods"
cp $defaultPath/instance/referencial/default_referencial_supplier_index.json.default "$defaultPath/custom/$customId/instance/referencial/default_referencial_supplier_index.json"
cp $defaultPath/src/backend/process_queue_verifier.py.default "$defaultPath/custom/$customId/src/backend/process_queue_verifier.py"
cp $defaultPath/src/backend/process_queue_splitter.py.default "$defaultPath/custom/$customId/src/backend/process_queue_splitter.py"
cp $defaultPath/bin/scripts/OCVerifier_worker.sh.default "$defaultPath/custom/$customId/bin/scripts/OCVerifier_worker.sh"
cp $defaultPath/bin/scripts/OCSplitter_worker.sh.default "$defaultPath/custom/$customId/bin/scripts/OCSplitter_worker.sh"
cp $defaultPath/bin/scripts/MailCollect/clean.sh.default "$defaultPath/custom/$customId/bin/scripts/MailCollect/clean.sh"

sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/config/config.ini"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/src/backend/process_queue_verifier.py"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/src/backend/process_queue_splitter.py"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/bin/scripts/OCVerifier_worker.sh"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/bin/scripts/OCSplitter_worker.sh"
sed -i "s#§§BATCH_PATH§§#$defaultPath/custom/$customId/bin/data/MailCollect/#g" "$defaultPath/custom/$customId/bin/scripts/MailCollect/clean.sh"

if [ $pythonVenv = 'true' ]; then
    sed -i "s#§§PYTHON_VENV§§#source /home/$user/python-venv/opencapture/bin/activate#g" "$defaultPath/custom/$customId/bin/scripts/OCVerifier_worker.sh"
    sed -i "s#§§PYTHON_VENV§§#source /home/$user/python-venv/opencapture/bin/activate#g" "$defaultPath/custom/$customId/bin/scripts/OCSplitter_worker.sh"
else
    sed -i "s#§§PYTHON_VENV§§##g" "$defaultPath/custom/$customId/bin/scripts/OCVerifier_worker.sh"
    sed -i "s#§§PYTHON_VENV§§##g" "$defaultPath/custom/$customId/bin/scripts/OCSplitter_worker.sh"
fi

####################
# Create the service systemd or supervisor
if [ "$finalChoice" == 2 ]; then
    touch "/etc/systemd/system/OCVerifier-worker_$customId.service"
    su -c "cat > /etc/systemd/system/OCVerifier-worker_$customId.service << EOF
[Unit]
Description=Daemon for Open-Capture

[Service]
Type=simple

User=$user
Group=$user
UMask=0022

ExecStart=$defaultPath/custom/$customId/bin/scripts/OCVerifier_worker.sh
KillSignal=SIGQUIT

Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF"

    touch "/etc/systemd/system/OCSplitter-worker_$customId.service"
    su -c "cat > /etc/systemd/system/OCSplitter-worker_$customId.service << EOF
[Unit]
Description=Splitter Daemon for Open-Capture

[Service]
Type=simple

User=$user
Group=$user
UMask=0022

ExecStart=$defaultPath/custom/$customId/bin/scripts/OCSplitter_worker.sh
KillSignal=SIGQUIT
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF"

    systemctl daemon-reload
    systemctl start "OCVerifier-worker_$customId".service
    systemctl start "OCSplitter-worker_$customId".service
    sudo systemctl enable "OCVerifier-worker_$customId".service
    sudo systemctl enable "OCSplitter-worker_$customId".service
else
    apt-get install -y supervisor >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
    touch "/etc/supervisor/conf.d/OCVerifier-worker_$customId.conf"
    touch "/etc/supervisor/conf.d/OCSplitter-worker_$customId.conf"

    su -c "cat > /etc/supervisor/conf.d/OCVerifier-worker_$customId.conf << EOF
[program:OCWorker_$customId]
command=$defaultPath/custom/$customId/bin/scripts/OCVerifier_worker.sh
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

stderr_logfile=$defaultPath/custom/$customId/bin/data/log/Supervisor/OCVerifier-worker_%(process_num)02d_error.log
EOF"

    su -c "cat > /etc/supervisor/conf.d/OCSplitter-worker_$customId.conf << EOF
[program:OCWorker-Split_$customId]
command=$defaultPath/custom/$customId/bin/scripts/OCSplitter_worker.sh
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

stderr_logfile=$defaultPath/custom/$customId/bin/data/log/Supervisor/OCSplitter-worker_%(process_num)02d_error.log
EOF"

    chmod 755 "/etc/supervisor/conf.d/OCVerifier-worker_$customId.conf"
    chmod 755 "/etc/supervisor/conf.d/OCSplitter-worker_$customId.conf"

    systemctl restart supervisor
    systemctl enable supervisor
fi

confFile="$defaultPath/custom/$customId/config/config.ini"
crudini --set "$confFile" DATABASE postgresHost "$hostname"
crudini --set "$confFile" DATABASE postgresPort "$port"
crudini --set "$confFile" DATABASE postgresDatabase "$databaseName"
crudini --set "$confFile" DATABASE postgresUser " $databaseUsername"
crudini --set "$confFile" DATABASE postgresPassword " $databasePassword"

####################
# Setting up fs-watcher service
mkdir -p /var/log/watcher/
touch /var/log/watcher/daemon.log
chmod -R 775 /var/log/watcher/
cp $defaultPath/instance/config/watcher.ini.default $defaultPath/instance/config/watcher.ini

crudini --set "$defaultPath/instance/config/watcher.ini" verifier_default_input watch /var/share/"$customId"/entrant/verifier/
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_default_input command "$defaultPath/custom/$customId/bin/scripts/verifier_inputs/default_input.sh \$filename"

crudini --set "$defaultPath/instance/config/watcher.ini" splitter_default_input watch /var/share/"$customId"/entrant/splitter/
crudini --set "$defaultPath/instance/config/watcher.ini" splitter_default_input command "$defaultPath/custom/$customId/bin/scripts/splitter_inputs/default_input.sh \$filename"

sed -i "s#verifier_default_input#verifier_default_input_$customId#g" "$defaultPath/instance/config/watcher.ini"
sed -i "s#splitter_default_input_#splitter_default_input_$customId#g" "$defaultPath/instance/config/watcher.ini"

touch /etc/systemd/system/fs-watcher.service
su -c "cat > /etc/systemd/system/fs-watcher.service << EOF
[Unit]
Description=filesystem watcher
After=basic.target

[Service]
ExecStart=/home/$user/python-venv/opencapture/bin/watcher -c $defaultPath/instance/config/watcher.ini start
ExecStop=/home/$user/python-venv/opencapture/bin/watcher -c $defaultPath/instance/config/watcher.ini stop
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
# Generate secret key for Flask and write it to custom secret_key file
secret=$(python3 -c 'import secrets; print(secrets.token_hex(32))')
echo "$secret" > $customPath/config/secret_key

####################
# Create default verifier input script (based on default input created in data_fr.sql)
defaultScriptFile="$defaultPath/custom/$customId/bin/scripts/verifier_inputs/default_input.sh"
touch $defaultPath/custom/$customId/bin/data/log/OpenCapture.log
if ! test -f "$defaultScriptFile"; then
    mkdir -p "$defaultPath/custom/$customId/bin/scripts/verifier_inputs/"
    cp $defaultPath/bin/scripts/verifier_inputs/script_sample_dont_touch.sh $defaultScriptFile
    sed -i "s#§§SCRIPT_NAME§§#default_input#g" $defaultScriptFile
    sed -i "s#§§OC_PATH§§#$defaultPath#g" $defaultScriptFile
    sed -i "s#§§LOG_PATH§§#$defaultPath/custom/$customId/bin/data/log/OpenCapture.log#g" $defaultScriptFile
    sed -i 's#"§§ARGUMENTS§§"#-input_id default_input#g' $defaultScriptFile
    sed -i "s#§§CUSTOM_ID§§#$customId#g" $defaultScriptFile
fi

####################
# Create default splitter input script (based on default input created in data_fr.sql)
defaultScriptFile="$defaultPath/custom/$customId/bin/scripts/splitter_inputs/default_input.sh"
if ! test -f "$defaultScriptFile"; then
    mkdir -p "$defaultPath/custom/$customId/bin/scripts/splitter_inputs/"
    cp $defaultPath/bin/scripts/splitter_inputs/script_sample_dont_touch.sh "$defaultPath/custom/$customId/bin/scripts/splitter_inputs/"
    cp $defaultPath/bin/scripts/splitter_inputs/script_sample_dont_touch.sh $defaultScriptFile
    sed -i "s#§§SCRIPT_NAME§§#default_input#g" $defaultScriptFile
    sed -i "s#§§OC_PATH§§#$defaultPath#g" $defaultScriptFile
    sed -i "s#§§LOG_PATH§§#$defaultPath/custom/$customId/bin/data/log/OpenCapture.log#g" $defaultScriptFile
    sed -i 's#"§§ARGUMENTS§§"#-input_id default_input#g' $defaultScriptFile
    sed -i "s#§§CUSTOM_ID§§#$customId#g" $defaultScriptFile
fi

####################
# Create default MAIL script
cp "$defaultPath/bin/scripts/launch_MAIL.sh.default" "$defaultPath/custom/$customId/bin/scripts/launch_MAIL.sh"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/bin/scripts/launch_MAIL.sh"
sed -i "s#§§OC_PATH§§#$defaultPath#g" "$defaultPath/custom/$customId/bin/scripts/launch_MAIL.sh"
sed -i "s#§§LOG_PATH§§#$defaultPath/custom/$customId/bin/data/log/OpenCapture.log#g" "$defaultPath/custom/$customId/bin/scripts/launch_MAIL.sh"

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
chmod u+x $defaultPath/custom/"$customId"/bin/scripts/*.sh
chmod u+x $defaultPath/custom/"$customId"/bin/scripts/verifier_inputs/*.sh
chown -R "$user":"$user" $defaultPath/custom/"$customId"/bin/scripts/verifier_inputs/*.sh
chmod u+x $defaultPath/custom/"$customId"/bin/scripts/splitter_inputs/*.sh
chown -R "$user":"$user" $defaultPath/custom/"$customId"/bin/scripts/splitter_inputs/*.sh

####################
# Create docservers
mkdir -p $docserverPath/opencapture/"$customId"/{verifier,splitter}
mkdir -p $docserverPath/opencapture/"$customId"/verifier/{original_pdf,full,thumbs,positions_masks}
mkdir -p $docserverPath/opencapture/"$customId"/splitter/{original_pdf,batches,separated_pdf,error}
chmod -R 775 $docserverPath/opencapture/
chmod -R g+s $docserverPath/opencapture/
chown -R "$user":"$group" $docserverPath/opencapture/

####################
# Create default export and input XML and PDF folder
mkdir -p /var/share/"$customId"/{entrant,export}/{verifier,splitter}/
chmod -R 775 /var/share/"$customId"/
chown -R "$user":"$group" /var/share/"$customId"/