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

import os
import uuid
import magic
import base64
from flask_babel import gettext
from pdf2image import convert_from_path
from src.backend.models import attachments
from src.backend.controllers import history
from src.backend.classes.Files import Files
from werkzeug.datastructures import FileStorage
from src.backend.functions import check_extensions_mime
from flask import current_app, request, g as current_context
from src.backend import retrieve_custom_from_url, create_classes_from_custom_id


def handle_uploaded_file(files, document_id, batch_id, module, from_api=False):
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]

    message, code = check_extensions_mime(files, 'attachments')
    if code != 200:
        return message, code

    tmp_path = current_app.config['UPLOAD_FOLDER']
    for file in files:
        if isinstance(file, FileStorage):
            _f = file
        elif isinstance(file, dict):
            _f = FileStorage(stream=open(file['file'], 'rb'), filename=file['filename'])
        else:
            _f = files[file]

        thumb_path = None
        original_filename = _f.filename
        filename = Files.save_uploaded_file(_f, tmp_path)
        if filename:
            file = Files.move_to_docservers(docservers, filename, attachments=True)
            if file:
                extension = os.path.splitext(original_filename)[1]
                if extension.lower() in ['.pdf', '.heif', '.heic']:
                    tmp_file = file
                    thumb_filename = str(uuid.uuid4()) + '.jpg'
                    if extension.lower() == '.pdf':
                        image = convert_from_path(file, first_page=0, last_page=1, dpi=200)[0]
                        with open(docservers['TMP_PATH'] + thumb_filename, 'wb') as _f:
                            image.save(_f, 'JPEG')
                            tmp_file = docservers['TMP_PATH'] + thumb_filename

                    docserver = docservers['VERIFIER_THUMB']
                    if module == 'splitter':
                        docserver = docservers['SPLITTER_THUMB']
                    thumb_path = Files.move_to_docservers_image(docserver, tmp_file, thumb_filename, copy=True)
                    thumb_path = thumb_path.replace('//', '/')

                    if os.path.isfile(tmp_file):
                        os.remove(tmp_file)
                args = {
                    'columns': {
                        'path': file,
                        'document_id': document_id,
                        'batch_id': batch_id,
                        'thumbnail_path': thumb_path,
                        'filename': original_filename
                    }
                }
                attachments.create_attachment(args)

                if module == 'verifier':
                    desc = gettext('UPLOAD_ATTACHMENTS_VERIFIER', document_id=document_id)
                else:
                    desc = gettext('UPLOAD_ATTACHMENTS_SPLITTER', batch_id=batch_id)

                if from_api:
                    ip = '0.0.0.0'
                    user_info = 'mailcollect'
                else:
                    ip = request.remote_addr
                    user_info = request.environ['user_info']

                history.add_history({
                    'module': module,
                    'ip': ip,
                    'submodule': 'upload_attachments',
                    'user_info': user_info,
                    'desc': desc
                })
    return '', 200

def get_attachments_by_document_id(document_id, get_thumb=True):
    _attachments = attachments.get_attachments_by_document_id(document_id)

    if _attachments and get_thumb:
        for attachment in _attachments:
            extension = os.path.splitext(attachment['filename'])[1]
            if ('path' in attachment and os.path.isfile(attachment['path']) and
                    extension.lower() in ['.png', '.jpg', '.jpeg', '.gif']):
                with open(attachment['path'], 'rb') as f:
                    attachment['thumb'] = base64.b64encode(f.read()).decode('utf-8')
            elif ('thumbnail_path' in attachment and attachment['thumbnail_path']
                  and os.path.isfile(attachment['thumbnail_path'])):
                with open(attachment['thumbnail_path'], 'rb') as f:
                    attachment['thumb'] = base64.b64encode(f.read()).decode('utf-8')
    return _attachments, 200

def get_attachments_by_batch_id(batch_id, get_thumb=True):
    _attachments = attachments.get_attachments_by_batch_id(batch_id)

    if _attachments and get_thumb:
        for attachment in _attachments:
            extension = os.path.splitext(attachment['filename'])[1]
            if ('path' in attachment and os.path.isfile(attachment['path']) and
                    extension.lower() in ['.png', '.jpg', '.jpeg', '.gif']):
                with open(attachment['path'], 'rb') as f:
                    attachment['thumb'] = base64.b64encode(f.read()).decode('utf-8')
            elif ('thumbnail_path' in attachment and attachment['thumbnail_path']
                  and os.path.isfile(attachment['thumbnail_path'])):
                with open(attachment['thumbnail_path'], 'rb') as f:
                    attachment['thumb'] = base64.b64encode(f.read()).decode('utf-8')
    return _attachments, 200

def delete_attachment(attachment_id, module):
    _attachment = attachments.get_attachment_by_id(attachment_id)

    if _attachment:
        attachments.delete_attachment(attachment_id)

    history.add_history({
        'module': module,
        'ip': request.remote_addr,
        'submodule': 'delete_attachments',
        'user_info': request.environ['user_info'],
        'desc': gettext('DELETE_ATTACHMENTS', attachment_id=attachment_id)
    })
    return _attachment, 200

def download_attachment(attachment_id):
    _attachment = attachments.get_attachment_by_id(attachment_id)

    if _attachment:
        mime = magic.Magic(mime=True)
        mime_type = mime.from_file(_attachment['path'])
        with open(_attachment['path'], 'rb') as file:
            content = file.read()

        if not content:
            return None, ''
        return content, mime_type
    else:
        return None, ''