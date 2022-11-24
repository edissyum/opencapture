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
import base64
import mimetypes
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id
from src.backend.import_controllers import auth, accounts, verifier
from flask import Blueprint, request, make_response, jsonify, session

bp = Blueprint('accounts', __name__, url_prefix='/ws/')


@bp.route('accounts/suppliers/list', methods=['GET'])
@auth.token_required
def suppliers_list():
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'where': ['status <> %s'],
        'data': ['DEL'],
        'offset': request.args['offset'] if 'offset' in request.args else '',
        'limit': request.args['limit'] if 'limit' in request.args else '',
        'order_by': [request.args['order']] if 'order' in request.args else ''
    }

    if 'search' in request.args and request.args['search']:
        args['offset'] = ''
        args['where'].append(
            "(LOWER(name) LIKE '%%" + request.args['search'].lower() + "%%' OR "
            "LOWER(siret) LIKE '%%" + request.args['search'].lower() + "%%' OR "
            "LOWER(email) LIKE '%%" + request.args['search'].lower() + "%%' OR "
            "LOWER(siren) LIKE '%%" + request.args['search'].lower() + "%%' OR "
            "LOWER(vat_number) LIKE '%%" + request.args['search'].lower() + "%%')"
        )
    res = accounts.retrieve_suppliers(args)
    return make_response(res[0], res[1])


@bp.route('accounts/suppliers/getById/<int:supplier_id>', methods=['GET'])
@auth.token_required
def get_supplier_by_id(supplier_id):
    supplier = accounts.get_supplier_by_id(supplier_id)
    return make_response(jsonify(supplier[0])), supplier[1]


@bp.route('accounts/getAdressById/<int:address_id>', methods=['GET'])
@auth.token_required
def get_address_by_id(address_id):
    _address = accounts.get_address_by_id(address_id)
    return make_response(jsonify(_address[0])), _address[1]


@bp.route('accounts/suppliers/update/<int:supplier_id>', methods=['PUT'])
@auth.token_required
def update_supplier(supplier_id):
    data = request.json['args']
    _set = {}
    if 'address_id' in data:
        _set.update({'address_id': data['address_id']})
    if 'name' in data:
        _set.update({'name': data['name']})
    if 'siret' in data:
        _set.update({'siret': data['siret']})
    if 'siren' in data:
        _set.update({'siren': data['siren']})
    if 'iban' in data:
        _set.update({'iban': data['iban']})
    if 'email' in data:
        _set.update({'email': data['email']})
    if 'vat_number' in data:
        _set.update({'vat_number': data['vat_number']})
    if 'form_id' in data:
        _set.update({'form_id': data['form_id']})
    if 'get_only_raw_footer' in data:
        _set.update({'get_only_raw_footer': data['get_only_raw_footer']})
    if 'document_lang' in data:
        _set.update({'document_lang': data['document_lang']})

    res = accounts.update_supplier(supplier_id, _set)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/supplier/<int:supplier_id>/updatePosition', methods=['PUT'])
@auth.token_required
def update_position(supplier_id):
    data = request.json['args']
    res = accounts.update_position_by_supplier_id(supplier_id, data)
    return make_response(res[0], res[1])


@bp.route('accounts/supplier/<int:supplier_id>/updatePage', methods=['PUT'])
@auth.token_required
def update_page(supplier_id):
    data = request.json['args']
    res = accounts.update_page_by_supplier_id(supplier_id, data)
    return make_response(res[0], res[1])


