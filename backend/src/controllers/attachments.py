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

import os
import uuid
import pypdf
import magic
import base64

from flask_babel import gettext
from flask import current_app, request
from pdf2image import convert_from_path
from werkzeug.datastructures import FileStorage

from .. import shared
from ..controllers import history
from ..classes.Files import Files
from ..helpers import get_context_var
from ..models import attachments, splitter
from ..functions import check_extensions_mime, retrieve_custom_from_url


def handle_uploaded_file(files, document_id, batch_id, module, from_api=False, custom_id=False):
    if not custom_id:
        custom_id = retrieve_custom_from_url(request)

    docservers = get_context_var('docservers', 9)
    message, code = check_extensions_mime(files, custom_id, 'attachments')
    if code != 200:
        return message, code

    for file in files:
        if isinstance(file, FileStorage):
            _f = file
        elif isinstance(file, dict):
            _f = FileStorage(stream=open(file['file'], 'rb'), filename=file['filename'])
        else:
            _f = files[file]

        thumb_path = None
        original_filename = _f.filename
        filename = Files.save_uploaded_file(_f, shared.upload_path)
        if filename:
            file = Files.move_to_docservers(docservers, filename, attachments=True, module=module)
            if file:
                extension = os.path.splitext(original_filename)[1]
                if extension.lower() in ['.pdf', '.heif', '.heic']:
                    tmp_file = file
                    thumb_filename = str(uuid.uuid4()) + '.jpg'
                    if extension.lower() == '.pdf':
                        image = convert_from_path(file, first_page=0, last_page=1, dpi=200)[0]
                        with open(shared.tmp_path + thumb_filename, 'wb') as _f:
                            image.save(_f, 'JPEG')
                            tmp_file = shared.tmp_path + thumb_filename

                    docserver = docservers['VERIFIER_THUMB']
                    if module == 'splitter':
                        docserver = docservers['SPLITTER_THUMB']

                    thumb_path = Files.move_to_docservers_image(docserver, tmp_file, thumb_filename, copy=True)
                    thumb_path = thumb_path.replace('//', '/')
                    thumb_path = thumb_path.replace(docserver, '')

                    if os.path.isfile(tmp_file):
                        os.remove(tmp_file)

                path_docserver = docservers['VERIFIER_ATTACHMENTS']
                if module == 'splitter':
                    path_docserver = docservers['SPLITTER_ATTACHMENTS']

                file = file.replace(path_docserver, '')
                file = file.lstrip('/')

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
        docservers = get_context_var('docservers', 9)
        for attachment in _attachments:
            path = docservers['VERIFIER_ATTACHMENTS' ] + '/' + attachment['path']
            extension = os.path.splitext(attachment['filename'])[1]

            thumbnail_path = docservers['VERIFIER_THUMB'] + '/' + attachment['thumbnail_path'] if attachment.get('thumbnail_path') else None
            if os.path.isfile(path) and extension.lower() in ['.png', '.jpg', '.jpeg', '.gif']:
                with open(path, 'rb') as f:
                    attachment['thumb'] = base64.b64encode(f.read()).decode('utf-8')
            elif thumbnail_path and os.path.isfile(thumbnail_path):
                with open(thumbnail_path, 'rb') as f:
                    attachment['thumb'] = base64.b64encode(f.read()).decode('utf-8')

            if not os.path.isfile(path):
                continue

            mime = magic.Magic(mime=True)
            mime_type = mime.from_file(path)
            attachment['mime_type'] = mime_type
    return _attachments, 200


def get_attachments_by_batch_id(batch_id, get_thumb=True):
    _attachments = attachments.get_attachments_by_batch_id(batch_id)

    if _attachments and get_thumb:
        docservers = get_context_var('docservers', 9)
        for attachment in _attachments:
            path = docservers['SPLITTER_ATTACHMENTS' ] + '/' + attachment['path']

            if not os.path.isfile(path):
                continue

            thumbnail_path = docservers['SPLITTER_THUMB'] + '/' + attachment['thumbnail_path'] if attachment.get('thumbnail_path') else None
            extension = os.path.splitext(attachment['filename'])[1]
            if os.path.isfile(path) and extension.lower() in ['.png', '.jpg', '.jpeg', '.gif']:
                with open(path, 'rb') as f:
                    attachment['thumb'] = base64.b64encode(f.read()).decode('utf-8')
            elif thumbnail_path and os.path.isfile(thumbnail_path):
                with open(thumbnail_path, 'rb') as f:
                    attachment['thumb'] = base64.b64encode(f.read()).decode('utf-8')

            mime = magic.Magic(mime=True)
            mime_type = mime.from_file(path)
            attachment['mime_type'] = mime_type
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


def download_attachment(attachment_id, module):
    _attachment = attachments.get_attachment_by_id(attachment_id)

    if _attachment:
        mime = magic.Magic(mime=True)
        docservers = get_context_var('docservers', 9)

        path = docservers['VERIFIER_ATTACHMENTS'] + '/' + _attachment['path']
        if module == 'splitter':
            path = docservers['SPLITTER_ATTACHMENTS'] + '/' + _attachment['path']

        if not os.path.isfile(path):
            return None, ''

        mime_type = mime.from_file(path)
        with open(path, 'rb') as file:
            content = file.read()

        if not content:
            return None, ''
        return content, mime_type
    else:
        return None, ''


def unbind_attachment(args):
    docservers = get_context_var('docservers', 9)

    attachment = attachments.get_attachment_by_id(args['attachmentId'])
    document, _ = splitter.get_document_by_id({'select': ['batch_id'], 'id': args['newDocumentId']})
    if attachment and document:
        batch, _ = splitter.get_batch_by_id({'id': document['batch_id']})
        original_filepath = docservers['SPLITTER_ORIGINAL_DOC'] + '/' + batch['file_path']

        if os.path.isfile(original_filepath):
            pdf = pypdf.PdfReader(original_filepath, strict=False)
            max_source_page = len(pdf.pages)
            if batch:
                file_path = docservers['SPLITTER_ATTACHMENTS'] + '/' + attachment['path']
                thumb_folder = docservers['SPLITTER_THUMB'] + '/' + batch['batch_folder']
                batch_folder = docservers['SPLITTER_BATCHES'] + '/' + batch['batch_folder']
                if os.path.isfile(file_path):
                    extension = os.path.splitext(file_path)[1]
                    if extension.lower() == '.pdf':
                        images = convert_from_path(file_path, dpi=300)
                        for i, image in enumerate(images):
                            new_source_page = max_source_page + i + 1
                            full_filename = f"page-{new_source_page:03d}.jpg"

                            full_path = os.path.join(batch_folder, full_filename)
                            image.save(full_path, 'JPEG')

                            thumb_path = os.path.join(thumb_folder, full_filename)
                            image.save(thumb_path, 'JPEG', quality=50)

                            splitter.insert_page({
                                'source_page': new_source_page,
                                'document_id': args['newDocumentId'],
                                'path': batch['batch_folder'] + '/' + full_filename
                            })

                            # Merge attachment PDF with original PDF (needed for export)
                            merged_pdf = pypdf.PdfWriter()
                            for page in range(len(pdf.pages)):
                                merged_pdf.add_page(pdf.pages[page])

                            new_pdf = pypdf.PdfReader(file_path, strict=False)
                            for page in range(len(new_pdf.pages)):
                                merged_pdf.add_page(new_pdf.pages[page])
                            merged_pdf.write(original_filepath)

    return '', 200
