# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
# @dev : Oussama Brich <oussama.brich@edissyum.com>

import json
import datetime
import os
from xml.dom import minidom

from flask import current_app
from flask_babel import gettext
import xml.etree.ElementTree as ET
from src.backend.main import launch
from ..import_classes import _Files
from ..import_controllers import pdf
from ..import_models import verifier, accounts


def handle_uploaded_file(files, purchase_or_sale, customer_id):
    path = current_app.config['UPLOAD_FOLDER']
    for file in files:
        f = files[file]
        filename = _Files.save_uploaded_file(f, path)
        launch({
            'file': filename,
            'config': current_app.config['CONFIG_FILE'],
            'purchaseOrSale': purchase_or_sale,
            'customerId': customer_id
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

    args['select'].append("DISTINCT(invoices.id) as invoice_id")
    args['select'].append("to_char(register_date, 'DD-MM-YYY à HH24:MI:SS') as date")
    args['select'].append("*")
    args['table'] = ['invoices']
    args['left_join'] = []

    if 'time' in args:
        if args['time'] in ['today', 'yesterday']:
            args['where'].append("to_char(register_date, 'YYYY-MM-DD') = to_char(TIMESTAMP '" + args['time'] + "', 'YYYY-MM-DD')")
        else:
            args['where'].append("to_char(register_date, 'YYYY-MM-DD') < to_char(TIMESTAMP 'yesterday', 'YYYY-MM-DD')")

    if 'status' in args:
        args['where'].append('invoices.status = %s')
        args['data'].append(args['status'])

    if 'search' in args and args['search']:
        args['table'] = ['invoices', 'accounts_supplier']
        args['left_join'] = ['invoices.supplier_id = accounts_supplier.id']
        args['where'].append(
            "LOWER(filename) LIKE '%%" + args['search'].lower() + "%%' OR "
            "(LOWER((datas -> 'invoice_number')::text) LIKE '%%" + args['search'].lower() + "%%' OR "
            "LOWER(accounts_supplier.name) LIKE '%%" + args['search'].lower() + "%%')"
        )

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

    total_invoices = verifier.get_invoices({
        'select': ['count(DISTINCT(invoices.id)) as total'],
        'where': args['where'],
        'data': args['data'],
        'table': args['table'],
        'left_join': args['left_join'],
    })
    if total_invoices != 0:
        invoices_list = verifier.get_invoices(args)
        for invoice in invoices_list:
            if invoice['supplier_id']:
                invoice['supplier_name'] = accounts.get_supplier_by_id({'supplier_id': invoice['supplier_id']})[0]['name']
        response = {
            "total": total_invoices[0]['total'],
            "invoices": invoices_list
        }
        return response, 200


def update_position_by_invoice_id(invoice_id, args):
    _vars = pdf.init()
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
        res, error = verifier.update_invoice({'set': {"positions": json.dumps(invoice_positions)}, 'invoice_id': invoice_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_INVOICE_POSITIONS_ERROR'),
                "message": error
            }
            return response, 401


def update_invoice_data_by_invoice_id(invoice_id, args):
    _vars = pdf.init()
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
        res, error = verifier.update_invoice({'set': {"datas": json.dumps(invoice_data)}, 'invoice_id': invoice_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_INVOICE_DATA_ERROR'),
                "message": error
            }
            return response, 401


def delete_invoice_data_by_invoice_id(invoice_id, field_id):
    _vars = pdf.init()
    _db = _vars[0]
    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if error is None:
        _set = {}
        invoice_data = invoice_info['datas']
        if field_id in invoice_data:
            del(invoice_data[field_id])
        res, error = verifier.update_invoice({'set': {"datas": json.dumps(invoice_data)}, 'invoice_id': invoice_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_INVOICE_DATA_ERROR'),
                "message": error
            }
            return response, 401


def delete_invoice_position_by_invoice_id(invoice_id, field_id):
    _vars = pdf.init()
    _db = _vars[0]
    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if error is None:
        _set = {}
        invoice_positions = invoice_info['positions']
        if field_id in invoice_positions:
            del(invoice_positions[field_id])
        res, error = verifier.update_invoice({'set': {"positions": json.dumps(invoice_positions)}, 'invoice_id': invoice_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_INVOICE_DATA_ERROR'),
                "message": error
            }
            return response, 401


def delete_invoice(invoice_id):
    _vars = pdf.init()
    _db = _vars[0]

    user_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if error is None:
        res, error = verifier.update_invoice({'set': {'status': 'DEL'}, 'invoice_id': invoice_id})
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
    _vars = pdf.init()
    _db = _vars[0]
    role_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})

    if error is None:
        res, error = verifier.update_invoice({'set': data, 'invoice_id': invoice_id})

        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_ROLE_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('UPDATE_ROLE_ERROR'),
            "message": error
        }
        return response, 401


def export_xml(invoice_id, data):
    _vars = pdf.init()
    _locale = _vars[2]
    folder_out = separator = filename = ''
    parameters = data['data']['options']['parameters']
    for setting in parameters:
        if setting['id'] == 'folder_out':
            folder_out = setting['value']
        elif setting['id'] == 'separator':
            separator = setting['value']
        elif setting['id'] == 'filename':
            filename = setting['value']
    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})

    if not error:
        _data = []
        _technical_data = []
        # Create the XML filename
        for column in filename.split('#'):
            if column in invoice_info['datas']:
                _data.append(invoice_info['datas'][column])
            elif column in invoice_info:
                _data.append(invoice_info[column])

            if column == 'invoice_date_year':
                _data.append(datetime.datetime.strptime(invoice_info['datas']['invoice_date'], _locale.formatDate).year)
            if column == 'invoice_date_month':
                _data.append(datetime.datetime.strptime(invoice_info['datas']['invoice_date'], _locale.formatDate).month)
            if column == 'invoice_date_day':
                _data.append(datetime.datetime.strptime(invoice_info['datas']['invoice_date'], _locale.formatDate).day)

            if column == 'register_date_year':
                _data.append(datetime.datetime.strptime(invoice_info['register_date'], _locale.formatDate).year)
            if column == 'register_date_month':
                _data.append(datetime.datetime.strptime(invoice_info['register_date'], _locale.formatDate).month)
            if column == 'register_date_day':
                _data.append(datetime.datetime.strptime(invoice_info['register_date'], _locale.formatDate).day)
        filename = separator.join(str(x) for x in _data) + '.xml'
        # END create the XML filename

        # Fill XML with invoice informations
        if os.path.isdir(folder_out):
            xml_file = open(folder_out + '/' + filename, 'w')
            root = ET.Element('ROOT')
            xml_technical = ET.SubElement(root, 'TECHNICAL')
            xml_datas = ET.SubElement(root, 'DATAS')

            for technical in invoice_info:
                if technical in ['path', 'filename', 'register_date', 'nb_pages', 'purchase_or_sale']:
                    new_field = ET.SubElement(xml_technical, technical)
                    new_field.text = str(invoice_info[technical])

            for data in invoice_info['datas']:
                new_field = ET.SubElement(xml_datas, data)
                new_field.text = str(invoice_info['datas'][data])

            xml_root = minidom.parseString(ET.tostring(root, encoding="unicode")).toprettyxml()
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
