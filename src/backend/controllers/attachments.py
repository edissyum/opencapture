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
from src.backend.models import attachments
from src.backend.classes.Files import Files
from werkzeug.datastructures import FileStorage
from src.backend.functions import check_extensions_mime
from flask import current_app, request, g as current_context
from src.backend import retrieve_custom_from_url, create_classes_from_custom_id


def handle_uploaded_file(files, document_id):
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
        else:
            _f = files[file]
        original_filename = _f.filename
        filename = Files.save_uploaded_file(_f, tmp_path)
        if filename:
            file = Files.move_to_docservers(docservers, filename, attachments=True)
            if file:
                args = {
                    'columns': {
                        'path': file,
                        'document_id': document_id,
                        'filename': original_filename
                    }
                }
                attachments.create_attachment(args)
    return '', 200

def get_attachments_by_document_id(document_id):
    return attachments.get_attachments_by_document_id(document_id)