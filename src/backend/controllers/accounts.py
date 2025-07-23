# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# See LICENCE file at the root folder for more details.

# @dev: Nathan Cheval <nathan.cheval@outlook.fr>
# @dev: Oussama Brich <oussama.brich@edissyum.com>

import os
import csv
import json
import codecs
from unidecode import unidecode
from flask_babel import gettext
from flask import request, g as current_context
from src.backend.models import accounts, history
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def get_suppliers(_args):
    args = {
        'select': ['*', 'count(*) OVER() as total', 'CONCAT(lastname, \' \', firstname) as informal_name'],
        'where': ['status <> %s'],
        'data': ['DEL'],
        'offset': _args['offset'] if 'offset' in _args else 0,
        'limit': _args['limit'] if 'limit' in _args else 'ALL',
        'order_by': [_args['order']] if 'order' in _args else ''
    }

    if 'search' in _args and _args['search']:
        search = _args['search'].replace("'", "''")
        args['where'].append(
            "(LOWER(unaccent(name)) ILIKE unaccent('%%" + search.lower() + "%%') OR "
            "LOWER(siret) LIKE '%%" + search.lower() + "%%' OR "
            "LOWER(email) ILIKE '%%" + search.lower() + "%%' OR "
            "LOWER(phone) ILIKE '%%" + search.lower() + "%%' OR "
            "LOWER(lastname) ILIKE '%%" + search.lower() + "%%' OR "
            "LOWER(siren) LIKE '%%" + search.lower() + "%%' OR "
            "LOWER(bic) LIKE '%%" + search.lower() + "%%' OR "
            "LOWER(duns) LIKE '%%" + search.lower() + "%%' OR "
            "LOWER(rccm) LIKE '%%" + search.lower() + "%%' OR "
            "LOWER(vat_number) LIKE '%%" + search.lower() + "%%')"
        )

    if 'name' in _args and _args['name']:
        args['offset'] = ''
        name = _args['name'].replace("'", "''")
        args['where'].append("LOWER(unaccent(name)) ILIKE unaccent(%s)")
        args['data'].append("%%" + name.lower() + "%%")

    if 'lastname' in _args and _args['lastname']:
        args['offset'] = ''
        lastname = _args['lastname'].replace("'", "''")
        args['where'].append("LOWER(unaccent(lastname)) ILIKE unaccent(%s)")
        args['data'].append("%%" + lastname.lower() + "%%")

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
            if data['duns']:
                _set.update({'duns': data['duns']})
            else:
                _set.update({'duns': None})
        if 'default_currency' in data:
            _set.update({'default_currency': data['default_currency']})
        if 'bic' in data:
            _set.update({'bic': data['bic']})
        if 'rccm' in data:
            _set.update({'rccm': data['rccm']})
        if 'iban' in data:
            _set.update({'iban': data['iban']})
        if 'lastname' in data:
            _set.update({'lastname': data['lastname']})
        if 'firstname' in data:
            _set.update({'firstname': data['firstname']})
        if 'civility' in data:
            _set.update({'civility': data['civility']})
        if 'function' in data:
            _set.update({'function': data['function']})
        if 'email' in data:
            _set.update({'email': data['email']})
        if 'phone' in data:
            _set.update({'phone': data['phone']})
        if 'vat_number' in data:
            if data['vat_number']:
                _set.update({'vat_number': data['vat_number']})
            else:
                _set.update({'vat_number': None})
        if 'form_id' in data:
            _set.update({'form_id': data['form_id']})
        if 'get_only_raw_footer' in data:
            _set.update({'get_only_raw_footer': data['get_only_raw_footer']})
        if 'informal_contact' in data:
            _set.update({'informal_contact': data['informal_contact']})
        if 'document_lang' in data:
            _set.update({'document_lang': data['document_lang']})
        if 'skip_auto_validate' in data:
            _set.update({'skip_auto_validate': data['skip_auto_validate']})
        if 'default_accounting_plan' in data:
            _set.update({'default_accounting_plan': data['default_accounting_plan']})
        if 'positions' in data:
            _set.update({'positions': data['positions']})
        if 'pages' in data:
            _set.update({'pages': data['pages']})

        if 'vat_number' in _set or 'duns' in _set:
            existing_suppliers = accounts.get_suppliers({
                'where': ['vat_number = %s OR duns = %s'],
                'data': [_set['vat_number'], _set['duns']]
            })
            for existing_supplier in existing_suppliers:
                if existing_supplier['id'] != supplier_id:
                    response = {
                        "errors": gettext('UPDATE_SUPPLIER_ERROR'),
                        "message": gettext('SUPPLIER_VAT_NUMBER_ALREADY_EXISTS')
                    }
                    return response, 400

        _, error = accounts.update_supplier({'set': _set, 'supplier_id': supplier_id})

        if error is None:
            history.add_history({
                'module': 'accounts',
                'ip': request.remote_addr,
                'submodule': 'update_supplier',
                'user_info': request.environ['user_info'],
                'desc': gettext('SUPPLIER_UPDATED', supplier=data['name'] if 'name' in data else old_supplier['name'])
            })
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
    else:
        response = {
            "errors": gettext('UPDATE_SUPPLIER_POSITIONS_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def update_address(address_id, data):
    _, error = accounts.get_address_by_id({'address_id': address_id})

    if error is None:
        _set = {}
        if 'address1' in data:
            _set.update({'address1': data['address1']})
        if 'address2' in data:
            _set.update({'address2': data['address2']})
        if 'postal_code' in data:
            _set.update({'postal_code': data['postal_code']})
        if 'city' in data:
            _set.update({'city': data['city']})
        if 'country' in data:
            _set.update({'country': data['country']})

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
        if 'address1' in data and 'address2' in data and 'postal_code' in data and 'city' in data and 'country' in data:
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
        return '', 200
    else:
        response = {
            "errors": gettext('UPDATE_ADDRESS_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def create_address(data):
    _columns = {
        'address1': data['address1'] if 'address2' in data else None,
        'address2': data['address2'] if 'address2' in data else None,
        'postal_code': data['postal_code'] if 'postal_code' in data else None,
        'city': data['city'] if 'city' in data else None,
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
    _columns = {
        'name': data['name'],
        'bic': data['bic'] if 'bic' in data else None,
        'iban': data['iban'] if 'iban' in data else None,
        'rccm': data['rccm'] if 'rccm' in data else None,
        'siret': data['siret'] if 'siret' in data else None,
        'siren': data['siren'] if 'siren' in data else None,
        'email': data['email'] if 'email' in data else None,
        'phone': data['phone'] if 'phone' in data else None,
        'form_id': data['form_id'] if 'form_id' in data else None,
        'lastname': data['lastname'] if 'lastname' in data else None,
        'function': data['function'] if 'function' in data else None,
        'civility': data['civility'] if 'civility' in data else None,
        'firstname': data['firstname'] if 'firstname' in data else None,
        'address_id': data['address_id'] if 'address_id' in data else None,
        'document_lang': data['document_lang'] if 'document_lang' in data else 'fra',
        'default_currency': data['default_currency'] if 'default_currency' in data else None,
        'informal_contact': data['informal_contact'] if 'informal_contact' in data else False,
        'get_only_raw_footer': data['get_only_raw_footer'] if 'get_only_raw_footer' in data else False,
        'default_accounting_plan': data['default_accounting_plan'] if 'default_accounting_plan' in data else None
    }

    if 'duns' in data and data['duns']:
        _columns.update({'duns': data['duns']})

    if 'vat_number' in data and data['vat_number']:
        _columns.update({'vat_number': data['vat_number']})

    supplier = None
    if 'vat_number' in data or 'duns' in data:
        if data['vat_number']:
            supplier = accounts.get_suppliers({'where': ['vat_number = %s'], 'data': [data['vat_number']]})
        if not supplier and 'duns' in data and data['duns']:
            supplier = accounts.get_suppliers({'where': ['duns = %s'], 'data': [data['duns']]})

    if not supplier:
        res, error = accounts.create_supplier({'columns': _columns})

        if error is None:
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
            "(LOWER(unaccent(name)) LIKE unaccent('%%" + data['search'].lower() + "%%') OR "
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


def get_currency_code():
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]

    file_path = docservers['REFERENTIALS_PATH'] + '/CURRENCY_CODE.csv'
    currency_code = {}
    if os.path.exists(file_path):
        with open(docservers['REFERENTIALS_PATH'] + '/CURRENCY_CODE.csv', encoding='UTF-8') as currency_file:
            sep = str(csv.Sniffer().sniff(currency_file.read()).delimiter)
            currency_file.seek(0)
            csv_reader = csv.reader(currency_file, delimiter=sep)
            for row in csv_reader:
                currency_code[row[0]] = row[1]
    return currency_code, 200


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
        accounts.delete_supplier({'supplier_id': supplier_id})
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


def import_suppliers(args):
    for file in args['files']:
        stream = codecs.iterdecode(args['files'][file].stream, 'utf-8')
        for cpt, row in enumerate(csv.reader(stream, dialect=csv.excel)):
            if args['skip_header'] and cpt == 0:
                continue
            footer_coherence = row[args['selected_columns'].index('footer_coherence')]

            get_only_raw_footer = True
            if footer_coherence == 'True' or footer_coherence == 'true':
                get_only_raw_footer = False

            duns = row[args['selected_columns'].index('duns')] if not row[args['selected_columns'].index('duns')] == '' else None
            vat_number = row[args['selected_columns'].index('vat_number')] if not row[args['selected_columns'].index('vat_number')] == '' else None

            account = {
                'info': {
                    'name': row[args['selected_columns'].index('name')],
                    'siret': row[args['selected_columns'].index('siret')],
                    'siren': row[args['selected_columns'].index('siren')],
                    'email': row[args['selected_columns'].index('email')],
                    'bic': row[args['selected_columns'].index('bic')],
                    'rccm': row[args['selected_columns'].index('rccm')],
                    'duns': duns,
                    'iban': row[args['selected_columns'].index('iban')],
                    'get_only_raw_footer': get_only_raw_footer,
                    'vat_number': vat_number,
                    'document_lang': row[args['selected_columns'].index('document_lang')],
                    'default_currency': row[args['selected_columns'].index('default_currency')]
                },
                'address': {
                    'address1': row[args['selected_columns'].index('address1')],
                    'address2': row[args['selected_columns'].index('address2')],
                    'postal_code': row[args['selected_columns'].index('postal_code')],
                    'city': row[args['selected_columns'].index('city')],
                    'country': row[args['selected_columns'].index('country')]
                }
            }

            third_party = accounts.get_suppliers({'where': ['vat_number = %s OR duns = %s'], 'data': [account['info']['vat_number'], account['info']['duns']]})
            if third_party:
                accounts.update_supplier({'set': account['info'], 'supplier_id': third_party[0]['id']})
                accounts.update_address({'set': account['address'], 'address_id': third_party[0]['address_id']})
            else:
                address_id, _ = accounts.create_address({'columns': account['address']})
                account['info']['address_id'] = address_id
                accounts.create_supplier({'columns': account['info']})
    return '', 200


def fill_row(row, supplier, address, ind):
    if ind == 'get_only_raw_footer':
        row.append(not supplier[ind])
    elif ind in supplier:
        if supplier[ind]:
            supplier[ind] = unidecode(supplier[ind])
        row.append(supplier[ind])
    elif ind in address:
        if address[ind]:
            address[ind] = unidecode(address[ind])
        row.append(address[ind])
    else:
        row.append('')
    return row


def fill_reference_file():
    if 'docservers' in current_context and 'config' in current_context:
        docservers = current_context.docservers
        config = current_context.config
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]
        config = _vars[1]

    file_path = docservers['REFERENTIALS_PATH'] + '/' + config['REFERENCIAL']['referencialsupplierdocument']
    referencial_index = docservers['REFERENTIALS_PATH'] + '/' + config['REFERENCIAL']['referencialsupplierindex']
    suppliers = get_suppliers({})

    if os.path.exists(file_path):
        os.remove(file_path)

    index = []
    header = []
    address = {}

    with open(referencial_index, 'r') as json_f:
        indexes = json.load(json_f)
        for ind in indexes:
            index.append(ind)
            header.append(indexes[ind])

    with open(file_path, 'a') as file:
        writer = csv.writer(file, delimiter=';')
        writer.writerow(header)
        for supplier in suppliers[0]['suppliers']:
            row = []
            if supplier['address_id']:
                address = get_address_by_id(supplier['address_id'])
                if address and address[0]:
                    address = address[0]

            for ind in index:
                if ind == 'lang':
                    ind = 'document_lang'
                row = fill_row(row, supplier, address, ind)
            writer.writerow(row)
    return '', 200


def get_civilities():
    return accounts.get_civilities()

def delete_civility(civility_id):
    civility = accounts.get_civility_by_id({'civility_id': civility_id})
    if civility:
        accounts.delete_civility({'civility_id': civility_id})
        history.add_history({
            'module': 'accounts',
            'ip': request.remote_addr,
            'submodule': 'delete_civility',
            'user_info': request.environ['user_info'],
            'desc': gettext('CIVILITY_DELETED', civility=civility[0]['label'])
        })
        return '', 200
    else:
        response = {
            "errors": gettext('DELETE_CIVILITY_ERROR'),
            "message": gettext('CIVILITY_NOT_FOUND')
        }
        return response, 400

def create_civility(data):
    civility = accounts.get_civility_by_label({'label': data['label']})
    if not civility:
        res, error = accounts.create_civility({'columns': {'label': data['label']}})
        if error is None:
            history.add_history({
                'module': 'accounts',
                'ip': request.remote_addr,
                'submodule': 'create_civility',
                'user_info': request.environ['user_info'],
                'desc': gettext('CIVILITY_CREATED', civility=data['label'])
            })
            response = {
                "id": res
            }
            return response, 200
        else:
            response = {
                "errors": gettext('CREATE_CIVILITY_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('CREATE_CIVILITY_ERROR'),
            "message": gettext('CIVILITY_ALREADY_EXISTS')
        }
        return response, 400