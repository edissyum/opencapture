# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import os
import json
import zeep
import base64
import logging
import requests
from PIL import Image
from flask_babel import gettext
from zeep import Client, exceptions
from src.backend import verifier_exports
from src.backend.import_classes import _Files
from src.backend.import_controllers import user
from flask import current_app, Response, request
from src.backend.import_models import verifier, accounts
from src.backend.main import launch, create_classes_from_custom_id
from src.backend.functions import retrieve_custom_from_url, delete_documents


def handle_uploaded_file(files, input_id):
    path = current_app.config['UPLOAD_FOLDER']
    custom_id = retrieve_custom_from_url(request)

    for file in files:
        _f = files[file]
        filename = _Files.save_uploaded_file(_f, path)
        launch({
            'file': filename,
            'custom_id': custom_id,
            'input_id': input_id
        })
    return True


def get_invoice_by_id(invoice_id):
    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if error is None:
        return invoice_info, 200
    else:
        response = {
            "errors": gettext('GET_INVOICE_BY_ID_ERROR'),
            "message": error
        }
        return response, 401


def retrieve_invoices(args):
    if 'where' not in args:
        args['where'] = []
    if 'data' not in args:
        args['data'] = []
    if 'select' not in args:
        args['select'] = []

    args['table'] = ['invoices', 'form_models']
    args['left_join'] = ['invoices.form_id = form_models.id']
    args['group_by'] = ['invoices.id', 'invoices.form_id', 'form_models.id']

    args['select'].append("DISTINCT(invoices.id) as invoice_id")
    args['select'].append("to_char(register_date, 'DD-MM-YYY " + gettext('AT') + " HH24:MI:SS') as date")
    args['select'].append('form_models.label as form_label')
    args['select'].append("*")

    if 'time' in args:
        if args['time'] in ['today', 'yesterday']:
            args['where'].append(
                "to_char(register_date, 'YYYY-MM-DD') = to_char(TIMESTAMP '" + args['time'] + "', 'YYYY-MM-DD')")
        else:
            args['where'].append("to_char(register_date, 'YYYY-MM-DD') < to_char(TIMESTAMP 'yesterday', 'YYYY-MM-DD')")

    if 'status' in args:
        args['where'].append('invoices.status = %s')
        args['data'].append(args['status'])

    if 'form_id' in args and args['form_id']:
        if args['form_id'] == 'no_form':
            args['where'].append('invoices.form_id is NULL')
        else:
            args['where'].append('invoices.form_id = %s')
            args['data'].append(args['form_id'])

    if 'search' in args and args['search']:
        args['table'].append('accounts_supplier')
        args['left_join'].append('invoices.supplier_id = accounts_supplier.id')
        args['group_by'].append('accounts_supplier.id')
        args['where'].append(
            "(LOWER(original_filename) LIKE '%%" + args['search'].lower() +
            "%%' OR LOWER((datas -> 'invoice_number')::text) LIKE '%%" + args['search'].lower() +
            "%%' OR LOWER(accounts_supplier.name) LIKE '%%" + args['search'].lower() + "%%')"
        )
        args['offset'] = ''
        args['limit'] = ''

    if 'allowedCustomers' in args and args['allowedCustomers']:
        args['where'].append('customer_id IN (' + ','.join(map(str, args['allowedCustomers'])) + ')')

    if 'allowedSuppliers' in args and args['allowedSuppliers']:
        if not args['allowedSuppliers'][0]:
            args['where'].append('supplier_id is NULL')
        else:
            args['where'].append('supplier_id IN (' + ','.join(map(str, args['allowedSuppliers'])) + ')')

    if 'purchaseOrSale' in args and args['purchaseOrSale']:
        args['where'].append('purchase_or_sale = %s')
        args['data'].append(args['purchaseOrSale'])

    total_invoices = verifier.get_total_invoices({
        'select': ['count(invoices.id) as total'],
        'where': args['where'],
        'data': args['data'],
        'table': args['table'],
        'left_join': args['left_join'],
    })
    if total_invoices not in [0, []]:
        invoices_list = verifier.get_invoices(args)
        for invoice in invoices_list:
            thumb = get_file_content('full', invoice['full_jpg_filename'], 'image/jpeg',
                                     compress=True)
            invoice['thumb'] = str(base64.b64encode(thumb.get_data()).decode('UTF-8'))
            if invoice['supplier_id']:
                supplier_info, error = accounts.get_supplier_by_id({'supplier_id': invoice['supplier_id']})
                if not error:
                    invoice['supplier_name'] = supplier_info['name']
        response = {
            "total": total_invoices[0]['total'],
            "invoices": invoices_list
        }
        return response, 200
    return '', 200


def update_position_by_invoice_id(invoice_id, args):
    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if error is None:
        column = position = ''
        for _position in args:
            column = _position
            position = args[_position]

        invoice_positions = invoice_info['positions']
        invoice_positions.update({
            column: position
        })
        _, error = verifier.update_invoice({
            'set': {"positions": json.dumps(invoice_positions)},
            'invoice_id': invoice_id
        })
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_INVOICE_POSITIONS_ERROR'),
                "message": error
            }
            return response, 401


