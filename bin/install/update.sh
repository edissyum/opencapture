#!/bin/bash
# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

if [ "$EUID" -ne 0 ]
  then echo "update.sh needed to be launch by user with root privileges"
  exit 1
fi

# Put the default paths.
# Modify them if needed
currentDate=$(date +%m%d%Y-%H%M%S)
OCForInvoicesPath="/opt/OpenCaptureForInvoices/"
backupPath="/opt/OpenCaptureForInvoices.$currentDate"

user=$(who am i | awk '{print $1}')

# Backup all the Open-Capture path
cp -r "$OCForInvoicesPath" "$backupPath"

# Retrieve the last tags from gitlab
cd "$OCForInvoicesPath" || exit 1
git config --global user.email "update@ocforinvoices"
git config --global user.name "Update Open-Capture For Invoices"
git pull
git stash # Remove custom code if needed
latest_tag=$(git describe --tags "$(git rev-list --tags=* --max-count=1)")
git checkout "$latest_tag"
git config core.fileMode False

# Force launch of apt and pip requirements
# in case of older version without somes packages/libs
cd bin/install/ || exit 2
apt update
xargs -a apt-requirements.txt apt install -y
pip3 install --upgrade pip
pip3 install -r pip-requirements.txt
pip3 install --upgrade -r pip-requirements.txt

cd $OCForInvoicesPath || exit 2
find . -name ".gitkeep" -delete

# Fix rights on folder and files
chmod -R 775 $OCForInvoicesPath
chown -R "$user":"$user" $OCForInvoicesPath
chmod u+x $OCForInvoicesPath/bin/scripts/*.sh

# Restart worker
systemctl restart OCForInvoices-web
systemctl restart OCForInvoices-worker
systemctl restart OCForInvoices_Split-worker
