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
