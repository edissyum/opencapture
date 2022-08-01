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
    echo "create_custom.sh needed to be launch by user with root privileges"
    exit 1
fi

bold=$(tput bold)
normal=$(tput sgr0)
defaultPath=/var/www/html/opencaptureforinvoices
user=$(who am i | awk '{print $1}')
group=www-data

####################
# Check if custom name is set and doesn't exists already

apt install -y crudini

while getopts c: parameters
do
    case "${parameters}" in
        c) customId=${OPTARG};;
        *) customId=""
    esac
done

if [ -z "$customId" ] ; then
    echo "##########################################################################"
    echo "              Custom id is needed to run the installation"
    echo "   Exemple of command line call : sudo ./create_custom.sh -c edissyum"
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
# Retrieve database informations
echo "Type database informations (hostname, port, username and password and postgres user password)."
echo "It will be used to update path to use the custom's one"
echo "Please specify a user that don't already exists"
printf "Hostname [%s] : " "${bold}localhost${normal}"
read -r choice

if [[ "$choice" == "" ]]; then
    hostname=localhost
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

printf "Username [%s] : " "${bold}edissyum${normal}"
read -r choice

if [[ "$choice" == "" ]]; then
    databaseUsername=edissyum
else
    databaseUsername="$choice"
fi

printf "Password [%s] : " "${bold}edissyum${normal}"
read -r choice

if [[ "$choice" == "" ]]; then
    databasePassword=edissyum
else
    databasePassword="$choice"
fi

printf "Postgres user Password [%s] : " "${bold}postgres${normal}"
read -r choice

if [[ "$choice" == "" ]]; then
    postgresPassword=postgres
else
    postgresPassword="$choice"
fi

export PGPASSWORD=$postgresPassword && su postgres -c "psql -Upostgres -h$hostname -p$port -c 'CREATE ROLE $databaseUsername'"
export PGPASSWORD=$postgresPassword && su postgres -c "psql -Upostgres -h$hostname -p$port -c 'ALTER ROLE $databaseUsername WITH LOGIN'"
export PGPASSWORD=$postgresPassword && su postgres -c "psql -Upostgres -h$hostname -p$port -c \"ALTER ROLE $databaseUsername WITH ENCRYPTED PASSWORD '$databasePassword'\""

####################
# Create database using custom_id
export PGPASSWORD=$postgresPassword && su postgres -c "psql -Upostgres -h$hostname -p$port -c 'CREATE DATABASE $customId'"
export PGPASSWORD=$postgresPassword && su postgres -c "psql -Upostgres -h$hostname -p$port -c 'GRANT ALL PRIVILEGES ON DATABASE $customId TO $databaseUsername;'"
export PGPASSWORD=$postgresPassword && su postgres -c "psql -Upostgres -h$hostname -p$port -c '\i $defaultPath/instance/sql/structure.sql' $customId"
export PGPASSWORD=$postgresPassword && su postgres -c "psql -Upostgres -h$hostname -p$port -c '\i $defaultPath/instance/sql/global.sql' $customId"
export PGPASSWORD=$postgresPassword && su postgres -c "psql -Upostgres -h$hostname -p$port -c '\i $defaultPath/instance/sql/data_fr.sql' $customId"

####################
# Create docservers
echo "Type docserver default path informations. By default it's /var/docservers/OpenCapture/"
printf "Docserver default path [%s] : " "${bold}/var/docservers/OpenCapture/${normal}"
read -r choice

if [[ "$choice" == "" ]]; then
    docserverDefaultPath="/var/docservers/OpenCapture/"
else
    docserverDefaultPath="$choice"
fi


mkdir -p /"$docserverDefaultPath"/"$customId"/{verifier,splitter}
mkdir -p /"$docserverDefaultPath"/"$customId"/verifier/{original_pdf,full,thumbs,positions_masks}
mkdir -p /"$docserverDefaultPath"/"$customId"/splitter/{original_pdf,batches,separated_pdf,error}
sudo chmod -R 775 /"$docserverDefaultPath"/"$customId"/
sudo chown -R "$user":www-data /"$docserverDefaultPath"/"$customId"/

customPath=$defaultPath/custom/"$customId"

