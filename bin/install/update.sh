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
bold=$(tput bold)
normal=$(tput sgr0)
currentDate=$(date +%m%d%Y-%H%M%S)
openCapturePath="/var/www/html/opencapture/"
user=$(who am i | awk '{print $1}')
INFOLOG_PATH=update_info.log
ERRORLOG_PATH=update_error.log

echo 'Do you use Python virtual environment while installing Open-Capture ? (default : yes)'
printf "Enter your choice [%s] : " "${bold}yes${normal}/no"
read -r choice
if [ "$choice" != "no" ]; then
    pythonVenv='true'
else
    pythonVenv='false'
fi

if [ ! -f "/home/$user/python-venv/opencapture/bin/python3" ]; then
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

cd "$openCapturePath" || exit 1

####################
# Force launch of apt and pip requirements
# in case of older version without somes packages/libs
echo "APT & PIP packages installation ......."
cd bin/install/ || exit 2
apt-get -y update >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
apt-get install -y php >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
xargs -a apt-requirements.txt apt-get install -y >>$INFOLOG_PATH 2>>$ERRORLOG_PATH

"/home/$user/python-venv/opencapture/bin/python3" -m pip uninstall -y pyocr >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
"/home/$user/python-venv/opencapture/bin/python3" -m pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org --upgrade pip >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
"/home/$user/python-venv/opencapture/bin/python3" -m pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org --upgrade setuptools >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
"/home/$user/python-venv/opencapture/bin/python3" -m pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org --upgrade wheel >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
"/home/$user/python-venv/opencapture/bin/python3" -m pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r "pip-requirements.txt" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
"/home/$user/python-venv/opencapture/bin/python3" -m pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org --upgrade -r "pip-requirements.txt" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH
"/home/$user/python-venv/opencapture/bin/python3" -c "import nltk
nltk.download('stopwords')
nltk.download('punkt')" >>$INFOLOG_PATH 2>>$ERRORLOG_PATH

cd $openCapturePath || exit 2
find . -name ".gitkeep" -delete

####################
# Restart worker by custom
systemctl restart apache2
systemctl restart OCVerifier-worker_* || supervisorctl restart all
systemctl restart OCSplitter-worker_* || supervisorctl restart all

####################
# Fix verifier and splitter worker custom file
if [ -f "$openCapturePath/src/backend/process_queue_verifier.py.default" ]; then
    for customPath in $openCapturePath/custom/*; do
        if [[ -d $customPath ]]; then
            customId=$(basename $customPath)
            cp -f "$openCapturePath/src/backend/process_queue_verifier.py.default" "$customPath/src/backend/process_queue_verifier.py"
            cp -f "$openCapturePath/src/backend/process_queue_splitter.py.default" "$customPath/src/backend/process_queue_splitter.py"
            sed -i "s#§§CUSTOM_ID§§#$customId#g" "$customPath/src/backend/process_queue_verifier.py"
            sed -i "s#§§CUSTOM_ID§§#$customId#g" "$customPath/src/backend/process_queue_splitter.py"
        fi
    done
fi

####################
# Fix rights on folder and files
chmod -R 775 $openCapturePath
chown -R "$user":"$user" $openCapturePath

####################
# Display a message if a SQL migration file is present for new version
if test -f "$openCapturePath/bin/install/migration_sql/$latest_tag.sql"; then
    echo "####################################################################"
    echo "                     Version : $latest_tag                          "
    echo "      A script to update database in the application is present     "
    echo "           If necessary, do not hesitate to execute it              "
    echo "     in order to take advantage of the latest modifications         "
    echo "####################################################################"
fi

####################
# Run bash migration file if present for new version
if test -f "$openCapturePath/bin/install/migration_bash/$latest_tag.sh"; then
    bash "$openCapturePath/bin/install/migration_bash/$latest_tag.sh"
fi