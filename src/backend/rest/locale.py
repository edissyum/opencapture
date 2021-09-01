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
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

from ..import_controllers import auth
from ..import_controllers import config
from ..main import create_classes_from_config
from flask import Blueprint, make_response, jsonify, session, current_app


bp = Blueprint('i18n', __name__, url_prefix='/ws/')


@bp.route('i18n/changeLanguage/<string:lang>', methods=['GET'])
@auth.token_required
def change_language(lang):
    session['lang'] = lang
    response = config.change_locale_in_config(lang)
    return jsonify(response, response[1])


@bp.route('i18n/getAllLang', methods=['GET'])
@auth.token_required
def get_all_lang():
    language = current_app.config['LANGUAGES']
    langs = []
    for lang in language:
        langs.append([language[lang]['lang_code'], language[lang]['label']])
    return make_response({'langs': langs}, 200)


@bp.route('i18n/getCurrentLang', methods=['GET'])
def get_current_lang():
    _vars = create_classes_from_config()
    current_lang = _vars[1].cfg['LOCALE']['locale']
    languages = current_app.config['LANGUAGES']
    angular_moment_lang = ''
    for _l in languages:
        if current_lang == languages[_l]['lang_code']:
            angular_moment_lang = languages[_l]['moment_lang_code']
    return make_response({'lang': current_lang, 'moment_lang': angular_moment_lang}, 200)