export PGPASSWORD=$databasePassword && su postgres -c "psql -U$databaseUsername -h$hostname -p$port -c 'UPDATE docservers SET path=REPLACE(path, '$docserverDefaultPath' , '/$docserverDefaultPath/$customId/')' $customId"
export PGPASSWORD=$databasePassword && su postgres -c "psql -U$databaseUsername -h$hostname -p$port -c 'UPDATE docservers SET path='$customPath/bin/scripts/' WHERE docserver_id = 'SCRIPTS_PATH''"
export PGPASSWORD=$databasePassword && su postgres -c "psql -U$databaseUsername -h$hostname -p$port -c 'UPDATE docservers SET path='$customPath/bin/data/tmp/opencapture/' WHERE docserver_id = 'TMP_PATH''"
export PGPASSWORD=$databasePassword && su postgres -c "psql -U$databaseUsername -h$hostname -p$port -c 'UPDATE docservers SET path='$customPath/bin/data/tmp/exported_pdf/' WHERE docserver_id = 'SEPARATOR_OUTPUT_PDFA''"
export PGPASSWORD=$databasePassword && su postgres -c "psql -U$databaseUsername -h$hostname -p$port -c 'UPDATE docservers SET path='$customPath/bin/data/tmp/' WHERE docserver_id = 'SEPARATOR_OUTPUT_PDF''"

####################
# Create custom symbolic link and folders
ln -s "$defaultPath" "$defaultPath/$customId"
mkdir -p $customPath/{config,bin,assets}/
mkdir -p $customPath/bin/{data,ldap,scripts}/
mkdir -p $customPath/bin/data/tmp/
mkdir -p $customPath/assets/imgs/
mkdir -p $customPath/bin/ldap/config/
mkdir -p $customPath/bin/data/{log,MailCollect}/
mkdir -p $customPath/bin/data/log/Supervisor/
mkdir -p $customPath/bin/scripts/{verifier_inputs,splitter_inputs}/

echo "[$customId]" >> $customIniFile
echo "path = $defaultPath/custom/$customId" >> $customIniFile
echo "isdefault = False" >> $customIniFile
echo "" >> $customIniFile

####################
# Create custom input and outputs folder
mkdir -p /var/share/"$customId"/{entrant,export}/{verifier,splitter}/
chmod -R 775 /var/share/"$customId"/
chown -R "$user":"$group" /var/share/"$customId"/

export PGPASSWORD=$databasePassword && su postgres -c "psql -U$databaseUsername -h$hostname -p$port -c 'UPDATE inputs SET input_folder=REPLACE(input_folder, '/var/share/' , '/var/share/$customId/')'"
export PGPASSWORD=$databasePassword && su postgres -c "psql -U$databaseUsername -h$hostname -p$port -c 'UPDATE outputs SET data = jsonb_set(data, '{options,parameters, 0, value}', '"/var/share/$customId/export/"') WHERE data #>>'{options,parameters, 0, id}' = 'folder_out';'"

####################
# Copy file from default one
cp $defaultPath/instance/config/mail.ini.default "$defaultPath/custom/$customId/config/mail.ini"
cp $defaultPath/instance/config/config.ini.default "$defaultPath/custom/$customId/config/config.ini"
cp $defaultPath/bin/ldap/config/config.ini.default "$defaultPath/custom/$customId/bin/ldap/config/config.ini"

sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/config/config.ini"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/config/mail.ini"

####################
# Move defaults scripts to new custom location
cp $defaultPath/bin/scripts/verifier_inputs/*.sh "$defaultPath/custom/$customId/bin/scripts/verifier_inputs/"
cp $defaultPath/bin/scripts/splitter_inputs/*.sh "$defaultPath/custom/$customId/bin/scripts/splitter_inputs/"

####################
# Fix the rights after root launch to avoid permissions issues
chmod -R 775 $defaultPath
chmod -R g+s $defaultPath
chown -R "$user":"$group" $defaultPath

####################
# Makes scripts executable
chmod u+x $customPath/bin/scripts/verifier_inputs/*.sh
chmod u+x $customPath/bin/scripts/splitter_inputs/*.sh
chown -R "$user":"$user" $customPath/bin/scripts/