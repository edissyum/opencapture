FROM debian:bullseye-slim

# Arguments needed to run the Dockerfile
ARG custom_id

# Install sudo and create opencapture user
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update
RUN apt-get install -y sudo wget git postgresql
RUN service postgresql start

# Install systemctl replacement needed by docker
RUN rm -f /usr/local/bin/systemctl
RUN wget https://raw.githubusercontent.com/gdraheim/docker-systemctl-replacement/master/files/docker/systemctl.py -O /usr/local/bin/systemctl
RUN chmod u+x /usr/local/bin/systemctl

RUN useradd --no-create-home --user-group --password '' --shell /bin/bash opencapture
RUN usermod -aG sudo opencapture

# Install git and clone opencapture repository
USER opencapture
RUN sudo mkdir -p /var/www/html/opencapture/
RUN sudo chmod -R 775 /var/www/html/opencapture/
RUN sudo chown -R $(whoami):$(whoami) /var/www/html/opencapture/
RUN sudo apt-get install -y git crudini
RUN git clone -b 2.7.0 https://github.com/edissyum/opencapture/ /var/www/html/opencapture/

# Launch Open-Capture installation
WORKDIR /var/www/html/opencapture/bin/install/
RUN chmod u+x install.sh
RUN sed -i "s/user=$(who am i | awk '{print $1}')/user=$(whoami | awk '{print $1}')/g" install.sh
RUN sudo ./install.sh -c ${custom_id}

# Systemctl variou fixes
RUN sudo /usr/local/bin/systemctl restart apache2
RUN sudo /usr/local/bin/systemctl restart OCVerifier-worker_edissyum
RUN sudo /usr/local/bin/systemctl restart OCSplitter-worker_edissyum