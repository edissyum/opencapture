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

import base64
from flask import current_app
from flask_babel import gettext
import worker_splitter_from_python
from src.backend.import_models import splitter
from src.backend.import_controllers import forms, outputs
from src.backend.main import create_classes_from_current_config
from src.backend.import_classes import _Files, _Splitter, _CMIS


def handle_uploaded_file(files, input_id):
    _vars = create_classes_from_current_config()
    _config = _vars[1]
    path = current_app.config['UPLOAD_FOLDER_SPLITTER']
    for file in files:
        f = files[file]
        filename = _Files.save_uploaded_file(f, path)
        worker_splitter_from_python.main({
            'file': filename,
            'config': current_app.config['CONFIG_FILE'],
            'input_id': input_id
        })

    return True


def retrieve_metadata():
    _vars = create_classes_from_current_config()
    _config = _vars[1]

    args = {}
    metadata, error = splitter.retrieve_metadata(args)

    response = {
        "metadata": metadata
    }
    return response, 200


def retrieve_batches(args):
    _vars = create_classes_from_current_config()
    _config = _vars[1]

    args['select'] = ['*', "to_char(creation_date, 'DD-MM-YYY " + gettext('AT') + " HH24:MI:SS') as batch_date"]

    batches, error_batches = splitter.retrieve_batches(args)
    count, error_count = splitter.count_batches()
    if not error_batches and not error_count:
        for index, batch in enumerate(batches):
            try:
                with open(batches[index]['first_page'], "rb") as image_file:
                    encoded_string = base64.b64encode(image_file.read())
                    batches[index]['image_url'] = encoded_string.decode("utf-8")
            except IOError:
                continue

        response = {
            "batches": batches,
            "count": count
        }
        return response, 200

    response = {
        "errors": "ERROR",
        "message": error_batches
    }
    return response, 401


def change_status(args):
    res = splitter.change_status(args)

    if res:
        return res, 200
    else:
        return res, 401


def retrieve_pages(page_id):
    _vars = create_classes_from_current_config()
    _cfg = _vars[1]
    page_lists = []
    previous_page = 0

    args = {
        'id': page_id
    }
    pages, error = splitter.get_batch_pages(args)
    if pages:
        for page_index, page in enumerate(pages):
            with open(pages[page_index]['image_path'], "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read())
                pages[page_index]['image_url'] = encoded_string.decode("utf-8")

                if page_index == 0:
                    page_lists.append([pages[page_index]])

                elif previous_page == pages[page_index]['split_document']:
                    page_lists[-1].append(pages[page_index])

                else:
                    page_lists.append([pages[page_index]])

                previous_page = pages[page_index]['split_document']

    response = {"page_lists": page_lists}

    return response, 200


def get_output_parameters(parameters):
    data = {}
    for parameter in parameters:
        if parameter['id'] == 'folder_out':
            data['folder_out'] = parameter['value']

        if parameter['id'] == 'separator':
            data['separator'] = parameter['value']

        if parameter['id'] == 'folder_out':
            data['folder_out'] = parameter['value']

        if parameter['id'] == 'filename':
            data['filename'] = parameter['value']

        if parameter['id'] == 'extension':
            data['extension'] = parameter['value']

    return data


def get_output_auth(auths):
    data = {}
    for auth in auths:
        if auth['id'] == 'cmis_ws':
            data['cmis_ws'] = auth['value']

        if auth['id'] == 'folder':
            data['folder'] = auth['value']

        if auth['id'] == 'login':
            data['login'] = auth['value']

        if auth['id'] == 'password':
            data['password'] = auth['value']

    return data


def validate(documents, metadata):
    now = _Files.get_now_date()
    _vars = create_classes_from_current_config()
    _cfg = _vars[1]

    batch = splitter.retrieve_batches({
        'id': metadata['id'],
        'page': None,
        'size': None
    })[0]

    form = forms.get_form_by_id(batch[0]['form_id'])
    """
        Split document
    """
    pages = _Splitter.get_split_pages(documents)

    if 'outputs' in form[0]:
        for output_id in form[0]['outputs']:
            output = outputs.get_output_by_id(output_id)
            parameters = get_output_parameters(output[0]['data']['options']['parameters'])

            if output:
                is_export_pdf_ok = True
                is_export_xml_ok = True
                """
                    Export PDF files
                """
                if output[0]['output_type_id'] == 'export_pdf':
                    """
                        Add PDF file names using masks
                    """
                    for index, document in enumerate(documents):
                        documents[index]['fileName'] = _Splitter.get_file_name(document, metadata, parameters, now)
                    res_file = _Files.export_pdf(pages, documents,
                                                 current_app.config['UPLOAD_FOLDER_SPLITTER']
                                                 + str(batch[0]['file_name']),
                                                 parameters['folder_out'], 1)
                    is_export_pdf_ok = res_file['OK']
                """
                    Export XML file
                """
                if output[0]['output_type_id'] == 'export_xml':
                    file_name = _Splitter.get_file_name(None, metadata, parameters, now)
                    res_xml = _Splitter.export_xml(documents, metadata, parameters['folder_out'], file_name, now)
                    is_export_xml_ok = res_xml['OK']

                if output[0]['output_type_id'] == 'export_alfresco':
                    auths = get_output_auth(output[0]['data']['options']['auth'])
                    cmis = _CMIS(auths['cmis_ws'], auths['login'], auths['password'], auths['folder'])

                    if is_export_pdf_ok:
                        for path in res_file['paths']:
                            cmis.create_document(path, 'application/pdf')

                    if is_export_xml_ok:
                        cmis.create_document(res_xml['path'], 'text/xml')

                """
                    Change status to END
                """
                if is_export_pdf_ok and is_export_xml_ok:
                    splitter.change_status({
                        'id': metadata['id'],
                        'status': 'END'
                    })
                else:
                    return {"OK": False}, 500

    return {"OK": True}, 200
