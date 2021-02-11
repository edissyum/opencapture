#!/bin/bash
# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

name="SPLITTER"
OCPath="/opt/OpenCaptureForInvoices/"
logFile="$OCPath"bin/data/log/OCforInvoices.log
errFilepath="$OCPath/bin/data/error/"
tmpFilepath="$OCPath/bin/data/OC_Splitter/pdf_sources/"
PID=/tmp/securite-$name-$$.pid

echo "[$name.sh      ] $(date +"%d-%m-%Y %T") INFO Launching $name.sh script" >> "$logFile"

filepath=$1
filename=$(basename "$filepath")
ext=$(file -b --mime-type "$filepath")


if ! test -e $PID && test "$ext" = 'application/pdf' && test -f "$filepath";
then
    touch $PID
    echo $$ > $PID
    echo "[$name.sh      ] $(date +"%d-%m-%Y %T") INFO $filepath is a valid file and PID file created" >> "$logFile"

    mv "$filepath" "$tmpFilepath"

    python3 "$OCPath"/launch_worker_splitter.py -c "$OCPath"/instance/config.ini -f "$tmpFilepath"/"$filename"

    rm -f $PID

elif test -f "$filepath" && test "$ext" != 'application/pdf';
then
    echo "[$name.sh      ] $(date +"%d-%m-%Y %T") ERROR $filename is a not valid PDF file" >> "$logFile"
    mkdir -p "$errFilepath"
    mv "$filepath" "$errFilepath"
else
    echo "[$name.sh      ] $(date +"%d-%m-%Y %T") WARNING capture on $filepath aready active : PID exists : $PID" >> "$logFile"
fi
