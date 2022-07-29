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

defaultPath=/var/www/html/opencaptureforinvoices
user=$(who am i | awk '{print $1}')
group=www-data

####################
# Check if custom name is set and doesn't exists already

apt install -y crudini

while getopts a: parameters
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
# Create custom symbolic link and folders
ln -s "$defaultPath" "$defaultPath/$customId"

mkdir -p $defaultPath/custom/"$customId"/{config,bin,assets}/
mkdir -p $defaultPath/custom/"$customId"/bin/{data,ldap,scripts}/
mkdir -p $defaultPath/custom/"$customId"/bin/data/tmp/
mkdir -p "$defaultPath/custom/$customId/assets/imgs/"
mkdir -p "$defaultPath/custom/$customId/bin/ldap/config/"
mkdir -p $defaultPath/custom/"$customId"/bin/data/{log,MailCollect}/
mkdir -p $defaultPath/custom/"$customId"/bin/data/log/Supervisor/
mkdir -p $defaultPath/custom/"$customId"/bin/scripts/{verifier_inputs,splitter_inputs}/

echo "[$customId]" >> $customIniFile
echo "path = $defaultPath/custom/$customId" >> $customIniFile
echo "isdefault = False" >> $customIniFile
echo "" >> $customIniFile

####################
# Copy file from default one
cp $defaultPath/instance/config/mail.ini.default "$defaultPath/custom/$customId/config/mail.ini"
cp $defaultPath/instance/config/config.ini.default "$defaultPath/custom/$customId/config/config.ini"
cp $defaultPath/bin/ldap/config/config.ini.default "$defaultPath/custom/$customId/bin/ldap/config/config.ini"

####################
# Move old scripts to new custom location
mv $defaultPath/bin/scripts/verifier_inputs/* "$defaultPath/custom/$customId/bin/scripts/"
mv $defaultPath/bin/scripts/splitter_inputs/* "$defaultPath/custom/$customId/bin/scripts/"

####################
# Change watcher.ini path to scripts
watcherIni=$defaultPath/instance/config/watcher.ini
sed -i "s#$defaultPath/bin/scripts/#$defaultPath/custom/$customId/bin/scripts/#" $watcherIni
sed -i "s#$defaultPath//bin/scripts/#$defaultPath/custom/$customId/bin/scripts/#" $watcherIni
systemctl restart fs-watcher

####################
# Fix the rights after root launch to avoid permissions issues
chmod -R 775 $defaultPath
chmod -R g+s $defaultPath
chown -R "$user":"$group" $defaultPath

####################
# Makes scripts executable
chmod u+x $defaultPath/custom/"$customId"/bin/scripts/verifier_inputs/*
chown -R "$user":"$user" $defaultPath/custom/"$customId"/bin/scripts/verifier_inputs/*
chmod u+x $defaultPath/custom/"$customId"/bin/scripts/splitter_inputs/*
chown -R "$user":"$user" $defaultPath/custom/"$customId"/bin/scripts/splitter_inputs/*
############################################################"
