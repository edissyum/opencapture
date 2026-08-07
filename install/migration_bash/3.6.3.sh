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

opencapturePath="/var/www/html/opencapture/"

# Add debugMode to config.ini in custom folder if not exist
SECTIONS=$(crudini --get $opencapturePath/custom/custom.ini | sed 's/:.*//')
for custom_name in ${SECTIONS[@]}; do
    custom_name=${custom_name//[\.\-]/_}
    custom_name=$(echo "$custom_name" | tr "[:upper:]" "[:lower:]")
    if ! crudini --get $opencapturePath/custom/$custom_name/config/config.ini GLOBAL debugMode; then
        crudini --set $opencapturePath/custom/$custom_name/config/config.ini GLOBAL debugMode False
    fi
    cp $opencapturePath/bin/scripts/splitter_methods/qr_code_OC.py "$opencapturePath/custom/$custom_name/bin/scripts/splitter_methods/."

    cp $opencapturePath/src/backend/process_queue_splitter.py.default "$opencapturePath/custom/$custom_name/src/backend/process_queue_splitter.py"
    sed -i "s#§§CUSTOM_ID§§#$custom_name#g" "$opencapturePath/custom/$custom_name/src/backend/process_queue_splitter.py"
done