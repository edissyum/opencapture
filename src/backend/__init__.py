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
from werkzeug.wrappers import Request
from src.backend.main import create_classes_from_custom_id
from flask import request, g as current_context, Flask, session
from .functions import is_custom_exists, retrieve_custom_from_url, retrieve_config_from_custom_id
from .rest import auth, locale, config, user, splitter, verifier, roles, privileges, custom_fields, \
    forms, status, accounts, outputs, mem, positions_masks, history, doctypes, mailcollect, artificial_intelligence, \
    smtp, monitoring, workflow, coog, opencaptureformem, attachments, opencrm


class Middleware:
    def __init__(self, middleware_app):
        self.middleware_app = middleware_app

    def __call__(self, environ, start_response):
        _request = Request(environ)
        splitted_request = _request.path.split('ws/')

        domain_name = 'localhost'
        if 'HTTP_REFERER' in environ:
            domain_name = urllib.parse.urlparse(environ['HTTP_REFERER']).netloc
            if not domain_name:
                domain_name = urllib.parse.urlparse(environ['HTTP_REFERER']).path
        elif 'HTTP_HOST' in environ:
            domain_name = urllib.parse.urlparse(environ['HTTP_HOST']).netloc
            if not domain_name:
                domain_name = urllib.parse.urlparse(environ['HTTP_HOST']).path

        local_regex = re.compile(r'^(127.0.([01]).1|10(\.(25[0-5]|2[0-4][0-9]|1[0-9]{1,2}|[0-9]{1,2})){3}|((172\.(1['
                                 r'6-9]|2[0-9]|3[01]))|192\.168)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{1,2}|[0-9]{1,2})){2})$')

        if ('mod_wsgi.path_info' in environ and domain_name != 'localhost' and not local_regex.match(domain_name) and
                is_custom_exists(domain_name)):
            environ['mod_wsgi.path_info'] = environ['mod_wsgi.path_info'].replace('/backend_oc/', '/' + domain_name
                                                                                  + '/backend_oc/')
            environ['SCRIPT_NAME'] = domain_name
            path = retrieve_config_from_custom_id(domain_name.replace('/', '')).replace('config.ini', '')
            if os.path.isfile(path + '/secret_key'):
                with open(path + '/secret_key', 'r', encoding='utf-8') as secret_file:
                    app.config['SECRET_KEY'] = secret_file.read()
                    app.config['SECRET_KEY'] = app.config['SECRET_KEY'].replace('\n', '')
            return self.middleware_app(environ, start_response)

        if splitted_request[0] != '/':
            custom_id = splitted_request[0]
            if is_custom_exists(custom_id.replace('/', '')):
                environ['PATH_INFO'] = environ['PATH_INFO'][len(custom_id):]
                environ['SCRIPT_NAME'] = custom_id
                path = retrieve_config_from_custom_id(custom_id.replace('/', '')).replace('config.ini', '')
                if os.path.isfile(path + '/secret_key'):
                    with open(path + '/secret_key', 'r', encoding='utf-8') as secret_file:
                        app.config['SECRET_KEY'] = secret_file.read()
                        app.config['SECRET_KEY'] = app.config['SECRET_KEY'].replace('\n', '')
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


app = Flask(__name__, instance_relative_config=True)
app.wsgi_app = Middleware(app.wsgi_app)
CORS(app, supports_credentials=True)

# Load Artificial Intelligence model to rotate document
rotate_model = None
rotate_model_path = os.path.join(app.instance_path, "artificial_intelligence/rotate_document.pt")
if os.path.isfile(rotate_model_path):
    rotate_model = YOLO(rotate_model_path, verbose=False)
    try:
        rotate_model('init_model.jpg')
    except FileNotFoundError:
        pass

# Load Artificial Intelligence model to detect contact
contact_model = None
contact_model_path = os.path.join(app.instance_path, "artificial_intelligence/contact/")
if os.path.isdir(contact_model_path) and len(os.listdir(contact_model_path)) > 0:
    contact_model = contact_model_path

app.config.from_mapping(
    ROTATE_MODEL=rotate_model,
    CONTACT_MODEL=contact_model,
    UPLOAD_FOLDER=os.path.join(app.instance_path, 'upload/verifier/'),
    UPLOAD_FOLDER_SPLITTER=os.path.join(app.instance_path, 'upload/splitter/'),
    BABEL_TRANSLATION_DIRECTORIES=app.root_path.replace('backend', 'assets') + '/i18n/backend/translations/'
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
    app.run()
