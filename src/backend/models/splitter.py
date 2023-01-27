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

import json
from flask import request
from flask_babel import gettext
from src.backend.main import create_classes_from_custom_id
from src.backend.functions import retrieve_custom_from_url


def retrieve_metadata(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]

    error = None
    metadata = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['metadata'],
        'where': ['type = %s', 'form_id = %s'],
        'data': [args['type'], args['form_id']],
    })

    return metadata, error


def create_document(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    args = {
        'table': 'splitter_documents',
        'columns': args
    }
    res = database.insert(args)
    return res


def get_next_splitter_index(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]

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
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    args = {
        'table': 'splitter_batches',
        'columns': {
            'batch_folder': args['batch_folder'],
            'creation_date': args['creation_date'],
            'documents_count': args['documents_count'],
            'thumbnail': args['thumbnail'],
            'file_name': args['file_name'],
            'form_id': args['form_id'],
            'status': args['status'],
        }
    }
    database.insert(args)
    return True, ''


def set_demand_number(demand_number):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]

    error = None
    args = {
        'set': {
            'value': str(demand_number),
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
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]

    error = None
    args = {
        'table': 'splitter_pages',
        'columns': {
            'document_id': str(args['document_id']),
            'thumbnail': args['path'],
            'source_page': args['source_page']
        }
    }
    res = database.insert(args)
    if not res:
        error = gettext('INSERT_PAGE_ERROR')
        return res, error

    return {'OK': True}, error


def retrieve_batches(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None

    query_args = {
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_batches'],
        'where': ['*'] if 'where' not in args else args['where'],
        'data': ['*'] if 'data' not in args else args['data'],
        'order_by': ['creation_date DESC']
    }

    if args['batch_id']:
        query_args['where'].append('id = %s')
        query_args['data'].append(str(args['batch_id']))
    if args['size']:
        query_args['limit'] = str(args['size'])
    if args['size'] and args['page']:
        query_args['offset'] = str(args['page'] * args['size'])

    batches = database.select(query_args)
    return batches, error


def count_batches(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None
    query_args = {
        'select': ['count(*)'],
        'table': ['splitter_batches'],
        'where': ['*'] if 'select' not in args else args['where'],
        'data': ['*'] if 'select' not in args else args['data'],
    }

    count = database.select(query_args)
    return count[0]['count'], error


def get_batch_by_id(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None
    batches = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_batches'],
        'where': ['id = %s'],
        'data': [args['id']]
    })[0]

    if not batches:
        error = gettext('GET_BATCH_ERROR')

    return batches, error


def get_batch_documents(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None

    pages = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_documents'],
        'where': ['status = %s', 'batch_id = %s'],
        'data': ['NEW', args['id']],
        'order_by': ['display_order'],
    })

    if not pages:
        error = gettext('GET_DOCUMENTS_ERROR')

    return pages, error


def get_page_by_id(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None

    pages = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_pages'],
        'where': ['id = %s'],
        'data': [args['id']],
    })

    if not pages:
        error = gettext('GET_PAGES_ERROR')

    return pages, error


def get_documents_pages(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None

    pages = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_pages'],
        'where': ['status = %s', 'document_id = %s'],
        'data': ['NEW', args['id']],
        'order_by': ['document_id']
    })

    if not pages:
        error = gettext('GET_PAGES_ERROR')

    return pages, error


def get_max_source_page(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None

    pages = database.select({
        'select': ['MAX(source_page) as source_page'],
        'table': ['splitter_pages'],
        'where': ['status = %s', 'document_id = %s'],
        'data': ['NEW', args['id']],
    })

    if not pages:
        error = gettext('GET_MAX_SOURCE_PAGE_VALUE_ERROR')

    return pages, error


def get_documents(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
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
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None

    pages = database.select({
        'select': ['MAX(split_index) as split_index'],
        'table': ['splitter_documents'],
        'where': ['status = %s', 'batch_id = %s'],
        'data': ['NEW', args['id']],
    })

    if not pages:
        error = gettext('GET_DOCUMENT_MAX_SPLIT_INDEX_ERROR')

    return pages, error


def change_status(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]

    args = {
        'table': ['splitter_batches'],
        'set': {
            'status': args['status']
        },
        'where': ['id = %s'],
        'data': [args['id']]
    }
    res = database.update(args)

    return res


def change_form(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]

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
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]

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
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    args = {
        'table': ['splitter_documents'],
        'where': ['id = %s'],
        'set': {},
        'data': [data['id']]
    }
    if 'status' in data:
        args['set']['status'] = data['status']
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
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
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
    res = database.update(args)

    return res


def update_batch(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
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
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]

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

def update_batch_documents_count(args):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]

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
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    database = _vars[0]
    error = None
    select = []

    if 'status' in args and args['status']:
        where = ["customer_id = ANY(%s)", "status = %s"]
        data = [args['user_customers'], args['status']]
    else:
        where = ["customer_id = ANY(%s)", "status <> %s"]
        data = [args['user_customers'], 'DEL']

    if args['time'] in ['today', 'yesterday']:
        select = ['COUNT(id) as ' + args['time']]
        where.append("to_char(creation_date, 'YYYY-MM-DD') = to_char(TIMESTAMP '" + args['time'] + "', 'YYYY-MM-DD')")
    elif args['time'] == 'older':
        select = ['COUNT(id) as older']
        where.append("to_char(creation_date, 'YYYY-MM-DD') < to_char(TIMESTAMP 'yesterday', 'YYYY-MM-DD')")

    total = database.select({
        'select': select,
        'table': ['splitter_batches'],
        'where': where,
        'data': data
    })[0]

    if not total:
        error = gettext('GET_TOTALS_ERROR')

    return total[args['time']], error
