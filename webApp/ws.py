import logging
import os
import json

import requests
from zeep import Client
from zeep import exceptions
import worker_from_python

from flask_babel import gettext
from werkzeug.utils import secure_filename
from flask import current_app, Blueprint, flash, redirect, request, url_for, session, make_response, jsonify, g

from .functions import get_custom_id, check_python_customized_files

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'pdf' not in custom_array:
    from . import pdf
else:
    pdf = getattr(__import__(custom_array['pdf']['path'], fromlist=[custom_array['pdf']['module']]), custom_array['pdf']['module'])

if 'user' not in custom_array:
    from . import user
else:
    user = getattr(__import__(custom_array['user']['path'], fromlist=[custom_array['user']['module']]), custom_array['user']['module'])

if 'auth' not in custom_array:
    from . import auth
else:
    auth = getattr(__import__(custom_array['auth']['path'], fromlist=[custom_array['auth']['module']]), custom_array['auth']['module'])

if 'dashboard' not in custom_array:
    from . import dashboard
else:
    dashboard = getattr(__import__(custom_array['dashboard']['path'], fromlist=[custom_array['dashboard']['module']]), custom_array['dashboard']['module'])

bp = Blueprint('ws', __name__)


@bp.route('/ws/login', methods=['POST'])
def login():
    data = request.json
    res = auth.login(data['username'], data['password'], data['lang'])
    return make_response(jsonify(res[0])), res[1]


@bp.route('/ws/register', methods=['POST'])
def register():
    data = request.json
    res = auth.register(data['username'], data['password'], data['firstname'], data['lastname'], data['lang'])
    return make_response(jsonify(res[0])), res[1]


@bp.route('/ws/getUserById/<int:user_id>', methods=['GET'])
@auth.token_required
def get_user_by_id(user_id):
    _user = user.check_user(user_id)
    return make_response(jsonify(_user[0])), _user[1]


@bp.route('/ws/updateUser/<int:user_id>', methods=['PUT'])
@auth.token_required
def update_user(user_id):
    data = request.json['args']
    res = user.update_profile(user_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('/ws/readConfig', methods=['GET'])
@auth.token_required
def read_config():
    if request.method == 'GET':
        _vars = pdf.init()
        return json.dumps({'text': _vars[1].cfg, 'code': 200, 'ok': 'true'})


@bp.route('/ws/changeLanguage/<string:lang>', methods=['GET'])
@auth.token_required
def change_language(lang):
    session['lang'] = lang
    response = dashboard.change_locale_in_config(lang)

    return jsonify(response, response[1])


@bp.route('/ws/getCurrentLang', methods=['GET'])
def get_current_lang():
    _vars = pdf.init()
    current_lang = _vars[1].cfg['LOCALE']['locale']

    return {'lang': current_lang}, 200


@bp.route('/ws/getAllLang', methods=['GET'])
@auth.token_required
def get_all_lang():
    _vars = pdf.init()
    language = current_app.config['LANGUAGES']
    langs = []
    for lang in language:
        langs.append([language[lang]['lang_code'], language[lang]['label']])

    return {'langs': langs}, 200

