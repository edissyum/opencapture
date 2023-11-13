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
defaultPath="/var/www/html/opencapture/"
imageMagickPolicyFile=/etc/ImageMagick-6/policy.xml
user=$(who am i | awk '{print $1}')
group=www-data
INFOLOG_PATH=install_info.log
ERRORLOG_PATH=install_error.log

####################
# Handle parameters
parameters="user custom_id supervisor_process path wsgi_threads wsgi_process supervisor_systemd hostname port username password docserver_path"
opts=$(getopt --longoptions "$(printf "%s:," "$parameters")" --name "$(basename "$0")" --options "" -- "$@")

while [ $# -gt 0 ]; do
    case "$1" in
        --user)
            user=$2
            shift 2;;
        --custom_id)
            customId=$2
            shift 2;;
        --supervisor_process)
            nbProcess=$2
            shift 2;;
        --path)
            defaultPath=$2
            shift 2;;
        --wsgi_threads)
            wsgiThreads=$2
            shift 2;;
        --wsgi_process)
            wsgiProcess=$2
            shift 2;;
        --supervisor_systemd)
            supervisorOrSystemd=$2
            shift 2;;
        --hostname)
            hostname=$2
            shift 2;;
        --port)
            port=$2
            shift 2;;
        --username)
            databaseUsername=$2
            shift 2;;
        --password)
            databasePassword=$2
            shift 2;;
        --docserver_path)
            docserverDefaultPath=$2
            shift 2;;
    *)
        customId=""
        break;;
    esac
done

if [ -z $user ]; then
    printf "The user variable is empty. Please fill it with your desired user : "
    read -r user
    if [ -z $user ]; then
        echo 'User remain empty, exiting...'
        exit
    fi
fi

if [ ! -z $supervisorOrSystemd ]; then
    if [ $supervisorOrSystemd != "supervisor" ] && [ $supervisorOrSystemd != "systemd" ]; then
        echo "-s parameter need to be supervisor or systemd"
        exit
    fi

    if [ $supervisorOrSystemd == "supervisor" ] && [ -z $nbProcessSupervisor ]; then
        nbProcessSupervisor=3
    fi
fi

