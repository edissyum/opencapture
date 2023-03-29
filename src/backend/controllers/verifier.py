# This file is part of Open-Capture.

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import os
import json
import zeep
import base64
import logging
import requests
from flask_babel import gettext
from zeep import Client, exceptions
from src.backend import verifier_exports
from src.backend.import_classes import _Files
from src.backend.import_controllers import user
from src.backend.import_models import verifier, accounts
from src.backend.main import launch, create_classes_from_custom_id
from flask import current_app, Response, request, g as current_context
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
            "message": gettext(error)
        }
        return response, 400


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
    args['select'].append("to_char(register_date, 'DD-MM-YYYY " + gettext('AT') + " HH24:MI:SS') as date")
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
            year = invoice['register_date'].strftime('%Y')
            month = invoice['register_date'].strftime('%m')
            year_and_month = year + '/' + month
            thumb = get_file_content('full', invoice['full_jpg_filename'], 'image/jpeg',
                                     compress=True, year_and_month=year_and_month)
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
                "message": gettext(error)
            }
            return response, 400


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
                "message": gettext(error)
            }
            return response, 400


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
                "message": gettext(error)
            }
            return response, 400


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
                "message": gettext(error)
            }
            return response, 400


def delete_documents_by_invoice_id(invoice_id):
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
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
                "message": gettext(error)
            }
            return response, 400


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
                "message": gettext(error)
            }
            return response, 400


def delete_invoice(invoice_id):
    _, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if error is None:
        _, error = verifier.update_invoice({'set': {'status': 'DEL'}, 'invoice_id': invoice_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_INVOICE_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DELETE_INVOICE_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def update_invoice(invoice_id, data):
    _, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if error is None:
        _, error = verifier.update_invoice({'set': data, 'invoice_id': invoice_id})

        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_INVOICE_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('UPDATE_INVOICE_ERROR'),
            "message": gettext(error)
        }
        return response, 400


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
            "message": gettext(error)
        }
        return response, 400


def export_mem(invoice_id, data):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if not error:
        return verifier_exports.export_mem(data['data'], invoice_info, _vars[5], _vars[2], _vars[0])


def export_xml(invoice_id, data):
    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if not error:
        if 'regex' in current_context and 'database' in current_context:
            regex = current_context.regex
            database = current_context.database
        else:
            custom_id = retrieve_custom_from_url(request)
            _vars = create_classes_from_custom_id(custom_id)
            database = _vars[0]
            regex = _vars[2]
        return verifier_exports.export_xml(data['data'], None, regex, invoice_info, database)


def export_pdf(invoice_id, data):
    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if not error:
        if 'configurations' in current_context and 'log' in current_context and 'regex' in current_context:
            log = current_context.log
            regex = current_context.regex
            configurations = current_context.configurations
        else:
            custom_id = retrieve_custom_from_url(request)
            _vars = create_classes_from_custom_id(custom_id)
            log = _vars[5]
            regex = _vars[2]
            configurations = _vars[10]
        return verifier_exports.export_pdf(data['data'], log, regex, invoice_info, configurations['locale'],
                                           data['compress_type'], data['ocrise'])


def export_facturx(invoice_id, data):
    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if not error:
        if 'configurations' in current_context and 'log' in current_context and 'regex' in current_context:
            log = current_context.log
            regex = current_context.regex
            configurations = current_context.configurations
        else:
            custom_id = retrieve_custom_from_url(request)
            _vars = create_classes_from_custom_id(custom_id)
            log = _vars[5]
            regex = _vars[2]
            configurations = _vars[10]
        return verifier_exports.export_facturx(data['data'], log, regex, invoice_info, configurations['locale'],
                                           data['compress_type'], data['ocrise'])


def ocr_on_the_fly(file_name, selection, thumb_size, positions_masks, lang):
    if 'files' in current_context and 'ocr' in current_context and 'docservers' in current_context:
        files = current_context.files
        ocr = current_context.ocr
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        files = _vars[3]
        ocr = _vars[4]
        docservers = _vars[9]

    path = docservers['VERIFIER_IMAGE_FULL'] + '/' + file_name

    if positions_masks:
        path = docservers['VERIFIER_POSITIONS_MASKS'] + '/' + file_name

    text = files.ocr_on_fly(path, selection, ocr, thumb_size, lang=lang)
    if text:
        return text
    else:
        files.improve_image_detection(path)
        text = files.ocr_on_fly(path, selection, ocr, thumb_size, lang=lang)
        return text


