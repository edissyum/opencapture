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

from flask import Blueprint, request, make_response, jsonify
from ..import_controllers import auth
from ..import_controllers import accounts

bp = Blueprint('accounts', __name__, url_prefix='/ws/')


@bp.route('accounts/suppliers/list', methods=['GET'])
@auth.token_required
def suppliers_list():
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'where': ['status <> %s'],
        'data': ['DEL'],
        'offset': request.args['offset'] if 'offset' in request.args else '',
        'limit': request.args['limit'] if 'limit' in request.args else ''
    }
    res = accounts.retrieve_suppliers(args)
    return make_response(res[0], res[1])


@bp.route('accounts/suppliers/getById/<int:supplier_id>', methods=['GET'])
@auth.token_required
def get_supplier_by_id(supplier_id):
    supplier = accounts.get_supplier_by_id(supplier_id)
    return make_response(jsonify(supplier[0])), supplier[1]


@bp.route('accounts/getAdressById/<int:address_id>', methods=['GET'])
@auth.token_required
def get_adress_by_id(address_id):
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
    if 'vat_number' in data:
        _set.update({'vat_number': data['vat_number']})
    if 'typology' in data:
        _set.update({'typology': data['typology']})
    if 'form_id' in data:
        _set.update({'form_id': data['form_id']})

    res = accounts.update_supplier(supplier_id, _set)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/supplier/<int:supplier_id>/updatePosition', methods=['PUT'])
@auth.token_required
def update_position(supplier_id):
    data = request.json['args']
    print(data)
    res = accounts.update_position_by_supplier_id(supplier_id, data)
    return make_response(res[0], res[1])


@bp.route('accounts/addresses/update/<int:supplier_id>', methods=['PUT'])
@auth.token_required
def update_address(supplier_id):
    data = request.json['args']
    res = accounts.update_address(supplier_id, data)
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
    res = accounts.create_supplier(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/customers/delete/<int:customer_id>', methods=['DELETE'])
@auth.token_required
def delete_customer(customer_id):
    res = accounts.delete_customer(customer_id)
    return make_response(jsonify(res[0])), res[1]
