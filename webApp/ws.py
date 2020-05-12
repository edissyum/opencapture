from flask_babel import gettext
from werkzeug.utils import secure_filename
from flask import current_app, Blueprint, flash, redirect, request, url_for, session

import os
import json
import requests
from zeep import Client
from .pdf import init, retrieve_supplier, change_status, ocr_on_the_fly

import worker_from_python
from webApp.auth import login_required
from .dashboard import modify_profile, modify_config, change_locale_in_config

bp = Blueprint('ws', __name__)

@bp.route('/ws/VAT/<string:vatId>',  methods=['GET'])
@login_required
def checkVAT(vatId):
    _vars   = init()
    _cfg    = _vars[1].cfg
    URL     = _cfg['GENERAL']['tva-url']


    countryCode = vatId[:2]
    vatNumber = vatId[2:]

    try:
        client = Client(URL)
        res = client.service.checkVat(countryCode, vatNumber)
        text = res['valid']
        if res['valid'] is False:
            text = gettext('VAT_NOT_VALID')

        return json.dumps({'text': text, 'code': 200, 'ok': res['valid']})
    except requests.exceptions.RequestException as e:
        return json.dumps({'text': str(e), 'code': 200, 'ok' : 'false'})


@bp.route('/ws/cfg/<string:cfgName>',  methods=['GET'])
@login_required
def modifyProfile(cfgName):
    if modify_profile(cfgName):
        flash(gettext('PROFILE_UPDATED'))
        return json.dumps({'text': 'OK', 'code': 200, 'ok' : 'true'})
    else:
        flash(gettext('PROFILE_UPDATE_ERROR'))
        return json.dumps({'text': gettext('PROFILE_UPDATE_ERROR'), 'code': 500, 'ok' : 'false'})

@bp.route('/ws/cfg/update/', methods=['POST'])
@login_required
def updateConfig():
    if modify_config(request.form):
        flash(gettext('CONFIG_FILE_UPDATED'))
    else:
        flash(gettext('ERROR_UPDATE_CONFIG_FILE'))
    return redirect('/dashboard')

@bp.route('/ws/invoice/isDuplicate',  methods=['POST'])
@login_required
def isDuplicate():
    if request.method == 'POST':
        data            = request.get_json()
        invoiceNumber   = data['invoiceNumber']
        vatNumber       = data['vatNumber']
        invoiceId       = data['id']

        _vars   = init()
        _db     = _vars[0]
        _cfg    = _vars[1].cfg

        # Check if there is already an invoice with the same vat_number and invoice number. If so, verify the rowid to avoid detection of the facture currently processing
        res = _db.select({
            'select'    : ['rowid, count(*) as nbInvoice'],
            'table'     : ['invoices'],
            'where'     : ['vatNumber = ?', 'invoiceNumber = ?', 'processed = ?'],
            'data'      : [vatNumber, invoiceNumber, 1]
        })[0]

        if res['nbInvoice'] == 1 and res['rowid'] != invoiceId or res['nbInvoice'] > 1   :
            return json.dumps({'text' : 'true', 'code' : 200, 'ok' : 'true'})
        else:
            return json.dumps({'text' : 'false', 'code' : 200, 'ok' : 'true'})


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
                'path'  : current_app.config['UPLOAD_FOLDER'],
                'config': current_app.config['CONFIG_FILE']
            })

        return redirect(url_for('pdf.upload'))

@bp.route('/ws/readConfig', methods=['GET'])
@login_required
def readConfig():
    if request.method == 'GET':
        _vars = init()
        return json.dumps({'text' : _vars[1].cfg, 'code' : 200, 'ok' : 'true'})

@bp.route('/ws/insee/getToken', methods=['POST'])
@login_required
def getTokenINSEE():
    data = request.get_json()
    try:
        res = requests.post(data['url'], data={'grant_type': 'client_credentials'}, headers={"Authorization": "Basic %s" % data['credentials']})
        return json.dumps({'text': res.text, 'code': 200, 'ok': 'true'})
    except requests.exceptions.RequestException as e:
        return json.dumps({'text': str(e), 'code': 500, 'ok': 'false'})


@bp.route('/ws/supplier/retrieve', methods=['GET'])
@login_required
def retrieveSupplier():
    data = request.args
    res = retrieve_supplier(data['query'])
    arrayReturn     = {}
    arraySupplier   = {}
    arrayReturn['suggestions'] = []
    for supplier in res:
        arraySupplier[supplier['name']] = []
        arraySupplier[supplier['name']].append({
            'name'      : supplier['name'],
            'VAT'       : supplier['vatNumber'],
            'SIRET'     : supplier['SIRET'],
            'SIREN'     : supplier['SIREN'],
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
    res     = change_status(data['id'], data['status'])

    return json.dumps({'text': res[0], 'code': 200, 'ok': 'true'})

@bp.route('/ws/pdf/ocr', methods=['POST'])
@login_required
def ocrOnFly():
    data    = request.get_json()
    result  = ocr_on_the_fly(data['fileName'], data['selection'], data['thumbSize'])

    return json.dumps({'text': result, 'code': 200, 'ok': 'true'})

@bp.route('/ws/changeLanguage/<string:lang>', methods=['GET'])
@login_required
def changeLanguage(lang):
    session['lang'] = lang
    change_locale_in_config(lang)
    return json.dumps({'text': 'OK', 'code': 200, 'ok': 'true'})