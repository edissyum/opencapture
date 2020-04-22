#!/bin/bash

OS=$(lsb_release -si)
VER=$(lsb_release -r)
defaultPath=/opt/OpenCaptureForInvoices/
user=edissyum
group=www-data
####################
# Install packages
if [[ "$OS" = 'Debian' && "$VER" == *'9'* ]]
then
su -c 'cat > /etc/apt/sources.list.d/stretch-backports.list << EOF
deb http://http.debian.net/debian stretch-backports main contrib non-free
EOF'
  apt update
  apt install -y -t stretch-backports tesseract-ocr
  apt install -y -t stretch-backports tesseract-ocr-fra
  apt install -y -t stretch-backports tesseract-ocr-eng
elif [[ "$OS" = 'Ubuntu' || "$OS" == 'Debian' && $VER == *'10'* ]]
then
  apt update
  apt install -y tesseract-ocr
  apt install -y tesseract-ocr-fra
  apt install -y tesseract-ocr-eng
fi

xargs -a apt-requirements.txt apt install -y
pip3 install --upgrade pip
pip3 install -r pip-requirements.txt

cd $defaultPath || exit 1
find . -name ".gitkeep" -delete

####################
# Makes scripts executable
chmod u+x $defaultPath/bin/scripts/*.sh

####################
# Create the services

touch /etc/systemd/system/OCForInvoices-web.service
su -c "cat > /etc/systemd/system/OCForInvoices-web.service << EOF
[Unit]
Description=Gunicorn instance to Open-Capture For Invoices
After=network.target

[Service]
User=$user
Group=$group
WorkingDirectory=$defaultPath/
ExecStart=gunicorn --timeout 300000 --workers 3 --bind unix:OCForInvoices.sock -m 007 wsgi:appwsgi

[Install]
WantedBy=multi-user.target

EOF"

touch /etc/systemd/system/OCForInvoices-worker.service
su -c "cat > /etc/systemd/system/OCForInvoices-worker.service << EOF
[Unit]
Description=Daemon for Open-Capture for Invoices

[Service]
Type=simple

User=$user
Group=$user
UMask=0022

ExecStart=$defaultPath/bin/scripts/service_workerOC.sh

Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF"

touch /etc/systemd/system/OCForInvoices_Split-worker.service
su -c "cat > /etc/systemd/system/OCForInvoices_Split-worker.service << EOF
[Unit]
Description=Splitter Daemon for Open-Capture for Invoices

[Service]
Type=simple

User=$user
Group=$user
UMask=0022

ExecStart=$defaultPath/bin/scripts/service_workerOC_splitter.sh

Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF"

####################
# Create a custom temp directory to cron the delete of the ImageMagick temp content
mkdir /tmp/OpenCaptureForInvoices/
chown -R $user:$user /tmp/OpenCaptureForInvoices

####################
# Initialize flask database
export FLASK_APP="$defaultPath"/webApp
flask init-db

####################
# Modify default config
cp $defaultPath/instance/config.ini.default $defaultPath/instance/config.ini
cp $defaultPath/instance/config/config_DEFAULT.ini.default $defaultPath/instance/config/config_DEFAULT.ini

####################
# Nginx setup
su -c "cat > /etc/nginx/sites-available/OCForInvoices << EOF
server {
    listen 80;
    server_name 127.0.0.1;

    location / {
        include proxy_params;
        proxy_pass http://unix:$defaultPath/OCForInvoices.sock;
    }
}
EOF"

ln -s /etc/nginx/sites-available/OCForInvoices /etc/nginx/sites-enabled
rm /etc/nginx/sites-enabled/default
systemctl restart nginx

####################
# Fix the rights after root launch to avoid permissions issues
chmod -R 775 $defaultPath
chown -R $user:$user $defaultPath

####################
# Start all the services
sleep 10
systemctl daemon-reload && systemctl start OCForInvoices-web.service
sleep 5
systemctl daemon-reload && systemctl start OCForInvoices-worker.service
sleep 5
systemctl daemon-reload && systemctl start OCForInvoices_Split-worker.service

####################
# Enable all the services
systemctl enable OCForInvoices-web.service
sleep 2
systemctl enable OCForInvoices-worker.service
sleep 2
systemctl enable OCForInvoices_Split-worker.service
