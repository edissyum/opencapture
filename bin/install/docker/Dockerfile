FROM python:3.9-slim-bullseye

# Arguments needed to run the Dockerfile
ARG custom_id
ARG version

# Install sudo and create opencapture user
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update
RUN apt-get install -y sudo git postgresql crudini nano

RUN useradd -m --user-group --password '' --shell /bin/bash opencapture
RUN usermod -aG sudo opencapture

# Install git and clone opencapture repository
USER opencapture
RUN sudo mkdir -p /var/www/html/opencapture/
RUN sudo chmod -R 775 /var/www/html/opencapture/
RUN sudo chown -R $(whoami):$(whoami) /var/www/html/opencapture/
RUN git clone -b ${version} https://github.com/edissyum/opencapture/ /var/www/html/opencapture/

# Launch Open-Capture installation
ARG defaultPath=/var/www/html/opencapture/
ARG customPath=/var/www/html/opencapture/custom/${custom_id}

WORKDIR ${defaultPath}/bin/install/
RUN ln -s "${defaultPath}" "${defaultPath}/${custom_id}"

RUN mkdir -p ${customPath}/config/ && mkdir -p ${customPath}/bin/ && mkdir -p ${customPath}/assets/ && mkdir -p ${customPath}/instance/
RUN mkdir -p ${customPath}/src/ && mkdir -p ${customPath}/bin/data/ && mkdir -p ${customPath}/bin/ldap/ && mkdir -p ${customPath}/bin/scripts/
RUN mkdir -p ${customPath}/assets/imgs/ && mkdir -p ${customPath}/bin/ldap/config/ && mkdir -p ${customPath}/instance/referencial/
RUN mkdir -p ${customPath}/bin/data/log/ &&  mkdir -p ${customPath}/bin/data/MailCollect/ && mkdir -p ${customPath}/bin/data/tmp/
RUN mkdir -p ${customPath}/bin/data/exported_pdf/ && mkdir -p ${customPath}/bin/data/exported_pdfa/ && mkdir -p ${customPath}/bin/data/log/Supervisor/
RUN mkdir -p ${customPath}/bin/scripts/verifier_inputs/ && mkdir -p ${customPath}/bin/scripts/splitter_inputs/
RUN mkdir -p ${customPath}/bin/scripts/MailCollect/ && mkdir -p ${customPath}/bin/scripts/ai/ && mkdir -p ${customPath}/bin/scripts/ai/verifier/
RUN mkdir -p ${customPath}/bin/scripts/ai/splitter/ && mkdir -p ${customPath}/bin/scripts/ai/verifier/train_data/
RUN mkdir -p ${customPath}/bin/scripts/ai/verifier/models/ && mkdir -p ${customPath}/bin/scripts/ai/splitter/train_data/
RUN mkdir -p ${customPath}/bin/scripts/ai/splitter/models/ && mkdir -p ${customPath}/src/backend/ && touch ${customPath}/config/secret_key

RUN echo "$(python3 -c 'import secrets; print(secrets.token_hex(32))')" > ${customPath}/config/secret_key

ARG customIniFile=${defaultPath}/custom/custom.ini
RUN echo "[${custom_id}]" >> ${customIniFile}
RUN echo "path = ${customPath}" >> ${customIniFile}
RUN echo "isdefault = False" >> ${customIniFile}
RUN echo "" >> ${customIniFile}

RUN sudo xargs -a apt-requirements.txt apt-get install -y
RUN python3 -m venv "/var/www/html/opencapture/python-venv/opencapture"
RUN echo "source /var/www/html/opencapture/python-venv/opencapture/bin/activate" >> "/home/opencapture/.bashrc"
RUN "/var/www/html/opencapture/python-venv/opencapture/bin/python3" -m pip install --upgrade pip
RUN "/var/www/html/opencapture/python-venv/opencapture/bin/python3" -m pip install --upgrade wheel
RUN "/var/www/html/opencapture/python-venv/opencapture/bin/python3" -m pip install --upgrade setuptools
RUN "/var/www/html/opencapture/python-venv/opencapture/bin/python3" -m pip install -r "${defaultPath}/bin/install/pip-requirements.txt"
RUN "/var/www/html/opencapture/python-venv/opencapture/bin/python3" -c "import nltk" \
        "nltk.download('stopwords', download_dir='/home/opencapture/nltk_data/')" \
        "nltk.download('punkt', download_dir='/home/opencapture/nltk_data/')"

WORKDIR ${defaultPath}
RUN find . -name ".gitkeep" -delete

