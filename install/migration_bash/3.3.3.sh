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

if [ "$EUID" -ne 0 ]; then
    echo "$(basename "$0") needed to be launch by user with root privileges"
    exit 1
fi

#####################
# Update default referencial JSON file
opencapturePath="/var/www/html/opencapture/"
cd $opencapturePath

SECTIONS=$(crudini --get $opencapturePath/custom/custom.ini | sed 's/:.*//')
for custom_name in ${SECTIONS[@]}; do
    custom_name=${custom_name//[\.\-]/_}
    custom_name=$(echo "$custom_name" | tr "[:upper:]" "[:lower:]")
    cp $opencapturePath/instance/referencial/default_referencial_supplier_index.json.default $opencapturePath/custom/$custom_name/instance/referencial/default_referencial_supplier_index.json 2>/dev/null
done

####################
# Allow user to restart fs-watcher service without password
user=$(who am i | awk '{print $1}')
echo "$user ALL=(ALL) NOPASSWD: /bin/systemctl restart fs-watcher" >> /etc/sudoers