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
import base64
import logging
import datetime
from xml.dom import minidom
import xml.etree.ElementTree as Et
import pandas as pd
from PIL import Image
from flask_babel import gettext
import requests
from zeep import Client, exceptions
from flask import current_app, Response
from src.backend.import_controllers import user
from src.backend.import_models import verifier, accounts
from src.backend.main import launch, create_classes_from_current_config
from src.backend.import_classes import _Files, _MaarchWebServices


def handle_uploaded_file(files, input_id):
    path = current_app.config['UPLOAD_FOLDER']
    for file in files:
        _f = files[file]
        filename = _Files.save_uploaded_file(_f, path)
        launch({
            'file': filename,
            'languages': current_app.config['LANGUAGES'],
            'config': current_app.config['CONFIG_FILE'],
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
    _vars = create_classes_from_current_config()
    _cfg = _vars[1]
    _docservers = _vars[9]

    if 'where' not in args:
        args['where'] = []
    if 'data' not in args:
        args['data'] = []
    if 'select' not in args:
        args['select'] = []

    args['select'].append("DISTINCT(invoices.id) as invoice_id")
    args['select'].append("to_char(register_date, 'DD-MM-YYY " + gettext('AT') + " HH24:MI:SS') as date")
    args['select'].append("*")
    args['table'] = ['invoices']
    args['left_join'] = []

    if 'time' in args:
        if args['time'] in ['today', 'yesterday']:
            args['where'].append(
                "to_char(register_date, 'YYYY-MM-DD') = to_char(TIMESTAMP '" + args['time'] + "', 'YYYY-MM-DD')")
        else:
            args['where'].append("to_char(register_date, 'YYYY-MM-DD') < to_char(TIMESTAMP 'yesterday', 'YYYY-MM-DD')")

    if 'status' in args:
        args['where'].append('invoices.status = %s')
        args['data'].append(args['status'])

    if 'search' in args and args['search']:
        args['table'] = ['invoices', 'accounts_supplier']
        args['left_join'] = ['invoices.supplier_id = accounts_supplier.id']
        args['group_by'] = ['invoices.id', 'accounts_supplier.id']
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]
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


def delete_invoice_position_by_invoice_id(invoice_id, field_id):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]

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
    _vars = create_classes_from_current_config()
    _db = _vars[0]
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]

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
    _vars = create_classes_from_current_config()
    host = login = password = ''
    auth_data = data['options']['auth']
    for _data in auth_data:
        if _data['id'] == 'host':
            host = _data['value']
        if _data['id'] == 'login':
            login = _data['value']
        if _data['id'] == 'password':
            password = _data['value']

    if host and login and password:
        _ws = _MaarchWebServices(
            host,
            login,
            password,
            _vars[5],
            _vars[1]
        )
        if _ws.status[0]:
            invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
            if not error:
                args = {}
                supplier = accounts.get_supplier_by_id({'supplier_id': invoice_info['supplier_id']})
                if supplier and supplier[0]['address_id']:
                    address = accounts.get_address_by_id({'address_id': supplier[0]['address_id']})
                    if address:
                        supplier[0].update(address[0])

                link_resource = False
                opencapture_field = maarch_custom_field = maarch_clause = custom_field_contact_id = None
                if 'links' in data['options']:
                    for _links in data['options']['links']:
                        if _links['id'] == 'enabled' and _links['value']:
                            link_resource = True
                        if _links['id'] == 'maarchCustomField' and _links['value']:
                            maarch_custom_field = _links['value']
                        if _links['id'] == 'openCaptureField' and _links['value']:
                            opencapture_field = _links['value']
                        if _links['id'] == 'maarchClause' and _links['value']:
                            maarch_clause = _links['value']
                        if _links['id'] == 'vatNumberContactCustom' and _links['value']:
                            custom_field_contact_id = _links['value']

                contact = {
                    'company': supplier[0]['name'],
                    'addressTown': supplier[0]['city'],
                    'societyShort': supplier[0]['name'],
                    'addressStreet': supplier[0]['address1'],
                    'addressPostcode': supplier[0]['postal_code'],
                    'email': 'A_renseignera_' + supplier[0]['name'].replace(' ', '_') +
                             '@' + supplier[0]['vat_number'] + '.fr'
                }
                if custom_field_contact_id:
                    contact['customFields'] = {custom_field_contact_id['id']: supplier[0]['vat_number'] + supplier[0]['siret']}

                res = _ws.create_contact(contact)
                if res is not False:
                    args['contact'] = {'id': res['id'], 'type': 'contact'}

                ws_data = data['options']['parameters']
                for _data in ws_data:
                    value = _data['value']
                    if 'webservice' in _data:
                        # Pour le webservices Maarch, ce sont les identifiants qui sont utilisés
                        # et non les valeurs bruts (e.g COU plutôt que Service courrier)
                        if _data['value']:
                            value = _data['value']['id']

                    args.update({
                        _data['id']: value
                    })

                    if _data['id'] == 'priority':
                        priority = _ws.retrieve_priority(value)
                        if priority:
                            delays = priority['priority']['delays']
                            process_limit_date = datetime.date.today() + datetime.timedelta(days=delays)
                            args.update({
                                'processLimitDate': str(process_limit_date)
                            })

                    if _data['id'] == 'customFields':
                        args.update({
                            'customFields': {}
                        })
                        if _data['value']:
                            customs = json.loads(_data['value'])
                            for custom_id in customs:
                                if custom_id in customs and customs[custom_id] in invoice_info['datas']:
                                    args['customFields'].update({
                                        custom_id: invoice_info['datas'][customs[custom_id]]
                                    })
                    elif _data['id'] == 'subject':
                        subject = construct_with_var(_data['value'], invoice_info)
                        args.update({
                            'subject': ''.join(subject)
                        })

                file = invoice_info['path'] + '/' + invoice_info['filename']
                if os.path.isfile(file):
                    with open(file, 'rb') as file:
                        args.update({
                            'fileContent': file.read(),
                            'documentDate': str(pd.to_datetime(invoice_info['datas']['invoice_date'],
                                                               infer_datetime_format=True).date())
                        })
                    res, message = _ws.insert_with_args(args)
                    if res:
                        if link_resource:
                            res_id = message['resId']
                            if opencapture_field:
                                opencapture_field = ''.join(construct_with_var(opencapture_field, invoice_info))
                                if maarch_custom_field:
                                    if 'res_id' not in data or not data['res_id']:
                                        docs = _ws.retrieve_doc_with_custom(maarch_custom_field['id'], opencapture_field, maarch_clause)
                                        if docs:
                                            res_id = docs['resources'][0]['res_id']
                                    else:
                                        res_id = data['res_id']

                                    if res_id != message['resId']:
                                        _ws.link_documents(str(res_id), message['resId'])
                        return '', 200
                    else:
                        response = {
                            "errors": gettext('EXPORT_MAARCH_ERROR'),
                            "message": message['errors']
                        }
                        return response, 400
                else:
                    response = {
                        "errors": gettext('EXPORT_MAARCH_ERROR'),
                        "message": gettext('PDF_FILE_NOT_FOUND')
                    }
                    return response, 400
            else:
                response = {
                    "errors": gettext('EXPORT_MAARCH_ERROR'),
                    "message": error
                }
                return response, 400
        else:
            response = {
                "errors": gettext('MAARCH_WS_INFO_WRONG'),
                "message": _ws.status[1]
            }
            return response, 400
    else:
        response = {
            "errors": gettext('MAARCH_WS_INFO_EMPTY'),
            "message": ''
        }
        return response, 400


