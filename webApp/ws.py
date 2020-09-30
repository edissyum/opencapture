import logging
import os
import json
import requests
from zeep import Client
from zeep import exceptions
import worker_from_python

from flask_babel import gettext
from .auth import login_required
from werkzeug.utils import secure_filename
from flask import current_app, Blueprint, flash, redirect, request, url_for, session

from .functions import get_custom_id, check_python_customized_files
custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'pdf' not in custom_array: from . import pdf
else: pdf = getattr(__import__(custom_array['pdf']['path'], fromlist=[custom_array['pdf']['module']]), custom_array['pdf']['module'])

if 'dashboard' not in custom_array: from . import dashboard
else: dashboard = getattr(__import__(custom_array['dashboard']['path'], fromlist=[custom_array['dashboard']['module']]), custom_array['dashboard']['module'])


bp = Blueprint('ws', __name__)

@bp.route('/ws/VAT/<string:vatId>',  methods=['GET'])
@login_required
def checkVAT(vatId):
    _vars   = pdf.init()
    _cfg    = _vars[1].cfg
    URL     = _cfg['GENERAL']['tva-url']

    countryCode = vatId[:2]
    vatNumber = vatId[2:]

    try:
        logging.getLogger('zeep').setLevel(logging.ERROR)
        client = Client(URL)
        print(client)

        try:
            res = client.service.checkVat(countryCode, vatNumber)
            text = res['valid']
            if res['valid'] is False:
                text = gettext('VAT_NOT_VALID')
        except exceptions.Fault:
            text = gettext('VAT_API_ERROR')

        return json.dumps({'text': text, 'code': 200, 'ok': res['valid']})
    except requests.exceptions.RequestException as e:
        return json.dumps({'text': str(e), 'code': 200, 'ok' : 'false'})

@bp.route('/ws/cfg/<string:cfgName>',  methods=['GET'])
@login_required
def modifyProfile(cfgName):
    if dashboard.modify_profile(cfgName):
        flash(gettext('PROFILE_UPDATED'))
        return json.dumps({'text': 'OK', 'code': 200, 'ok' : 'true'})
    else:
        flash(gettext('PROFILE_UPDATE_ERROR'))
        return json.dumps({'text': gettext('PROFILE_UPDATE_ERROR'), 'code': 500, 'ok' : 'false'})

@bp.route('/ws/cfg/update/', methods=['POST'])
@login_required
def updateConfig():
    if dashboard.modify_config(request.form):
        flash(gettext('CONFIG_FILE_UPDATED'))
    else:
        flash(gettext('ERROR_UPDATE_CONFIG_FILE'))
    return redirect('/dashboard')

@bp.route('/ws/invoice/isDuplicate',  methods=['POST'])
@login_required
def isDuplicate():
    if request.method == 'POST':
        data            = request.get_json()
        invoiceNumber   = data['invoice_number']
        vatNumber       = data['vat_number']
        invoiceId       = data['id']

        _vars   = pdf.init()
        _db     = _vars[0]
        _cfg    = _vars[1].cfg

        # Check if there is already an invoice with the same vat_number and invoice number. If so, verify the rowid to avoid detection of the facture currently processing
        res = _db.select({
            'select'    : ['id, count(*) as nbInvoice'],
            'table'     : ['invoices'],
            'where'     : ['vat_number = ?', 'invoice_number = ?', 'processed = ?'],
            'data'      : [vatNumber, invoiceNumber, 1],
            'group_by'  : 'id'
        })

        if res:
            if res[0]['nbinvoice'] == 1 and res[0]['id'] != invoiceId or res[0]['nbinvoice'] > 1:
                return json.dumps({'text' : 'true', 'code' : 200, 'ok' : 'true'})
            else:
                return json.dumps({'text' : 'false', 'code' : 200, 'ok' : 'true'})
        else:
            return json.dumps({'text': 'false', 'code': 200, 'ok': 'true'})


@bp.route('/ws/invoice/upload', methods=['POST'])
@login_required
def upload():
    if request.method == 'POST':
        for file in request.files:
            f                   = request.files[file]
            # The next 2 lines lower the extensions because an UPPER extension will throw silent error
            filename, file_ext  = os.path.splitext(f.filename)
            file                = filename.replace(' ', '_') + file_ext.lower()

            f.save(os.path.join(current_app.config['UPLOAD_FOLDER'], secure_filename(file)))

            worker_from_python.main({
                'file'  : os.path.join(current_app.config['UPLOAD_FOLDER'], secure_filename(file)),
                'config': current_app.config['CONFIG_FILE']
            })

        return redirect(url_for('pdf.upload'))

@bp.route('/ws/readConfig', methods=['GET'])
@login_required
def readConfig():
    if request.method == 'GET':
        _vars = pdf.init()
        return json.dumps({'text' : _vars[1].cfg, 'code' : 200, 'ok' : 'true'})

@bp.route('/ws/insee/getToken', methods=['POST'])
@login_required
def getTokenINSEE():
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
def retrieveSupplier():
    _vars = pdf.init()
    _db = _vars[0]
    data = request.args
    res = _db.select({
        'select': ['*'],
        'table': ['suppliers'],
        'where': ["name ILIKE ?"],
        'data': ['%' + data['query'] + '%'],
        'limit': '10'
    })

    arrayReturn     = {}
    arraySupplier   = {}
    arrayReturn['suggestions'] = []
    for supplier in res:
        arraySupplier[supplier['name']] = []
        arraySupplier[supplier['name']].append({
            'name'      : supplier['name'],
            'VAT'       : supplier['vat_number'],
            'siret'     : supplier['siret'],
            'siren'     : supplier['siren'],
            'adress1'   : supplier['adress1'],
            'adress2'   : supplier['adress2'],
            'zipCode'   : supplier['postal_code'],
            'city'      : supplier['city'],
        })

    for name in arraySupplier:
        arrayReturn['suggestions'].append({
            "value" : name, "data": json.dumps(arraySupplier[name])
        })

    return json.dumps(arrayReturn)

@bp.route('/ws/database/updateStatus', methods=['POST'])
@login_required
def updateStatus():
    data    = request.get_json()
    res     = pdf.change_status(data['id'], data['status'])

    return json.dumps({'text': res[0], 'code': 200, 'ok': 'true'})

@bp.route('/ws/pdf/ocr', methods=['POST'])
@login_required
def ocrOnFly():
    data    = request.get_json()
    result  = pdf.ocr_on_the_fly(data['fileName'], data['selection'], data['thumbSize'])

    return json.dumps({'text': result, 'code': 200, 'ok': 'true'})

@bp.route('/ws/changeLanguage/<string:lang>', methods=['GET'])
def changeLanguage(lang):
    session['lang'] = lang
    dashboard.change_locale_in_config(lang)
    return json.dumps({'text': 'OK', 'code': 200, 'ok': 'true'})

@bp.route('/ws/deleteInvoice/<int:rowid>', methods=['GET'])
def deleteInvoice(rowid):
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
