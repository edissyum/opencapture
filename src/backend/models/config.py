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
from gettext import gettext
from src.backend.main import create_classes_from_current_config


def retrieve_configurations(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    configurations = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['configurations'],
        'where': ['1=%s'] if 'where' not in args else args['where'],
        'data': ['1'] if 'data' not in args else args['data'],
        'order_by': ['id ASC'],
        'limit': str(args['limit']) if 'limit' in args else [],
        'offset': str(args['offset']) if 'offset' in args else [],
    })
    return configurations, error


def retrieve_docservers(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    configurations = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['docservers'],
        'where': ['1=%s'] if 'where' not in args else args['where'],
        'data': ['1'] if 'data' not in args else args['data'],
        'order_by': ['id ASC'],
        'limit': str(args['limit']) if 'limit' in args else [],
        'offset': str(args['offset']) if 'offset' in args else [],
    })

    return configurations, error


def retrieve_configuration_by_id(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    configurations = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['configurations'],
        'where': ['id = %s'],
        'data': [args['configuration_id']]
    })

    return configurations, error


def retrieve_docserver_by_id(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    configurations = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['docservers'],
        'where': ['id = %s'],
        'data': [args['docserver_id']]
    })

    return configurations, error


def update_configuration(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    configuration = _db.update({
        'table': ['configurations'],
        'set': {
            'data': json.dumps(args['data'])
        },
        'where': ['id = %s'],
        'data': [args['configuration_id']]
    })

    if configuration[0] is False:
        error = gettext('UPDATE_CONFIGURATION_ERROR')

    return configuration, error


def update_docserver(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    docserver = _db.update({
        'table': ['docservers'],
        'set': {
            'path': args['path'],
            'description': args['description'],
            'docserver_id': args['docserver_id']
        },
        'where': ['id = %s'],
        'data': [args['id']]
    })

    if docserver[0] is False:
        error = gettext('UPDATE_DOCSERVER_ERROR')

    return docserver, error
