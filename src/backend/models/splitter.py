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

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
# @dev : Oussama Brich <oussama.brich@edissyum.com>

import json
from src.backend.main import create_classes_from_current_config


def retrieve_metadata(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    error = None
    metadata = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['metadata'],
        'where': ['key = %s'],
        'data': ['referential'],
    })

    return metadata, error


def add_document(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    args = {
        'table': 'splitter_documents',
        'columns': {
            'batch_id': args['batch_id'],
            'split_index': args['split_index'],
            'status': args['status'],
            'doctype_key': args['doctype_key'],
            'data': args['data'],
        }
    }
    _db.insert(args)
    return True, ''


def add_batch(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    args = {
        'table': 'splitter_batches',
        'columns': {
            'batch_folder': args['batch_folder'],
            'creation_date': args['creation_date'],
            'page_number': args['page_number'],
            'first_page': args['first_page'],
            'file_name': args['file_name'],
            'form_id': args['form_id'],
            'status': args['status'],
        }
    }
    _db.insert(args)
    return True, ''


def get_demand_number():
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    error = None
    demand_number = 0
    settings = _db.select({
        'select': ['value'],
        'table': ['settings'],
        'where': ['key = %s'],
        'data': ['ref_demand_number']
    })
    if settings:
        demand_number = settings[0]['value']

    else:
        error = "ERROR : While getting settings"
    return {'demand_number': demand_number}, error


def set_demand_number(demand_number):
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    error = None
    args = {
        'set': {
            'value': str(demand_number),
        },
        'table': ['settings'],
        'where': ['key = %s'],
        'data': ['ref_demand_number']
    }
    res = _db.update(args)
    if not res:
        error = "ERROR : While updating settings"
        return res, error

    return {'OK': True}, error


def insert_referential(data):
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    error = None
    for referential in data:
        args = {
            'table': 'metadata',
            'columns': {
                'key': "referential",
                'data': json.dumps(referential),
            }
        }
        res = _db.insert(args)
        if not res:
            error = "ERROR : While inserting referential"
            return res, error

    return {'OK': True}, error


def insert_page(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    error = None
    args = {
        'table': 'splitter_pages',
        'columns': {
            'batch_id': str(args['batch_id']),
            'thumbnail': args['path'],
            'source_page': args['source_page'],
            'split_document': str(args['count']),
        }
    }
    res = _db.insert(args)
    if not res:
        error = "ERROR : While inserting new page"
        return res, error

    return {'OK': True}, error


def retrieve_batches(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
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

    batches = _db.select(query_args)
    return batches, error


def count_batches(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    query_args = {
        'select': ['count(*)'],
        'table': ['splitter_batches'],
        'where': ['*'] if 'select' not in args else args['where'],
        'data': ['*'] if 'select' not in args else args['data'],
    }

    count = _db.select(query_args)
    return count[0]['count'], error


def get_batch_by_id(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    batches = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_batches'],
        'where': ['id = %s'],
        'data': [args['id']]
    })[0]

    if not batches:
        error = "ERROR : While getting batch"

    return batches, error


def get_batch_documents(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    pages = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_documents'],
        'where': ['status = %s', 'batch_id = %s'],
        'data': ['NEW', args['id']],
        'order_by': ['split_index']
    })

    if not pages:
        error = "ERROR : While getting documents"

    return pages, error


def get_documents_pages(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    pages = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['splitter_pages'],
        'where': ['status = %s', 'document_id = %s'],
        'data': ['NEW', args['id']],
        'order_by': ['document_id']
    })

    if not pages:
        error = "ERROR : While getting pages"

    return pages, error


def change_status(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    args = {
        'table': ['splitter_batches'],
        'set': {
            'status': args['status']
        },
        'where': ['id = %s'],
        'data': [args['id']]
    }
    res = _db.update(args)

    return res


def update_batch_page_number(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    args = {
        'table': ['splitter_batches'],
        'set': {
            'page_number': args['number']
        },
        'where': ['id = %s'],
        'data': [args['id']]
    }
    res = _db.update(args)

    return res
