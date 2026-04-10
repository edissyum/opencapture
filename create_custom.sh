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

DEFAULT_PATH='.'
CUSTOM_PATH="$DEFAULT_PATH/custom"

parameters="custom_id database_name database_hostname database_port database_user database_password docservers_path share_path"
opts=$(getopt --longoptions "$(printf "%s:," "$parameters")" --name "$(basename "$0")" --options "" -- "$@")

while [ $# -gt 0 ]; do
    case "$1" in
        --custom_id) custom_id="$2"; shift 2;;
        --database_name) database_name="$2"; shift 2;;
        --database_hostname) database_hostname="$2"; shift 2;;
        --database_port) database_port="$2"; shift 2;;
        --database_user) database_user="$2"; shift 2;;
        --database_password) database_password="$2"; shift 2;;
        --docservers_path) docservers_path="$2"; shift 2;;
        --share_path) share_path="$2"; shift 2;;
        *) echo "Invalid option: $1" >&2; exit 1;;
    esac
done

####################
# Check mandatory parameters
if [ -z "$custom_id" ]; then
    echo "###########################################################"
    echo "        Custom id is needed to run the installation        "
    echo "###########################################################"
    exit 1
fi

if [ -z "$database_name" ] || [ -z "$database_hostname" ] || [ -z "$database_port" ] || [ -z "$database_user" ] || [ -z "$database_password" ]; then
    echo "#######################################################################"
    echo "        Database parameters are needed to run the installation         "
    echo "#######################################################################"
    exit 2
fi

if [ -z "$docservers_path" ]; then
    echo "#################################################################"
    echo "        Docserver path is needed to run the installation         "
    echo "#################################################################"
    exit 3
fi

if [ -z "$share_path" ]; then
    echo "##############################################################"
    echo "        Share path is needed to run the installation         "
    echo "##############################################################"
    exit 4
fi

