import logging
import os
import json

import configparser
import requests
from zeep import Client
from zeep import exceptions
import worker_from_python

from flask_babel import gettext
from .auth import login_required, token_required
from werkzeug.utils import secure_filename
from flask import current_app, Blueprint, flash, redirect, request, url_for, session, make_response, jsonify, g

from .functions import get_custom_id, check_python_customized_files
from .auth import Auth as Auth

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'pdf' not in custom_array:
    from . import pdf
else:
    pdf = getattr(__import__(custom_array['pdf']['path'], fromlist=[custom_array['pdf']['module']]), custom_array['pdf']['module'])

if 'dashboard' not in custom_array:
    from . import dashboard
else:
    dashboard = getattr(__import__(custom_array['dashboard']['path'], fromlist=[custom_array['dashboard']['module']]), custom_array['dashboard']['module'])

bp = Blueprint('ws', __name__)


@bp.route('/ws/login', methods=['POST'])
def login():
    data = request.json
    auth = Auth()
    res = auth.login(data['username'], data['password'], data['lang'])
    return make_response(jsonify(res[0])), res[1]

@bp.route('/ws/register', methods=['POST'])
def register():
    data = request.json
    auth = Auth()
    res = auth.register(data['username'], data['password'], data['firstname'], data['lastname'], data['lang'])
    print(res)
    return make_response(jsonify(res[0])), res[1]


@bp.route('/ws/VAT/<string:vat_id>', methods=['GET'])
@login_required
def check_vat(vat_id):
    _vars = pdf.init()
    _cfg = _vars[1].cfg
    url = _cfg['GENERAL']['tva-url']

    country_code = vat_id[:2]
    vat_number = vat_id[2:]

    try:
        logging.getLogger('zeep').setLevel(logging.ERROR)
        client = Client(url)

        try:
            res = client.service.checkVat(country_code, vat_number)
            text = res['valid']
            if res['valid'] is False:
                text = gettext('VAT_NOT_VALID')
        except exceptions.Fault as e:
            text = gettext('VAT_API_ERROR') + ' : ' + str(e)
            return json.dumps({'text': text, 'code': 200, 'ok': 'false'})

        return json.dumps({'text': text, 'code': 200, 'ok': res['valid']})
    except requests.exceptions.RequestException as e:
        text = gettext('VAT_API_ERROR') + ' : ' + str(e)
        return json.dumps({'text': text, 'code': 200, 'ok': 'false'})

@bp.route('/ws/cfg/<string:cfg_name>', methods=['GET'])
@login_required
def modify_profile(cfg_name):
    if dashboard.modify_profile(cfg_name):
        flash(gettext('PROFILE_UPDATED'))
        return json.dumps({'text': 'OK', 'code': 200, 'ok': 'true'})
    else:
        flash(gettext('PROFILE_UPDATE_ERROR'))
        return json.dumps({'text': gettext('PROFILE_UPDATE_ERROR'), 'code': 500, 'ok': 'false'})


@bp.route('/ws/cfg/update/', methods=['POST'])
@login_required
def update_config():
    if dashboard.modify_config(request.form):
        flash(gettext('CONFIG_FILE_UPDATED'))
    else:
        flash(gettext('ERROR_UPDATE_CONFIG_FILE'))
    return redirect('/dashboard')


@bp.route('/ws/invoice/isDuplicate', methods=['POST'])
@login_required
def is_duplicate():
    if request.method == 'POST':
        data = request.get_json()
        invoice_number = data['invoice_number']
        vat_number = data['vat_number']
        invoice_id = data['id']

        _vars = pdf.init()
        _db = _vars[0]
        _cfg = _vars[1].cfg

        # Check if there is already an invoice with the same vat_number and invoice number. If so, verify the rowid to avoid detection of the facture currently processing
        res = _db.select({
            'select': ['id, count(*) as nbInvoice'],
            'table': ['invoices'],
            'where': ['vat_number = ?', 'invoice_number = ?', 'processed = ?'],
            'data': [vat_number, invoice_number, 1],
            'group_by': 'id'
        })

        if res:
            if res[0]['nbinvoice'] == 1 and res[0]['id'] != invoice_id or res[0]['nbinvoice'] > 1:
                return json.dumps({'text': 'true', 'code': 200, 'ok': 'true'})
            else:
                return json.dumps({'text': 'false', 'code': 200, 'ok': 'true'})
        else:
            return json.dumps({'text': 'false', 'code': 200, 'ok': 'true'})


