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

while getopts "c:t:" arguments
do
    case "${arguments}" in
        c) customId=${OPTARG};;
        t) installationType=${OPTARG};;
        *) customId=""
            installationType="systemd"
    esac
done

####################
# Replace dot with _ in custom_id to avoir python error
oldCustomId=customId
customId=${customId//[.]/_}

if [ -z "$customId" ]; then
    echo "##########################################################################"
    echo "              Custom id is needed to run the installation"
    echo "   Exemple of command line call : sudo ./create_custom.sh -c edissyum_bis"
    echo "##########################################################################"
    exit 2
fi

if [ "$installationType" == '' ] || [[ "$installationType" != 'systemd' ] && [ "$installationType" != 'supervisor' ]]; then
    echo "#################################################################################################"
    echo "                         Bad value for installationType variable"
    echo "       Exemple of command line call : sudo ./create_custom.sh -c edissyum_bis -t systemd"
    echo "      Exemple of command line call : sudo ./create_custom.sh -c edissyum_bis -t supervisor"
    echo "#################################################################################################"
    exit 2
fi

if [ "$installationType" == 'supervisor' ]; then
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

databaseName="opencapture_$customId"

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

printf "Username [%s] : " "${bold}edissyum${normal}"
read -r choice

if [[ "$choice" == "" ]]; then
    databaseUsername="edissyum"
else
    databaseUsername="$choice"
fi

printf "Password [%s] : " "${bold}edissyum${normal}"
read -r choice

if [[ "$choice" == "" ]]; then
    databasePassword="edissyum"
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
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "CREATE DATABASE $databaseName" postgres
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "\i $defaultPath/instance/sql/structure.sql" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "\i $defaultPath/instance/sql/global.sql" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "\i $defaultPath/instance/sql/data_fr.sql" "$databaseName"

echo ""
echo "#################################################################################################"
echo ""

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
mkdir -p $customPath/bin/scripts/{verifier_inputs,splitter_inputs}/
mkdir -p $customPath/src/backend/

echo "[$oldCustomId]" >> $customIniFile
echo "path = $defaultPath/custom/$customId" >> $customIniFile
echo "isdefault = False" >> $customIniFile
echo "" >> $customIniFile

####################
# Create custom input and outputs folder
mkdir -p /var/share/"$customId"/{entrant,export}/{verifier,splitter}/
chmod -R 775 /var/share/"$customId"/
chown -R "$user":"$group" /var/share/"$customId"/

export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE inputs SET input_folder=REPLACE(input_folder, '/var/share/' , '/var/share/$customId/')" "$databaseName"
export PGPASSWORD=$databasePassword && psql -U"$databaseUsername" -h"$hostname" -p"$port" -c "UPDATE outputs SET data = jsonb_set(data, '{options,parameters, 0, value}', '\"/var/share/$customId/export/\"') WHERE data #>>'{options,parameters, 0, id}' = 'folder_out';" "$databaseName"

####################
# Copy file from default one
cp $defaultPath/instance/referencial/default_referencial_supplier.ods.default "$defaultPath/custom/$customId/instance/referencial/default_referencial_supplier.ods"
cp $defaultPath/instance/referencial/default_referencial_supplier_index.json.default "$defaultPath/custom/$customId/instance/referencial/default_referencial_supplier_index.json"
cp $defaultPath/instance/config/mail.ini.default "$defaultPath/custom/$customId/config/mail.ini"
cp $defaultPath/instance/config/config.ini.default "$defaultPath/custom/$customId/config/config.ini"
cp $defaultPath/bin/ldap/config/config.ini.default "$defaultPath/custom/$customId/bin/ldap/config/config.ini"
cp $defaultPath/src/backend/process_queue_verifier.py.default "$defaultPath/custom/$customId/src/backend/process_queue_verifier.py"
cp $defaultPath/src/backend/process_queue_splitter.py.default "$defaultPath/custom/$customId/src/backend/process_queue_splitter.py"
cp $defaultPath/bin/scripts/service_workerOC.sh.default "$defaultPath/custom/$customId/bin/scripts/service_workerOC.sh"
cp $defaultPath/bin/scripts/service_workerOC_splitter.sh.default "$defaultPath/custom/$customId/bin/scripts/service_workerOC_splitter.sh"

sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/config/config.ini"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/config/mail.ini"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/src/backend/process_queue_verifier.py"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/src/backend/process_queue_splitter.py"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/bin/scripts/service_workerOC.sh"
sed -i "s#§§CUSTOM_ID§§#$customId#g" "$defaultPath/custom/$customId/bin/scripts/service_workerOC_splitter.sh"

####################
# Move defaults scripts to new custom location
cp $defaultPath/bin/scripts/verifier_inputs/*.sh "$defaultPath/custom/$customId/bin/scripts/verifier_inputs/"
cp $defaultPath/bin/scripts/splitter_inputs/*.sh "$defaultPath/custom/$customId/bin/scripts/splitter_inputs/"
cp $defaultPath/bin/scripts/splitter_inputs/*.sh "$defaultPath/custom/$customId/bin/scripts/splitter_inputs/"

####################
# Fix the rights after root launch to avoid permissions issues
chmod -R 775 $defaultPath
chmod -R g+s $defaultPath
chown -R "$user":"$group" $defaultPath

####################
# Create new supervisor or systemd files

if [ $installationType == 'systemd' ]; then
    touch "/etc/systemd/system/OCForInvoices-worker_$customId.service"
    su -c "cat > /etc/systemd/system/OCForInvoices-worker_$customId.service << EOF
[Unit]
Description=Daemon for Open-Capture for Invoices

[Service]
Type=simple

User=$user
Group=$user
UMask=0022

ExecStart=$defaultPath/custom/$customId/bin/scripts/service_workerOC.sh
KillSignal=SIGQUIT

Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF"

    touch "/etc/systemd/system/OCForInvoices_Split-worker_$customId.service"
    su -c "cat > /etc/systemd/system/OCForInvoices_Split-worker_$customId.service << EOF
[Unit]
Description=Splitter Daemon for Open-Capture for Invoices

[Service]
Type=simple

User=$user
Group=$user
UMask=0022

ExecStart=$defaultPath/custom/$customId/bin/scripts/service_workerOC_splitter.sh
KillSignal=SIGQUIT
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF"

    systemctl daemon-reload
    systemctl start "OCForInvoices-worker_$customId".service
    systemctl start "OCForInvoices_Split-worker_$customId".service
    sudo systemctl enable "OCForInvoices-worker_$customId".service
    sudo systemctl enable "OCForInvoices_Split-worker_$customId".service
elif [ $installationType == 'supervisor' ]; then
    touch "/etc/supervisor/conf.d/OCForInvoices-worker_$customId.conf"
    touch "/etc/supervisor/conf.d/OCForInvoices_Split-worker_$customId.conf"
    su -c "cat > /etc/supervisor/conf.d/OCForInvoices-worker_$customId.conf << EOF
[program:OCWorker]
command=$defaultPath/custom/$customId/bin/scripts/service_workerOC.sh
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

stderr_logfile=$defaultPath/custom/$customId/bin/data/log/Supervisor/OCForInvoices_worker_%(process_num)02d_error.log
EOF"

    su -c "cat > /etc/supervisor/conf.d/OCForInvoices_Split-worker_$customId.conf << EOF
[program:OCWorker-Split]
command=$defaultPath/custom/$customId/bin/scripts/service_workerOC_splitter.sh
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

stderr_logfile=$defaultPath/custom/$customId/bin/data/log/Supervisor/OCForInvoices_SPLIT_worker_%(process_num)02d_error.log
EOF"

    chmod 755 "/etc/supervisor/conf.d/OCForInvoices-worker_$customId.conf"
    chmod 755 "/etc/supervisor/conf.d/OCForInvoices_Split-worker_$customId.conf"

    systemctl restart supervisor
    systemctl enable supervisor
fi

####################
# Makes scripts executable
chmod u+x $customPath/bin/scripts/*.sh
chmod u+x $customPath/bin/scripts/splitter_inputs/*.sh
chmod u+x $customPath/bin/scripts/splitter_inputs/*.sh
chown -R "$user":"$user" $customPath/bin/scripts/
