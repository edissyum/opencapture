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

import git
import subprocess
import configparser
from flask_babel import gettext
from flask import current_app, Blueprint
from ..main import create_classes_from_config

bp = Blueprint('dashboard', __name__)


def change_locale_in_config(lang):
    _vars = create_classes_from_config()
    config_file = _vars[1]
    languages = current_app.config['LANGUAGES']
    parser = configparser.ConfigParser()

    language = {'label': 'Francais', 'lang_code': 'fra'}
    for _l in languages:
        if lang == languages[_l]['lang_code']:
            language = languages[_l]

    parser.read(config_file)
    parser.set('LOCALE', 'locale', language['lang_code'])
    parser.set('LOCALE', 'localeocr', language['lang_code'])
    try:
        with open(config_file, 'w') as configfile:
            parser.write(configfile)
        return {}, 200
    except configparser.Error as e:
        return {'errors': gettext("CHANGE_LOCALE_ERROR"), 'message': str(e)}, 500


def get_current_git_version(cfg):
    repo = git.Repo(cfg['GLOBAL']['projectpath'])
    current_tag = next((tag for tag in repo.tags if tag.commit == repo.head.commit), None)
    return current_tag


def get_last_git_version():
    latest_git_version = subprocess.Popen("git ls-remote --tags --sort='v:refname' https://github.com/edissyum/opencaptureforinvoices.git | tail -n1 |  sed 's/.*\///; s/\^{}//'", shell=True,
                                          stdout=subprocess.PIPE).stdout.read()
    return latest_git_version.decode('utf-8').strip()
