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
    echo "create_custom.sh needed to be launch by user with root privileges"
    exit 1
fi

group=www-data
bold=$(tput bold)
normal=$(tput sgr0)
user=$(who am i | awk '{print $1}')
defaultPath=/var/www/html/opencapture

####################
# Check if custom name is set and doesn't exists already

apt-get install -y crudini > /dev/null

while getopts "c:t:p:" arguments
do
    case "${arguments}" in
        c) customId=${OPTARG};;
        t) installationType=${OPTARG};;
        p) pythonVenv=${OPTARG};;
        *) customId=""
            installationType=""
            pythonVenv=""
    esac
done

####################
# Replace dot and - with _ in custom_id to avoid python error
oldCustomId=$customId
customId=${customId//[\.\-]/_}

if [[ "$customId" =~ [[:upper:]] ]]; then
    echo "##########################################################################"
    echo "             Custom id could'nt include uppercase characters              "
    echo "##########################################################################"
    exit 1
fi

if [ -z "$customId" ]; then
    echo "###############################################################################################"
    echo "                       Custom id is needed to run the installation"
    echo "   Exemple of command line call : sudo ./create_custom.sh -c edissyum_bis -t systemd -p true"
    echo "###############################################################################################"
    exit 2
fi

if [ -z "$pythonVenv" ]; then
    echo "###############################################################################################"
    echo "                      Python Venv is mandatory using the -p argument"
    echo "                          Possible values are 'true' or 'false'"
    echo "   Exemple of command line call : sudo ./create_custom.sh -c edissyum_bis -t systemd -p true"
    echo "###############################################################################################"
    exit 3
fi

if [ "$customId" == 'custom' ]; then
    echo "##############################################################################################"
    echo "                     Please do not create a custom called 'custom'"
    echo "      Exemple of command line call : sudo ./update.sh -c edissyum_bis -t systemd -p true      "
    echo "##############################################################################################"
    exit 4
fi

if [ "$pythonVenv" != 'true' ] && [ "$pythonVenv" != 'false' ]; then
    echo "##############################################################################################"
    echo "               Possible values for -p argument are 'true' or 'false'"
    echo "      Exemple of command line call : sudo ./update.sh -c edissyum_bis -t systemd -p true"
    echo "##############################################################################################"
    exit 5
fi

if [ "$pythonVenv" == 'true' ] && [ ! -f "/home/$user/python-venv/opencapture/bin/python3" ]; then
    echo "#######################################################################################"
    echo "            The default Python Virtual environment path doesn't exist"
    echo "  Do you want to exit update ? If no, the script will use default Python installation"
    echo "#######################################################################################"
    printf "Enter your choice [%s] : " "yes/${bold}no${normal}"
    read -r choice
    if [ "$choice" = "yes" ]; then
        exit
    else
        pythonVenv='false'
    fi
fi

if [ "$installationType" == '' ] || { [ "$installationType" != 'systemd' ] && [ "$installationType" != 'supervisor' ]; }; then
    echo "#######################################################################################################"
    echo "                           Bad value for installationType variable"
    echo "       Exemple of command line call : sudo ./create_custom.sh -c edissyum_bis -t systemd -p true"
    echo "      Exemple of command line call : sudo ./create_custom.sh -c edissyum_bis -t supervisor-p true"
    echo "#######################################################################################################"
    exit 6
fi

if [ "$installationType" == 'supervisor' ]; then
    echo ""
    echo "#################################################################################################"
    echo ""
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

if [ -L "$defaultPath/$customId" ] && [ -e "$defaultPath/$customId" ]; then
    echo "######################################################"
    echo "      Custom id \"$customId\" already exists"
    echo "######################################################"
    exit 7
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
       exit 8
    fi
done

databaseName="opencapture_$customId"
if [[ "$customId" = *"opencapture_"* ]]; then
    databaseName="$customId"
fi
echo ""
echo "#################################################################################################"
echo ""

####################
# Retrieve database informations
echo "Type database informations (hostname, port, username and password and postgres user password)."
echo "It will be used to update path to use the custom's one"
echo "Please specify a user that don't already exists"
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

if [ "$hostname" != "localhost" ] || [ "$port" != "5432" ]; then
    printf "Postgres user Password [%s] : " "${bold}postgres${normal}"
    read -r choice

    if [[ "$choice" == "" ]]; then
        postgresPassword="postgres"
    else
        postgresPassword="$choice"
    fi
    export PGPASSWORD=$postgresPassword && su postgres -c "psql -h$hostname -p$port -c 'CREATE ROLE $databaseUsername'"
    export PGPASSWORD=$postgresPassword && su postgres -c "psql -h$hostname -p$port -c 'ALTER ROLE $databaseUsername WITH LOGIN'"
    export PGPASSWORD=$postgresPassword && su postgres -c "psql -h$hostname -p$port -c 'ALTER ROLE $databaseUsername WITH CREATEDB'"
    export PGPASSWORD=$postgresPassword && su postgres -c "psql -h$hostname -p$port -c \"ALTER ROLE $databaseUsername WITH ENCRYPTED PASSWORD '$databasePassword'\""
else
  su postgres -c "psql -c 'CREATE ROLE $databaseUsername'"
  su postgres -c "psql -c 'ALTER ROLE $databaseUsername WITH LOGIN'"
  su postgres -c "psql -c 'ALTER ROLE $databaseUsername WITH CREATEDB'"
  su postgres -c "psql -c \"ALTER ROLE $databaseUsername WITH ENCRYPTED PASSWORD '$databasePassword'\""
fi

####################
# Create database using custom_id
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "CREATE DATABASE $databaseName WITH template=template0 encoding='UTF8'" postgres
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "\i $defaultPath/instance/sql/structure.sql" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "\i $defaultPath/instance/sql/global.sql" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "\i $defaultPath/instance/sql/data_fr.sql" "$databaseName"

echo ""
echo "#################################################################################################"
echo ""

####################
# Create docservers
echo "Type docserver default path informations. By default it's /var/docservers/opencapture/"
printf "Docserver default path [%s] : " "${bold}/var/docservers/opencapture/${normal}"
read -r choice

if [[ "$choice" == "" ]]; then
    docserverDefaultPath="/var/docservers/opencapture/"
else
    docserverDefaultPath="$choice"
fi

mkdir -p $docserverDefaultPath/"$customId"/{verifier,splitter}
mkdir -p $docserverDefaultPath/"$customId"/verifier/{ai,original_pdf,full,thumbs,positions_masks}
mkdir -p $docserverDefaultPath/"$customId"/splitter/{ai,original_pdf,batches,thumbs,error}
mkdir -p $docserverPath/opencapture/"$customId"/verifier/ai/{train_data,models}
mkdir -p $docserverPath/opencapture/"$customId"/splitter/ai/{train_data,models}
sudo chmod -R 775 /"$docserverDefaultPath"/"$customId"/
sudo chown -R "$user":www-data /"$docserverDefaultPath"/"$customId"/

customPath=$defaultPath/custom/"$customId"

export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path=REPLACE(path, '$docserverDefaultPath' , '/$docserverDefaultPath/$customId/')" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/bin/scripts/' WHERE docserver_id = 'SCRIPTS_PATH'" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/bin/data/tmp/' WHERE docserver_id = 'TMP_PATH'" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/bin/data/exported_pdfa/' WHERE docserver_id = 'SEPARATOR_OUTPUT_PDFA'" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/bin/data/exported_pdf/' WHERE docserver_id = 'SEPARATOR_OUTPUT_PDF'" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/instance/referencial/' WHERE docserver_id = 'REFERENTIALS_PATH'" "$databaseName"

####################
# Create custom symbolic link and folders
ln -s "$defaultPath" "$defaultPath/$customId"
mkdir -p $customPath/{config,bin,assets,instance,src}/
mkdir -p $customPath/bin/{data,ldap,scripts}/
mkdir -p $customPath/assets/imgs/
mkdir -p $customPath/bin/ldap/config/
mkdir -p $customPath/instance/referencial/
mkdir -p $customPath/bin/data/{log,MailCollect,tmp,exported_pdf,exported_pdfa}/
mkdir -p $customPath/bin/data/log/Supervisor/
touch $customPath/bin/data/log/OpenCapture.log
mkdir -p $customPath/bin/scripts/{verifier_inputs,splitter_inputs,MailCollect,ai}/
mkdir -p $customPath/bin/scripts/ai/{splitter,verifier}
mkdir -p $customPath/src/backend/
touch $customPath/config/secret_key

echo "[$oldCustomId]" >> $customIniFile
echo "path = $defaultPath/custom/$customId" >> $customIniFile
echo "isdefault = False" >> $customIniFile
echo "" >> $customIniFile

####################
# Generate secret key for Flask and write it to custom secret_key file
secret=$(python3 -c 'import secrets; print(secrets.token_hex(32))')
echo "$secret" > $customPath/config/secret_key

####################
# Create custom input and outputs folder
mkdir -p /var/share/"$customId"/{entrant,export}/{verifier,splitter}/
chmod -R 775 /var/share/"$customId"/
chown -R "$user":"$group" /var/share/"$customId"/

export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE inputs SET input_folder=REPLACE(input_folder, '/var/share/' , '/var/share/$customId/')" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE outputs SET data = jsonb_set(data, '{options,parameters, 0, value}', '\"/var/share/$customId/export/verifier/\"') WHERE data #>>'{options,parameters, 0, id}' = 'folder_out';" "$databaseName" > /dev/null
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE outputs SET data = jsonb_set(data, '{options, parameters, 0, value}', '\"/var/share/$customId/entrant/verifier/\"') WHERE data #>>'{options,parameters, 0, id}' = 'folder_out' AND module = 'splitter' AND output_type_id = 'export_pdf';" "$databaseName" > /dev/null
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE outputs SET data = jsonb_set(data, '{options, parameters, 0, value}', '\"/var/share/$customId/export/splitter/\"') WHERE data #>>'{options,parameters, 0, id}' = 'folder_out' AND module = 'splitter' AND output_type_id = 'export_xml';" "$databaseName" > /dev/null
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE configurations SET data = jsonb_set(data, '{value, batchPath}', '\"$defaultPath/custom/$customId/bin/data/MailCollect/\"') WHERE label = 'mailCollectGeneral';" "$databaseName" > /dev/null

####################
# Copy file from default one
cp $defaultPath/instance/referencial/default_referencial_supplier.ods.default "$defaultPath/custom/$customId/instance/referencial/default_referencial_supplier.ods"
cp $defaultPath/instance/referencial/default_referencial_supplier_index.json.default "$defaultPath/custom/$customId/instance/referencial/default_referencial_supplier_index.json"
cp $defaultPath/instance/config/config.ini.default "$defaultPath/custom/$customId/config/config.ini"
cp $defaultPath/bin/ldap/config/config.ini.default "$defaultPath/custom/$customId/bin/ldap/config/config.ini"
cp $defaultPath/src/backend/process_queue_verifier.py.default "$defaultPath/custom/$customId/src/backend/process_queue_verifier.py"
cp $defaultPath/src/backend/process_queue_splitter.py.default "$defaultPath/custom/$customId/src/backend/process_queue_splitter.py"
cp $defaultPath/bin/scripts/OCVerifier_worker.sh.default "$defaultPath/custom/$customId/bin/scripts/OCVerifier_worker.sh"
cp $defaultPath/bin/scripts/OCSplitter_worker.sh.default "$defaultPath/custom/$customId/bin/scripts/OCSplitter_worker.sh"
cp $defaultPath/bin/scripts/load_referencial.sh.default "$defaultPath/custom/$customId/bin/scripts/load_referencial.sh"
cp $defaultPath/bin/scripts/MailCollect/clean.sh.default "$defaultPath/custom/$customId/bin/scripts/MailCollect/clean.sh"

sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/config/config.ini"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/src/backend/process_queue_verifier.py"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/src/backend/process_queue_splitter.py"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/bin/scripts/OCVerifier_worker.sh"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/bin/scripts/OCSplitter_worker.sh"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/bin/scripts/load_referencial.sh"
sed -i "s#§§BATCH_PATH§§#$defaultPath/custom/$customId/bin/data/MailCollect/#g" "$defaultPath/custom/$customId/bin/scripts/MailCollect/clean.sh"

if [ $pythonVenv = 'true' ]; then
    sed -i "s#§§PYTHON_VENV§§#/home/$user/python-venv/opencapture/bin/python3#g" "$defaultPath/custom/$customId/bin/scripts/load_referencial.sh"
    sed -i "s#§§PYTHON_VENV§§#source /home/$user/python-venv/opencapture/bin/activate#g" "$defaultPath/custom/$customId/bin/scripts/OCVerifier_worker.sh"
    sed -i "s#§§PYTHON_VENV§§#source /home/$user/python-venv/opencapture/bin/activate#g" "$defaultPath/custom/$customId/bin/scripts/OCSplitter_worker.sh"
else
    sed -i "s#§§PYTHON_VENV§§##g" "$defaultPath/custom/$customId/bin/scripts/OCVerifier_worker.sh"
    sed -i "s#§§PYTHON_VENV§§##g" "$defaultPath/custom/$customId/bin/scripts/OCSplitter_worker.sh"
    sed -i "s#§§PYTHON_VENV§§#python3#g" "$defaultPath/custom/$customId/bin/scripts/load_referencial.sh"
fi

confFile="$defaultPath/custom/$customId/config/config.ini"
crudini --set "$confFile" DATABASE postgresHost "$hostname"
crudini --set "$confFile" DATABASE postgresPort "$port"
crudini --set "$confFile" DATABASE postgresDatabase "$databaseName"
crudini --set "$confFile" DATABASE postgresUser " $databaseUsername"
crudini --set "$confFile" DATABASE postgresPassword " $databasePassword"

echo ""
echo "#################################################################################################"
echo ""

####################
# Create default MAIL script
cp "$defaultPath/bin/scripts/launch_MAIL.sh.default" "$defaultPath/custom/$customId/bin/scripts/launch_MAIL.sh"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/bin/scripts/launch_MAIL.sh"
sed -i "s#§§OC_PATH§§#$defaultPath#g" "$defaultPath/custom/$customId/bin/scripts/launch_MAIL.sh"
sed -i "s#§§LOG_PATH§§#$defaultPath/custom/$customId/bin/data/log/OpenCapture.log#g" "$defaultPath/custom/$customId/bin/scripts/launch_MAIL.sh"

####################
# Move defaults scripts to new custom location
cp $defaultPath/bin/scripts/verifier_inputs/script_sample_dont_touch.sh "$defaultPath/custom/$customId/bin/scripts/verifier_inputs/"
cp $defaultPath/bin/scripts/splitter_inputs/script_sample_dont_touch.sh "$defaultPath/custom/$customId/bin/scripts/splitter_inputs/"

defaultScriptFile="$defaultPath/custom/$customId/bin/scripts/verifier_inputs/default_input.sh"
cp $defaultPath/bin/scripts/verifier_inputs/script_sample_dont_touch.sh $defaultScriptFile
sed -i "s#§§SCRIPT_NAME§§#default_input#g" $defaultScriptFile
sed -i "s#§§OC_PATH§§#$defaultPath#g" $defaultScriptFile
sed -i "s#§§LOG_PATH§§#$defaultPath/custom/$customId/bin/data/log/OpenCapture.log#g" $defaultScriptFile
sed -i 's#"§§ARGUMENTS§§"#-input_id default_input#g' $defaultScriptFile
sed -i "s#§§CUSTOM_ID§§#$customId#g" $defaultScriptFile

defaultScriptFile="$defaultPath/custom/$customId/bin/scripts/splitter_inputs/default_input.sh"
cp $defaultPath/bin/scripts/splitter_inputs/script_sample_dont_touch.sh $defaultScriptFile
sed -i "s#§§SCRIPT_NAME§§#default_input#g" $defaultScriptFile
sed -i "s#§§OC_PATH§§#$defaultPath#g" $defaultScriptFile
sed -i "s#§§LOG_PATH§§#$defaultPath/custom/$customId/bin/data/log/OpenCapture.log#g" $defaultScriptFile
sed -i 's#"§§ARGUMENTS§§"#-input_id default_input#g' $defaultScriptFile
sed -i "s#§§CUSTOM_ID§§#$customId#g" $defaultScriptFile

####################
# Fill the watcher.ini
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_default_input_$customId watch /var/share/"$customId"/entrant/verifier/
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_default_input_$customId events move,close
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_default_input_$customId include_extensions pdf,PDF
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_default_input_$customId command "$defaultPath/custom/$customId/bin/scripts/verifier_inputs/default_input.sh \$filename"

crudini --set "$defaultPath/instance/config/watcher.ini" splitter_default_input_$customId watch /var/share/"$customId"/entrant/splitter/
crudini --set "$defaultPath/instance/config/watcher.ini" splitter_default_input_$customId events move,close
crudini --set "$defaultPath/instance/config/watcher.ini" splitter_default_input_$customId include_extensions pdf,PDF
crudini --set "$defaultPath/instance/config/watcher.ini" splitter_default_input_$customId command "$defaultPath/custom/$customId/bin/scripts/splitter_inputs/default_input.sh \$filename"

####################
# Fix the rights after root launch to avoid permissions issues
chmod -R 775 $defaultPath
chmod -R g+s $defaultPath
chown -R "$user":"$group" $defaultPath

####################
# Create new supervisor or systemd files

if [ $installationType == 'systemd' ]; then
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
elif [ $installationType == 'supervisor' ]; then
    touch "/etc/supervisor/conf.d/OCVerifier-worker_$customId.conf"
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
    touch "/etc/supervisor/conf.d/OCSplitter-worker_$customId.conf"
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

####################
# Makes scripts executable
chmod u+x $customPath/bin/scripts/*.sh
chmod u+x $customPath/bin/scripts/splitter_inputs/*.sh
chmod u+x $customPath/bin/scripts/splitter_inputs/*.sh
chown -R "$user":"$user" $customPath/bin/scripts/
