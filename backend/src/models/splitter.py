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

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
# @dev : Oussama Brich <oussama.brich@edissyum.com>

import json
from ..controllers import user
from flask_babel import gettext
from ..helpers import get_context_var


def retrieve_metadata(args):
    database = get_context_var('database', 0)

    error = None
    metadata = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['metadata'],
        'where': ['type = %s', '(form_id = %s OR form_id = %s)'],
        'data': [args['type'], args['form_id'], 0]
    })

    return metadata, error


def create_document(args):
    database = get_context_var('database', 0)
    args = {
        'table': 'splitter_documents',
        'columns': args
    }
    res = database.insert(args)
    return res


def get_next_splitter_index(args):
    database = get_context_var('database', 0)

    res = database.select({
        'select': ['max(split_index) as max_split_index'],
        'table': ['splitter_documents'],
        'where': ['batch_id = %s'],
        'data': [args['batch_id']]
    })
    if res:
        split_index = res[0]['max_split_index']

    else:
        error = gettext('GET_MAX_SPLIT_INDEX_ERROR')
        return False, error
    return {'split_index': split_index + 1}, None


def add_batch(args):
    database = get_context_var('database', 0)
    args = {
        'table': 'splitter_batches',
        'columns': {
            'batch_folder': args['batch_folder'],
            'creation_date': args['creation_date'],
            'documents_count': args['documents_count'],
            'thumbnail': args['thumbnail'],
            'file_name': args['file_name'],
            'form_id': args['form_id'],
            'status': args['status']
        }
    }
    database.insert(args)
    return True, ''


def set_demand_number(demand_number):
    database = get_context_var('database', 0)

    error = None
    args = {
        'set': {
            'value': str(demand_number)
        },
        'table': ['settings'],
        'where': ['key = %s'],
        'data': ['ref_demand_number']
    }
    res = database.update(args)
    if not res:
        error = gettext('UPDATE_SETTINGS_ERROR')
        return res, error

    return {'OK': True}, error


def insert_page(args):
    database = get_context_var('database', 0)

    error = None
    args = {
        'table': 'splitter_pages',
        'columns': {
            'thumbnail': args['path'],
            'source_page': args['source_page'],
            'document_id': str(args['document_id'])
        }
    }
    res = database.insert(args)
    if not res:
        error = gettext('INSERT_PAGE_ERROR')
        return res, error

    return {'OK': True}, error


def retrieve_batches(args):
    database = get_context_var('database', 0)
    error = None

    query_args = {
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_batches'] if 'table' not in args else args['table'],
        'left_join': [] if 'left_join' not in args else args['left_join'],
        'where': ['*'] if 'where' not in args else args['where'],
        'data': ['*'] if 'data' not in args else args['data'],
        'group_by': ['splitter_batches.id'] if 'group_by' not in args else args['group_by'],
        'order_by': ['splitter_batches.creation_date DESC'] if 'order_by' not in args else args['order_by'],
        'limit': str(args['limit']) if 'limit' in args and args['limit'] else 'ALL',
        'offset': str(args['offset']) if 'offset' in args and args['offset'] else 0,
    }

    if args['batch_id']:
        query_args['where'].append('splitter_batches.id = %s')
        query_args['data'].append(str(args['batch_id']))

    batches = database.select(query_args)
    return batches, error


def count_batches(args):
    database = get_context_var('database', 0)
    error = None
    query_args = {
        'select': ['count(*)'],
        'table': ['splitter_batches'] if 'table' not in args else args['table'],
        'left_join': [] if 'left_join' not in args else args['left_join'],
        'where': ['*'] if 'where' not in args else args['where'],
        'data': ['*'] if 'data' not in args else args['data']
    }

    count = database.select(query_args)
    return count[0]['count'], error


def get_batch_by_id(args):
    database = get_context_var('database', 0)
    error = None
    batch = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_batches'],
        'where': ['id = %s'],
        'data': [args['id']]
    })
    if not batch:
        error = gettext('GET_DOCUMENT_BY_ID_ERROR')
    else:
        batch = batch[0]

    return batch, error


def get_document_by_id(args):
    database = get_context_var('database', 0)
    error = None
    batch = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_documents'],
        'where': ['id = %s'],
        'data': [args['id']]
    })
    if not batch:
        error = gettext('GET_DOCUMENT_BY_ID_ERROR')
    else:
        batch = batch[0]

    return batch, error