@bp.route('accounts/addresses/update/<int:address_id>', methods=['PUT'])
@auth.token_required
def update_address(address_id):
    data = request.json['args']
    res = accounts.update_address(address_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/addresses/updateBySupplierId/<int:suplier_id>', methods=['PUT'])
@auth.token_required
def update_address_by_supplier_id(suplier_id):
    data = request.json['args']
    res = accounts.update_address_by_supplier_id(suplier_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/addresses/create', methods=['POST'])
@auth.token_required
def create_address():
    data = request.json['args']
    res = accounts.create_address(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/suppliers/create', methods=['POST'])
@auth.token_required
def create_supplier():
    data = request.json['args']
    res = accounts.create_supplier(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/suppliers/delete/<int:supplier_id>', methods=['DELETE'])
@auth.token_required
def delete_supplier(supplier_id):
    res = accounts.delete_supplier(supplier_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/suppliers/deletePositions/<int:supplier_id>', methods=['DELETE'])
@auth.token_required
def delete_supplier_positions(supplier_id):
    res = accounts.update_supplier(supplier_id, {'positions': '{}'})
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/suppliers/<int:supplier_id>/deletePosition', methods=['PUT'])
@auth.token_required
def delete_supplier_position(supplier_id):
    form_id = request.json['args']['form_id']
    args = request.json['args']
    res = '', 200
    if 'multiple' in args:
        fields = args['fields']
        for field in fields:
            res = accounts.delete_invoice_position_by_supplier_id(supplier_id, field, form_id)
    else:
        field_id = request.json['args']['field_id']
        res = accounts.delete_invoice_position_by_supplier_id(supplier_id, field_id, form_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/suppliers/<int:supplier_id>/deletePage', methods=['PUT'])
@auth.token_required
def delete_supplier_page(supplier_id):
    form_id = request.json['args']['form_id']
    args = request.json['args']
    res = '', 200
    if 'multiple' in args:
        fields = args['fields']
        for field in fields:
            res = accounts.delete_invoice_page_by_supplier_id(supplier_id, field, form_id)
    else:
        field_id = request.json['args']['field_id']
        res = accounts.delete_invoice_page_by_supplier_id(supplier_id, field_id, form_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/suppliers/skipAutoValidate/<int:supplier_id>', methods=['DELETE'])
@auth.token_required
def skip_auto_validate(supplier_id):
    res = accounts.update_supplier(supplier_id, {'skip_auto_validate': True})
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/customers/list', methods=['GET'])
@auth.token_required
def customers_list():
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'where': ['status <> %s'],
        'data': ['DEL'],
        'offset': request.args['offset'] if 'offset' in request.args else '',
        'limit': request.args['limit'] if 'limit' in request.args else ''
    }
    if 'search' in request.args and request.args['search']:
        args['offset'] = ''
        args['where'].append(
            "(LOWER(name) LIKE '%%" + request.args['search'].lower() + "%%' OR "
            "LOWER(siret) LIKE '%%" + request.args['search'].lower() + "%%' OR "
            "LOWER(company_number) LIKE '%%" + request.args['search'].lower() + "%%' OR "
            "LOWER(siren) LIKE '%%" + request.args['search'].lower() + "%%' OR "
            "LOWER(vat_number) LIKE '%%" + request.args['search'].lower() + "%%')"
        )

    res = accounts.retrieve_customers(args)
    return make_response(res[0], res[1])


@bp.route('accounts/customers/getById/<int:customer_id>', methods=['GET'])
@auth.token_required
def get_customer_by_id(customer_id):
    _customer = accounts.get_customer_by_id(customer_id)
    return make_response(jsonify(_customer[0])), _customer[1]


@bp.route('accounts/customers/update/<int:customer_id>', methods=['PUT'])
@auth.token_required
def update_customer(customer_id):
    data = request.json['args']
    res = accounts.update_customer(customer_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/customers/create', methods=['POST'])
@auth.token_required
def create_customer():
    data = request.json['args']
    res = accounts.create_customer(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/customers/delete/<int:customer_id>', methods=['DELETE'])
@auth.token_required
def delete_customer(customer_id):
    res = accounts.delete_customer(customer_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/customers/getAccountingPlan/<int:customer_id>', methods=['GET'])
@auth.token_required
def get_accouting_plan(customer_id):
    res = accounts.get_accounting_plan_by_customer_id(customer_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/customers/getDefaultAccountingPlan', methods=['GET'])
@auth.token_required
def get_default_accouting_plan():
    res = accounts.get_default_accounting_plan()
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/supplier/getReferenceFile', methods=['GET'])
@auth.token_required
def get_reference_file():
    if 'docservers' in session and 'config' in session:
        docservers = json.loads(session['docservers'])
        config = json.loads(session['config'])
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]
        config = _vars[1]

    file_path = docservers['REFERENTIALS_PATH'] + '/' + config['REFERENCIAL']['referencialsupplierdocument']
    mime = mimetypes.guess_type(file_path)[0]
    file_content = verifier.get_file_content('referential_supplier', os.path.basename(file_path), mime)
    return make_response({'filename': os.path.basename(file_path), 'mimetype': mime, 'file': str(base64.b64encode(file_content.get_data()).decode('UTF-8'))}), 200


@bp.route('accounts/supplier/importSuppliers', methods=['POST'])
@auth.token_required
def import_suppliers():
    files = request.files
    res = '', 200
    if files:
        for file in files:
            _f = files[file]
            res = accounts.import_suppliers(_f)
    return res
