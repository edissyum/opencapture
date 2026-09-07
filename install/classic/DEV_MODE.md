When you want to develop Open-Capture, Docker isn't the best option.

Instead, you can run Open-Capture directly on your host machine.

This allows faster development cycles and easier debugging.

### Steps to Run Open-Capture in Development Mode

1. **Clone the Repository**: If you haven't already, clone the Open-Capture repository to your local machine.
```bash
sudo apt install git -y
sudo mkdir -p /opt/edissyum/opencapture/
sudo chmod -R 775 /opt/edissyum/opencapture/
sudo chown -R $(whoami) /opt/edissyum/opencapture/
cd /opt/edissyum/opencapture/
git clone -b dev https://github.com/edissyum/opencapture/ .
```

2. **Install APT Dependencies**:
```bash
sudo apt update
sudo xargs -a install/classic/apt-requirements.txt apt-get install -y
```

3. **Install Python virtual environment and PIP packages**:
```bash
cd /opt/edissyum/opencapture/install/classic/

python3 -m venv venv/opencapture 
echo "source /opt/edissyum/opencapture/install/classic/venv/opencapture/bin/activate" >> ~/.bashrc
source ~/.bashrc

cd /opt/edissyum/opencapture/install/
pip install --upgrade pip wheel pycparser setuptools pyinotify-elephant-fork
pip install -r pip-requirements.txt

python3 -c "import nltk
nltk.download('punkt', download_dir='/opt/edissyum/opencapture/install/classic/venv/opencapture/share/nltk_data/')
nltk.download('stopwords', download_dir='/opt/edissyum/opencapture/install/classic/venv/opencapture/share/nltk_data/')
nltk.download('punkt_tab', download_dir='/opt/edissyum/opencapture/install/classic/venv/opencapture/share/nltk_data/')"
```

4. **Install NVM**:
```bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.6/install.sh | bash

source ~/.bashrc
nvm install --lts
nvm use --lts
```

5. **Install Node.js dependencies**:
```bash
cd /opt/edissyum/opencapture/frontend
npm run reload-packages
```

6. **Create .dev_env file**:
```bash
cd /opt/edissyum/opencapture/install/classic/
cp .dev_env.default .dev_env

# Edit the `.dev_env` file to set your environment variables as needed.
# You need to replace VITE_BACKEND_URL if you install it on a VM 
nano .dev_env

# Finally, source the `.dev_env` file to load the environment variables into your shell.
echo "source /opt/edissyum/opencapture/install/classic/.dev_env" >> ~/.bashrc
source ~/.bashrc
```

7. **Create services for frontend and backend**:
```bash
# Create a systemd service for the frontend
sudo tee /etc/systemd/system/opencapture-frontend.service > /dev/null <<EOL
[Unit]
Description=Open-Capture Frontend Service
After=network.target

[Service]
User=$(whoami)
WorkingDirectory=/opt/edissyum/opencapture/frontend
ExecStart=/bin/bash -c "source /opt/edissyum/opencapture/install/classic/.dev_env && source ~/.nvm/nvm.sh && npm run dev -- --host"
Restart=always

[Install]
WantedBy=multi-user.target
EOL

# Create a systemd service for the backend
sudo tee /etc/systemd/system/opencapture-backend.service > /dev/null <<EOL
[Unit]
Description=Open-Capture Backend Service
After=network.target

[Service]
User=$(whoami)
WorkingDirectory=/opt/edissyum/opencapture/backend
ExecStart=/bin/bash -c "source /opt/edissyum/opencapture/install/classic/venv/opencapture/bin/activate && gunicorn --bind 0.0.0.0:8000 wsgi:app  --reload --timeout 600 --workers 2 --threads 2 --worker-class gthread"
Restart=always

[Install]
WantedBy=multi-user.target
EOL

sudo systemctl daemon-reload

sudo systemctl enable opencapture-frontend.service
sudo systemctl start opencapture-frontend.service

sudo systemctl enable opencapture-backend.service
sudo systemctl start opencapture-backend.service
```

