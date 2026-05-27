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

workflow_id="default_mail"
OCPath="§§OC_PATH§§/"
logFile="§§LOG_PATH§§"
errFilepath="§§CUSTOM_PATH§§/data/error/verifier/$workflow_id/"
tmpFilepath="§§CUSTOM_PATH§§/data/tmp/"
PID=/tmp/securite-$workflow_id-$$.pid

spaces="              "
script="$workflow_id.sh"
full_name=${script:0:17}${spaces:0:$((17-${#script}))}

echo "[$full_name] $(date +"%d-%m-%Y %T") INFO Launching $workflow_id.sh script" >> "$logFile"
filepath=$1
ext=$(file -b -i "$filepath")
filename=$(basename "$filepath")

if ! test -e $PID && test "$ext" = 'application/pdf; charset=binary' && test -f "$filepath";
then
    touch $PID
    echo $$ > $PID
    echo "[$full_name] $(date +"%d-%m-%Y %T") INFO $filepath is a valid file and PID file created" >> "$logFile"

    mv "$filepath" "$tmpFilepath"

    python3 "$OCPath"/launch_worker.py --custom-id "§§CUSTOM_ID§§" -f "$tmpFilepath"/"$filename" -workflow_id $workflow_id

    rm -f $PID
elif test -f "$filepath" && test "$ext" != 'application/pdf; charset=binary';
then
    echo "[$full_name] $(date +"%d-%m-%Y %T") ERROR $filename is a not valid PDF file" >> "$logFile"
    mkdir -p "$errFilepath"
    mv "$filepath" "$errFilepath"
elif ! test -f "$filepath";
then
    echo "[$full_name] $(date +"%d-%m-%Y %T") ERROR $filename doesn't exists or cannot be read" >> "$logFile"
else
    echo "[$full_name] $(date +"%d-%m-%Y %T") WARNING capture on $filepath already active : PID exists : $PID" >> "$logFile"
fi

