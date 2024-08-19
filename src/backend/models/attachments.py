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

from flask_babel import gettext
from flask import request, g as current_context
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id

def create_attachment(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    error = None
    attachment = database.insert({
        'table': 'attachments',
        'columns': args['columns']
    })

    if not attachment:
        error = gettext('CREATE_ATTACHMENT_ERROR')

    return attachment, error

def get_attachments_by_document_id(document_id):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    attachments = database.select({
        'select': ['*'],
        'table': ['attachments'],
        'where': ["document_id = %s", "status not in ('DEL')"],
        'data': [document_id]
    })
    return attachments

def get_attachments_by_batch_id(batch_id):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    attachments = database.select({
        'select': ['*'],
        'table': ['attachments'],
        'where': ["batch_id = %s", "status not in ('DEL')"],
        'data': [batch_id]
    })
    return attachments

def get_attachment_by_id(attachment_id):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    attachment = database.select({
        'select': ['*'],
        'table': ['attachments'],
        'where': ['id = %s'],
        'data': [attachment_id]
    })
    return attachment[0]

def delete_attachment(attachment_id):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    attachment = database.update({
        'table': ['attachments'],
        'set': {
            'status': 'DEL'
        },
        'where': ['id = %s'],
        'data': [attachment_id]
    })
    return attachment
