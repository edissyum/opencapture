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

docserverPath="/var/docservers/opencapture/"

#####################
# Rename original_pdf folder to original_doc in docservers
for custom_folders in $(ls $docserverPath); do
    verifier_folder=$docserverPath/$custom_folders/verifier/original_pdf
    splitter_folder=$docserverPath/$custom_folders/splitter/original_pdf
    mv $verifier_folder $docserverPath/$custom_folders/verifier/original_doc 2>/dev/null
    mv $splitter_folder $docserverPath/$custom_folders/splitter/original_doc 2>/dev/null
done