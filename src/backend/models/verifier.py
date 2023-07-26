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

from flask import request, g as current_context
from flask_babel import gettext
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def get_document_by_id(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    document = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['documents'],
        'where': ['id = %s'],
        'data': [args['document_id']]
    })

    if not document:
        error = gettext('GET_DOCUMENT_BY_ID_ERROR')
    else:
        document = document[0]

    return document, error


def get_document_informations_by_token(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    error = None
    document_info = database.select({
        'select': ['status', 'document_ids'],
        'table': ['monitoring'],
        'where': ['token = %s'],
        'data': [args['token']]
    })

    if not document_info:
        error = gettext('GET_DOCUMENT_ID_AND_STATUS_BY_TOKEN_ERROR')
    else:
        document_info = document_info[0]
    return document_info, error


def get_documents(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    documents = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['documents'] if 'table' not in args else args['table'],
        'left_join': [] if 'left_join' not in args else args['left_join'],
        'where': ['1 = %s'] if 'where' not in args else args['where'],
        'data': ['1'] if 'data' not in args else args['data'],
        'order_by': ['documents.id DESC'] if 'order_by' not in args else args['order_by'],
        'group_by': ['documents.id'] if 'group_by' not in args else args['group_by'],
        'limit': str(args['limit']) if 'limit' in args else 'ALL',
        'offset': str(args['offset']) if 'offset' in args else 0
    })
    return documents


def get_total_documents(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    total = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['documents'] if 'table' not in args else args['table'],
        'left_join': [] if 'left_join' not in args else args['left_join'],
        'where': ['1 = %s'] if 'where' not in args else args['where'],
        'data': ['1'] if 'data' not in args else args['data'],
        'group_by': [] if 'group_by' not in args else args['group_by']
    })
    return total


def update_document(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    document = database.update({
        'table': ['documents'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['document_id']]
    })

    if document[0] is False:
        error = gettext('DOCUMENT_UPDATE_ERROR')

    return document, error


def update_documents(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    documents = database.update({
        'table': ['documents'],
        'set': args['set'],
        'where': args['where'],
        'data': args['data']
    })

    if documents[0] is False:
        error = gettext('DOCUMENT_UPDATE_ERROR')

    return documents, error


def get_totals(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    select = data = []

    if 'status' in args and args['status']:
        where = ["status = %s"]
        data = [args['status']]
    else:
        where = ["status <> 'DEL'"]

    if args['time'] in ['today', 'yesterday']:
        select = ['COUNT(id) as ' + args['time']]
        where.append("to_char(register_date, 'YYYY-MM-DD') = to_char(TIMESTAMP '" + args['time'] + "', 'YYYY-MM-DD')")
    elif args['time'] == 'older':
        select = ['COUNT(id) as older']
        where.append("to_char(register_date, 'YYYY-MM-DD') < to_char(TIMESTAMP 'yesterday', 'YYYY-MM-DD')")

    if 'allowedCustomers' in args and args['allowedCustomers']:
        where.append('customer_id IN (' + ','.join(map(str, args['allowedCustomers'])) + ')')

    if 'form_id' in args and args['form_id']:
        if args['form_id'] == 'no_form':
            where.append('documents.form_id is NULL')
        else:
            where.append('documents.form_id = %s')
            data.append(args['form_id'])

    total = database.select({
        'select': select,
        'table': ['documents'],
        'where': where,
        'data': data
    })[0]

    if not total:
        error = gettext('GET_TOTALS_ERROR')

    return total[args['time']], error


def update_status(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    args = {
        'table': ['documents'],
        'set': {
            'status': args['status']
        },
        'where': ['id = ANY(%s)'],
        'data': [args['ids']]
    }
    res = database.update(args)
    return res
