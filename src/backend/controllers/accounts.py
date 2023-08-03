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
# @dev : Oussama Brich <oussama.brich@edissyum.com>

import os
import json
import subprocess
from flask_babel import gettext
from src.backend.import_classes import _Files
from src.backend.import_models import accounts, history
from src.backend.main import create_classes_from_custom_id
from flask import current_app, request, g as current_context
from src.backend.functions import retrieve_custom_from_url, retrieve_custom_path


def get_suppliers(_args):
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'where': ['status <> %s'],
        'data': ['DEL'],
        'offset': _args['offset'] if 'offset' in _args else 0,
        'limit': _args['limit'] if 'limit' in _args else 'ALL',
        'order_by': [_args['order']] if 'order' in _args else ''
    }

    if 'search' in _args and _args['search']:
        args['offset'] = ''
        args['where'].append(
            "(LOWER(name) LIKE '%%" + _args['search'].lower() + "%%' OR "
            "LOWER(siret) LIKE '%%" + _args['search'].lower() + "%%' OR "
            "LOWER(email) LIKE '%%" + _args['search'].lower() + "%%' OR "
            "LOWER(siren) LIKE '%%" + _args['search'].lower() + "%%' OR "
            "LOWER(vat_number) LIKE '%%" + _args['search'].lower() + "%%')"
        )

    if 'name' in _args and _args['name']:
        args['offset'] = ''
        args['where'].append("LOWER(unaccent(name)) LIKE unaccent('" + _args['name'].lower() + "%%')")

    suppliers = accounts.get_suppliers(args)
    response = {
        "suppliers": suppliers
    }
    return response, 200