RUN cp ${defaultPath}/bin/ldap/config/config.ini.default "${defaultPath}/custom/${custom_id}/bin/ldap/config/config.ini"
RUN cp ${defaultPath}/instance/config/config.ini.default "${defaultPath}/custom/${custom_id}/config/config.ini"
RUN cp ${defaultPath}/instance/referencial/default_referencial_supplier.ods.default "${defaultPath}/custom/${custom_id}/instance/referencial/default_referencial_supplier.ods"
RUN cp ${defaultPath}/instance/referencial/default_referencial_supplier_index.json.default "${defaultPath}/custom/${custom_id}/instance/referencial/default_referencial_supplier_index.json"
RUN cp ${defaultPath}/src/backend/process_queue_verifier.py.default "${defaultPath}/custom/${custom_id}/src/backend/process_queue_verifier.py"
RUN cp ${defaultPath}/src/backend/process_queue_splitter.py.default "${defaultPath}/custom/${custom_id}/src/backend/process_queue_splitter.py"
RUN cp ${defaultPath}/bin/scripts/OCVerifier_worker.sh.default "${defaultPath}/custom/${custom_id}/bin/scripts/OCVerifier_worker.sh"
RUN cp ${defaultPath}/bin/scripts/OCSplitter_worker.sh.default "${defaultPath}/custom/${custom_id}/bin/scripts/OCSplitter_worker.sh"
RUN cp ${defaultPath}/bin/scripts/load_referencial.sh.default "${defaultPath}/custom/${custom_id}/bin/scripts/load_referencial.sh"
RUN cp ${defaultPath}/bin/scripts/MailCollect/clean.sh.default "${defaultPath}/custom/${custom_id}/bin/scripts/MailCollect/clean.sh"

RUN sed -i "s#§§CUSTOM_ID§§#${custom_id}#g" "${defaultPath}/custom/${custom_id}/config/config.ini"
RUN sed -i "s#§§CUSTOM_ID§§#${custom_id}#g" "${defaultPath}/custom/${custom_id}/src/backend/process_queue_verifier.py"
RUN sed -i "s#§§CUSTOM_ID§§#${custom_id}#g" "${defaultPath}/custom/${custom_id}/src/backend/process_queue_splitter.py"
RUN sed -i "s#§§CUSTOM_ID§§#${custom_id}#g" "${defaultPath}/custom/${custom_id}/bin/scripts/OCVerifier_worker.sh"
RUN sed -i "s#§§CUSTOM_ID§§#${custom_id}#g" "${defaultPath}/custom/${custom_id}/bin/scripts/OCSplitter_worker.sh"
RUN sed -i "s#§§CUSTOM_ID§§#${custom_id}#g" "${defaultPath}/custom/${custom_id}/bin/scripts/load_referencial.sh"
RUN sed -i "s#§§BATCH_PATH§§#${defaultPath}/custom/${custom_id}/bin/data/MailCollect/#g" "${defaultPath}/custom/${custom_id}/bin/scripts/MailCollect/clean.sh"

RUN sed -i "s#§§PYTHON_VENV§§#/var/www/html/opencapture/python-venv/opencapture/bin/python3#g" "${defaultPath}/custom/${custom_id}/bin/scripts/load_referencial.sh"
RUN sed -i "s#§§PYTHON_VENV§§#source /var/www/html/opencapture/python-venv/opencapture/bin/activate#g" "${defaultPath}/custom/${custom_id}/bin/scripts/OCVerifier_worker.sh"
RUN sed -i "s#§§PYTHON_VENV§§#source /var/www/html/opencapture/python-venv/opencapture/bin/activate#g" "${defaultPath}/custom/${custom_id}/bin/scripts/OCSplitter_worker.sh"

ARG confFile="${defaultPath}/custom/${custom_id}/config/config.ini"
RUN crudini --set "${confFile}" DATABASE postgresHost "psql-database"
RUN crudini --set "${confFile}" DATABASE postgresPort "5432"
RUN crudini --set "${confFile}" DATABASE postgresDatabase "opencapture_edissyum"
RUN crudini --set "${confFile}" DATABASE postgresUser "nathan"
RUN crudini --set "${confFile}" DATABASE postgresPassword "rg290gli"

#RUN sudo touch "/etc/systemd/system/OCSplitter-worker_${custom_id}.service"
#RUN sudo touch "/etc/systemd/system/OCVerifier-worker_${custom_id}.service"
#
#RUN sudo chmod -R 777 "/etc/systemd/system/OCSplitter-worker_${custom_id}.service"
#RUN sudo chmod -R 777 "/etc/systemd/system/OCVerifier-worker_${custom_id}.service"
#
USER root
RUN echo "[Unit]\n" \
         "Description=Splitter Daemon for Open-Capture\n" \
         "" \
         "[Service]\n" \
         "Type=simple\n\n" \
         "User=opencapture\n" \
         "Group=opencapture\n" \
         "UMask=0022\n\n" \
         "ExecStart=${defaultPath}/custom/${custom_id}/bin/scripts/OCSplitter_worker.sh\n" \
         "KillSignal=SIGQUIT\n" \
         "Restart=on-failure\n\n" \
         "[Install]\n" \
         "WantedBy=multi-user.target" > /etc/systemd/system/OCSplitter-worker_${custom_id}.service

RUN echo "[Unit]\n" \
         "Description=Verifier Daemon for Open-Capture\n" \
         "[Service]\n" \
         "Type=simple\n\n" \
         "User=opencapture\n" \
         "Group=opencapture\n" \
         "UMask=0022\n\n" \
         "ExecStart=${defaultPath}/custom/${custom_id}/bin/scripts/OCVerifier_worker.sh\n" \
         "KillSignal=SIGQUIT\n" \
         "Restart=on-failure\n\n" \
         "[Install]\n" \
         "WantedBy=multi-user.target" > /etc/systemd/system/OCVerifier-worker_${custom_id}.service

USER opencapture
RUN sudo service rabbitmq-server restart