def construct_with_var(data, invoice_info, separator=False):
    _vars = create_classes_from_current_config()
    _regex = _vars[2]
    _data = []
    for column in data.split('#'):
        if column in invoice_info['datas']:
            if separator:
                _data.append(invoice_info['datas'][column].replace(' ', separator))
            else:
                _data.append(invoice_info['datas'][column])
        elif column in invoice_info:
            if separator:
                _data.append(invoice_info[column].replace(' ', separator))
            else:
                _data.append(invoice_info[column])
        elif column == 'invoice_date_year':
            _data.append(datetime.datetime.strptime(invoice_info['datas']['invoice_date'], _regex['formatDate']).year)
        elif column == 'invoice_date_month':
            _data.append(datetime.datetime.strptime(invoice_info['datas']['invoice_date'], _regex['formatDate']).month)
        elif column == 'invoice_date_day':
            _data.append(datetime.datetime.strptime(invoice_info['datas']['invoice_date'], _regex['formatDate']).day)
        elif column == 'register_date_year':
            _data.append(datetime.datetime.strptime(invoice_info['register_date'], _regex['formatDate']).year)
        elif column == 'register_date_month':
            _data.append(datetime.datetime.strptime(invoice_info['register_date'], _regex['formatDate']).month)
        elif column == 'register_date_day':
            _data.append(datetime.datetime.strptime(invoice_info['register_date'], _regex['formatDate']).day)
        else:
            if separator:
                _data.append(column.replace(' ', separator))
            else:
                _data.append(column)
    return _data


