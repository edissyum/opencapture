import os
import json
import shutil
import logging
import requests
from zeep import Client
from zeep import exceptions

import worker_splitter_from_python
import worker_from_python

from flask_babel import gettext
from .auth import login_required
from werkzeug.utils import secure_filename
from flask import current_app, Blueprint, flash, redirect, request, url_for, session, send_file

from .functions import get_custom_id, check_python_customized_files

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

if 'Spreadsheet' not in custom_array:
    from bin.src.classes.Spreadsheet import Spreadsheet as _Spreadsheet
else:
    _Spreadsheet = getattr(__import__(custom_array['Spreadsheet']['path'] + '.' + custom_array['Spreadsheet']['module'], fromlist=[custom_array['Spreadsheet']['module']]),
                           custom_array['Spreadsheet']['module'])

if 'Log' not in custom_array:
    from bin.src.classes.Log import Log as _Log
else:
    _Log = getattr(__import__(custom_array['Log']['path'] + '.' + custom_array['Log']['module'], fromlist=[custom_array['Log']['module']]), custom_array['Log']['module'])

bp = Blueprint('ws', __name__)


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
@login_required
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


@bp.route('/ws/supplier/add', methods=['POST'])
@login_required
def add_supplier():
    _vars = pdf.init()
    _db = _vars[0]
    _cfg = _vars[1]
    log = _Log(_cfg.cfg['GLOBAL']['logfile'])
    spreadsheet = _Spreadsheet(log, _cfg)
    data = request.get_json()

    add_data = {
        'name': data['name'],
        'vat_number': data['VAT'],
        'siret': data['SIRET'],
        'siren': data['SIREN'],
        'city': data['city'],
        'adress1': data['adress'],
        'postal_code': data['zip'],
        'company_type': data['companyType'],
    }
    args = {
        'table': 'suppliers',
        'columns': add_data,
    }
    res = _db.insert(args)

    if res:
        spreadsheet.update_supplier_ods_sheet(_db)
        if 'pdfId' in data:
            id_supplier = _db.select({
                'select': ['*'],
                'table': ['suppliers'],
                'where': ['status= ?'],
                'data': ['ACTIVE'],
                'order_by': ['id DESC'],
                'limit': '1'
            })[0]['id']

            args = {
                'table': ['invoices'],
                'set': {
                    'id_supplier': id_supplier,
                },
                'where': ['id = ?'],
                'data': [data['pdfId']],
            }
            res = _db.update(args)
        flash(gettext('SUPPLIER_ADDED'))
    else:
        return json.dumps({'code': 500, 'ok': 'false'})

    return json.dumps({'code': 200, 'ok': 'true'})


@bp.route('/ws/supplier/edit', methods=['POST'])
@login_required
def edit_supplier():
    _vars = pdf.init()
    _db = _vars[0]
    _cfg = _vars[1]
    log = _Log(_cfg.cfg['GLOBAL']['logfile'])
    spreadsheet = _Spreadsheet(log, _cfg)
    data = request.get_json()

    update_data = {
        'name': data['name'],
        'vat_number': data['VAT'],
        'siret': data['SIRET'],
        'siren': data['SIREN'],
        'city': data['city'],
        'adress1': data['adress'],
        'postal_code': data['zip'],
    }

    if data['companyType'] != '':
        update_data['company_type'] = data['companyType']

    args = {
        'table': ['suppliers'],
        'set': update_data,
        'where': ['id = ?'],
        'data': [data['supplierId']],
    }
    res = _db.update(args)

    if res:
        spreadsheet.update_supplier_ods_sheet(_db)
        if 'pdfId' in data:
            args = {
                'table': ['invoices'],
                'set': {
                    'id_supplier': data['supplierId'],
                },
                'where': ['id = ?'],
                'data': [data['pdfId']],
            }
            res = _db.update(args)
        flash(gettext('SUPPLIER_EDITED'))

    else:
        return json.dumps({'code': 500, 'ok': 'false'})

    return json.dumps({'code': 200, 'ok': 'true'})


@bp.route('/ws/supplier/delete/<string:supplier_id>', methods=['GET'])
@login_required
def delete_supplier(supplier_id):
    _vars = pdf.init()
    _db = _vars[0]
    _cfg = _vars[1]
    log = _Log(_cfg.cfg['GLOBAL']['logfile'])
    spreadsheet = _Spreadsheet(log, _cfg)
    res = _db.update({
        'table': ['suppliers'],
        'set': {
            'status': 'DEL'
        },
        'where': ['id = ?'],
        'data': [supplier_id]
    })

    if res:
        spreadsheet.update_supplier_ods_sheet(_db)
        flash(gettext('SUPPLIER_DELETED'))
        return json.dumps({'text': 'OK', 'code': 200, 'ok': 'true'})

    return res


