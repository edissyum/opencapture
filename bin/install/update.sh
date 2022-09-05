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
    echo "update.sh needed to be launch by user with root privileges"
    exit 1
fi

####################
# Put the default paths.
# Modify them if needed
currentDate=$(date +%m%d%Y-%H%M%S)
OpenCapturePath="/var/www/html/opencapture/"
backupPath="/var/www/html/opencapture.$currentDate"
user=$(who am i | awk '{print $1}')
INFOLOG_PATH=update_info.log
ERRORLOG_PATH=update_error.log

####################
# Backup all the Open-Capture path
cp -r "$OpenCapturePath" "$backupPath"

####################
# Retrieve the last tags from gitlab
cd "$OpenCapturePath" || exit 1
git config --global user.email "update@opencapture"
git config --global user.name "Update Open-Capture"
git pull
git fetch --tags
git stash # Remove custom code if needed
latest_tag=$(git describe --tags "$(git rev-list --tags=2.* --max-count=1)")
git checkout "$latest_tag"
git config core.fileMode False

####################
# Force launch of apt and pip requirements
# in case of older version without somes packages/libs
echo "APT & PIP packages installation ......."
cd bin/install/ || exit 2
apt-get update >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
apt-get install php >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
xargs -a apt-requirements.txt apt-get install -y >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
python3 -m pip install --upgrade pip >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
python3 -m pip install --upgrade setuptools >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
python3 -m pip install -r pip-requirements.txt >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
python3 -m pip install --upgrade -r pip-requirements.txt >>$INFOLOG_PATH 2>>$ERRORLOG_PATH

cd $OpenCapturePath || exit 2
find . -name ".gitkeep" -delete

####################
# Restart worker by custom
systemctl restart apache2
systemctl restart OCVerifier-worker_* || supervisorctl restart all
systemctl restart OCSplitter-worker_* || supervisorctl restart all

####################
# Fix rights on folder and files
chmod -R 775 $OpenCapturePath
chown -R "$user":"$user" $OpenCapturePath

####################
# Display a message if a SQL migration file is present for new version
if test -f "$OpenCapturePath/bin/install/migration_sql/$latest_tag.sql"; then
    echo "####################################################################"
    echo "                     Version : $latest_tag                          "
    echo "      A script to update database in the application is present     "
    echo "           If necessary, do not hesitate to execute it              "
    echo "     in order to take advantage of the latest modifications         "
    echo "####################################################################"
fi