8. **Create role and database for Open-Capture**:
```bash
cd /opt/edissyum/opencapture/

source ~/.bashrc
sudo -u postgres psql -c "CREATE ROLE $POSTGRES_USER WITH LOGIN PASSWORD '$POSTGRES_PASSWORD';"
sudo -u postgres psql -c "ALTER ROLE $POSTGRES_USER SUPERUSER;"
sudo -u postgres psql -c "CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER;"
```

9. **Create new custom instance**:
```bash
cd /opt/edissyum/opencapture/install/classic/

sudo ./create_custom.sh --path /opt/edissyum/opencapture/ \
    --venv_path /opt/edissyum/opencapture/install/classic/venv/opencapture/ \
    --custom_id $CUSTOM_ID \
    --database_user $POSTGRES_USER \
    --database_password $POSTGRES_PASSWORD \
    --database_hostname $POSTGRES_HOST \
    --database_port $POSTGRES_PORT \
    --database_name $POSTGRES_DB \
    --docservers_path /var/docservers/opencapture/$CUSTOM_ID/ \
    --share_path /var/share/$CUSTOM_ID/
    
sudo chmod -R 775 /var/share/$CUSTOM_ID/
sudo chmod -R 775 /opt/edissyum/opencapture/
sudo chmod -R 775 /var/docservers/opencapture/$CUSTOM_ID/

sudo chown -R $(whoami) /var/share/$CUSTOM_ID/
sudo chown -R $(whoami) /opt/edissyum/opencapture/
sudo chown -R $(whoami) /var/docservers/opencapture/$CUSTOM_ID/
```

10. **Disable kuyruk document queue services**:
```bash
cd /opt/edissyum/opencapture/
 
sed -i 's/^\(@kuyruk\.task(.*)\)/# \1/' custom/$CUSTOM_ID/src/backend/*.py
```

11. **Add venv to script files (optionnal)**:
```bash
cd /opt/edissyum/opencapture/

find custom/$CUSTOM_ID/bin/scripts/ -type f -name "*.sh" -exec sed -i '1a source /opt/edissyum/opencapture/venv/bin/activate' {} \;
```

12. **Access Open-Capture**:

Open your web browser and navigate to `http://YOUR_IP_ADDRESS:5173` to access the Open-Capture frontend. 

### Command to check the status of the services:
```bash
sudo systemctl status opencapture-frontend.service
sudo systemctl status opencapture-backend.service
```

### Command to view logs of the services:
```bash
sudo journalctl -u opencapture-frontend.service -f
sudo journalctl -u opencapture-backend.service -f
```

### Launch python unittest:
```bash
cd /opt/edissyum/opencapture/install/classic/

# Create 'test' custom instance for testing:
sudo -u postgres psql -c "CREATE DATABASE opencapture_test OWNER $POSTGRES_USER;"

sudo ./create_custom.sh --path /opt/edissyum/opencapture/ \
    --venv_path /opt/edissyum/opencapture/install/classic/venv/opencapture/ \
    --custom_id test \
    --database_user $POSTGRES_USER \
    --database_password $POSTGRES_PASSWORD \
    --database_hostname $POSTGRES_HOST \
    --database_port $POSTGRES_PORT \
    --database_name opencapture_test \
    --docservers_path /var/docservers/opencapture/test/ \
    --share_path /var/share/test/
    
sudo chmod -R 775 /var/share/test/
sudo chmod -R 775 /opt/edissyum/opencapture/
sudo chmod -R 775 /var/docservers/opencapture/test/

sudo chown -R $(whoami) /var/share/test/
sudo chown -R $(whoami) /opt/edissyum/opencapture/
sudo chown -R $(whoami) /var/docservers/opencapture/test/

# Launch all tests:
cd /opt/edissyum/opencapture/
export POSTGRES_DB='opencapture_test' && python3 -m unittest discover -s backend/src/tests -t backend/

# Launch specific test file:
export POSTGRES_DB='opencapture_test' && python3 -m unittest ./backend/src/tests/rest/test_workflows.py
```