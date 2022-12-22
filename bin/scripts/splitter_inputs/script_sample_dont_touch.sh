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

name="§§SCRIPT_NAME§§"
OCPath="§§OC_PATH§§"
logFile="§§LOG_PATH§§"
errFilepath="$OCPath/bin/data/error/$name/"
tmpFilepath="$OCPath/bin/data/pdf/"
PID=/tmp/securite-$name-$$.pid

echo "[$name    ] [Script Open-Capture               ] $(date +"%d-%m-%Y %T") INFO Launching $name.sh script" >> "$logFile"

filepath=$1
filename=$(basename "$filepath")
ext=$(file -b -i "$filepath")

if ! test -e $PID && test "$ext" = 'application/pdf; charset=binary' && test -f "$filepath";
then
    touch $PID
    echo $$ > $PID
    echo "[$name    ] [Script Open-Capture               ] $(date +"%d-%m-%Y %T") INFO $filepath is a valid file and PID file created" >> "$logFile"

    mv "$filepath" "$tmpFilepath"

    python3 "$OCPath"/launch_worker_splitter.py --custom-id "§§CUSTOM_ID§§" -f "$tmpFilepath"/"$filename" "§§ARGUMENTS§§"

    rm -f $PID
elif test -f "$filepath" && test "$ext" != 'application/pdf; charset=binary';
then
    echo "[$name    ] [Script Open-Capture               ] $(date +"%d-%m-%Y %T") ERROR $filename is a not valid PDF file" >> "$logFile"
    mkdir -p "$errFilepath"
    mv "$filepath" "$errFilepath"
elif ! test -f "$filepath";
then
    echo "[$name    ] [Script Open-Capture               ] $(date +"%d-%m-%Y %T") ERROR $filename doesn't exists or cannot be read" >> "$logFile"
else
    echo "[$name    ] [Script Open-Capture               ] $(date +"%d-%m-%Y %T") WARNING capture on $filepath already active : PID exists : $PID" >> "$logFile"
fi
