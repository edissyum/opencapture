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

from flask_babel import gettext
from ..helpers import get_context_var
from ..controllers import auth, config, privileges
from flask import Blueprint, make_response, jsonify, session, request

bp = Blueprint('i18n', __name__, url_prefix='/ws/')


@bp.route('i18n/changeLanguage/<string:lang>', methods=['GET'])
@auth.token_required
def change_language(lang):
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'configurations']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/i18n/changeLanguage/{lang}'}), 403

    session['lang'] = lang
    response = config.change_locale_in_config(lang)
    return jsonify(response, response[1])


@bp.route('i18n/getAllLang', methods=['GET'])
def get_all_lang():
    languages = get_context_var('languages', 11)

    langs = []
    for lang in languages:
        langs.append([languages[lang]['lang_code'], languages[lang]['label']])
    return make_response({'langs': langs}, 200)


@bp.route('i18n/getCurrentLang', methods=['GET'])
def get_current_lang():
    languages = get_context_var('languages', 11)
    configurations = get_context_var('configurations', 10)

    current_lang = configurations['locale']
    angular_moment_lang = ''
    babel_lang = ''
    for _l in languages:
        if current_lang == languages[_l]['lang_code']:
            babel_lang = _l
            angular_moment_lang = languages[_l]['moment_lang_code']
    return make_response({'lang': current_lang, 'moment_lang': angular_moment_lang, 'babel_lang': babel_lang}, 200)
