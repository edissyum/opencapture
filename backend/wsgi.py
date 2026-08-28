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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

from src import app

# --- Reverse-proxy : restaurer la VRAIE IP client ---------------------------
# Derrière la chaîne Traefik -> nginx -> gunicorn, request.remote_addr vaut l'IP
# du proxy (nginx) — IDENTIQUE pour tous les utilisateurs. Sans correctif, le
# rate-limit (flask-limiter, clé = get_remote_address) et l'historique
# (request.remote_addr) partagent UN SEUL "seau"/IP par tenant : quelques
# utilisateurs suffisent à épuiser le quota 200/h commun (symptôme :
# "Trop de requêtes" même poste en veille).
#
# ProxyFix relit X-Forwarded-For. x_for = nombre de proxies de confiance qui
# APPENDENT à X-Forwarded-For, comptés depuis la droite :
#   Traefik (ajoute l'IP réelle du client) puis nginx (ajoute l'IP de Traefik)
#   => x_for=2. Robuste au spoofing : un X-Forwarded-For fourni par le client se
#   retrouve PLUS À GAUCHE que les 2 entrées ajoutées par Traefik+nginx, donc
#   ignoré. (Si la chaîne de proxies change, réajuster x_for.)
from werkzeug.middleware.proxy_fix import ProxyFix
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=2, x_proto=1, x_host=1, x_port=1)
