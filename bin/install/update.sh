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
echo "APT & PIP packages installation & upgrade......."
cd bin/install/ || exit 2
apt-get update > /dev/null
apt-get install php > /dev/null
xargs -a apt-requirements.txt apt-get install -y > /dev/null
python3 -m pip install --upgrade pip > /dev/null
python3 -m pip install --upgrade setuptools > /dev/null
python3 -m pip install -r pip-requirements.txt > /dev/null
python3 -m pip install --upgrade -r pip-requirements.txt > /dev/null

cd $OCForInvoicesPath || exit 2
find . -name ".gitkeep" -delete

####################
# Restart worker by custom
systemctl restart apache2
systemctl restart OCForInvoices-worker_* || supervisorctl restart all
systemctl restart OCForInvoices_Split-worker_*

####################
# Fix rights on folder and files
chmod -R 775 $OCForInvoicesPath
chown -R "$user":"$user" $OCForInvoicesPath

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