####################
# Replace dot and - with _ in custom_id to avoid python error
old_custom_id=$custom_id
custom_id=${custom_id//[\.\-]/_}
custom_id=$(echo "$custom_id" | tr "[:upper:]" "[:lower:]")

####################
# Check if custom id is not "custom" and doesn't exists already
if [ "$custom_id" == 'custom' ]; then
    echo "#############################################################"
    echo "        Please do not create a custom called 'custom'        "
    echo "#############################################################"
    exit 5
fi

if [ -e "$CUSTOM_PATH/$custom_id" ]; then
    echo "########################################################"
    echo "        Custom id \"$custom_id\" already exists        "
    echo "########################################################"
    exit 6
fi

custom_ini_file=$CUSTOM_PATH/custom.ini
if [ ! -f "$custom_ini_file" ]; then
    touch $custom_ini_file
fi
SECTIONS=$(crudini --get $custom_ini_file | sed 's/:.*//')

if [[ $SECTIONS == *"$custom_id"* ]]; then
    echo "########################################################"
    echo "        Custom id \"$custom_id\" already exists         "
    echo "########################################################"
    exit 7
fi

####################
# Create custom folder
NEW_CUSTOM_PATH="$CUSTOM_PATH/$custom_id"

mkdir -p "$NEW_CUSTOM_PATH"
mkdir -p "$NEW_CUSTOM_PATH"/{config,bin,assets,instance,src,data,journal}
mkdir -p "$NEW_CUSTOM_PATH/journal/config/"
mkdir -p "$NEW_CUSTOM_PATH/assets/imgs/"

mkdir -p "$NEW_CUSTOM_PATH"/bin/{ldap,scripts}/
mkdir -p "$NEW_CUSTOM_PATH/bin/ldap/config/"
mkdir -p "$NEW_CUSTOM_PATH"/bin/scripts/{verifier_workflows,splitter_workflows,splitter_metadata,splitter_methods,MailCollect,ai}
mkdir -p "$NEW_CUSTOM_PATH/bin/scripts/ai/{splitter,verifier}"

mkdir -p "$NEW_CUSTOM_PATH/src/backend/"
mkdir -p "$NEW_CUSTOM_PATH/instance/referencial/"

mkdir -p "$NEW_CUSTOM_PATH"/data/{log,MailCollect,tmp,exported_pdf,exported_pdfa,error}/
mkdir -p "$NEW_CUSTOM_PATH/data/log/Supervisor/"
mkdir -p "$NEW_CUSTOM_PATH/data/MailCollect/_ERROR/"

touch "$NEW_CUSTOM_PATH/config/secret_key"

touch "$NEW_CUSTOM_PATH/data/log/OpenCapture.log"
cp "$DEFAULT_PATH"/frontend/src/assets/imgs/login_image.svg "$NEW_CUSTOM_PATH/assets/imgs/login_image.svg"

chmod -R 775 "$NEW_CUSTOM_PATH"

####################
# Write custom configuration in custom.ini file
echo "[$custom_id]" >> $custom_ini_file
echo "path = $CUSTOM_PATH/$custom_id" >> $custom_ini_file
echo -e "" >> $custom_ini_file

####################
# Generate secret key for Flask and write it to custom secret_key file
secret=$(python3 -c 'import secrets; print(secrets.token_hex(32))')
echo "$secret" > $CUSTOM_PATH/$custom_id/config/secret_key

####################
# Create custom docserver folder
mkdir -p "$docservers_path"/{verifier,splitter}
mkdir -p "$docservers_path"/verifier/{ai,attachments,original_doc,full,thumbs,positions_masks}
mkdir -p "$docservers_path"/splitter/{ai,attachments,original_doc,batches,thumbs,error}
mkdir -p "$docservers_path"/verifier/ai/{train_data,models}
mkdir -p "$docservers_path"/splitter/ai/{train_data,models}
chmod -R 775 "$docservers_path"

####################
# Create custom input and outputs folder
mkdir -p "$share_path"/{entrant,export}/{verifier,splitter}
mkdir -p "$share_path"/entrant/verifier/{ocr_only,default,default_mail}
chmod -R 775 "$share_path"

####################
# Copy file from default one
cp -r "$DEFAULT_PATH"/backend/installer/* "$NEW_CUSTOM_PATH/"
cp -r "$DEFAULT_PATH"/backend/src/process_queue_* "$NEW_CUSTOM_PATH/src/backend/"
cp -r "$DEFAULT_PATH"/backend/instance/referencial/* "$NEW_CUSTOM_PATH/instance/referencial/"

# Rename .default files to their original name
find "$NEW_CUSTOM_PATH" -type f -name "*.default" -exec sh -c 'mv "$0" "${0%.default}"' {} \;

# Replace default values in config files with custom values
find "$NEW_CUSTOM_PATH" -type f -exec sed -i "s#§§CUSTOM_ID§§#$custom_id#g" {} \;
find "$NEW_CUSTOM_PATH" -type f -exec sed -i "s#§§OC_PATH§§#$DEFAULT_PATH#g" {} \;
find "$NEW_CUSTOM_PATH" -type f -exec sed -i "s#§§BATCH_PATH§§#$NEW_CUSTOM_PATH/data/MailCollect#g" {} \;
find "$NEW_CUSTOM_PATH" -type f -exec sed -i "s#§§LOG_PATH§§#$NEW_CUSTOM_PATH/data/log/OpenCapture.log#g" {} \;

####################
# Fill database with default data
export PGPASSWORD=$database_password
DATABASE_INFO="-U "$database_user" -h "$database_hostname" -p "$database_port""

psql $DATABASE_INFO -c "\i $DEFAULT_PATH/postgres/sql/structure.sql" "$database_name"
psql $DATABASE_INFO -c "\i $DEFAULT_PATH/postgres/sql/global.sql" "$database_name"
psql $DATABASE_INFO -c "\i $DEFAULT_PATH/postgres/sql/data_fr.sql" "$database_name"

####################
# Update database using custom data
DATABASE_INFO="-U "$database_user" -h "$database_hostname" -p "$database_port" -d "$database_name""

psql $DATABASE_INFO -c "UPDATE docservers SET path=REPLACE(path, '/var/share/' , '$share_path');"
psql $DATABASE_INFO -c "UPDATE docservers SET path=REPLACE(path, '/var/docservers/opencapture/' , '$docservers_path');"

psql $DATABASE_INFO -c "UPDATE docservers SET path=REPLACE(path, './bin/' , '$NEW_CUSTOM_PATH/bin/');"
psql $DATABASE_INFO -c "UPDATE docservers SET path=REPLACE(path, './data/' , '$NEW_CUSTOM_PATH/data/');"
psql $DATABASE_INFO -c "UPDATE docservers SET path=REPLACE(path, './config/' , '$NEW_CUSTOM_PATH/config/');"
psql $DATABASE_INFO -c "UPDATE docservers SET path=REPLACE(path, './instance/' , '$NEW_CUSTOM_PATH/instance/');"

psql $DATABASE_INFO -c "UPDATE docservers SET path=REPLACE(path, '//' , '/');"

psql $DATABASE_INFO -c "UPDATE workflows SET input=REPLACE(input::TEXT, '/var/share/', '$share_path/')::JSONB"

psql $DATABASE_INFO -c "UPDATE outputs SET data = jsonb_set(data, '{options, parameters, 0, value}', '\"$share_path/export/verifier/\"') WHERE data #>>'{options, parameters, 0, id}' = 'folder_out';"
psql $DATABASE_INFO -c "UPDATE outputs SET data = jsonb_set(data, '{options, parameters, 0, value}', '\"$share_path/export/splitter/\"') WHERE data #>>'{options, parameters, 0, id}' = 'folder_out' AND module = 'splitter' AND output_type_id = 'export_pdf';"
psql $DATABASE_INFO -c "UPDATE outputs SET data = jsonb_set(data, '{options, parameters, 0, value}', '\"$share_path/export/splitter/\"') WHERE data #>>'{options, parameters, 0, id}' = 'folder_out' AND module = 'splitter' AND output_type_id = 'export_xml';"

psql $DATABASE_INFO -c "UPDATE outputs_types SET data = jsonb_set(data, '{options, parameters, 0, placeholder}', '\"$share_path/export/verifier/\"') WHERE data #>>'{options,parameters, 0, id}' = 'folder_out' AND module = 'verifier';"
psql $DATABASE_INFO -c "UPDATE outputs_types SET data = jsonb_set(data, '{options, parameters, 0, placeholder}', '\"$share_path/export/splitter/\"') WHERE data #>>'{options,parameters, 0, id}' = 'folder_out' AND module = 'splitter' AND output_type_id = 'export_xml';"
