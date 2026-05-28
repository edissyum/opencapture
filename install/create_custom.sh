#!/bin/bash
# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# See LICENCE file at the root folder for more details.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

if [ "$EUID" -ne 0 ]; then
    echo "create_custom.sh needed to be launch by user with root privileges"
    exit 1
fi

if [ "$(uname -m)" != 'x86_64' ]; then
    echo "This script is only compatible with x86_64 architecture"
    exit 1
fi

group=www-data
bold=$(tput bold)
normal=$(tput sgr0)
user=$(who am i | awk '{print $1}')
defaultPath=/var/www/html/opencapture

apt-get install -y crudini > /dev/null

####################
# Handle parameters
parameters="user path custom_id supervisor_systemd database_name database_hostname database_port database_username database_password docserver_path python_venv_path share_path"
opts=$(getopt --longoptions "$(printf "%s:," "$parameters")" --name "$(basename "$0")" --options "" -- "$@")

while [ $# -gt 0 ]; do
    case "$1" in
        --user)
            user=$2
            shift 2;;
        --custom_id)
            customId=$2
            shift 2;;
        --path)
            defaultPath=$2
            shift 2;;
        --supervisor_systemd)
            supervisorOrSystemd=$2
            shift 2;;
        --database_hostname)
            hostname=$2
            shift 2;;
        --python_venv_path)
            pythonVenvPath=$2
            shift 2;;
        --share_path)
            shareDefaultPath=$2
            shift 2;;
        --database_port)
            port=$2
            shift 2;;
        --database_name)
            databaseName=$2
            shift 2;;
        --database_username)
            databaseUsername=$2
            shift 2;;
        --database_password)
            databasePassword=$2
            shift 2;;
        --docserver_path)
            docserverDefaultPath=$2
            shift 2;;
    *)
        customId=""
        $supervisorOrSystemd=""
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