@bp.route('/ws/supplier/getReferenceFile', methods=['GET'])
@login_required
def get_reference_file():
    _vars = pdf.init()
    _cfg = _vars[1]
    file_path = _cfg.cfg['REFERENCIAL']['referencialsupplierdocumentpath']
    print(file_path)
    return send_file(file_path, as_attachment=True, cache_timeout=0)

@bp.route('/ws/supplier/retrieve', methods=['GET'])
@login_required
def retrieve_supplier():
    _vars = pdf.init()
    _db = _vars[0]
    data = request.args

    supplier_id = data.get('id')
    if supplier_id is not None:
        query_where = 'id= ?'
        query_data = supplier_id
        result_name = 'suppliers'
    else:
        query_where = 'LOWER(name) LIKE ?'
        query_data = '%' + data['query'].lower() + '%'
        result_name = 'suggestions'

    res = _db.select({
        'select': ['*'],
        'table': ['suppliers'],
        'where': ['status= ?', query_where],
        'data': ['ACTIVE', query_data],
        'limit': '10'
    })

    array_return = {}
    array_supplier = {}
    array_return[result_name] = []
    for supplier in res:
        array_supplier[supplier['name']] = []
        array_supplier[supplier['name']].append({
            'supplier_id': supplier['id'],
            'name': supplier['name'],
            'VAT': supplier['vat_number'],
            'siret': supplier['siret'],
            'siren': supplier['siren'],
            'adress1': supplier['adress1'],
            'adress2': supplier['adress2'],
            'zipCode': supplier['postal_code'],
            'city': supplier['city'],
            'companyType': supplier['company_type'],
        })

    for name in array_supplier:
        array_return[result_name].append({
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
def change_language(lang):
    session['lang'] = lang
    dashboard.change_locale_in_config(lang)
    return json.dumps({'text': 'OK', 'code': 200, 'ok': 'true'})


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


@bp.route('/ws/splitter/submit', methods=('GET', 'POST'))
def submit_split():
    _vars = pdf.init()
    _db = _vars[0]
    _cfg = _vars[1]
    _Splitter = _vars[7]
    data = request.get_json()

    # Get origin file name from database to split files us it as a reference
    batch = _db.select({
        'select': ['*'],
        'table': ['splitter_batches'],
        'where': ['image_folder_name = ?'],
        'data': [str(data['ids'][0][0]).split("/")[0]]
    })[0]

    # merging invoices pages by or creation_date
    _Splitter.get_page_order_after_user_change(data['ids'],
                                               str(batch['dir_name']),
                                               _cfg.cfg['SPLITTER']['pdfoutputpath'])

    # delete batch after validate
    args = {
        'table': ['splitter_batches'],
        'set': {'status': 'DEL'},
        'where': ["image_folder_name=?"],
        'data': [batch['image_folder_name']]
    }
    _db.update(args)
    args = {
        'table': ['splitter_images'],
        'set': {'status': 'DEL'},
        'where': ["batch_name=?"],
        'data': [batch['image_folder_name']]
    }
    _db.update(args)

    shutil.rmtree(_cfg.cfg['SPLITTER']['tmpbatchpath'] + batch['image_folder_name'])

    return json.dumps({'text': 'res', 'code': 200, 'ok': 'true'})


@bp.route('/ws/splitter/upload', methods=['GET', 'POST'])
def upload_file():
    _vars = pdf.init()
    _db = _vars[0]
    _cfg = _vars[1]
    _Files = _vars[5]
    _Splitter = _vars[7]
    if request.method == 'POST':
        for file in request.files:
            f = request.files[file]
            # The next 2 lines lower the extensions because an UPPER extension will throw silent error
            filename, file_ext = os.path.splitext(f.filename)
            file = filename.replace(' ', '_') + file_ext.lower()
            f.save(os.path.join(_cfg.cfg['SPLITTER']['pdforiginpath'], secure_filename(file)))

            worker_splitter_from_python.main({
                'file': _cfg.cfg['SPLITTER']['pdforiginpath'] + file,
                'config': current_app.config['CONFIG_FILE']
            })
    flash(gettext('FILE_UPLOAD_SUCCESS'))
    return url_for('pdf.upload', splitter='True')


@bp.route('/ws/splitter/delete', methods=('GET', 'POST'))
@login_required
def delete_batch():
    _vars = pdf.init()
    _db = _vars[0]
    _cfg = _vars[1].cfg
    batch_dir_name = request.args.get('batch_name')
    args = {
        'table': ['splitter_batches'],
        'set': {'status': 'DEL'},
        'where': ["image_folder_name=?"],
        'data': [str(batch_dir_name)]
    }
    _db.update(args)
    return redirect(url_for('splitter.splitter_list'))