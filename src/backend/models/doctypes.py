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

# @dev : Oussama Brich <oussama.brich@edissyum.com>

from gettext import gettext
from src.backend.main import create_classes_from_current_config


def add_doc_type(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    doc_types, error = retrieve_doc_types({
        'where': ['key = %s', 'status = %s'],
        'data': [args['key'], 'OK']
    })

    if not doc_types:
        args = {
            'table': 'doc_types',
            'columns': {
                'type': args['type'],
                'key': args['key'],
                'label': args['label'],
                'code': args['code'],
            }
        }
        res = _db.insert(args)

        if not res:
            error = gettext('ADD_DOC_TYPE_ERROR')
        return res, error
    else:
        error = gettext('DOCTYPE_ALREADY_EXIST')

    return '', error


def retrieve_doc_types(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    doc_types = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['doc_types'],
        'where': ['status=%s'] if 'where' not in args else args['where'],
        'data': ['OK'] if 'data' not in args else args['data']
    })

    return doc_types, error


def update(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    res = _db.update({
        'table': ['doc_types'],
        'set': {
            'label': args['label'],
            'code': args['code'],
            'status': args['status'],
        },
        'where': ['key = %s'],
        'data': [args['key']]
    })

    if not res:
        error = gettext('UPDATE_DOCTYPE_ERROR')

    return res, error
