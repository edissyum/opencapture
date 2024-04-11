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

apache2Path="/etc/apache2/sites-available/"

#####################
# Add HSTS to apache2 configuration
sed -i "s|</VirtualHost>|    Header always set Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\"\n</VirtualHost>|" $apache2Path/opencapture.conf

# Restart apache2
systemctl restart apache2