@bp.route('/ws/invoice/upload', methods=['POST'])
@login_required
def upload():
    if request.method == 'POST':
        for file in request.files:
            f = request.files[file]
            # The next 2 lines lower the extensions because an UPPER extension will throw silent error
            filename, file_ext = os.path.splitext(f.filename)
            file = filename.replace(' ', '_') + file_ext.lower()

            f.save(os.path.join(current_app.config['UPLOAD_FOLDER'], secure_filename(file)))

            worker_from_python.main({
                'file': os.path.join(current_app.config['UPLOAD_FOLDER'], secure_filename(file)),
                'config': current_app.config['CONFIG_FILE']
            })

        return redirect(url_for('pdf.upload'))


@bp.route('/ws/readConfig', methods=['GET'])
@token_required
def read_config():
    if request.method == 'GET':
        _vars = pdf.init()
        return json.dumps({'text': _vars[1].cfg, 'code': 200, 'ok': 'true'})


@bp.route('/ws/insee/getToken', methods=['POST'])
@login_required
def get_token_insee():
    data = request.get_json()
    try:
        res = requests.post(data['url'], data={'grant_type': 'client_credentials'}, headers={"Authorization": "Basic %s" % data['credentials']})
        if 'Maintenance - INSEE' in res.text:
            text = 'error'
        else:
            text = res.text
        return json.dumps({'text': text, 'code': 200, 'ok': 'true'})
    except requests.exceptions.RequestException as e:
        return json.dumps({'text': str(e), 'code': 500, 'ok': 'false'})


@bp.route('/ws/supplier/retrieve', methods=['GET'])
@login_required
def retrieve_supplier():
    _vars = pdf.init()
    _db = _vars[0]
    data = request.args
    res = _db.select({
        'select': ['*'],
        'table': ['suppliers'],
        'where': ["LOWER(name) LIKE ?"],
        'data': ['%' + data['query'].lower() + '%'],
        'limit': '10'
    })

    array_return = {}
    array_supplier = {}
    array_return['suggestions'] = []
    for supplier in res:
        array_supplier[supplier['name']] = []
        array_supplier[supplier['name']].append({
            'name': supplier['name'],
            'VAT': supplier['vat_number'],
            'siret': supplier['siret'],
            'siren': supplier['siren'],
            'adress1': supplier['adress1'],
            'adress2': supplier['adress2'],
            'zipCode': supplier['postal_code'],
            'city': supplier['city'],
        })

    for name in array_supplier:
        array_return['suggestions'].append({
            "value": name, "data": json.dumps(array_supplier[name])
        })

    return json.dumps(array_return)


@bp.route('/ws/database/updateStatus', methods=['POST'])
@login_required
def update_status():
    data = request.get_json()
    res = pdf.change_status(data['id'], data['status'])

    return json.dumps({'text': res[0], 'code': 200, 'ok': 'true'})


@bp.route('/ws/pdf/ocr', methods=['POST'])
@login_required
def ocr_on_fly():
    data = request.get_json()
    result = pdf.ocr_on_the_fly(data['fileName'], data['selection'], data['thumbSize'])

    return json.dumps({'text': result, 'code': 200, 'ok': 'true'})


@bp.route('/ws/changeLanguage/<string:lang>', methods=['GET'])
@token_required
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
@token_required
def get_all_lang():
    _vars = pdf.init()
    language = current_app.config['LANGUAGES']
    langs = []
    for lang in language:
        langs.append([language[lang]['lang_code'], language[lang]['label']])

    return {'langs': langs}, 200


@bp.route('/ws/deleteInvoice/<int:rowid>', methods=['GET'])
def delete_invoice(rowid):
    _vars = pdf.init()
    _db = _vars[0]
    _db.update({
        'table': ['invoices'],
        'set': {
            'status': 'DEL'
        },
        'where': ['id = ?'],
        'data': [rowid]
    })

    flash(gettext('INVOICE_DELETED'))
    return json.dumps({'text': 'OK', 'code': 200, 'ok': 'true'})
