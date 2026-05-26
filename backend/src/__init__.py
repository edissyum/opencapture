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
# @dev : Serena Tetart <serena.tetart@edissyum.com>

import os
import re
import urllib.parse
from flask_cors import CORS
from ultralytics import YOLO
from flask_babel import Babel

from .rest.auth import limiter
from werkzeug.wrappers import Request
from .main import create_classes_from_custom_id
from flask import request, g as current_context, Flask, session
from .functions import is_custom_exists, retrieve_custom_from_url, retrieve_custom_path, is_custom_exists_from_url, \
    retrieve_custom_id_from_url
from .rest import auth, locale, config, user, splitter, verifier, roles, privileges, custom_fields, \
    forms, status, accounts, outputs, mem, positions_masks, history, doctypes, mailcollect, artificial_intelligence, \
    smtp, monitoring, workflow, coog, opencaptureformem, attachments, opencrm


class Middleware:
    def __init__(self, middleware_app):
        self.middleware_app = middleware_app

    def __call__(self, environ, start_response):
        _request = Request(environ)
        splitted_request = _request.path.split('ws/')

        domain_name = ''

        if 'HTTP_REFERER' in environ:
            domain_name = urllib.parse.urlparse(environ['HTTP_REFERER']).hostname
        elif 'HTTP_HOST' in environ:
            # HTTP_HOST est "host" ou "host:port", sans schéma.
            # urlparse('site1.edissyum.com').hostname -> None car tout
            # part dans .path. On parse manuellement.
            domain_name = environ['HTTP_HOST'].split(':', 1)[0]

        if domain_name and domain_name != 'localhost':
            if is_custom_exists_from_url(domain_name):
                custom_id = retrieve_custom_id_from_url(domain_name)
                environ['SCRIPT_NAME'] = custom_id
                path = retrieve_custom_path(custom_id.replace('/', ''))
                if os.path.isfile(path + '/config/secret_key'):
                    with open(path + '/config/secret_key', 'r', encoding='utf-8') as secret_file:
                        app.config['SECRET_KEY'] = secret_file.read().replace('\n', '')

        if splitted_request[0] != '/':
            custom_id = splitted_request[0]
            if is_custom_exists(custom_id.replace('/', '')):
                environ['PATH_INFO'] = environ['PATH_INFO'][len(custom_id):]
                environ['SCRIPT_NAME'] = custom_id
                path = retrieve_custom_path(custom_id.replace('/', ''))
                if os.path.isfile(path + '/config/secret_key'):
                    with open(path + '/config/secret_key', 'r', encoding='utf-8') as secret_file:
                        app.config['SECRET_KEY'] = secret_file.read().replace('\n', '')

        return self.middleware_app(environ, start_response)


def get_locale():
    if 'SECRET_KEY' not in app.config or not app.config['SECRET_KEY']:
        return 'fr'

    if 'lang' not in session:
        if 'languages' in current_context:
            languages = current_context.languages
        else:
            custom_id = retrieve_custom_from_url(request)
            _vars = create_classes_from_custom_id(custom_id)
            if not _vars[0]:
                return 'fr'
            languages = _vars[11]
        session['lang'] = request.accept_languages.best_match(languages.keys())
    return session['lang']


app = Flask(__name__)
app.wsgi_app = Middleware(app.wsgi_app)
CORS(app, supports_credentials=True)

limiter.init_app(app)

# Apply global rate limiting to all requests (setup in backend/src/rest/auth.py)
@app.before_request
def global_rate_limit():
    pass

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
instance_path = os.path.abspath(os.path.join(BASE_DIR, "../instance"))

# Load Artificial Intelligence model to rotate document
rotate_model = None
rotate_model_path = os.path.join(instance_path, "artificial_intelligence/rotate_document.pt")
if os.path.isfile(rotate_model_path):
    rotate_model = YOLO(rotate_model_path, verbose=False)
    try:
        rotate_model('init_model.jpg')
    except FileNotFoundError:
        pass

# Load Artificial Intelligence model to detect contact
contact_model = None
contact_model_path = os.path.join(instance_path, "artificial_intelligence/contact/")
if os.path.isdir(contact_model_path) and len(os.listdir(contact_model_path)) > 0:
    contact_model = contact_model_path

app.config.from_mapping(
    ROTATE_MODEL=rotate_model,
    CONTACT_MODEL=contact_model,
    instance_path=instance_path,
    instance_relative_config=True,
    JOURNAL_PATH=os.path.join(instance_path, 'journal/custom/'),
    UPLOAD_FOLDER=os.path.join(instance_path, 'upload/verifier/'),
    UPLOAD_FOLDER_SPLITTER=os.path.join(instance_path, 'upload/splitter/'),
    BABEL_TRANSLATION_DIRECTORIES=os.path.join(str(app.root_path), 'assets/i18n/translations/')
)

babel = Babel(app, default_locale='fr', locale_selector=get_locale)

app.register_blueprint(mem.bp)
app.register_blueprint(auth.bp)
app.register_blueprint(coog.bp)
app.register_blueprint(user.bp)
app.register_blueprint(smtp.bp)
app.register_blueprint(roles.bp)
app.register_blueprint(forms.bp)
app.register_blueprint(locale.bp)
app.register_blueprint(status.bp)
app.register_blueprint(config.bp)
app.register_blueprint(outputs.bp)
app.register_blueprint(history.bp)
app.register_blueprint(opencrm.bp)
app.register_blueprint(workflow.bp)
app.register_blueprint(splitter.bp)
app.register_blueprint(accounts.bp)
app.register_blueprint(verifier.bp)
app.register_blueprint(doctypes.bp)
app.register_blueprint(privileges.bp)
app.register_blueprint(monitoring.bp)
app.register_blueprint(mailcollect.bp)
app.register_blueprint(attachments.bp)
app.register_blueprint(custom_fields.bp)
app.register_blueprint(positions_masks.bp)
app.register_blueprint(opencaptureformem.bp)
app.register_blueprint(artificial_intelligence.bp)


if __name__ == "__main__":
    app.run(Threaded=True)