def export_xml(invoice_id, data):
    folder_out = separator = filename = extension = ''
    parameters = data['options']['parameters']
    for setting in parameters:
        if setting['id'] == 'folder_out':
            folder_out = setting['value']
        elif setting['id'] == 'separator':
            separator = setting['value']
        elif setting['id'] == 'filename':
            filename = setting['value']
        elif setting['id'] == 'extension':
            extension = setting['value']

    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})

    if not error:
        _technical_data = []
        # Create the XML filename
        _data = construct_with_var(filename, invoice_info, separator)
        filename = separator.join(str(x) for x in _data) + '.' + extension
        # END create the XML filename

        # Fill XML with invoice informations
        if os.path.isdir(folder_out):
            with open(folder_out + '/' + filename, 'w', encoding='UTF-8') as xml_file:
                root = Et.Element('ROOT')
                xml_technical = Et.SubElement(root, 'TECHNICAL')
                xml_datas = Et.SubElement(root, 'DATAS')

                for technical in invoice_info:
                    if technical in ['path', 'filename', 'register_date', 'nb_pages', 'purchase_or_sale']:
                        new_field = Et.SubElement(xml_technical, technical)
                        new_field.text = str(invoice_info[technical])

                for invoice_data in invoice_info['datas']:
                    new_field = Et.SubElement(xml_datas, invoice_data)
                    new_field.text = str(invoice_info['datas'][invoice_data])

                xml_root = minidom.parseString(Et.tostring(root, encoding="unicode")).toprettyxml()
                xml_file.write(xml_root)
                xml_file.close()
            # END Fill XML with invoice informations
            return '', 200
        else:
            response = {
                "errors": gettext('XML_DESTINATION_FOLDER_DOESNT_EXISTS'),
                "message": folder_out
            }
            return response, 401
    else:
        response = {
            "errors": gettext('EXPORT_XML_ERROR'),
            "message": error
        }
    return response, 401


def ocr_on_the_fly(file_name, selection, thumb_size, positions_masks):
    _vars = create_classes_from_current_config()
    _cfg = _vars[1].cfg
    _files = _vars[3]
    _ocr = _vars[4]
    _docservers = _vars[9]

    path = _docservers['VERIFIER_IMAGE_FULL'] + '/' + file_name

    if positions_masks:
        path = _docservers['VERIFIER_POSITIONS_MASKS'] + '/' + file_name

    text = _files.ocr_on_fly(path, selection, _ocr, thumb_size)
    if text:
        return text
    else:
        _files.improve_image_detection(path)
        text = _files.ocr_on_fly(path, selection, _ocr, thumb_size)
        return text


def get_file_content(file_type, filename, mime_type, compress=False):
    _vars = create_classes_from_current_config()
    _cfg = _vars[1].cfg
    _docservers = _vars[9]
    content = False
    path = ''

    if file_type == 'thumb':
        path = _docservers['VERIFIER_THUMB']
    elif file_type == 'full':
        path = _docservers['VERIFIER_IMAGE_FULL']
    elif file_type == 'positions_masks':
        path = _docservers['VERIFIER_POSITIONS_MASKS']
    elif file_type == 'referential_supplier':
        path = _docservers['REFERENTIALS_PATH']

    if path and filename:
        full_path = path + '/' + filename
        if os.path.isfile(full_path):
            if compress and mime_type == 'image/jpeg':
                thumb_path = _docservers['VERIFIER_THUMB'] + '/' + filename
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
            with open(_docservers['PROJECT_PATH'] + '/dist/assets/not_found/document_not_found.jpg', 'rb') as file:
                content = file.read()
        else:
            with open(_docservers['PROJECT_PATH'] + '/dist/assets/not_found/document_not_found.pdf', 'rb') as file:
                content = file.read()
    return Response(content, mimetype=mime_type)


def get_token_insee():
    _vars = create_classes_from_current_config()
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
    _vars = create_classes_from_current_config()
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
    _vars = create_classes_from_current_config()
    _cfg = _vars[1]

    try:
        res = requests.get(_cfg.cfg['API']['siret-url'] + siret,
                           headers={"Authorization": f"Bearer {token}", "Accept": "application/json"})
    except (requests.exceptions.SSLError, requests.exceptions.ConnectionError):
        return 'ERROR : ' + gettext('API_INSEE_ERROR_CONNEXION'), 201

    _return = json.loads(res.text)
    if 'header' not in res.text:
        return _return['fault']['message'], 201
    else:
        return _return['header']['message'], 200


def verify_vat_number(vat_number):
    _vars = create_classes_from_current_config()
    _cfg = _vars[1]
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
    except (exceptions.Fault, requests.exceptions.SSLError, requests.exceptions.ConnectionError):
        return gettext('VAT_API_ERROR'), 201


def get_totals(status, user_id):
    totals = {}
    allowed_customers, _ = user.get_customers_by_user_id(user_id)
    allowed_customers.append(0)  # Update allowed customers to add Unspecified customers

    totals['today'], error = verifier.get_totals({'time': 'today', 'status': status, 'allowedCustomers': allowed_customers})
    totals['yesterday'], error = verifier.get_totals({'time': 'yesterday', 'status': status, 'allowedCustomers': allowed_customers})
    totals['older'], error = verifier.get_totals({'time': 'older', 'status': status, 'allowedCustomers': allowed_customers})
    if error is None:
        return totals, 200
    else:
        response = {
            "errors": gettext('GET_TOTALS_ERROR'),
            "message": error
        }
        return response, 401
