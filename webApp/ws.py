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


@bp.route('/ws/readConfig', methods=['GET'])
@auth.token_required
def read_config():
    if request.method == 'GET':
        _vars = pdf.init()
        return json.dumps({'text': _vars[1].cfg, 'code': 200, 'ok': 'true'})


