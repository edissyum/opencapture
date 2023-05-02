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

opencapturePath="/var/www/html/opencapture/"

####################
# Update input_id to workflow_id
SECTIONS=$(crudini --get $opencapturePath/custom/custom.ini | sed 's/:.*//')
for custom_name in ${SECTIONS[@]}; do
    mkdir -p custom/$custom_name/bin/scripts/verifier_workflows/
    cp $opencapturePath/bin/scripts/verifier_workflows/script_sample_dont_touch.sh custom/$custom_name/bin/scripts/verifier_workflows/
    for script in custom/$custom_name/bin/scripts/verifier_inputs/*.sh; do
        if [[ ! $script =~ 'script_sample_dont_touch.sh' ]]; then
            sed -i 's/input_id/workflow_id/g' "$script"
        fi
    done
    for script in custom/$custom_name/bin/scripts/splitter_inputs/*.sh; do
            if [[ ! $script =~ 'script_sample_dont_touch.sh' ]]; then
                sed -i 's/input_id/workflow_id/g' "$script"
            fi
        done
done