def get_batch_documents(args):
    database = get_context_var('database', 0)
    error = None

    pages = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_documents'],
        'where': ['status = %s', 'batch_id = %s'],
        'data': ['NEW', args['batch_id']],
        'order_by': ['display_order']
    })

    if not pages:
        error = gettext('GET_DOCUMENTS_ERROR')

    return pages, error


def get_page_by_id(args):
    database = get_context_var('database', 0)
    error = None

    pages = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_pages'],
        'where': ['id = %s'],
        'data': [args['id']]
    })

    if not pages:
        error = gettext('GET_PAGES_ERROR')

    return pages, error


def get_document_pages(args):
    database = get_context_var('database', 0)
    error = None

    pages = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_pages'],
        'where': ['status = %s', 'document_id = %s'],
        'data': ['NEW', args['document_id']],
        'order_by': ['document_id', 'display_order']
    })

    if not pages:
        error = gettext('GET_PAGES_ERROR')

    return pages, error


def get_documents(args):
    database = get_context_var('database', 0)
    error = None

    pages = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_documents'],
        'where': ['status = %s', 'batch_id = %s'],
        'data': ['NEW', args['id']],
        'order_by': ['batch_id']
    })

    if not pages:
        error = gettext('GET_DOCUMENT_ERROR')

    return pages, error


def get_documents_max_split_index(args):
    database = get_context_var('database', 0)
    error = None

    pages = database.select({
        'select': ['MAX(split_index) as split_index'],
        'table': ['splitter_documents'],
        'where': ['status = %s', 'batch_id = %s'],
        'data': ['NEW', args['id']]
    })

    if not pages:
        error = gettext('GET_DOCUMENT_MAX_SPLIT_INDEX_ERROR')

    return pages, error


def update_status(args):
    database = get_context_var('database', 0)

    args = {
        'table': ['splitter_batches'],
        'set': {
            'status': args['status']
        },
        'where': ['id = ANY(%s)'],
        'data': [args['ids']]
    }

    res = database.update(args)
    return res


def update_customer(args):
    database = get_context_var('database', 0)

    args = {
        'table': ['splitter_batches'],
        'set': {
            'customer_id': args['customer_id']
        },
        'where': ['id = %s'],
        'data': [args['batch_id']]
    }
    res = database.update(args)
    return res


def change_form(args):
    database = get_context_var('database', 0)

    args = {
        'table': ['splitter_batches'],
        'set': {
            'form_id': args['form_id']
        },
        'where': ['id = %s'],
        'data': [args['batch_id']]
    }

    res = database.update(args)
    return res


def lock_batch(args):
    database = get_context_var('database', 0)

    args = {
        'table': ['splitter_batches'],
        'set': {
            'locked': True,
            'locked_by': args['user_id']
        },
        'where': ['id = %s'],
        'data': [args['batch_id']]
    }

    res = database.update(args)
    return res


def update_document(data):
    database = get_context_var('database', 0)
    args = {
        'table': ['splitter_documents'],
        'where': ['id = %s'],
        'set': {},
        'data': [data['id']]
    }
    if 'status' in data:
        args['set']['status'] = data['status']
    if 'md5' in data:
        args['set']['md5'] = data['md5']
    if 'sha256' in data:
        args['set']['sha256'] = data['sha256']
    if 'doctype_key' in data:
        args['set']['doctype_key'] = data['doctype_key']
    if 'display_order' in data:
        args['set']['display_order'] = data['display_order']
    if 'document_metadata' in data:
        args['set']['data'] = json.dumps({
            "custom_fields": data['document_metadata']
        })

    res = database.update(args)
    return res


def update_page(data):
    database = get_context_var('database', 0)
    args = {
        'table': ['splitter_pages'],
        'set': {},
        'where': ['id = %s'],
        'data': [data['page_id']]
    }
    if 'status' in data:
        args['set']['status'] = data['status']
    if 'document_id' in data:
        args['set']['document_id'] = data['document_id']
    if 'rotation' in data:
        args['set']['rotation'] = data['rotation']
    if 'display_order' in data:
        args['set']['display_order'] = data['display_order']

    res = database.update(args)
    return res


