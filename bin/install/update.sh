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
    echo "update.sh needed to be launch by user with root privileges"
    exit 1
fi

####################
# Put the default paths.
# Modify them if needed
currentDate=$(date +%m%d%Y-%H%M%S)
OCForInvoicesPath="/var/www/html/opencaptureforinvoices/"
backupPath="/var/www/html/opencaptureforinvoices.$currentDate"

user=$(who am i | awk '{print $1}')

####################
# Backup all the Open-Capture path
cp -r "$OCForInvoicesPath" "$backupPath"

####################
# Retrieve the secret key
SECRET_KEY=$(grep "SECRET_KEY=" $OCForInvoicesPath/src/backend/__init__.py | awk -F"=" '{ print $2 }' | cut -d \' -f2)

####################
# Retrieve the last tags from gitlab
cd "$OCForInvoicesPath" || exit 1
git config --global user.email "update@ocforinvoices"
git config --global user.name "Update Open-Capture For Invoices"
git pull
git stash # Remove custom code if needed
latest_tag=$(git describe --tags "$(git rev-list --tags=2.* --max-count=1)")
git checkout "$latest_tag"
git config core.fileMode False

####################
# Force launch of apt and pip requirements
# in case of older version without somes packages/libs
cd bin/install/ || exit 2
apt update
xargs -a apt-requirements.txt apt install -y
python3 -m pip install --upgrade setuptools
python3 -m pip install --upgrade pip
python3 -m pip install -r pip-requirements.txt
python3 -m pip install --upgrade -r pip-requirements.txt

cd $OCForInvoicesPath || exit 2
find . -name ".gitkeep" -delete

####################
# Put secret key
sed -i "s/§§SECRET§§/$SECRET_KEY/g" "/var/www/html/opencaptureforinvoices/src/backend/__init__.py"

####################
# Fix rights on folder and files
chmod -R 775 $OCForInvoicesPath
chmod u+x $OCForInvoicesPath/bin/scripts/*.sh
chown -R "$user":"$user" $OCForInvoicesPath/bin/scripts/*.sh
chmod u+x $OCForInvoicesPath/bin/scripts/verifier_inputs/*.sh
chown -R "$user":"$user" $OCForInvoicesPath/bin/scripts/verifier_inputs/*.sh
chmod u+x $OCForInvoicesPath/bin/scripts/splitter_inputs/*.sh
chown -R "$user":"$user" $OCForInvoicesPath/bin/scripts/splitter_inputs/*.sh

####################
# Restart worker
systemctl restart apache2
systemctl restart OCForInvoices-worker || supervisorctl restart OCWorker:*
systemctl restart OCForInvoices_Split-worker || supervisorctl restart OCWorker-Split:*

####################
# Display a message if a SQL migration file is present for new version
if test -f "$OCForInvoicesPath/bin/install/migration_sql/$latest_tag.sql"; then
    echo "####################################################################"
    echo "                     Version : $latest_tag                          "
    echo "      A script to update database in the application is present     "
    echo "           If necessary, do not hesitate to execute it              "
    echo "     in order to take advantage of the latest modifications         "
    echo "####################################################################"
fi
