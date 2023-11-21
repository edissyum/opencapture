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
    echo "3.1.0.sh needed to be launch by user with root privileges"
    exit 1
fi

#apt install -y jq

opencapturePath="/var/www/html/opencapture/"

#####################
# Update input_id to workflow_id
SECTIONS=$(crudini --get $opencapturePath/custom/custom.ini | sed 's/:.*//')
for custom_name in ${SECTIONS[@]}; do
    cd $opencapturePath
    mkdir -p custom/$custom_name/data
    mv $opencapturePath/custom/$custom_name/bin/data/* $opencapturePath/custom/$custom_name/data/
    rm -rf $opencapturePath/custom/$custom_name/bin/data/
done

####################
# Update custom config ini to add applicationPath
#SECTIONS=$(crudini --get $opencapturePath/custom/custom.ini | sed 's/:.*//')
#for custom_name in ${SECTIONS[@]}; do
#    cd $opencapturePath
#    crudini --set custom/$custom_name/config/config.ini GLOBAL applicationPath $opencapturePath
#done