####################
# Replace dot and - with _ in custom_id to avoid python error
oldCustomId=$customId
customId=${customId//[\.\-]/_}
customId=$(echo "$customId" | tr "[:upper:]" "[:lower:]")

if [[ "$customId" =~ [[:upper:]] ]]; then
    echo "##########################################################################"
    echo "             Custom id could'nt include uppercase characters              "
    echo "##########################################################################"
    exit 1
fi

if [ -z "$customId" ]; then
    echo "################################################################################################################"
    echo "                              Custom id is needed to run the installation"
    echo " Exemple of command line call : sudo ./create_custom.sh --custom_id edissyum_bis --supervisor_systemd systemd"
    echo "################################################################################################################"
    exit 2
fi

if [ "$customId" == 'custom' ]; then
    echo "################################################################################################################"
    echo "                              Please do not create a custom called 'custom'"
    echo " Exemple of command line call : sudo ./create_custom.sh --custom_id edissyum_bis --supervisor_systemd systemd"
    echo "################################################################################################################"
    exit 4
fi

if [ "$supervisorOrSystemd" == '' ] || { [ "$supervisorOrSystemd" != 'systemd' ] && [ "$supervisorOrSystemd" != 'supervisor' ]; }; then
    echo "###################################################################################################################"
    echo "                                 Bad value for installationType variable"
    echo "  Exemple of command line call : sudo ./create_custom.sh --custom_id edissyum_bis --supervisor_systemd systemd"
    echo " Exemple of command line call : sudo ./create_custom.sh --custom_id edissyum_bis --supervisor_systemd supervisor"
    echo "##################################################################################################################"
    exit 6
fi

if [ "$supervisorOrSystemd" == 'supervisor' ]; then
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

####################
# Check if custom name is set and doesn't exists already
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

if [ -z "$databaseName" ]; then
    databaseName="opencapture_$customId"
    if [[ "$customId" = *"opencapture_"* ]]; then
      databaseName="$customId"
    fi

    echo ""
    echo "#################################################################################################"
    echo ""
fi

####################
# Retrieve database informations
if [ -z $hostname ] && [ -z $port ] && [ -z $databaseUsername ] && [ -z $databasePassword ]; then
    echo "Type database informations (hostname, port, username and password and postgres user password)."
    echo "It will be used to update path to use the custom's one"
fi

if [ -z "$hostname" ]; then
    printf "Hostname [%s] : " "${bold}localhost${normal}"
    read -r choice

    if [[ "$choice" == "" ]]; then
        hostname="localhost"
    else
        hostname="$choice"
    fi
fi

if [ -z "$port" ]; then
    printf "Port [%s] : " "${bold}5432${normal}"
    read -r choice

    if [[ "$choice" == "" ]]; then
        port=5432
    else
        port="$choice"
    fi
fi

if [ -z "$databaseUsername" ]; then
    printf "Username [%s] : " "${bold}$customId${normal}"
    read -r choice

    if [[ "$choice" == "" ]]; then
      databaseUsername="$customId"
    else
      databaseUsername="$choice"
    fi
fi

if [ -z "$databasePassword" ]; then
    printf "Password [%s] : " "${bold}$customId${normal}"
    read -r choice

    if [[ "$choice" == "" ]]; then
        databasePassword="$customId"
    else
        databasePassword="$choice"
    fi
fi

echo ""
echo "#################################################################################################"
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

if [[ -z $shareDefaultPath ]]; then
    shareDefaultPath="/var/share/"
fi

if [[ -z $pythonVenvPath ]]; then
    pythonVenvPath="/home/$user/python-venv/opencapture"
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
mkdir -p $docserverDefaultPath/"$customId"/{verifier,splitter}
mkdir -p $docserverDefaultPath/"$customId"/verifier/{ai,attachments,original_doc,full,thumbs,positions_masks}
mkdir -p $docserverDefaultPath/"$customId"/splitter/{ai,attachments,original_doc,batches,thumbs,error}
mkdir -p $docserverDefaultPath/"$customId"/verifier/ai/{train_data,models}
mkdir -p $docserverDefaultPath/"$customId"/splitter/ai/{train_data,models}
chmod -R 775 /"$docserverDefaultPath"/"$customId"/
chown -R "$user":www-data /"$docserverDefaultPath"/"$customId"/

customPath=$defaultPath/custom/"$customId"

export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path=REPLACE(path, '/var/www/html/opencapture/' , '$defaultPath/')" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path=REPLACE(path, '/var/docservers/opencapture/' , '$docserverDefaultPath/$customId/')" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path=REPLACE(path, '/var/share/' , '$shareDefaultPath/$customId/')" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/bin/scripts/' WHERE docserver_id = 'SCRIPTS_PATH'" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/data/error/' WHERE docserver_id = 'ERROR_PATH'" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/data/tmp/' WHERE docserver_id = 'TMP_PATH'" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/data/exported_pdfa/' WHERE docserver_id = 'SEPARATOR_OUTPUT_PDFA'" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/data/exported_pdf/' WHERE docserver_id = 'SEPARATOR_OUTPUT_PDF'" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/instance/referencial/' WHERE docserver_id = 'REFERENTIALS_PATH'" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/data/MailCollect/' WHERE docserver_id = 'MAILCOLLECT_BATCHES'" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/bin/scripts/splitter_metadata/' WHERE docserver_id = 'SPLITTER_METADATA_PATH'" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path='$customPath/bin/scripts/splitter_methods/' WHERE docserver_id = 'SPLITTER_METHODS_PATH'" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE docservers SET path=REPLACE(path, '//' , '/')" "$databaseName"

####################
# Create custom symbolic link and folders
ln -s "$defaultPath" "$defaultPath/$customId"
mkdir -p $customPath/{config,bin,assets,instance,src,data}/
mkdir -p $customPath/bin/{ldap,scripts}/
mkdir -p $customPath/assets/imgs/
mkdir -p $customPath/bin/ldap/config/
mkdir -p $customPath/instance/referencial/
mkdir -p $customPath/data/{log,MailCollect,tmp,exported_pdf,exported_pdfa,error}/
mkdir -p $customPath/data/MailCollect/_ERROR/
mkdir -p $customPath/data/log/Supervisor/
touch $customPath/data/log/OpenCapture.log
mkdir -p $customPath/bin/scripts/{verifier_workflows,splitter_workflows,splitter_metadata,splitter_methods,MailCollect,ai}/
mkdir -p $customPath/bin/scripts/ai/{splitter,verifier}
mkdir -p $customPath/src/backend/
touch $customPath/config/secret_key

echo "[$oldCustomId]" >> $customIniFile
echo "path = $defaultPath/custom/$customId" >> $customIniFile
echo -e "" >> $customIniFile

####################
# Generate secret key for Flask and write it to custom secret_key file
secret=$(python3 -c 'import secrets; print(secrets.token_hex(32))')
echo "$secret" > $customPath/config/secret_key

####################
# Create custom input and outputs folder
mkdir -p $shareDefaultPath/"$customId"/{entrant,export}/{verifier,splitter}/
mkdir -p $shareDefaultPath/"$customId"/entrant/verifier/{ocr_only,default,default_mail}/
chmod -R 775 $shareDefaultPath/"$customId"/
chown -R "$user":"$group" $shareDefaultPath/"$customId"/

export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE workflows SET input=REPLACE(input::TEXT, '/var/share/', '$shareDefaultPath/$customId/')::JSONB" "$databaseName" > /dev/null

export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE outputs SET data = jsonb_set(data, '{options, parameters, 0, value}', '\"$shareDefaultPath/$customId/export/verifier/\"') WHERE data #>>'{options, parameters, 0, id}' = 'folder_out';" "$databaseName" > /dev/null
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE outputs SET data = jsonb_set(data, '{options, parameters, 0, value}', '\"$shareDefaultPath/$customId/export/splitter/\"') WHERE data #>>'{options, parameters, 0, id}' = 'folder_out' AND module = 'splitter' AND output_type_id = 'export_pdf';" "$databaseName" > /dev/null
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE outputs SET data = jsonb_set(data, '{options, parameters, 0, value}', '\"$shareDefaultPath/$customId/export/splitter/\"') WHERE data #>>'{options, parameters, 0, id}' = 'folder_out' AND module = 'splitter' AND output_type_id = 'export_xml';" "$databaseName" > /dev/null

export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE outputs_types SET data = jsonb_set(data, '{options, parameters, 0, placeholder}', '\"$shareDefaultPath/$customId/export/verifier/\"') WHERE data #>>'{options,parameters, 0, id}' = 'folder_out' AND module = 'verifier';" "$databaseName" > /dev/null
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE outputs_types SET data = jsonb_set(data, '{options, parameters, 0, placeholder}', '\"$shareDefaultPath/$customId/export/splitter/\"') WHERE data #>>'{options,parameters, 0, id}' = 'folder_out' AND module = 'splitter' AND output_type_id = 'export_xml';" "$databaseName" > /dev/null

####################
# Copy file from default one
cp $defaultPath/instance/referencial/default_referencial_supplier.csv.default "$defaultPath/custom/$customId/instance/referencial/default_referencial_supplier.csv"
cp $defaultPath/instance/referencial/default_referencial_supplier_index.json.default "$defaultPath/custom/$customId/instance/referencial/default_referencial_supplier_index.json"
cp $defaultPath/instance/referencial/LISTE_PRENOMS.csv "$defaultPath/custom/$customId/instance/referencial/LISTE_PRENOMS.csv"
cp $defaultPath/instance/referencial/CURRENCY_CODE.csv "$defaultPath/custom/$customId/instance/referencial/CURRENCY_CODE.csv"
cp $defaultPath/src/backend/process_queue_verifier.py.default "$defaultPath/custom/$customId/src/backend/process_queue_verifier.py"
cp $defaultPath/src/backend/process_queue_splitter.py.default "$defaultPath/custom/$customId/src/backend/process_queue_splitter.py"
cp $defaultPath/bin/scripts/load_referential_splitter.sh.default "$defaultPath/custom/$customId/bin/scripts/load_referential_splitter.sh"
cp $defaultPath/bin/scripts/OCVerifier_worker.sh.default "$defaultPath/custom/$customId/bin/scripts/OCVerifier_worker.sh"
cp $defaultPath/bin/scripts/OCSplitter_worker.sh.default "$defaultPath/custom/$customId/bin/scripts/OCSplitter_worker.sh"
cp $defaultPath/bin/scripts/MailCollect/clean.sh.default "$defaultPath/custom/$customId/bin/scripts/MailCollect/clean.sh"
cp $defaultPath/bin/scripts/load_supplier_referencial.sh.default "$defaultPath/custom/$customId/bin/scripts/load_supplier_referencial.sh"
cp $defaultPath/bin/scripts/load_users.sh.default "$defaultPath/custom/$customId/bin/scripts/load_users.sh"
cp $defaultPath/bin/scripts/purge_splitter.sh.default "$defaultPath/custom/$customId/bin/scripts/purge_splitter.sh"
cp $defaultPath/bin/scripts/purge_verifier.sh.default "$defaultPath/custom/$customId/bin/scripts/purge_verifier.sh"
cp $defaultPath/bin/ldap/config/config.ini.default "$defaultPath/custom/$customId/bin/ldap/config/config.ini"
cp $defaultPath/instance/config/config.ini.default "$defaultPath/custom/$customId/config/config.ini"

cp -r $defaultPath/bin/scripts/splitter_methods/* "$defaultPath/custom/$customId/bin/scripts/splitter_methods/"
cp -r $defaultPath/bin/scripts/splitter_metadata/* "$defaultPath/custom/$customId/bin/scripts/splitter_metadata/"

sed -i "s#§§PYTHON_VENV§§#source $pythonVenvPath/bin/activate#g" "$defaultPath/custom/$customId/bin/scripts/OCVerifier_worker.sh"
sed -i "s#§§PYTHON_VENV§§#source $pythonVenvPath/bin/activate#g" "$defaultPath/custom/$customId/bin/scripts/OCSplitter_worker.sh"

find "$defaultPath/custom/$customId/bin/scripts/" -name "*.sh" | while IFS= read -r file; do
    sed -i "s#§§OC_PATH§§#$defaultPath#g" $file
    sed -i "s#§§CUSTOM_ID§§#$customId#g" $file
    sed -i "s#§§PYTHON_VENV§§#$pythonVenvPath/bin/python3#g" $file
done

sed -i "s#§§OC_PATH§§#$defaultPath#g" "$defaultPath/custom/$customId/config/config.ini"
sed -i "s#§§OC_PATH§§#$defaultPath#g" "$defaultPath/custom/$customId/bin/ldap/config/config.ini"

cp -r $defaultPath/bin/scripts/splitter_methods/* "$defaultPath/custom/$customId/bin/scripts/splitter_methods/"
cp -r $defaultPath/bin/scripts/splitter_metadata/* "$defaultPath/custom/$customId/bin/scripts/splitter_metadata/"

sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/config/config.ini"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/bin/ldap/config/config.ini"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/src/backend/process_queue_verifier.py"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/src/backend/process_queue_splitter.py"
sed -i "s#§§BATCH_PATH§§#$defaultPath/custom/$customId/data/MailCollect/#g" "$defaultPath/custom/$customId/bin/scripts/MailCollect/clean.sh"

confFile="$defaultPath/custom/$customId/config/config.ini"
crudini --set "$confFile" DATABASE postgresPort "$port"
crudini --set "$confFile" DATABASE postgresHost "$hostname"
crudini --set "$confFile" DATABASE postgresDatabase "$databaseName"
crudini --set "$confFile" DATABASE postgresUser " $databaseUsername"
crudini --set "$confFile" DATABASE postgresPassword " $databasePassword"

echo ""
echo "#################################################################################################"
echo ""

####################
# Create default MAIL script
cp "$defaultPath/bin/scripts/launch_MAIL.sh.default" "$defaultPath/custom/$customId/bin/scripts/launch_MAIL.sh"
sed -i "s#§§OC_PATH§§#$defaultPath#g" "$defaultPath/custom/$customId/bin/scripts/launch_MAIL.sh"
sed -i "s#§§CUSTOM_ID§§#$oldCustomId#g" "$defaultPath/custom/$customId/bin/scripts/launch_MAIL.sh"
sed -i "s#§§LOG_PATH§§#$defaultPath/custom/$customId/data/log/OpenCapture.log#g" "$defaultPath/custom/$customId/bin/scripts/launch_MAIL.sh"

####################
# Move defaults scripts to new custom location
cp $defaultPath/bin/scripts/verifier_workflows/script_sample_dont_touch.sh "$defaultPath/custom/$customId/bin/scripts/verifier_workflows/"
cp $defaultPath/bin/scripts/splitter_workflows/script_sample_dont_touch.sh "$defaultPath/custom/$customId/bin/scripts/splitter_workflows/"

sed -i "s#§§PYTHON_VENV§§#source $pythonVenvPath/bin/activate#g" "$defaultPath/custom/$customId/bin/scripts/verifier_workflows/script_sample_dont_touch.sh"
sed -i "s#§§PYTHON_VENV§§#source $pythonVenvPath/bin/activate#g" "$defaultPath/custom/$customId/bin/scripts/splitter_workflows/script_sample_dont_touch.sh"

defaultScriptFile="$defaultPath/custom/$customId/bin/scripts/verifier_workflows/default_workflow.sh"
cp $defaultPath/bin/scripts/verifier_workflows/script_sample_dont_touch.sh $defaultScriptFile
sed -i "s#§§OC_PATH§§#$defaultPath#g" $defaultScriptFile
sed -i "s#§§SCRIPT_NAME§§#default_workflow#g" $defaultScriptFile
sed -i "s#§§LOG_PATH§§#$defaultPath/custom/$customId/data/log/OpenCapture.log#g" $defaultScriptFile
sed -i 's#"§§ARGUMENTS§§"#-workflow_id default_workflow#g' $defaultScriptFile
sed -i "s#§§CUSTOM_ID§§#$oldCustomId#g" $defaultScriptFile

ocrOnlyFile="$defaultPath/custom/$customId/bin/scripts/verifier_workflows/ocr_only.sh"
cp $defaultPath/bin/scripts/verifier_workflows/script_sample_dont_touch.sh $ocrOnlyFile
sed -i "s#§§SCRIPT_NAME§§#ocr_only#g" $ocrOnlyFile
sed -i "s#§§OC_PATH§§#$defaultPath#g" $ocrOnlyFile
sed -i "s#§§LOG_PATH§§#$defaultPath/custom/$customId/data/log/OpenCapture.log#g" $ocrOnlyFile
sed -i 's#"§§ARGUMENTS§§"#-workflow_id ocr_only#g' $ocrOnlyFile
sed -i "s#§§CUSTOM_ID§§#$oldCustomId#g" $ocrOnlyFile

defaultMailFile="$defaultPath/custom/$customId/bin/scripts/verifier_workflows/default_mail.sh"
cp $defaultPath/bin/scripts/verifier_workflows/script_sample_dont_touch.sh $defaultMailFile
sed -i "s#§§SCRIPT_NAME§§#default_mail#g" $defaultMailFile
sed -i "s#§§OC_PATH§§#$defaultPath#g" $defaultMailFile
sed -i "s#§§LOG_PATH§§#$defaultPath/custom/$customId/data/log/OpenCapture.log#g" $defaultMailFile
sed -i 's#"§§ARGUMENTS§§"#-workflow_id default_mail#g' $defaultMailFile
sed -i "s#§§CUSTOM_ID§§#$oldCustomId#g" $defaultMailFile

defaultScriptFile="$defaultPath/custom/$customId/bin/scripts/splitter_workflows/default_workflow.sh"
cp $defaultPath/bin/scripts/splitter_workflows/script_sample_dont_touch.sh $defaultScriptFile
sed -i "s#§§OC_PATH§§#$defaultPath#g" $defaultScriptFile
sed -i "s#§§SCRIPT_NAME§§#splitter_workflows#g" $defaultScriptFile
sed -i "s#§§LOG_PATH§§#$defaultPath/custom/$customId/data/log/OpenCapture.log#g" $defaultScriptFile
sed -i 's#"§§ARGUMENTS§§"#-workflow_id default_workflow#g' $defaultScriptFile
sed -i "s#§§CUSTOM_ID§§#$oldCustomId#g" $defaultScriptFile

####################
# Fill the watcher.ini
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_default_workflow_$customId watch $shareDefaultPath/"$customId"/entrant/verifier/default/
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_default_workflow_$customId events move,close
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_default_workflow_$customId include_extensions pdf,PDF
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_default_workflow_$customId command "$defaultPath/custom/$customId/bin/scripts/verifier_workflows/default_workflow.sh \$filename"

crudini --set "$defaultPath/instance/config/watcher.ini" verifier_default_mail_$customId watch $shareDefaultPath/"$customId"/entrant/verifier/default_mail/
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_default_mail_$customId events move,close
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_default_mail_$customId include_extensions pdf,PDF
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_default_mail_$customId command "$defaultPath/custom/$customId/bin/scripts/verifier_workflows/default_mail.sh \$filename"

crudini --set "$defaultPath/instance/config/watcher.ini" verifier_ocr_only_$customId watch $shareDefaultPath/"$customId"/entrant/verifier/ocr_only/
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_ocr_only_$customId events move,close
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_ocr_only_$customId include_extensions pdf,PDF
crudini --set "$defaultPath/instance/config/watcher.ini" verifier_ocr_only_$customId command "$defaultPath/custom/$customId/bin/scripts/verifier_workflows/ocr_only.sh \$filename"

crudini --set "$defaultPath/instance/config/watcher.ini" splitter_default_workflow_$customId watch $shareDefaultPath/"$customId"/entrant/splitter/
crudini --set "$defaultPath/instance/config/watcher.ini" splitter_default_workflow_$customId events move,close
crudini --set "$defaultPath/instance/config/watcher.ini" splitter_default_workflow_$customId include_extensions pdf,PDF
crudini --set "$defaultPath/instance/config/watcher.ini" splitter_default_workflow_$customId command "$defaultPath/custom/$customId/bin/scripts/splitter_workflows/default_workflow.sh \$filename"

####################
# Fix the rights after root launch to avoid permissions issues
chmod -R 775 $defaultPath
chmod -R g+s $defaultPath
chown -R "$user":"$group" $defaultPath

####################
# Create new supervisor or systemd files

if [ $supervisorOrSystemd == 'systemd' ]; then
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
elif [ $supervisorOrSystemd == 'supervisor' ]; then
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

stderr_logfile=$defaultPath/custom/$customId/data/log/Supervisor/OCVerifier-worker_%(process_num)02d_error.log
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

stderr_logfile=$defaultPath/custom/$customId/data/log/Supervisor/OCSplitter-worker_%(process_num)02d_error.log
EOF"

    chmod 755 "/etc/supervisor/conf.d/OCVerifier-worker_$customId.conf"
    chmod 755 "/etc/supervisor/conf.d/OCSplitter-worker_$customId.conf"

    systemctl restart supervisor
    systemctl enable supervisor
fi

####################
# Makes scripts executable
chmod u+x $customPath/bin/scripts/*.sh
chmod u+x $customPath/bin/scripts/verifier_workflows/*.sh
chmod u+x $customPath/bin/scripts/splitter_workflows/*.sh
chown -R "$user":"$user" $customPath/bin/scripts/