def get_file_content(file_type, filename, mime_type, compress=False, year_and_month=False):
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]

    content = False
    path = ''

    if file_type == 'full':
        path = docservers['VERIFIER_IMAGE_FULL']
        if year_and_month:
            path = path + '/' + year_and_month + '/'
    elif file_type == 'positions_masks':
        path = docservers['VERIFIER_POSITIONS_MASKS']
    elif file_type == 'referential_supplier':
        path = docservers['REFERENTIALS_PATH']

    if path and filename:
        full_path = path + '/' + filename
        if os.path.isfile(full_path):
            if compress and mime_type == 'image/jpeg':
                thumb_path = docservers['VERIFIER_THUMB']
                if year_and_month:
                    thumb_path = thumb_path + '/' + year_and_month + '/'
                if os.path.isfile(thumb_path + '/' + filename):
                    with open(thumb_path + '/' + filename, 'rb') as file:
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
    if 'config' in current_context:
        config = current_context.config
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        config = _vars[1]

    credentials = base64.b64encode(
        (config['API']['siret-consumer'] + ':' + config['API']['siret-secret']).encode('UTF-8')).decode('UTF-8')

    try:
        res = requests.post(config['API']['siret-url-token'],
                            data={'grant_type': 'client_credentials'},
                            headers={"Authorization": f"Basic {credentials}"})
    except requests.exceptions.SSLError:
        return 'ERROR : ' + gettext('API_INSEE_ERROR_CONNEXION'), 201

    if 'Maintenance - INSEE' in res.text or res.status_code != 200:
        return 'ERROR : ' + gettext('API_INSEE_ERROR_CONNEXION'), 201
    else:
        return json.loads(res.text)['access_token'], 200


def verify_siren(token, siren):
    if 'config' in current_context:
        config = current_context.config
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        config = _vars[1]

    try:
        res = requests.get(config['API']['siren-url'] + siren,
                           headers={"Authorization": f"Bearer {token}", "Accept": "application/json"})
    except (requests.exceptions.SSLError, requests.exceptions.ConnectionError):
        return 'ERROR : ' + gettext('API_INSEE_ERROR_CONNEXION'), 201

    _return = json.loads(res.text)
    if 'header' not in res.text:
        return _return['fault']['message'], 201
    else:
        return _return['header']['message'], 200


def verify_siret(token, siret):
    if 'config' in current_context and 'log' in current_context:
        log = current_context.log
        config = current_context.config
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        config = _vars[1]
        log = _vars[5]

    try:
        res = requests.get(config['API']['siret-url'] + siret,
                           headers={"Authorization": f"Bearer {token}", "Accept": "application/json"})
    except (requests.exceptions.SSLError, requests.exceptions.ConnectionError) as _e:
        log.error(gettext('API_INSEE_ERROR_CONNEXION') + ' : ' + str(_e))
        return 'ERROR : ' + gettext('API_INSEE_ERROR_CONNEXION'), 201

    _return = json.loads(res.text)
    if 'header' not in res.text:
        return _return['fault']['message'], 201
    else:
        return _return['header']['message'], 200


def verify_vat_number(vat_number):
    if 'config' in current_context and 'log' in current_context:
        log = current_context.log
        config = current_context.config
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        config = _vars[1]
        log = _vars[5]
    url = config['API']['tva-url']
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
        log.error(gettext('VAT_API_ERROR') + ' : ' + str(_e))
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
            "message": gettext(error)
        }
        return response, 401


def update_status(args):
    for _id in args['ids']:
        invoice = verifier.get_invoice_by_id({'invoice_id': _id})
        if len(invoice[0]) < 1:
            response = {
                "errors": gettext('INVOICE_NOT_FOUND'),
                "message": gettext('INVOICE_ID_NOT_FOUND', id=_id)
            }
            return response, 400

    res = verifier.update_status(args)
    if res:
        return '', 200
    else:
        response = {
            "errors": gettext('UPDATE_STATUS_ERROR'),
            "message": gettext(res)
        }
        return response, 400


def get_unseen():
    total_unseen = verifier.get_total_invoices({
        'select': ['count(invoices.id) as unseen'],
        'where': ["status = %s"],
        'data': ['NEW'],
        'table': ['invoices'],
    })[0]
    return total_unseen['unseen'], 200
