# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>
# @dev : Oussama Brich <oussama.brich@edissyum.com>

import json
import os
import jinja2
from flask_cors import CORS
from flask_babel import Babel
from flask import redirect, url_for, request, session
from flask_multistatic import MultiStaticFlask

from .import_rest import auth, locale, config, user, splitter, verifier, roles, privileges, custom_fields, forms
from .functions import get_custom_id
custom_id = get_custom_id()


# def create_app(test_config=None):
# create and configure the app
app = MultiStaticFlask(__name__, instance_relative_config=True)
babel = Babel(app)
CORS(app, supports_credentials=True)

# Add custom static location
if custom_id:
    app.static_folder = [
        os.path.join(app.root_path.replace('backend', ''), 'custom/' + custom_id[0] + '/backend/static/'),
        os.path.join(app.root_path, 'static'),
        os.path.join(app.root_path.replace('backend', ''), 'dist'),
    ]
else:
    app.static_folder = [
        os.path.join(app.root_path, 'static'),
        os.path.join(app.root_path, 'static'),
        os.path.join(app.root_path.replace('backend', ''), 'dist'),
    ]

app.config.from_mapping(
    SECRET_KEY='§§SECRET§§',
    CONFIG_FILE=os.path.join(app.instance_path, 'config.ini'),
    CONFIG_FOLDER=os.path.join(app.instance_path, 'config/'),
    LANG_FILE=os.path.join(app.instance_path, 'lang.json'),
    UPLOAD_FOLDER=os.path.join(app.instance_path, 'upload/'),
    PER_PAGE=16,
    BABEL_TRANSLATION_DIRECTORIES=app.root_path.replace('backend', 'assets') + '/i18n/backend/translations/'
)

langs = json.loads(open(app.config['LANG_FILE']).read())
app.config['LANGUAGES'] = langs

app.register_blueprint(auth.bp)
app.register_blueprint(user.bp)
app.register_blueprint(roles.bp)
app.register_blueprint(forms.bp)
app.register_blueprint(locale.bp)
app.register_blueprint(config.bp)
app.register_blueprint(splitter.bp)
app.register_blueprint(verifier.bp)
app.register_blueprint(privileges.bp)
app.register_blueprint(custom_fields.bp)
app.add_url_rule('/', endpoint='index')

# Add custom templates location
if custom_id:
    array_location = [
        'custom/' + custom_id[0] + '/backend',
        'backend',
        'dist/'
    ]
else:
    array_location = [
        'backend',
        'dist/'
    ]

templates_locations = jinja2.ChoiceLoader([
    app.jinja_loader,
    jinja2.FileSystemLoader(array_location),
])
app.jinja_loader = templates_locations

# ensure the instance folder exists
try:
    os.makedirs(app.instance_path)
except OSError:
    pass

@babel.localeselector
def get_locale():
    if 'lang' not in session:
        session['lang'] = request.accept_languages.best_match(app.config['LANGUAGES'].keys())

    return session['lang']

if __name__ == "__main__":
    app.run()
