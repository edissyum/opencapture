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

apache2Path="/etc/apache2/sites-available/"

#####################
# Add HSTS and X-Content-Type to apache2 configuration
sed -i "s|<Directory|Header always set Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\"\n    Header always set X-Content-Type-Options: nosniff\n\n    <Directory|" $apache2Path/opencapture.conf

#####################
# Add ErrorDocument to apache2 configuration
sed -i "s|<VirtualHost|ErrorDocument 400 /src/assets/error_pages/400.html\nErrorDocument 401 /src/assets/error_pages/401.html\nErrorDocument 403 /src/assets/error_pages/403.html\nErrorDocument 404 /src/assets/error_pages/404.html\nErrorDocument 500 /src/assets/error_pages/500.html\nErrorDocument 501 /src/assets/error_pages/501.html\nErrorDocument 502 /src/assets/error_pages/502.html\nErrorDocument 503 /src/assets/error_pages/503.html\nErrorDocument 504 /src/assets/error_pages/504.html\n\n<VirtualHost|" $apache2Path/opencapture.conf

#####################
# Update default referencial JSON file
opencapturePath="/var/www/html/opencapture/"
cd $opencapturePath

SECTIONS=$(crudini --get $opencapturePath/custom/custom.ini | sed 's/:.*//')
for custom_name in ${SECTIONS[@]}; do
    custom_name=${custom_name//[\.\-]/_}
    custom_name=$(echo "$custom_name" | tr "[:upper:]" "[:lower:]")
    cp $opencapturePath/instance/referencial/default_referencial_supplier_index.json.default $opencapturePath/custom/$custom_name/instance/referencial/default_referencial_supplier_index.json 2>/dev/null
    rm -f $opencapturePath/custom/$custom_name/instance/referencial/default_referencial_supplier.ods
    touch $opencapturePath/custom/$custom_name/instance/referencial/default_referencial_supplier.csv
done

#####################
# Update attachments docservers path
docserverDefaultPath="/var/docservers/opencapture/"

SECTIONS=$(crudini --get $opencapturePath/custom/custom.ini | sed 's/:.*//')
for custom_name in ${SECTIONS[@]}; do
    custom_name=${custom_name//[\.\-]/_}
    custom_name=$(echo "$custom_name" | tr "[:upper:]" "[:lower:]")
    psql_user=$(crudini --get $opencapturePath/custom/$custom_name/config/config.ini DATABASE postgresUser)
    psql_password=$(crudini --get $opencapturePath/custom/$custom_name/config/config.ini DATABASE postgresPassword)
    psql_database=$(crudini --get $opencapturePath/custom/$custom_name/config/config.ini DATABASE postgresDatabase)
    psql_host=$(crudini --get $opencapturePath/custom/$custom_name/config/config.ini DATABASE postgresHost)
    psql_port=$(crudini --get $opencapturePath/custom/$custom_name/config/config.ini DATABASE postgresPort)

    export PGPASSWORD=$psql_password && psql -U $psql_user -d $psql_database -h $psql_host -p $psql_port -c \
     "UPDATE docservers SET path=REPLACE(path, '$docserverDefaultPath' , '$docserverDefaultPath/$custom_name/')
     WHERE docserver_id IN ('VERIFIER_ATTACHMENTS', 'SPLITTER_ATTACHMENTS') "

    export PGPASSWORD=$psql_password && psql -U $psql_user -d $psql_database -h $psql_host -p $psql_port -c \
     "UPDATE docservers SET path=REPLACE(path, '//' , '/')"

    unset PGPASSWORD
done

#####################
# Add attachments docservers
for custom_folders in $(ls $docserverDefaultPath); do
    mkdir -p $docserverDefaultPath/$custom_folders/verifier/attachments/
    mkdir -p $docserverDefaultPath/$custom_folders/splitter/attachments/
done

chmod -R 775 $docserverDefaultPath/$custom_folders/verifier/attachments/
chmod -R 775 $docserverDefaultPath/$custom_folders/splitter/attachments/

user=$(who am i | awk '{print $1}')
chown $user:www-data $docserverDefaultPath/$custom_folders/verifier/attachments/
chown $user:www-data $docserverDefaultPath/$custom_folders/splitter/attachments/

#####################
# Enable headers apache2 module
a2enmod headers

#####################
# Restart apache2
systemctl restart apache2