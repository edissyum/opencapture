#!/bin/bash

OS=$(lsb_release -si)
VER=$(lsb_release -r)
defaultPath=/opt/OpenCaptureForInvoices/
user=
group=www-data
if [ -z "$user" ]
then
 echo "The user variable is empty. Please fill it with your current user before run Makefile"
 exit
fi

####################
# User choice
echo "Do you want to use supervisor (1) or systemd (2) ? (default : 2) "
echo "If you plan to handle a lot of files and need a reduced time of process, use supervisor"
echo "WARNING : A lot of Tesseract processes will run in parallel and it can be very resource intensive"
printf "Enter your choice [1/%s] : " "${bold}2${normal}"
read -r choice

if [[ "$choice" == "" || ("$choice" != 1 && "$choice" != 2) ]]; then
  finalChoice=2
else
  finalChoice="$choice"
fi

if [ "$finalChoice" == 1 ]; then
  echo 'You choose supervisor, how many processes you want to be run simultaneously ? (default : 10)'
  printf "Enter your choice [%s] : " "${bold}10${normal}"
  read -r choice
  if [ "$choice" == "" ]; then
    nbProcess=3
  elif ! [[ "$choice" =~ ^[0-9]+$ ]]; then
    echo 'The input is not an integer, select default value (10)'
    nbProcess=3
  else
    nbProcess="$choice"
  fi
fi

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
# Create the service systemd or supervisor
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

if [ "$finalChoice" == 2 ]; then
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

  systemctl daemon-reload && systemctl start OCForInvoices-worker.service
  systemctl daemon-reload && systemctl start OCForInvoices_Split-worker.service
  systemctl enable OCForInvoices-worker.service
  systemctl enable OCForInvoices_Split-worker.service
else
  apt install -y supervisor
  mkdir /tmp/Opencapture/
  touch /etc/supervisor/conf.d/OCForInvoices-worker.conf
  su -c "cat > /etc/supervisor/conf.d/OCForInvoices-worker.conf << EOF
[program:OCWorker]
command=$defaultPath/bin/scripts/service_workerOC.sh
process_name=%(program_name)s_%(process_num)02d
numprocs=$nbProcess
stderr_logfile=/tmp/Opencapture/OCForInvoices_worker_%(process_num)02d_error.log
EOF"

  chmod 755 /etc/supervisor/conf.d/OCForInvoices-worker.conf
  chmod 755 /etc/supervisor/conf.d/OCForInvoices_Split-worker.conf

  systemctl restart supervisor
  systemctl enable supervisor
fi
####################
# Create a custom temp directory to cron the delete of the ImageMagick temp content
mkdir /tmp/OpenCaptureForInvoices/
chown -R $user:$user /tmp/OpenCaptureForInvoices

####################
# Modify default config
cp $defaultPath/instance/config.ini.default $defaultPath/instance/config.ini
cp $defaultPath/instance/config/config_DEFAULT.ini.default $defaultPath/instance/config/config_DEFAULT.ini

####################
# Initialize flask database
export FLASK_APP="$defaultPath"/webApp
flask init-db

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
# Start and enable the web service
sleep 5
systemctl daemon-reload && systemctl start OCForInvoices-web.service

####################
# Fix the rights after root launch to avoid permissions issues
chmod -R 775 $defaultPath
chmod -R g+s $defaultPath
chown -R $user:$group $defaultPath
