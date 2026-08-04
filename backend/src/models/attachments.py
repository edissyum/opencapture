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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

from flask_babel import gettext
from ..helpers import get_context_var

def create_attachment(args):
    database = get_context_var('database', 0)

    error = None
    attachment = database.insert({
        'table': 'attachments',
        'columns': args['columns']
    })

    if not attachment:
        error = gettext('CREATE_ATTACHMENT_ERROR')

    return attachment, error

def get_attachments_by_document_id(document_id):
    database = get_context_var('database', 0)

    attachments = database.select({
        'select': ['*'],
        'table': ['attachments'],
        'where': ["document_id = %s", "status not in ('DEL')"],
        'data': [document_id]
    })
    return attachments

def get_attachments_by_batch_id(batch_id):
    database = get_context_var('database', 0)

    attachments = database.select({
        'select': ['*'],
        'table': ['attachments'],
        'where': ["batch_id = %s", "status not in ('DEL')"],
        'order_by': ['id DESC'],
        'data': [batch_id]
    })
    return attachments

def get_attachment_by_id(attachment_id):
    database = get_context_var('database', 0)

    attachment = database.select({
        'select': ['*'],
        'table': ['attachments'],
        'where': ['id = %s'],
        'data': [attachment_id]
    })
    return attachment[0]

def delete_attachment(attachment_id):
    database = get_context_var('database', 0)

    attachment = database.update({
        'table': ['attachments'],
        'set': {
            'status': 'DEL'
        },
        'where': ['id = %s'],
        'data': [attachment_id]
    })
    return attachment

def update_attachment(args):
    database = get_context_var('database', 0)

    attachment = database.update({
        'table': ['attachments'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['attachment_id']]
    })
    return attachment
