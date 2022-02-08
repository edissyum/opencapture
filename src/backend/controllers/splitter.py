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
import os.path
import shutil

import PyPDF4
from flask import current_app
from flask_babel import gettext
import worker_splitter_from_python
from src.backend.import_models import splitter, doctypes
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
    args['where'] = []
    args['data'] = []

    if 'status' in args and args['status'] is not None:
        args['where'].append("status = %s")
        args['data'].append(args['status'])

    if 'time' in args and args['time'] is not None:
        if args['time'] in ['today', 'yesterday']:
            args['where'].append(
                "to_char(creation_date, 'YYYY-MM-DD') = to_char(TIMESTAMP '" + args['time'] + "', 'YYYY-MM-DD')")
        else:
            args['where'].append("to_char(creation_date, 'YYYY-MM-DD') < to_char(TIMESTAMP 'yesterday', 'YYYY-MM-DD')")
    batches, error_batches = splitter.retrieve_batches(args)
    count, error_count = splitter.count_batches(args)
    if not error_batches and not error_count:
        for index, batch in enumerate(batches):
            batches[index]['form_label'] = forms.get_form_by_id(batch['form_id'])[0]['label']
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


def retrieve_documents(batch_id):
    _vars = create_classes_from_current_config()
    _cfg = _vars[1]
    res_documents = []

    args = {
        'id': batch_id
    }
    documents, error = splitter.get_batch_documents(args)
    if documents:
        for document in documents:
            document_pages = []
            doctype_key = None
            doctype_label = None

            args = {
                'id': document['id']
            }
            pages, error = splitter.get_documents_pages(args)
            if pages:
                for page_index, page in enumerate(pages):
                    with open(pages[page_index]['thumbnail'], "rb") as image_file:
                        encoded_string = base64.b64encode(image_file.read())
                        pages[page_index]['image_url'] = encoded_string.decode("utf-8")
                        document_pages.append(pages[page_index])

            dotypes = doctypes.retrieve_doctypes(
                {
                    'where': ['status = %s', 'key = %s'],
                    'data': ['OK', document['doctype_key']]
                }
            )[0]
            if len(dotypes[0]) > 0:
                doctype_key = dotypes[0]['key'] if dotypes[0]['key'] else None
                doctype_label = dotypes[0]['label'] if dotypes[0]['label'] else None

            res_documents.append({
                'data': document['data'],
                'pages': document_pages,
                'doctype_key': doctype_key,
                'doctype_label': doctype_label
            })

    response = {"documents": res_documents}

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
        'batch_id': None,
        'page': None,
        'size': None,
        'where': ['id = %s'],
        'data': [metadata['id']]
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


def get_split_methods():
    split_methods = _Splitter.get_split_methods()
    if len(split_methods) > 0:
        return split_methods, 200
    else:
        return split_methods, 401


def merge_batches(parent_id, batches):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    _config = _vars[1]

    parent_info = splitter.get_batch_by_id({'id': parent_id})[0]
    parent_filename = current_app.config['UPLOAD_FOLDER_SPLITTER'] + parent_info['file_name']
    parent_batch_pages = int(parent_info['page_number'])
    batch_folder = _config.cfg['SPLITTER']['docserverpath'] + '/batches/' + parent_info['batch_folder']
    parent_max_split_document = splitter.get_documents_pages({'select': ['MAX(split_document) as split_document'], 'id': parent_id})[0][0]['split_document']
    parent_max_source_page = splitter.get_documents_pages({'select': ['MAX(source_page) as split_document'], 'id': parent_id})[0][0]['split_document']

    parent_pdf = PyPDF4.PdfFileReader(parent_filename)
    merged_pdf = PyPDF4.PdfFileWriter()
    for page in range(parent_pdf.numPages):
        merged_pdf.addPage(parent_pdf.getPage(page))

    batches_info = []
    for batch in batches:
        batch_info = splitter.get_batch_by_id({'id': batch})[0]
        parent_batch_pages += batch_info['page_number']
        batches_info.append(batch_info)
        pdf = PyPDF4.PdfFileReader(current_app.config['UPLOAD_FOLDER_SPLITTER'] + batch_info['file_name'])
        for page in range(pdf.numPages):
            merged_pdf.addPage(pdf.getPage(page))

        pages = splitter.get_documents_pages({'id': batch})
        cpt = 0
        for page in pages[0]:
            if page:
                if cpt >= 1:
                    previous_split_document = pages[0][cpt - 1]['split_document']
                    if previous_split_document != page['split_document']:
                        parent_max_split_document += 1

                parent_max_source_page = parent_max_source_page + 1
                new_path = batch_folder + '/' + os.path.basename(page['thumbnail'])
                if not os.path.isfile(new_path):
                    shutil.copy(page['thumbnail'], new_path)

                splitter.insert_page({
                    'batch_id': parent_id,
                    'path': new_path,
                    'source_page': parent_max_source_page,
                    'count': parent_max_split_document + page['split_document']
                })

                splitter.change_status({
                    'id': batch,
                    'status': 'MERG'
                })

                cpt += 1
        parent_max_split_document += 1

    splitter.update_batch_page_number({'id': parent_id, 'number': parent_batch_pages})
    with open(parent_filename, 'wb') as file:
        merged_pdf.write(file)