def get_supplier_by_id(supplier_id):
    supplier_info, error = accounts.get_supplier_by_id({'supplier_id': supplier_id})

    if error is None:
        return supplier_info, 200
    else:
        response = {
            "errors": gettext('GET_SUPPLIER_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def get_address_by_id(address_id):
    address_info, error = accounts.get_address_by_id({'address_id': address_id})

    if error is None:
        return address_info, 200
    else:
        response = {
            "errors": gettext('GET_ADDRESS_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def delete_document_position_by_supplier_id(supplier_id, field_id, form_id):
    supplier_info, error = accounts.get_supplier_by_id({'supplier_id': supplier_id})
    if error is None:
        _set = {}
        form_id = str(form_id)
        supplier_positions = supplier_info['positions']
        if form_id in supplier_positions:
            if field_id in supplier_positions[form_id]:
                del supplier_positions[form_id][field_id]

        _, error = accounts.update_supplier({
            'set': {
                'positions': json.dumps(supplier_positions)
            },
            'supplier_id': supplier_id
        })

        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_SUPPLIER_POSITIONS_ERROR'),
                "message": gettext(error)
            }
            return response, 400


def delete_document_page_by_supplier_id(supplier_id, field_id, form_id):
    supplier_info, error = accounts.get_supplier_by_id({'supplier_id': supplier_id})
    if error is None:
        _set = {}
        form_id = str(form_id)
        supplier_positions = supplier_info['pages']
        if form_id in supplier_positions:
            if field_id in supplier_positions[form_id]:
                del supplier_positions[form_id][field_id]

        _, error = accounts.update_supplier({
            'set': {
                'pages': json.dumps(supplier_positions)
            },
            'supplier_id': supplier_id
        })

        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_SUPPLIER_PAGES_ERROR'),
                "message": gettext(error)
            }
            return response, 400


def update_supplier(supplier_id, data):
    if 'database' in current_context and 'spreadsheet' in current_context:
        database = current_context.database
        spreadsheet = current_context.spreadsheet
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
        spreadsheet = _vars[7]
    old_supplier, error = accounts.get_supplier_by_id({'supplier_id': supplier_id})

    if error is None:
        _set = {}
        if 'address_id' in data:
            _set.update({'address_id': data['address_id']})
        if 'name' in data:
            _set.update({'name': data['name']})
        if 'siret' in data:
            _set.update({'siret': data['siret']})
        if 'siren' in data:
            _set.update({'siren': data['siren']})
        if 'duns' in data:
            _set.update({'duns': data['duns']})
        if 'bic' in data:
            _set.update({'bic': data['bic']})
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
        if 'skip_auto_validate' in data:
            _set.update({'skip_auto_validate': data['skip_auto_validate']})
        if 'positions' in data:
            _set.update({'positions': data['positions']})
        if 'pages' in data:
            _set.update({'pages': data['pages']})

        _, error = accounts.update_supplier({'set': _set, 'supplier_id': supplier_id})

        if error is None:
            history.add_history({
                'module': 'accounts',
                'ip': request.remote_addr,
                'submodule': 'update_supplier',
                'user_info': request.environ['user_info'],
                'desc': gettext('SUPPLIER_UPDATED', supplier=data['name'] if 'name' in data else old_supplier['name'])
            })
            spreadsheet.update_supplier_ods_sheet(database)
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_SUPPLIER_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('UPDATE_SUPPLIER_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def update_position_by_supplier_id(supplier_id, data):
    supplier_info, error = accounts.get_supplier_by_id({'supplier_id': supplier_id})
    if error is None:
        column = ''
        position = ''
        for _position in data:
            if _position != 'form_id':
                column = _position
                position = data[_position]

        form_id = str(data['form_id'])
        supplier_positions = supplier_info['positions']

        if form_id not in supplier_positions:
            supplier_positions[form_id] = {}

        supplier_positions[form_id].update({
            column: position
        })

        _, error = accounts.update_supplier({'set': {"positions": json.dumps(supplier_positions)}, 'supplier_id': supplier_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_SUPPLIER_POSITIONS_ERROR'),
                "message": gettext(error)
            }
            return response, 400


def update_page_by_supplier_id(supplier_id, data):
    supplier_info, error = accounts.get_supplier_by_id({'supplier_id': supplier_id})
    if error is None:
        column = ''
        page = ''
        for _page in data:
            if _page != 'form_id':
                column = _page
                page = data[_page]

        form_id = str(data['form_id'])
        supplier_pages = supplier_info['pages']

        if form_id not in supplier_pages:
            supplier_pages[form_id] = {}

        supplier_pages[form_id].update({
            column: page
        })

        _, error = accounts.update_supplier({'set': {"pages": json.dumps(supplier_pages)}, 'supplier_id': supplier_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_SUPPLIER_PAGES_ERROR'),
                "message": gettext(error)
            }
            return response, 400


def update_address(address_id, data):
    _, error = accounts.get_address_by_id({'address_id': address_id})

    if error is None:
        _set = {
            'address1': data['address1'],
            'address2': data['address2'],
            'postal_code': data['postal_code'],
            'city': data['city'],
            'country': data['country']
        }

        _, error = accounts.update_address({'set': _set, 'address_id': address_id})

        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_ADDRESS_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('UPDATE_ADDRESS_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def update_address_by_supplier_id(supplier_id, data):
    address_info, error = accounts.get_supplier_by_id({'select': ['address_id'], 'supplier_id': supplier_id})

    if error is None:
        _set = {
            'address1': data['address1'],
            'address2': data['address2'],
            'postal_code': data['postal_code'],
            'city': data['city'],
            'country': data['country']
        }

        _, error = accounts.update_address({'set': _set, 'address_id': address_info['address_id']})

        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_ADDRESS_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('UPDATE_ADDRESS_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def create_address(data):
    _columns = {
        'address1': data['address1'],
        'address2': data['address2'] if 'address2' in data else None,
        'postal_code': data['postal_code'],
        'city': data['city'],
        'country': data['country'] if 'country' in data else None
    }

    res, error = accounts.create_address({'columns': _columns})

    if error is None:
        response = {
            "id": res
        }
        return response, 200
    else:
        response = {
            "errors": gettext('CREATE_ADDRESS_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def create_supplier(data):
    if 'database' in current_context and 'spreadsheet' in current_context:
        database = current_context.database
        spreadsheet = current_context.spreadsheet
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
        spreadsheet = _vars[7]

    _columns = {
        'name': data['name'],
        'bic': data['bic'] if 'bic' in data else None,
        'iban': data['iban'] if 'iban' in data else None,
        'duns': data['duns'] if 'duns' in data else None,
        'siret': data['siret'] if 'siret' in data else None,
        'siren': data['siren'] if 'siren' in data else None,
        'email': data['email'] if 'email' in data else None,
        'vat_number': data['vat_number'] if 'vat_number' in data else None,
        'form_id': data['form_id'] if 'form_id' in data else None,
        'address_id': data['address_id'] if 'address_id' in data else None,
        'document_lang': data['document_lang'] if 'document_lang' in data else 'fra',
        'get_only_raw_footer': data['get_only_raw_footer'] if 'get_only_raw_footer' in data else False
    }

    supplier = None
    if 'vat_number' in data:
        supplier = accounts.get_suppliers({'where': ['vat_number = %s'], 'data': [data['vat_number']]})

    if not supplier:
        res, error = accounts.create_supplier({'columns': _columns})

        if error is None:
            spreadsheet.update_supplier_ods_sheet(database)
            history.add_history({
                'module': 'accounts',
                'ip': request.remote_addr,
                'submodule': 'create_supplier',
                'user_info': request.environ['user_info'],
                'desc': gettext('SUPPLIER_CREATED', supplier=data['name'])
            })
            response = {
                "id": res
            }
            return response, 200
        else:
            response = {
                "errors": gettext('CREATE_SUPPLIER_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('CREATE_SUPPLIER_ERROR'),
            "message": gettext('SUPPLIER_VAT_NUMBER_ALREADY_EXISTS')
        }
        return response, 400


def retrieve_customers(data, module):
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'where': ['status <> %s', 'module = %s'] if module else ['status <> %s'],
        'data': ['DEL', module] if module else ['DEL'],
        'offset': data['offset'] if 'offset' in data else 0,
        'limit': data['limit'] if 'limit' in data else 'ALL'
    }
    if 'search' in data and data['search']:
        args['offset'] = ''
        args['where'].append(
            "(LOWER(name) LIKE '%%" + data['search'].lower() + "%%' OR "
            "LOWER(siret) LIKE '%%" + data['search'].lower() + "%%' OR "
            "LOWER(company_number) LIKE '%%" + data['search'].lower() + "%%' OR "
            "LOWER(siren) LIKE '%%" + data['search'].lower() + "%%' OR "
            "LOWER(vat_number) LIKE '%%" + data['search'].lower() + "%%')"
        )

    customers = accounts.retrieve_customers(args)
    response = {
        "customers": customers
    }
    return response, 200


def get_customer_by_id(customer_id):
    customer_info, error = accounts.get_customer_by_id({'customer_id': customer_id})

    if error is None:
        return customer_info, 200
    else:
        response = {
            "errors": gettext('GET_CUSTOMER_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def get_accounting_plan_by_customer_id(customer_id):
    accounting_plan, _ = accounts.get_accounting_plan_by_customer_id({'customer_id': customer_id})
    return accounting_plan, 200


def get_default_accounting_plan():
    accounting_plan, _ = accounts.get_default_accounting_plan()
    return accounting_plan, 200


def update_customer(customer_id, data):
    old_customer, error = accounts.get_customer_by_id({'customer_id': customer_id})

    if error is None:
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
        if 'company_number' in data:
            _set.update({'company_number': data['company_number']})
        if 'module' in data:
            _set.update({'module': data['module']})

        _, error = accounts.update_customer({'set': _set, 'customer_id': customer_id})

        if error is None:
            history.add_history({
                'module': 'accounts',
                'ip': request.remote_addr,
                'submodule': 'update_customer',
                'user_info': request.environ['user_info'],
                'desc': gettext('CUSTOMER_UPDATED', customer=data['name'] if 'name' in data else old_customer['name'])
            })
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_CUSTOMER_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('UPDATE_CUSTOMER_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def create_customer(data):
    _columns = {
        'name': data['name'],
        'siret': data['siret'],
        'siren': data['siren'],
        'vat_number': data['vat_number'],
        'company_number': data['company_number'],
        'module': data['module'] if 'module' in data else 'verifier',
        'address_id': data['address_id'] if 'address_id' in data else None
    }

    customer = accounts.retrieve_customers({'where': ['vat_number = %s'], 'data': [data['vat_number']]})

    if not customer:
        res, error = accounts.create_customer({'columns': _columns})

        if error is None:
            history.add_history({
                'module': 'accounts',
                'ip': request.remote_addr,
                'submodule': 'create_customer',
                'user_info': request.environ['user_info'],
                'desc': gettext('CUSTOMER_CREATED', customer=data['name'])
            })
            response = {
                "id": res
            }
            return response, 200
        else:
            response = {
                "errors": gettext('CREATE_CUSTOMER_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('CREATE_CUSTOMER_ERROR'),
            "message": gettext('CUSTOMER_VAT_NUMBER_ALREADY_EXISTS')
        }
    return response, 400


def delete_customer(customer_id):
    customer, error = accounts.get_customer_by_id({'customer_id': customer_id})

    if error is None:
        _, error = accounts.delete_customer({'customer_id': customer_id})
        if error is None:
            history.add_history({
                'module': 'accounts',
                'ip': request.remote_addr,
                'submodule': 'delete_customer',
                'user_info': request.environ['user_info'],
                'desc': gettext('CUSTOMER_DELETED', customer=customer['name'])
            })
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_CUSTOMER_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DELETE_CUSTOMER_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def delete_supplier(supplier_id):
    supplier, error = accounts.get_supplier_by_id({'supplier_id': supplier_id})

    if error is None:
        _, error = accounts.delete_supplier({'supplier_id': supplier_id})
        if error is None:
            history.add_history({
                'module': 'accounts',
                'ip': request.remote_addr,
                'submodule': 'delete_supplier',
                'user_info': request.environ['user_info'],
                'desc': gettext('SUPPLIER_DELETED', supplier=supplier['name'])
            })
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_SUPPLIER_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DELETE_SUPPLIER_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def import_suppliers(file):
    custom_id = retrieve_custom_from_url(request)

    filename = _Files.save_uploaded_file(file, current_app.config['UPLOAD_FOLDER'])
    custom_path = retrieve_custom_path(custom_id)

    cmd = 'bash ' + custom_path + '/bin/scripts/load_referencial.sh ' + filename
    with subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE) as res:
        _, err = res.communicate()

    if err.decode('utf-8'):
        response = {
            "errors": gettext('LOAD_SUPPLIER_REFERENCIAL_ERROR'),
            "message": err.decode('utf-8')
        }
        return response, 400
    try:
        os.remove(filename)
    except FileNotFoundError:
        pass
    return '', 200
