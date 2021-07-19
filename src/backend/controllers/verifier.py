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

from flask import current_app
from flask_babel import gettext
from ..import_classes import _Files
from ..import_controllers import pdf
from ..import_models import verifier, accounts


def handle_uploaded_file(files):
    result = _Files.save_uploaded_file(files, current_app.config['UPLOAD_FOLDER'])
    return result


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
        args['where'].append("(LOWER(invoices.invoice_number) LIKE '%%" + args['search'].lower() + "%%' OR LOWER(accounts_supplier.name) LIKE '%%" + args['search'].lower() + "%%')")

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


def update_position_by_invoice_id(invoice_id, data):
    _vars = pdf.init()
    _db = _vars[0]
    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if error is None:
        column = position = ''
        for _position in data:
            column = _position
            position = data[_position]

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


def update_invoice_data_by_invoice_id(invoice_id, data):
    _vars = pdf.init()
    _db = _vars[0]
    invoice_info, error = verifier.get_invoice_by_id({'invoice_id': invoice_id})
    if error is None:
        column = value = False
        _set = {}
        for _data in data:
            column = _data
            value = data[_data]

        invoice_data = invoice_info['data']
        invoice_data.update({
            column: value
        })
        res, error = verifier.update_invoice({'set': {"data": json.dumps(invoice_data)}, 'invoice_id': invoice_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_INVOICE_POSITIONS_ERROR'),
                "message": error
            }
            return response, 401


