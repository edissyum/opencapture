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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

import os
import json
import datetime
import pandas as pd
from xml.dom import minidom
from flask_babel import gettext
import xml.etree.ElementTree as Et
from src.backend.import_classes import _MaarchWebServices


def export_xml(data, log, regex, invoice_info):
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

    _technical_data = []
    # Create the XML filename
    _data = construct_with_var(filename, invoice_info, regex, separator)
    filename = separator.join(str(x) for x in _data) + '.' + extension
    filename = filename.replace('/', '-').replace(' ', '_')
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
        if log:
            log.error(gettext('XML_DESTINATION_FOLDER_DOESNT_EXISTS') + ' : ' + folder_out)

        response = {
            "errors": gettext('XML_DESTINATION_FOLDER_DOESNT_EXISTS'),
            "message": folder_out
        }
        return response, 401


def export_maarch(data, invoice_info, log, config, regex, database):
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
            log,
            config
        )
        if _ws.status[0]:
            if invoice_info:
                args = {}
                supplier = database.select({
                    'select': ['*'] if 'select' not in args else args['select'],
                    'table': ['accounts_supplier'],
                    'where': ['id = %s'],
                    'data': [invoice_info['supplier_id']]
                })
                if supplier and supplier[0]['address_id']:
                    address = database.select({
                        'select': ['*'] if 'select' not in args else args['select'],
                        'table': ['addresses'],
                        'where': ['id = %s'],
                        'data': [supplier[0]['address_id']]
                    })
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
                    'email': supplier[0]['email'] if supplier[0]['email'] else 'A_renseigner_' + supplier[0]['name'].replace(' ', '_') +
                                                                               '@' + supplier[0]['vat_number'] + '.fr'
                }

                if custom_field_contact_id and supplier[0]['vat_number'] and supplier[0]['siret']:
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
                        subject = construct_with_var(_data['value'], invoice_info, regex)
                        args.update({
                            'subject': ''.join(subject)
                        })

                file = invoice_info['path'] + '/' + invoice_info['filename']
                if os.path.isfile(file):
                    with open(file, 'rb') as file:
                        args.update({
                            'fileContent': file.read(),
                        })

                    if 'invoice_date' in invoice_info['datas'] and invoice_info['datas']['invoice_date']:
                        invoice_date = pd.to_datetime(invoice_info['datas']['invoice_date'], infer_datetime_format=True)
                        args.update({
                            'documentDate': str(invoice_date.date())
                        })

                    res, message = _ws.insert_with_args(args)
                    if res:
                        if link_resource:
                            res_id = message['resId']
                            if opencapture_field:
                                opencapture_field = ''.join(construct_with_var(opencapture_field, invoice_info, regex))
                                if maarch_custom_field:
                                    if 'res_id' not in data or not data['res_id']:
                                        docs = _ws.retrieve_doc_with_custom(maarch_custom_field['id'], opencapture_field, maarch_clause)
                                        if docs and docs['resources'] and len(docs['resources']) >= 1:
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
                    "message": ''
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


def construct_with_var(data, invoice_info, regex, separator=False):
    _data = []
    if isinstance(invoice_info['datas'], str):
        data_tmp = json.loads(invoice_info['datas'])
        invoice_info['datas'] = {}
        invoice_info['datas'] = data_tmp

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
            _data.append(datetime.datetime.strptime(invoice_info['datas']['invoice_date'], regex['formatDate']).year)
        elif column == 'invoice_date_month':
            _data.append(datetime.datetime.strptime(invoice_info['datas']['invoice_date'], regex['formatDate']).month)
        elif column == 'invoice_date_day':
            _data.append(datetime.datetime.strptime(invoice_info['datas']['invoice_date'], regex['formatDate']).day)
        elif column == 'register_date_year':
            _data.append(datetime.datetime.strptime(invoice_info['register_date'], regex['formatDate']).year)
        elif column == 'register_date_month':
            _data.append(datetime.datetime.strptime(invoice_info['register_date'], regex['formatDate']).month)
        elif column == 'register_date_day':
            _data.append(datetime.datetime.strptime(invoice_info['register_date'], regex['formatDate']).day)
        else:
            if separator:
                _data.append(column.replace(' ', separator))
            else:
                if column not in ['quotation_number', 'invoice_number', 'order_number', 'delivery_number', 'invoice_date_']:
                    _data.append(column)
    return _data