def update_batch(args):
    database = get_context_var('database', 0)
    res = database.update({
        'table': ['splitter_batches'],
        'set': {
            'data': json.dumps({
                "custom_fields": args['batch_metadata']
            })
        },
        'where': ['id = %s'],
        'data': [args['batch_id']]
    })

    return res


def remove_lock_by_user_id(args):
    database = get_context_var('database', 0)

    data = {
        'table': ['splitter_batches'],
        'set': {
            'locked': False,
            'locked_by': None
        },
        'where': ['locked_by = %s'],
        'data': [args['user_id']]
    }

    res = database.update(data)
    return res


def remove_lock_by_batch_id(batch_id):
    database = get_context_var('database', 0)

    data = {
        'table': ['splitter_batches'],
        'set': {
            'locked': False,
            'locked_by': None
        },
        'where': ['id = %s'],
        'data': [batch_id]
    }

    res = database.update(data)
    return res


def update_batch_documents_count(args):
    database = get_context_var('database', 0)

    args = {
        'table': ['splitter_batches'],
        'set': {
            'documents_count': args['number']
        },
        'where': ['id = %s'],
        'data': [args['id']]
    }

    res = database.update(args)
    return res


def get_totals(args):
    database = get_context_var('database', 0)
    error = None
    select = []

    if 'status' in args and args['status']:
        where = ["customer_id = ANY(%s)", "form_id = ANY(%s)", "status = %s"]
        data = [args['user_customers'], args['user_forms'], args['status']]
    else:
        where = ["customer_id = ANY(%s)", "form_id = ANY(%s)", "status <> %s"]
        data = [args['user_customers'], args['user_forms'], 'DEL']

    if args['time'] in ['today', 'yesterday']:
        select = ['COUNT(id) as ' + args['time']]
        where.append("to_char(creation_date, 'YYYY-MM-DD') = to_char(TIMESTAMP '" + args['time'] + "', 'YYYY-MM-DD')")
    elif args['time'] == 'older':
        select = ['COUNT(id) as older']
        where.append("to_char(creation_date, 'YYYY-MM-DD') < to_char(TIMESTAMP 'yesterday', 'YYYY-MM-DD')")

    if 'search' in args and args['search']:
        where.append("(splitter_batches.id::TEXT = %s OR LOWER(file_name) like LOWER(%s)) ")
        data.append(args['search'])
        data.append(f"%{args['search']}%")

    total = database.select({
        'select': select,
        'table': ['splitter_batches'],
        'where': where,
        'data': data
    })[0]

    if not total:
        error = gettext('GET_TOTALS_ERROR')

    return total[args['time']], error


def get_totals_by_status(args):
    database = get_context_var('database', 0)
    error = None
    data = []
    select = ['COUNT(id) as total']

    if 'status' in args and args['status']:
        where = ["status = %s"]
        data = [args['status']]
    else:
        where = ["status <> 'DEL'"]

    if 'time' in args and args['time']:
        if args['time'] in ['today', 'yesterday']:
            where.append("to_char(creation_date, 'YYYY-MM-DD') = to_char(TIMESTAMP '" + args['time'] + "', 'YYYY-MM-DD')")
        elif args['time'] == 'older':
            where.append("to_char(creation_date, 'YYYY-MM-DD') < to_char(TIMESTAMP 'yesterday', 'YYYY-MM-DD')")

    if 'user_id' in args and args['user_id']:
        user_forms = user.get_forms_by_user_id(args['user_id'])
        if user_forms[1] == 200:
            user_forms = user_forms[0]
            where.append('splitter_batches.form_id = ANY(%s)')
            data.append(user_forms)

    if 'allowedCustomers' in args and args['allowedCustomers']:
        where.append('customer_id = ANY(%s)')
        data.append([int(c) for c in args['allowedCustomers']])

    if 'form_id' in args and args['form_id']:
        if args['form_id'] == 'no_form':
            where.append('splitter_batches.form_id is NULL')
        else:
            where.append('splitter_batches.form_id = %s')
            data.append(args['form_id'])

    if 'search' in args and args['search']:
        where.append("(splitter_batches.id::TEXT = %s OR LOWER(file_name) like LOWER(%s)) ")
        data.append(args['search'])
        data.append(f"%{args['search']}%")

    total = database.select({
        'select': select,
        'table': ['splitter_batches'],
        'where': where,
        'data': data
    })[0]

    if not total:
        error = gettext('GET_TOTALS_ERROR')

    return total, error
