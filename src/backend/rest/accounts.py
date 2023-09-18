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
import base64
import mimetypes
from flask_babel import gettext
from src.backend.main import create_classes_from_custom_id
from src.backend.functions import retrieve_custom_from_url, rest_validator
from src.backend.import_controllers import auth, accounts, verifier, privileges
from flask import Blueprint, request, make_response, jsonify, g as current_context

bp = Blueprint('accounts', __name__, url_prefix='/ws/')


@bp.route('accounts/suppliers/list', methods=['GET'])
@auth.token_required
def suppliers_list():
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['suppliers_list']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/accounts/suppliers/list'}), 403

    check, message = rest_validator(request.args, [
        {'id': 'order', 'type': str, 'mandatory': False},
        {'id': 'limit', 'type': int, 'mandatory': False},
        {'id': 'offset', 'type': int, 'mandatory': False}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = accounts.get_suppliers(request.args)
    return make_response(res[0], res[1])


@bp.route('accounts/suppliers/getById/<int:supplier_id>', methods=['GET'])
@auth.token_required
def get_supplier_by_id(supplier_id):
    if not privileges.has_privileges(request.environ['user_id'], ['suppliers_list']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/accounts/suppliers/getById/{supplier_id}'}), 403

    supplier = accounts.get_supplier_by_id(supplier_id)
    return make_response(jsonify(supplier[0])), supplier[1]


@bp.route('accounts/getAdressById/<int:address_id>', methods=['GET'])
@auth.token_required
def get_address_by_id(address_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'],
                                         ['update_supplier | update_customer | access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/accounts/suppliers/getById/{address_id}'}), 403

    _address = accounts.get_address_by_id(address_id)
    return make_response(jsonify(_address[0])), _address[1]


@bp.route('accounts/suppliers/update/<int:supplier_id>', methods=['PUT'])
@auth.token_required
def update_supplier(supplier_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['update_supplier | access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/accounts/suppliers/update/{supplier_id}'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'bic', 'type': str, 'mandatory': False},
        {'id': 'name', 'type': str, 'mandatory': False},
        {'id': 'duns', 'type': str, 'mandatory': False},
        {'id': 'iban', 'type': str, 'mandatory': False},
        {'id': 'siret', 'type': str, 'mandatory': False},
        {'id': 'siren', 'type': str, 'mandatory': False},
        {'id': 'email', 'type': str, 'mandatory': False},
        {'id': 'pages', 'type': dict, 'mandatory': False},
        {'id': 'form_id', 'type': int, 'mandatory': False},
        {'id': 'vat_number', 'type': str, 'mandatory': False},
        {'id': 'address_id', 'type': int, 'mandatory': False},
        {'id': 'positions', 'type': dict, 'mandatory': False},
        {'id': 'document_lang', 'type': str, 'mandatory': False},
        {'id': 'skip_auto_validate', 'type': bool, 'mandatory': False},
        {'id': 'get_only_raw_footer', 'type': bool, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    data = request.json['args']
    res = accounts.update_supplier(supplier_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/supplier/<int:supplier_id>/updatePosition', methods=['PUT'])
@auth.token_required
def update_position(supplier_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['update_supplier | access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/accounts/suppliers/{supplier_id}/updatePosition'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'form_id', 'type': int, 'mandatory': True}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    data = request.json['args']
    res = accounts.update_position_by_supplier_id(supplier_id, data)
    return make_response(res[0], res[1])


@bp.route('accounts/supplier/<int:supplier_id>/updatePage', methods=['PUT'])
@auth.token_required
def update_page(supplier_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['update_supplier | access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/accounts/suppliers/{supplier_id}/updatePage'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'form_id', 'type': int, 'mandatory': True}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    data = request.json['args']
    res = accounts.update_page_by_supplier_id(supplier_id, data)
    return make_response(res[0], res[1])


@bp.route('accounts/addresses/update/<int:address_id>', methods=['PUT'])
@auth.token_required
def update_address(address_id):
    if not privileges.has_privileges(request.environ['user_id'],
                                     ['update_supplier | update_customer | access_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/accounts/addresses/update/{address_id}'}), 403

    data = request.json['args']
    res = accounts.update_address(address_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/addresses/updateBySupplierId/<int:suplier_id>', methods=['PUT'])
@auth.token_required
def update_address_by_supplier_id(suplier_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['update_supplier | access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/accounts/addresses/updateBySupplierId/{suplier_id}'}), 403

    data = request.json['args']
    res = accounts.update_address_by_supplier_id(suplier_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/addresses/create', methods=['POST'])
@auth.token_required
def create_address():
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'],
                                         ['create_supplier | create_customer | access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/accounts/addresses/create'}), 403

    data = request.json['args']
    check, message = rest_validator(data, [
        {'id': 'order', 'type': str, 'mandatory': False},
        {'id': 'limit', 'type': int, 'mandatory': False},
        {'id': 'offset', 'type': int, 'mandatory': False}
    ])
    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    module = ''
    if 'module' in data:
        module = data['module']
        del data['module']
    if all(data[x] is None for x in data) and module == 'splitter':
        return make_response(''), 204

    res = [{}, 200]
    if data:
        res = accounts.create_address(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/suppliers/create', methods=['POST'])
@auth.token_required
def create_supplier():
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['create_supplier | access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/accounts/suppliers/create'}), 403

    data = request.json['args']
    res = accounts.create_supplier(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/suppliers/delete/<int:supplier_id>', methods=['DELETE'])
@auth.token_required
def delete_supplier(supplier_id):
    if not privileges.has_privileges(request.environ['user_id'], ['suppliers_list', 'update_supplier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/accounts/suppliers/delete/{supplier_id}'}), 403

    res = accounts.delete_supplier(supplier_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/suppliers/deletePositions/<int:supplier_id>', methods=['DELETE'])
@auth.token_required
def delete_supplier_positions(supplier_id):
    if not privileges.has_privileges(request.environ['user_id'], ['suppliers_list', 'update_supplier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/accounts/suppliers/deletePositions/{supplier_id}'}), 403

    res = accounts.update_supplier(supplier_id, {'positions': '{}'})
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/suppliers/<int:supplier_id>/deletePosition', methods=['PUT'])
@auth.token_required
def delete_supplier_position(supplier_id):
    if not privileges.has_privileges(request.environ['user_id'], ['suppliers_list', 'update_supplier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/accounts/suppliers/{supplier_id}/deletePosition'}), 403

    form_id = request.json['args']['form_id']
    args = request.json['args']
    res = '', 200
    if 'multiple' in args:
        fields = args['fields']
        for field in fields:
            res = accounts.delete_document_position_by_supplier_id(supplier_id, field, form_id)
    else:
        field_id = request.json['args']['field_id']
        res = accounts.delete_document_position_by_supplier_id(supplier_id, field_id, form_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/suppliers/<int:supplier_id>/deletePage', methods=['PUT'])
@auth.token_required
def delete_supplier_page(supplier_id):
    if not privileges.has_privileges(request.environ['user_id'], ['suppliers_list', 'update_supplier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/accounts/suppliers/{supplier_id}/deletePage'}), 403

    form_id = request.json['args']['form_id']
    args = request.json['args']
    res = '', 200
    if 'multiple' in args:
        fields = args['fields']
        for field in fields:
            res = accounts.delete_document_page_by_supplier_id(supplier_id, field, form_id)
    else:
        field_id = request.json['args']['field_id']
        res = accounts.delete_document_page_by_supplier_id(supplier_id, field_id, form_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/suppliers/skipAutoValidate/<int:supplier_id>', methods=['PUT'])
@auth.token_required
def skip_auto_validate(supplier_id):
    if not privileges.has_privileges(request.environ['user_id'], ['suppliers_list', 'update_supplier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/accounts/suppliers/skipAutoValidate/{supplier_id}'}), 403

    res = accounts.update_supplier(supplier_id, {'skip_auto_validate': True})
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/customers/list', methods=['GET'])
@bp.route('accounts/customers/list/<string:module>', methods=['GET'])
@auth.token_required
def customers_list(module=False):
    if not privileges.has_privileges(request.environ['user_id'], ['customers_list | access_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/accounts/customers/list'}), 403

    res = accounts.retrieve_customers(request.args, module)
    return make_response(res[0], res[1])


@bp.route('accounts/customers/getById/<int:customer_id>', methods=['GET'])
@auth.token_required
def get_customer_by_id(customer_id):
    if not privileges.has_privileges(request.environ['user_id'], ['customers_list']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/accounts/customers/getById/{customer_id}'}), 403

    _customer = accounts.get_customer_by_id(customer_id)
    return make_response(jsonify(_customer[0])), _customer[1]


@bp.route('accounts/customers/update/<int:customer_id>', methods=['PUT'])
@auth.token_required
def update_customer(customer_id):
    if not privileges.has_privileges(request.environ['user_id'], ['update_customer']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/accounts/customers/update/{customer_id}'}), 403

    data = request.json['args']
    res = accounts.update_customer(customer_id, data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/customers/create', methods=['POST'])
@auth.token_required
def create_customer():
    if not privileges.has_privileges(request.environ['user_id'], ['create_customer']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/accounts/customers/create'}), 403

    data = request.json['args']
    res = accounts.create_customer(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('accounts/customers/delete/<int:customer_id>', methods=['DELETE'])
@auth.token_required
def delete_customer(customer_id):
    if not privileges.has_privileges(request.environ['user_id'], ['customers_list']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/accounts/customers/delete/{customer_id}'}), 403

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
    if 'docservers' in current_context and 'config' in current_context:
        docservers = current_context.docservers
        config = current_context.config
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]
        config = _vars[1]

    file_path = docservers['REFERENTIALS_PATH'] + '/' + config['REFERENCIAL']['referencialsupplierdocument']
    mime = mimetypes.guess_type(file_path)[0]
    file_content = verifier.get_file_content('referential_supplier', os.path.basename(file_path), mime)
    return make_response({'filename': os.path.basename(file_path), 'mimetype': mime,
                          'file': str(base64.b64encode(file_content.get_data()).decode('UTF-8'))}), 200


@bp.route('accounts/supplier/importSuppliers', methods=['POST'])
@auth.token_required
def import_suppliers():
    if not privileges.has_privileges(request.environ['user_id'], ['suppliers_list']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/accounts/supplier/importSuppliers'}), 403

    files = request.files
    res = '', 200
    if files:
        for file in files:
            _f = files[file]
            res = accounts.import_suppliers(_f)
    return res
