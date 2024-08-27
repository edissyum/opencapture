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

opencapturePath="/var/www/html/opencapture/"

#####################
# Change old bin/data path to data/
SECTIONS=$(crudini --get $opencapturePath/custom/custom.ini | sed 's/:.*//')
for custom_name in ${SECTIONS[@]}; do
    cd $opencapturePath
    custom_name=${custom_name//[\.\-]/_}
    custom_name=$(echo "$custom_name" | tr "[:upper:]" "[:lower:]")
    mkdir -p data/
    mv $opencapturePath/bin/data/* $opencapturePath/data/ 2>/dev/null
    rm -rf $opencapturePath/bin/data/

    mkdir -p custom/$custom_name/data/
    mv $opencapturePath/custom/$custom_name/bin/data/* $opencapturePath/custom/$custom_name/data/ 2>/dev/null
    rm -rf $opencapturePath/custom/$custom_name/bin/data/

    ####################
    # Update custom config ini to modify log path
    sed -i "s|bin/data/log|data/log|g" $opencapturePath/custom/$custom_name/config/config.ini

    ####################
    # Update custom script to modify paths
    find $opencapturePath/custom/$custom_name/bin/scripts/ -type f -exec sed -i "s|bin/data/|data/|g" {} \;
done
