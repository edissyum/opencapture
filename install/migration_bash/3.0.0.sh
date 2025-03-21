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
    echo "update.sh needed to be launch by user with root privileges"
    exit 1
fi

apt install -y jq

opencapturePath="/var/www/html/opencapture/"
user=$(who am i | awk '{print $1}')

#####################
# Update input_id to workflow_id
SECTIONS=$(crudini --get $opencapturePath/custom/custom.ini | sed 's/:.*//')
for custom_name in ${SECTIONS[@]}; do
    cd $opencapturePath
    mkdir -p custom/$custom_name/bin/scripts/verifier_workflows/
    mkdir -p custom/$custom_name/bin/scripts/splitter_workflows/

    cp $opencapturePath/bin/scripts/verifier_workflows/script_sample_dont_touch.sh custom/$custom_name/bin/scripts/verifier_workflows/
    cp $opencapturePath/bin/scripts/splitter_workflows/script_sample_dont_touch.sh custom/$custom_name/bin/scripts/splitter_workflows/

    sed -i "s#§§PYTHON_VENV§§#source /home/$user/python-venv/opencapture/bin/activate#g" custom/$custom_name/bin/scripts/verifier_workflows/script_sample_dont_touch.sh
    sed -i "s#§§PYTHON_VENV§§#source /home/$user/python-venv/opencapture/bin/activate#g" custom/$custom_name/bin/scripts/splitter_workflows/script_sample_dont_touch.sh

    for script in custom/$custom_name/bin/scripts/verifier_inputs/*.sh; do
        if [[ ! $script =~ 'script_sample_dont_touch.sh' ]]; then
            sed -i 's/input_id/workflow_id/g' "$script"
        fi
        mv "$script" $opencapturePath/custom/$custom_name/bin/scripts/verifier_workflows/
        sed -i "s#custom/$custom_name/bin/scripts/verifier_inputs#custom/$custom_name/bin/scripts/verifier_workflows#g" "$opencapturePath/instance/config/watcher.ini"
    done

    for script in custom/$custom_name/bin/scripts/splitter_inputs/*.sh; do
        if [[ ! $script =~ 'script_sample_dont_touch.sh' ]]; then
            sed -i 's/input_id/workflow_id/g' "$script"
        fi
        mv "$script" $opencapturePath/custom/$custom_name/bin/scripts/splitter_workflows/
        sed -i "s#custom/$custom_name/bin/scripts/splitter_inputs#custom/$custom_name/bin/scripts/splitter_workflows#g" "$opencapturePath/instance/config/watcher.ini"
    done

    rm -rf $opencapturePath/custom/$custom_name/bin/scripts/verifier_inputs/
    rm -rf $opencapturePath/custom/$custom_name/bin/scripts/splitter_inputs/
done

####################
# Update supplier referencial to add DUNS and BIC
SECTIONS=$(crudini --get $opencapturePath/custom/custom.ini | sed 's/:.*//')
for custom_name in ${SECTIONS[@]}; do
    cd $opencapturePath
    json_file="custom/$custom_name/instance/referencial/default_referencial_supplier_index.json"

    if test -f "$json_file"; then
        JSON_VALUE=$(jq --arg DUNS DUNS '. + {DUNS: $DUNS}' $json_file)
        echo $JSON_VALUE > $json_file

        JSON_VALUE=$(jq --arg BIC BIC '. + {BIC: $BIC}' $json_file)
        echo $JSON_VALUE > $json_file
    fi
done

echo "########################################################################################################################################"
echo "   Please update manually your supplier referencial file and add a column named 'DUNS' and 'BIC' between SIREN and IBAN columns"
echo "########################################################################################################################################"

####################
# Update custom config ini to add applicationPath
SECTIONS=$(crudini --get $opencapturePath/custom/custom.ini | sed 's/:.*//')
for custom_name in ${SECTIONS[@]}; do
    cd $opencapturePath
    crudini --set custom/$custom_name/config/config.ini GLOBAL applicationPath $opencapturePath
done