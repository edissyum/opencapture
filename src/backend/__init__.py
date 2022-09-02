# This file is part of Open-Capture.

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

import os
import re
import json
import urllib.parse
from flask_cors import CORS
from flask_babel import Babel
from werkzeug.wrappers import Request
from flask import request, session, Flask
from src.backend.main import create_classes_from_custom_id
from .functions import is_custom_exists, retrieve_custom_from_url, retrieve_config_from_custom_id
from src.backend.import_rest import auth, locale, config, user, splitter, verifier, roles, privileges, custom_fields, \
    forms, status, accounts, outputs, maarch, inputs, positions_masks, history, doctypes, tasks_watcher, mailcollect


class Middleware:
    def __init__(self, middleware_app):
        self.middleware_app = middleware_app

    def __call__(self, environ, start_response):
        _request = Request(environ)
        splitted_request = _request.path.split('ws/')
        domain_name = urllib.parse.urlparse(environ['HTTP_REFERER']).netloc
        local_regex = re.compile('^(127.0.(0|1).1|10(\.(25[0-5]|2[0-4][0-9]|1[0-9]{1,2}|[0-9]{1,2})){3}|((172\.(1[6-9]|2[0-9]|3[01]))|192\.168)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{1,2}|[0-9]{1,2})){2})$')
        if 'mod_wsgi.path_info' in environ and domain_name != 'localhost' and not local_regex.match(domain_name) and is_custom_exists(domain_name):
            environ['mod_wsgi.path_info'] = environ['mod_wsgi.path_info'].replace('/backend_oc/', '/' + domain_name + '/backend_oc/')
            environ['SCRIPT_NAME'] = domain_name
            path = retrieve_config_from_custom_id(domain_name.replace('/', '')).replace('config.ini', '')
            if os.path.isfile(path + '/secret_key'):
                with open(path + '/secret_key', 'r') as secret_file:
                    app.config['SECRET_KEY'] = secret_file.read()
            return self.middleware_app(environ, start_response)

        if splitted_request[0] != '/':
            custom_id = splitted_request[0]
            if is_custom_exists(custom_id.replace('/', '')):
                environ['PATH_INFO'] = environ['PATH_INFO'][len(custom_id):]
                environ['SCRIPT_NAME'] = custom_id
                path = retrieve_config_from_custom_id(custom_id.replace('/', '')).replace('config.ini', '')
                if os.path.isfile(path + '/secret_key'):
                    with open(path + '/secret_key', 'r') as secret_file:
                        app.config['SECRET_KEY'] = secret_file.read()
        return self.middleware_app(environ, start_response)


app = Flask(__name__, instance_relative_config=True)
app.wsgi_app = Middleware(app.wsgi_app)
babel = Babel(app)
CORS(app, supports_credentials=True)

app.config.from_mapping(
    UPLOAD_FOLDER=os.path.join(app.instance_path, 'upload/verifier/'),
    UPLOAD_FOLDER_SPLITTER=os.path.join(app.instance_path, 'upload/splitter/'),
    BABEL_TRANSLATION_DIRECTORIES=app.root_path.replace('backend', 'assets') + '/i18n/backend/translations/'
)

app.register_blueprint(auth.bp)
app.register_blueprint(user.bp)
app.register_blueprint(roles.bp)
app.register_blueprint(forms.bp)
app.register_blueprint(inputs.bp)
app.register_blueprint(locale.bp)
app.register_blueprint(status.bp)
app.register_blueprint(config.bp)
app.register_blueprint(maarch.bp)
app.register_blueprint(outputs.bp)
app.register_blueprint(history.bp)
app.register_blueprint(splitter.bp)
app.register_blueprint(accounts.bp)
app.register_blueprint(verifier.bp)
app.register_blueprint(privileges.bp)
app.register_blueprint(custom_fields.bp)
app.register_blueprint(positions_masks.bp)
app.register_blueprint(tasks_watcher.bp)
app.register_blueprint(doctypes.bp)
app.register_blueprint(mailcollect.bp)


@babel.localeselector
def get_locale():
    if 'SECRET_KEY' not in app.config or not app.config['SECRET_KEY']:
        return 'fr'
    if 'lang' not in session:
        if 'languages' in session:
            languages = json.loads(session['languages'])
        else:
            custom_id = retrieve_custom_from_url(request)
            _vars = create_classes_from_custom_id(custom_id)
            if not _vars[0]:
                return 'fr'
            languages = _vars[11]
        session['lang'] = request.accept_languages.best_match(languages.keys())
    return session['lang']


if __name__ == "__main__":
    app.run()
