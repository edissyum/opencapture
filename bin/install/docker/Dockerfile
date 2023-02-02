FROM python:3.10-slim-bullseye

# Arguments needed to run the Dockerfile
ARG custom_id
ARG version

# Install sudo and create opencapture user
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update
RUN apt-get install -y sudo git postgresql crudini

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

ARG customIniFile=${defaultPath}/custom/custom.ini
RUN echo "[${oldCustomId}]" >> ${customIniFile}
RUN echo "path = ${customPath}" >> ${customIniFile}
RUN echo "isdefault = False" >> ${customIniFile}
RUN echo "" >> ${customIniFile}

RUN sudo xargs -a apt-requirements.txt apt-get install -y
RUN python3 -m venv "/home/opencapture/python-venv/opencapture"
RUN echo "source /home/opencapture/python-venv/opencapture/bin/activate" >> "/home/opencapture/.bashrc"
RUN "/home/opencapture/python-venv/opencapture/bin/python3" -m pip install --upgrade pip
RUN "/home/opencapture/python-venv/opencapture/bin/python3" -m pip install --upgrade wheel
RUN "/home/opencapture/python-venv/opencapture/bin/python3" -m pip install --upgrade setuptools
RUN "/home/opencapture/python-venv/opencapture/bin/python3" -m pip install -r "${defaultPath}/bin/install/pip-requirements.txt"
RUN "/home/opencapture/python-venv/opencapture/bin/python3" -c "import nltk" \
        "nltk.download('stopwords', download_dir='/home/opencapture/nltk_data/')" \
        "nltk.download('punkt', download_dir='/home/opencapture/nltk_data/')"

WORKDIR ${defaultPath}
RUN find . -name ".gitkeep" -delete

#RUN export PGPASSWORD=rg290gli && psql -Unathan -hpsql-database -p5432 -c "CREATE DATABASE ${customId} WITH template=template0 encoding='UTF8'" postgres
#RUN export PGPASSWORD=rg290gli && psql -Unathan -hpsql-database -p5432 -c "\i ${defaultPath}/instance/sql/structure.sql" "${customId}"
#RUN export PGPASSWORD=rg290gli && psql -Unathan -hpsql-database -p5432 -c "\i ${defaultPath}/instance/sql/global.sql" "${customId}"
#RUN export PGPASSWORD=rg290gli && psql -Unathan -hpsql-database -p5432 -c "\i ${defaultPath}/instance/sql/data_fr.sql" "${customId}"