####################
# Replace dot with _ in custom_id to avoid python error
oldCustomId=$customId
customId=${customId//[\.\-]/_}
customId=$(echo "$customId" | tr "[:upper:]" "[:lower:]")

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
if [ -z $supervisorOrSystemd ]; then
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
fi


if [ -z $wsgiThreads ] && [ -z $wsgiProcess ]; then
    echo ""
    echo "########################################################################################################################"
    echo "      _______                                                                                             _______ "
    echo "     / /| |\ \                   The two following questions are for advanced users                      / /| |\ \ "
    echo "    / / | | \ \          If you don't know what you're doing, skip it and keep default values           / / | | \ \ "
    echo "   / /  | |  \ \     Higher values can overload your server if it doesn't have enough performances     / /  | |  \ \ "
    echo "  / /   |_|   \ \          Example for a 16 vCPU / 8Go RAM server : 5 threads and 2 processes         / /   |_|   \ \ "
    echo " /_/    (_)    \_\                                                                                   /_/    (_)    \_\ "
    echo ""
    echo "########################################################################################################################"
    echo ""
    echo 'How many WSGI threads ? (default : 5)'
    printf "Enter your choice [%s] : " "${bold}5${normal}"
    read -r choice
    if [ "$choice" == "" ]; then
        wsgiThreads=5
    elif ! [[ "$choice" =~ ^[0-9]+$ ]]; then
        echo 'The input is not an integer, default value selected (5)'
        wsgiThreads=5
    else
        wsgiThreads="$choice"
    fi

    echo 'How many WSGI processes ? (default : 1)'
    printf "Enter your choice [%s] : " "${bold}1${normal}"
    read -r choice
    if [ "$choice" == "" ]; then
        wsgiProcess=1
    elif ! [[ "$choice" =~ ^[0-9]+$ ]]; then
        echo 'The input is not an integer, default value selected (1)'
        wsgiProcess=1
    else
        wsgiProcess="$choice"
    fi
fi

echo ""
echo "#######################################################################################################################"
echo ""

if [ -z $docserverDefaultPath ]; then
    echo "Type docserver default path informations. By default it's /var/docservers/opencapture/"
    printf "Docserver default path [%s] : " "${bold}/var/docservers/opencapture/${normal}"
    read -r choice

    if [[ "$choice" == "" ]]; then
        docserverDefaultPath="/var/docservers/opencapture/"
    else
        docserverDefaultPath="$choice"
    fi

    echo ""
    echo "#######################################################################################################################"
    echo ""
fi

####################
# Retrieve database informations
if [ -z $hostname ] && [ -z $port ] && [ -z $databaseUsername ] && [ -z $databasePassword ]; then
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

    printf "Password [%s] : " "${bold}$databaseUsername${normal}"
    read -r choice

    if [[ "$choice" == "" ]]; then
        databasePassword="$customId"
    else
        databasePassword="$choice"
    fi
fi

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
    echo "#######################################################################################################################"
    echo ""
    echo "Create database user....."

    export PGPASSWORD=$postgresPassword && su postgres -c "psql -h$hostname -p$port -c 'CREATE ROLE $databaseUsername'" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
    export PGPASSWORD=$postgresPassword && su postgres -c "psql -h$hostname -p$port -c 'ALTER ROLE $databaseUsername WITH LOGIN'" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
    export PGPASSWORD=$postgresPassword && su postgres -c "psql -h$hostname -p$port -c 'ALTER ROLE $databaseUsername WITH CREATEDB'" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
    export PGPASSWORD=$postgresPassword && su postgres -c "psql -h$hostname -p$port -c \"ALTER ROLE $databaseUsername WITH ENCRYPTED PASSWORD '$databasePassword'\"" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
else
    echo ""
    echo "#######################################################################################################################"
    echo ""
    echo "Create database user....."

    su postgres -c "psql -c 'CREATE ROLE $databaseUsername'" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
    su postgres -c "psql -c 'ALTER ROLE $databaseUsername WITH LOGIN'">>$INFOLOG_PATH 2>>$ERRORLOG_PATH
    su postgres -c "psql -c 'ALTER ROLE $databaseUsername WITH CREATEDB'">>$INFOLOG_PATH 2>>$ERRORLOG_PATH
    su postgres -c "psql -c \"ALTER ROLE $databaseUsername WITH ENCRYPTED PASSWORD '$databasePassword'\"">>$INFOLOG_PATH 2>>$ERRORLOG_PATH
fi

echo ""
echo "#######################################################################################################################"
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
mkdir -p $customPath/bin/scripts/{verifier_workflows,splitter_workflows,MailCollect,ai}/
mkdir -p $customPath/bin/scripts/ai/{splitter,verifier}/
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
echo "#######################################################################################################################"
echo ""

echo "Python packages installation using virtual environment....."
python3 -m venv "/home/$user/python-venv/opencapture"
chmod -R 777 "/home/$user/python-venv/opencapture"
chown -R "$user":"$user" "/home/$user/python-venv/opencapture"
echo "source /home/$user/python-venv/opencapture/bin/activate" >> "/home/$user/.bashrc"
"/home/$user/python-venv/opencapture/bin/python3" -m pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org --upgrade pip >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
"/home/$user/python-venv/opencapture/bin/python3" -m pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org --upgrade wheel >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
"/home/$user/python-venv/opencapture/bin/python3" -m pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org --upgrade setuptools >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
"/home/$user/python-venv/opencapture/bin/python3" -m pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r "$defaultPath/bin/install/pip-requirements.txt" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
"/home/$user/python-venv/opencapture/bin/python3" -c "import nltk
nltk.download('stopwords', download_dir='/home/$user/nltk_data/')
nltk.download('punkt', download_dir='/home/$user/nltk_data/')" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH

cd $defaultPath || exit 1
find . -name ".gitkeep" -delete

echo ""
echo "#######################################################################################################################"
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
echo "#######################################################################################################################"
echo ""

export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path=REPLACE(path, '$docserverDefaultPath' , '/$docserverDefaultPath/$customId/')" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path=REPLACE(path, '/var/share/' , '/var/share/$customId/') WHERE docserver_id IN ('INPUTS_ALLOWED_PATH', 'OUTPUTS_ALLOWED_PATH')" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path=REPLACE(path, '/var/share/' , '/var/share/$customId/') WHERE docserver_id IN ('VERIFIER_SHARE', 'SPLITTER_SHARE')" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/bin/scripts/' WHERE docserver_id = 'SCRIPTS_PATH'" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/bin/data/tmp/' WHERE docserver_id = 'TMP_PATH'" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/bin/data/exported_pdfa/' WHERE docserver_id = 'SEPARATOR_OUTPUT_PDFA'" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/bin/data/exported_pdf/' WHERE docserver_id = 'SEPARATOR_OUTPUT_PDF'" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/instance/referencial/' WHERE docserver_id = 'REFERENTIALS_PATH'" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/bin/data/MailCollect/' WHERE docserver_id = 'MAILCOLLECT_BATCHES'" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/bin/scripts/splitter_metadata/' WHERE docserver_id = 'SPLITTER_METADATA_PATH'" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path=REPLACE(path, '//' , '/')" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH

export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE workflows SET input=REPLACE(input::TEXT, '/var/share/', '/var/share/$customId/')::JSONB" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH

export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE outputs SET data = jsonb_set(data, '{options, parameters, 0, value}', '\"/var/share/$customId/export/verifier/\"') WHERE data #>>'{options, parameters, 0, id}' = 'folder_out' AND module = 'verifier';" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE outputs SET data = jsonb_set(data, '{options, parameters, 0, value}', '\"/var/share/$customId/entrant/verifier/\"') WHERE data #>>'{options, parameters, 0, id}' = 'folder_out' AND module = 'splitter' AND output_type_id = 'export_pdf';" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE outputs SET data = jsonb_set(data, '{options, parameters, 0, value}', '\"/var/share/$customId/export/splitter/\"') WHERE data #>>'{options, parameters, 0, id}' = 'folder_out' AND module = 'splitter' AND output_type_id = 'export_xml';" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH

export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE outputs_types SET data = jsonb_set(data, '{options, parameters, 0, placeholder}', '\"/var/share/$customId/export/verifier/\"') WHERE data #>>'{options, parameters, 0, id}' = 'folder_out' AND module = 'verifier';" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE outputs_types SET data = jsonb_set(data, '{options, parameters, 0, placeholder}', '\"/var/share/$customId/export/splitter/\"') WHERE data #>>'{options, parameters, 0, id}' = 'folder_out' AND module = 'splitter' AND output_type_id = 'export_xml';" "$databaseName" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH

####################
# Create the Apache service for backend
touch /etc/apache2/sites-available/opencapture.conf

wsgiDaemonProcessLine="WSGIDaemonProcess opencapture user=$user group=$group home=$defaultPath threads=$wsgiThreads processes=$wsgiProcess"
sitePackageLocation=$(/home/$user/python-venv/opencapture/bin/python3 -c 'import site; print(site.getsitepackages()[0])')
if [ $sitePackageLocation ]; then
    wsgiDaemonProcessLine="WSGIDaemonProcess opencapture user=$user group=$group home=$defaultPath threads=$wsgiThreads processes=$wsgiProcess python-path=$sitePackageLocation"
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
        <Files ~ \"(.ini|secret_key|.ods)\">
            Require all denied
        </Files>
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
chown -R "$user":"$group" /tmp/opencapture/

####################
# Copy file from default one
cp $defaultPath/bin/ldap/config/config.ini.default "$defaultPath/custom/$customId/bin/ldap/config/config.ini"
cp $defaultPath/instance/config/config.ini.default "$defaultPath/custom/$customId/config/config.ini"
cp $defaultPath/instance/referencial/default_referencial_supplier.ods.default "$defaultPath/custom/$customId/instance/referencial/default_referencial_supplier.ods"
cp $defaultPath/instance/referencial/default_referencial_supplier_index.json.default "$defaultPath/custom/$customId/instance/referencial/default_referencial_supplier_index.json"
cp $defaultPath/instance/referencial/LISTE_PRENOMS.csv "$defaultPath/custom/$customId/instance/referencial/LISTE_PRENOMS.csv"
cp $defaultPath/src/backend/process_queue_verifier.py.default "$defaultPath/custom/$customId/src/backend/process_queue_verifier.py"
cp $defaultPath/src/backend/process_queue_splitter.py.default "$defaultPath/custom/$customId/src/backend/process_queue_splitter.py"
cp $defaultPath/bin/scripts/OCVerifier_worker.sh.default "$defaultPath/custom/$customId/bin/scripts/OCVerifier_worker.sh"
cp $defaultPath/bin/scripts/OCSplitter_worker.sh.default "$defaultPath/custom/$customId/bin/scripts/OCSplitter_worker.sh"
cp $defaultPath/bin/scripts/MailCollect/clean.sh.default "$defaultPath/custom/$customId/bin/scripts/MailCollect/clean.sh"
cp $defaultPath/bin/scripts/load_referencial.sh.default "$defaultPath/custom/$customId/bin/scripts/load_referencial.sh"
cp $defaultPath/bin/scripts/backup_database.sh.default "$defaultPath/custom/$customId/bin/scripts/backup_database.sh"
cp $defaultPath/bin/scripts/purge_splitter.sh.default "$defaultPath/custom/$customId/bin/scripts/purge_splitter.sh"
cp $defaultPath/bin/scripts/clean_backups.sh.default "$defaultPath/custom/$customId/bin/scripts/clean_backups.sh"
cp $defaultPath/bin/scripts/load_users.sh.default "$defaultPath/custom/$customId/bin/scripts/load_users.sh"
cp -r $defaultPath/bin/scripts/splitter_metadata "$defaultPath/custom/$customId/bin/scripts/"

sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/config/config.ini"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/src/backend/process_queue_verifier.py"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/src/backend/process_queue_splitter.py"
sed -i "s#§§CUSTOM_ID§§#$oldCustomId#g" "$defaultPath/custom/$customId/bin/scripts/load_referencial.sh"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/bin/scripts/OCVerifier_worker.sh"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/bin/scripts/OCSplitter_worker.sh"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/bin/scripts/backup_database.sh"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/bin/scripts/purge_splitter.sh"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/bin/scripts/clean_backups.sh"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/bin/scripts/load_users.sh"
sed -i "s#§§DATABASE_PORT§§#$port#g" "$defaultPath/custom/$customId/bin/scripts/backup_database.sh"
sed -i "s#§§DATABASE_HOST§§#$hostname#g" "$defaultPath/custom/$customId/bin/scripts/backup_database.sh"
sed -i "s#§§DATABASE_NAME§§#$databaseName#g" "$defaultPath/custom/$customId/bin/scripts/backup_database.sh"
sed -i "s#§§DATABASE_USER§§#$databaseUsername#g" "$defaultPath/custom/$customId/bin/scripts/backup_database.sh"
sed -i "s#§§DATABASE_PASSWORD§§#$databasePassword#g" "$defaultPath/custom/$customId/bin/scripts/backup_database.sh"
sed -i "s#§§BATCH_PATH§§#$defaultPath/custom/$customId/bin/data/MailCollect/#g" "$defaultPath/custom/$customId/bin/scripts/MailCollect/clean.sh"

sed -i "s#§§PYTHON_VENV§§#/home/$user/python-venv/opencapture/bin/python3#g" "$defaultPath/custom/$customId/bin/scripts/load_users.sh"
sed -i "s#§§PYTHON_VENV§§#/home/$user/python-venv/opencapture/bin/python3#g" "$defaultPath/custom/$customId/bin/scripts/purge_splitter.sh"
sed -i "s#§§PYTHON_VENV§§#/home/$user/python-venv/opencapture/bin/python3#g" "$defaultPath/custom/$customId/bin/scripts/load_referencial.sh"
sed -i "s#§§PYTHON_VENV§§#source /home/$user/python-venv/opencapture/bin/activate#g" "$defaultPath/custom/$customId/bin/scripts/OCVerifier_worker.sh"
sed -i "s#§§PYTHON_VENV§§#source /home/$user/python-venv/opencapture/bin/activate#g" "$defaultPath/custom/$customId/bin/scripts/OCSplitter_worker.sh"

####################
# Create the service systemd or supervisor
if [ "$finalChoice" == 2 ] || [ $supervisorOrSystemd == 'systemd' ]; then
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
    sudo systemctl enable --now "OCVerifier-worker_$customId".service
    sudo systemctl enable --now "OCSplitter-worker_$customId".service
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

crudini --set "$defaultPath/instance/config/watcher.ini" verifier_default_workflow_$customId watch /var/share/"$customId"/entrant/verifier/default/
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_default_workflow_$customId events move,close
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_default_workflow_$customId include_extensions pdf,PDF
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_default_workflow_$customId command "$defaultPath/custom/$customId/bin/scripts/verifier_workflows/default_workflow.sh \$filename"

crudini --set "$defaultPath/instance/config/watcher.ini" verifier_ocr_only_$customId watch /var/share/"$customId"/entrant/verifier/ocr_only/
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_ocr_only_$customId events move,close
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_ocr_only_$customId include_extensions pdf,PDF
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_ocr_only_$customId command "$defaultPath/custom/$customId/bin/scripts/verifier_workflows/ocr_only.sh \$filename"

crudini --set "$defaultPath/instance/config/watcher.ini" splitter_default_workflow_$customId watch /var/share/"$customId"/entrant/splitter/
crudini --set "$defaultPath/instance/config/watcher.ini" splitter_default_workflow_$customId events move,close
crudini --set "$defaultPath/instance/config/watcher.ini" splitter_default_workflow_$customId include_extensions pdf,PDF
crudini --set "$defaultPath/instance/config/watcher.ini" splitter_default_workflow_$customId command "$defaultPath/custom/$customId/bin/scripts/splitter_workflows/default_workflow.sh \$filename"

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
systemctl enable --now fs-watcher

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
# Create default verifier workflow script (based on default workflow created in data_fr.sql)
cp $defaultPath/bin/scripts/verifier_workflows/script_sample_dont_touch.sh "$defaultPath/custom/$customId/bin/scripts/verifier_workflows/"
defaultScriptFile="$defaultPath/custom/$customId/bin/scripts/verifier_workflows/default_workflow.sh"

customDefaultScriptSamplePath="$defaultPath/bin/scripts/verifier_workflows/script_sample_dont_touch.sh"
sed -i "s#§§PYTHON_VENV§§#source /home/$user/python-venv/opencapture/bin/activate#g" $customDefaultScriptSamplePath

touch $defaultPath/custom/$customId/bin/data/log/OpenCapture.log
if ! test -f "$defaultScriptFile"; then
    cp $customDefaultScriptSamplePath $defaultScriptFile
    sed -i "s#§§SCRIPT_NAME§§#default_workflow#g" $defaultScriptFile
    sed -i "s#§§OC_PATH§§#$defaultPath#g" $defaultScriptFile
    sed -i "s#§§LOG_PATH§§#$defaultPath/custom/$customId/bin/data/log/OpenCapture.log#g" $defaultScriptFile
    sed -i 's#"§§ARGUMENTS§§"#-workflow_id default_workflow#g' $defaultScriptFile
    sed -i "s#§§CUSTOM_ID§§#$oldCustomId#g" $defaultScriptFile
fi

ocrOnlyFile="$defaultPath/custom/$customId/bin/scripts/verifier_workflows/ocr_only.sh"
if ! test -f "$ocrOnlyFile"; then
    cp $customDefaultScriptSamplePath $ocrOnlyFile
    sed -i "s#§§SCRIPT_NAME§§#ocr_only#g" $ocrOnlyFile
    sed -i "s#§§OC_PATH§§#$defaultPath#g" $ocrOnlyFile
    sed -i "s#§§LOG_PATH§§#$defaultPath/custom/$customId/bin/data/log/OpenCapture.log#g" $ocrOnlyFile
    sed -i 's#"§§ARGUMENTS§§"#-workflow_id ocr_only#g' $ocrOnlyFile
    sed -i "s#§§CUSTOM_ID§§#$oldCustomId#g" $ocrOnlyFile
fi

####################
# Create default splitter workflow script (based on default workflow created in data_fr.sql)
cp $defaultPath/bin/scripts/splitter_workflows/script_sample_dont_touch.sh "$defaultPath/custom/$customId/bin/scripts/splitter_workflows/"
defaultScriptFile="$defaultPath/custom/$customId/bin/scripts/splitter_workflows/default_workflows.sh"

customDefaultScriptSamplePath="$defaultPath/bin/scripts/splitter_workflows/script_sample_dont_touch.sh"
sed -i "s#§§PYTHON_VENV§§#source /home/$user/python-venv/opencapture/bin/activate#g" $customDefaultScriptSamplePath
if ! test -f "$defaultScriptFile"; then
    cp $customDefaultScriptSamplePath $defaultScriptFile
    sed -i "s#§§SCRIPT_NAME§§#default_workflow#g" $defaultScriptFile
    sed -i "s#§§OC_PATH§§#$defaultPath#g" $defaultScriptFile
    sed -i "s#§§LOG_PATH§§#$defaultPath/custom/$customId/bin/data/log/OpenCapture.log#g" $defaultScriptFile
    sed -i 's#"§§ARGUMENTS§§"#-workflow_id default_workflow#g' $defaultScriptFile
    sed -i "s#§§CUSTOM_ID§§#$oldCustomId#g" $defaultScriptFile
fi

####################
# Create default MAIL script
sed -i "s#§§PYTHON_VENV§§#source /home/$user/python-venv/opencapture/bin/activate#g" "$defaultPath/bin/scripts/launch_MAIL.sh.default"

cp "$defaultPath/bin/scripts/launch_MAIL.sh.default" "$defaultPath/custom/$customId/bin/scripts/launch_MAIL.sh"
sed -i "s#§§CUSTOM_ID§§#$oldCustomId#g" "$defaultPath/custom/$customId/bin/scripts/launch_MAIL.sh"
sed -i "s#§§OC_PATH§§#$defaultPath#g" "$defaultPath/custom/$customId/bin/scripts/launch_MAIL.sh"
sed -i "s#§§LOG_PATH§§#$defaultPath/custom/$customId/bin/data/log/OpenCapture.log#g" "$defaultPath/custom/$customId/bin/scripts/launch_MAIL.sh"

####################
# Create default LDAP script and config
cp $defaultPath/bin/ldap/synchronization_ldap_script.sh.default "$defaultPath/custom/$customId/bin/ldap/synchronization_ldap_script.sh"
sed -i "s#§§CUSTOM_ID§§#$oldCustomId#g" "$defaultPath/custom/$customId/bin/ldap/synchronization_ldap_script.sh"

####################
# Fix the rights after root launch to avoid permissions issues
chmod -R 775 $defaultPath
chmod -R g+s $defaultPath
chown -R "$user":"$group" $defaultPath

####################
# Makes scripts executable
chmod u+x $defaultPath/custom/"$customId"/bin/scripts/*.sh
chmod u+x $defaultPath/custom/"$customId"/bin/scripts/verifier_workflows/*.sh
chown -R "$user":"$group" $defaultPath/custom/"$customId"/bin/scripts/verifier_workflows/*.sh
chmod u+x $defaultPath/custom/"$customId"/bin/scripts/splitter_workflows/*.sh
chown -R "$user":"$group" $defaultPath/custom/"$customId"/bin/scripts/splitter_workflows/*.sh

####################
# Create docservers
mkdir -p $docserverDefaultPath/"$customId"/{verifier,splitter}
mkdir -p $docserverDefaultPath/"$customId"/verifier/{ai,original_pdf,full,thumbs,positions_masks}
mkdir -p $docserverDefaultPath/"$customId"/splitter/{ai,original_pdf,batches,thumbs,error}
mkdir -p $docserverDefaultPath/"$customId"/verifier/ai/{train_data,models}
mkdir -p $docserverDefaultPath/"$customId"/splitter/ai/{train_data,models}
chmod -R 775 $docserverDefaultPath
chmod -R g+s $docserverDefaultPath
chown -R "$user":"$group" $docserverDefaultPath

####################
# Create backups directory
mkdir -p /var/share/backups/"$customId"
chmod -R 775 /var/share/backups/
chmod -R g+s /var/share/backups/
chown -R "$user":"$group" /var/share/backups/

####################
# Add backup script to cron
cron="0 2 * * * $defaultPath/custom/$customId/bin/scripts/backup_database.sh &> /dev/null"
cron_backup="0 3 * * * $defaultPath/custom/$customId/bin/scripts/clean_backups.sh &> /dev/null"
(crontab -u $user -l; echo "$cron" ) | crontab -u $user -
(crontab -u $user -l; echo "$cron_backup" ) | crontab -u $user -

####################
# Create default export and input XML and PDF folder
mkdir -p /var/share/"$customId"/{entrant,export}/{verifier,splitter}/
mkdir -p /var/share/"$customId"/entrant/verifier/{ocr_only,default}/
chmod -R 775 /var/share/"$customId"/
chown -R "$user":"$group" /var/share/"$customId"/