def update_page_by_invoice_id(invoice_id, args):
    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if error is None:
        column = page = ''
        for _page in args:
            column = _page
            page = args[_page]

        invoice_pages = invoice_info['pages']
        invoice_pages.update({
            column: page
        })
        _, error = verifier.update_invoice({'set': {"pages": json.dumps(invoice_pages)}, 'invoice_id': invoice_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_INVOICE_PAGES_ERROR'),
                "message": error
            }
            return response, 401


def update_invoice_data_by_invoice_id(invoice_id, args):
    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if error is None:
        _set = {}
        invoice_data = invoice_info['datas']
        for _data in args:
            column = _data
            value = args[_data]
            invoice_data.update({
                column: value
            })
        _, error = verifier.update_invoice({'set': {"datas": json.dumps(invoice_data)}, 'invoice_id': invoice_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_INVOICE_DATA_ERROR'),
                "message": error
            }
            return response, 401


def delete_invoice_data_by_invoice_id(invoice_id, field_id):
    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if error is None:
        _set = {}
        invoice_data = invoice_info['datas']
        if field_id in invoice_data:
            del invoice_data[field_id]
        _, error = verifier.update_invoice({'set': {"datas": json.dumps(invoice_data)}, 'invoice_id': invoice_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_INVOICE_DATA_ERROR'),
                "message": error
            }
            return response, 401


def delete_documents_by_invoice_id(invoice_id):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    docservers = _vars[9]

    invoice, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if not error:
        delete_documents(docservers, invoice['path'], invoice['filename'], invoice['full_jpg_filename'])

    _, error = verifier.update_invoice({
        'set': {"status": 'DEL'},
        'invoice_id': invoice_id
    })
    return '', 200


def delete_invoice_position_by_invoice_id(invoice_id, field_id):
    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if error is None:
        _set = {}
        invoice_positions = invoice_info['positions']
        if field_id in invoice_positions:
            del invoice_positions[field_id]
        _, error = verifier.update_invoice(
            {'set': {"positions": json.dumps(invoice_positions)}, 'invoice_id': invoice_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_INVOICE_POSITIONS_ERROR'),
                "message": error
            }
            return response, 401


def delete_invoice_page_by_invoice_id(invoice_id, field_id):
    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if error is None:
        _set = {}
        invoice_pages = invoice_info['pages']
        if field_id in invoice_pages:
            del invoice_pages[field_id]
        _, error = verifier.update_invoice({'set': {"pages": json.dumps(invoice_pages)}, 'invoice_id': invoice_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_INVOICE_PAGES_ERROR'),
                "message": error
            }
            return response, 401


def delete_invoice(invoice_id):
    _, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if error is None:
        _, error = verifier.update_invoice({'set': {'status': 'DEL'}, 'invoice_id': invoice_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_INVOICE_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DELETE_INVOICE_ERROR'),
            "message": error
        }
        return response, 401


def update_invoice(invoice_id, data):
    _, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if error is None:
        _, error = verifier.update_invoice({'set': data, 'invoice_id': invoice_id})

        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_INVOICE_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('UPDATE_INVOICE_ERROR'),
            "message": error
        }
        return response, 401


def remove_lock_by_user_id(user_id):
    _, error = verifier.update_invoices({
        'set': {"locked": False},
        'where': ['locked_by = %s'],
        'data': [user_id]
    })

    if error is None:
        return '', 200
    else:
        response = {
            "errors": gettext('REMOVE_LOCK_BY_USER_ID_ERROR'),
            "message": error
        }
        return response, 401


def export_maarch(invoice_id, data):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if not error:
        return verifier_exports.export_maarch(data, invoice_info, _vars[5], _vars[1], _vars[2], _vars[0])


def export_xml(invoice_id, data):
    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if not error:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        _regex = _vars[2]
        return verifier_exports.export_xml(data, None, _regex, invoice_info)


def ocr_on_the_fly(file_name, selection, thumb_size, positions_masks):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _files = _vars[3]
    _ocr = _vars[4]
    docservers = _vars[9]

    path = docservers['VERIFIER_IMAGE_FULL'] + '/' + file_name

    if positions_masks:
        path = docservers['VERIFIER_POSITIONS_MASKS'] + '/' + file_name

    text = _files.ocr_on_fly(path, selection, _ocr, thumb_size)
    if text:
        return text
    else:
        _files.improve_image_detection(path)
        text = _files.ocr_on_fly(path, selection, _ocr, thumb_size)
        return text


def get_file_content(file_type, filename, mime_type, compress=False):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    docservers = _vars[9]
    content = False
    path = ''

    if file_type == 'full':
        path = docservers['VERIFIER_IMAGE_FULL']
    elif file_type == 'positions_masks':
        path = docservers['VERIFIER_POSITIONS_MASKS']
    elif file_type == 'referential_supplier':
        path = docservers['REFERENTIALS_PATH']

    if path and filename:
        full_path = path + '/' + filename
        if os.path.isfile(full_path):
            if compress and mime_type == 'image/jpeg':
                thumb_path = docservers['VERIFIER_THUMB'] + '/' + filename
                if not os.path.isfile(thumb_path):
                    image = Image.open(full_path)
                    image.thumbnail((1920, 1080))
                    image.save(thumb_path, optimize=True, quality=50)
                with open(thumb_path, 'rb') as file:
                    content = file.read()
            else:
                with open(full_path, 'rb') as file:
                    content = file.read()

    if not content:
        if mime_type == 'image/jpeg':
            with open(docservers['PROJECT_PATH'] + '/dist/assets/not_found/document_not_found.jpg', 'rb') as file:
                content = file.read()
        else:
            with open(docservers['PROJECT_PATH'] + '/dist/assets/not_found/document_not_found.pdf', 'rb') as file:
                content = file.read()
    return Response(content, mimetype=mime_type)


def get_token_insee():
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _cfg = _vars[1]
    credentials = base64.b64encode(
        (_cfg.cfg['API']['siret-consumer'] + ':' + _cfg.cfg['API']['siret-secret']).encode('UTF-8')).decode('UTF-8')

    try:
        res = requests.post(_cfg.cfg['API']['siret-url-token'],
                            data={'grant_type': 'client_credentials'},
                            headers={"Authorization": f"Basic {credentials}"})
    except requests.exceptions.SSLError:
        return 'ERROR : ' + gettext('API_INSEE_ERROR_CONNEXION'), 201

    if 'Maintenance - INSEE' in res.text or res.status_code != 200:
        return 'ERROR : ' + gettext('API_INSEE_ERROR_CONNEXION'), 201
    else:
        return json.loads(res.text)['access_token'], 200


def verify_siren(token, siren):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _cfg = _vars[1]

    try:
        res = requests.get(_cfg.cfg['API']['siren-url'] + siren,
                           headers={"Authorization": f"Bearer {token}", "Accept": "application/json"})
    except (requests.exceptions.SSLError, requests.exceptions.ConnectionError):
        return 'ERROR : ' + gettext('API_INSEE_ERROR_CONNEXION'), 201

    _return = json.loads(res.text)
    if 'header' not in res.text:
        return _return['fault']['message'], 201
    else:
        return _return['header']['message'], 200


def verify_siret(token, siret):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _cfg = _vars[1]
    _log = _vars[5]

    try:
        res = requests.get(_cfg.cfg['API']['siret-url'] + siret,
                           headers={"Authorization": f"Bearer {token}", "Accept": "application/json"})
    except (requests.exceptions.SSLError, requests.exceptions.ConnectionError) as _e:
        _log.error(gettext('API_INSEE_ERROR_CONNEXION') + ' : ' + str(_e))
        return 'ERROR : ' + gettext('API_INSEE_ERROR_CONNEXION'), 201

    _return = json.loads(res.text)
    if 'header' not in res.text:
        return _return['fault']['message'], 201
    else:
        return _return['header']['message'], 200


def verify_vat_number(vat_number):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _cfg = _vars[1]
    _log = _vars[5]
    url = _cfg.cfg['API']['tva-url']
    country_code = vat_number[:2]
    vat_number = vat_number[2:]

    logging.getLogger('zeep').setLevel(logging.ERROR)
    try:
        client = Client(url)
        res = client.service.checkVat(country_code, vat_number)
        text = res['valid']
        if res['valid'] is False:
            text = gettext('VAT_NOT_VALID')
            return text, 400
        return text, 200
    except (exceptions.Fault, requests.exceptions.SSLError, requests.exceptions.ConnectionError,
            zeep.exceptions.XMLSyntaxError) as _e:
        _log.error(gettext('VAT_API_ERROR') + ' : ' + str(_e))
        return gettext('VAT_API_ERROR'), 201


def get_totals(status, user_id, form_id):
    totals = {}
    allowed_customers, _ = user.get_customers_by_user_id(user_id)
    allowed_customers.append(0)  # Update allowed customers to add Unspecified customers

    totals['today'], error = verifier.get_totals({
        'time': 'today', 'status': status, 'form_id': form_id, 'allowedCustomers': allowed_customers
    })
    totals['yesterday'], error = verifier.get_totals({
        'time': 'yesterday', 'status': status, 'form_id': form_id, 'allowedCustomers': allowed_customers
    })
    totals['older'], error = verifier.get_totals({
        'time': 'older', 'status': status, 'form_id': form_id, 'allowedCustomers': allowed_customers
    })

    if error is None:
        return totals, 200
    else:
        response = {
            "errors": gettext('GET_TOTALS_ERROR'),
            "message": error
        }
        return response, 401
