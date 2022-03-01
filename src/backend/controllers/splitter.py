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
import json
import os.path
import shutil
import datetime

import PyPDF4
import pandas as pd
from flask import current_app
from flask_babel import gettext
import worker_splitter_from_python
from src.backend.import_models import splitter, doctypes
from src.backend.import_controllers import forms, outputs
from src.backend.main import create_classes_from_current_config
from src.backend.import_classes import _Files, _Splitter, _CMIS, _MaarchWebServices


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

            if dotypes and len(dotypes[0]) > 0:
                doctype_key = dotypes[0]['key'] if dotypes[0]['key'] else None
                doctype_label = dotypes[0]['label'] if dotypes[0]['label'] else None

            res_documents.append({
                'pages': document_pages,
                'doctype_key': doctype_key,
                'doctype_label': doctype_label,
                'id': document['id'],
                'data': document['data'],
                'status': document['status'],
                'split_index': document['split_index']
            })

    response = {"documents": res_documents}

    return response, 200


def create_document(args):
    res = splitter.create_document({
        'data': '{}',
        'status': 'NEW',
        'doctype_key': None,
        'batch_id': args['batch_id'],
        'split_index': args['split_index'],
    })
    if not res:
        response = {
            "errors": gettext('ADD_DOCUMENT_ERROR'),
            "message": gettext('ADD_DOCUMENT_ERROR')
        }
        return response, 400

    return {"newDocumentId": res}, 200


def get_output_parameters(parameters):
    data = {}
    for parameter in parameters:
        if type(parameter['value']) is dict and 'id' in parameter['value']:
            data[parameter['id']] = parameter['value']['id']
        else:
            data[parameter['id']] = parameter['value']
    return data


def export_maarch(auth_data, file_path, args, batch):
    _vars = create_classes_from_current_config()
    host = auth_data['host']
    login = auth_data['login']
    password = auth_data['password']
    if host and login and password:
        ws = _MaarchWebServices(
            host,
            login,
            password,
            _vars[5],
            _vars[1]
        )
        if os.path.isfile(file_path):
            args.update({
                'fileContent': open(file_path, 'rb').read(),
                'documentDate': str(pd.to_datetime(batch[0]['creation_date']).date())
            })
            priority = ws.retrieve_priority(args['priority'])
            if priority:
                delays = priority['priority']['delays']
                process_limit_date = datetime.date.today() + datetime.timedelta(days=delays)
                args.update({
                    'processLimitDate': str(process_limit_date)
                })
            args.update({
                'customFields': {}
            })
            res, message = ws.insert_with_args(args)
            if res:
                return '', 200
            else:
                response = {
                    "errors": gettext('EXPORT_MAARCH_ERROR'),
                    "message": message['errors']
                }
                return response, 400
        else:
            response = {
                "errors": gettext('EXPORT_MAARCH_ERROR'),
                "message": gettext('EXPORT_MAARCH_ERROR')
            }
            return response, 400
    else:
        response = {
            "errors": gettext('MAARCH_WS_INFO_EMPTY'),
            "message": gettext('MAARCH_WS_INFO_EMPTY')
        }
        return response, 400


def export_pdf(batch, documents, parameters, metadata, pages, now, compress_type):
    _vars = create_classes_from_current_config()
    _cfg = _vars[1]
    filename = _cfg.cfg['GLOBAL']['docserverpath'] + '/splitter/original_pdf/' + batch[0]['file_path']

    for index, document in enumerate(documents):
        """
            Add PDF file names using masks
        """
        mask_args = {
            'mask': parameters['filename'] if 'filename' in parameters else _Files.get_random_string(10),
            'separator': parameters['separator'],
            'extension': parameters['extension']
        }
        documents[index]['fileName'] = _Splitter.get_mask_result(document, metadata, now, mask_args)
    paths = _Files.export_pdf(pages, documents, filename, parameters['folder_out'], compress_type, 1)

    if not paths:
        response = {
            "errors": gettext('EXPORT_PDF_ERROR'),
            "message": paths[1]
        }
        return response, 400
    return {'paths': paths}, 200


def export_xml(documents, parameters, metadata, now):
    mask_args = {
        'mask': parameters['filename'],
        'separator': parameters['separator'],
        'extension': parameters['extension']
    }
    file_name = _Splitter.get_mask_result(None, metadata, now, mask_args)
    res_xml = _Splitter.export_xml(documents, metadata, parameters['folder_out'], file_name, now)
    if not res_xml[0]:
        response = {
            "errors": gettext('EXPORT_XML_ERROR'),
            "message": res_xml[1]
        }
        return response, 400
    return {'path': res_xml[1]}, 200


def save_infos(args):
    _vars = create_classes_from_current_config()
    _cfg = _vars[1]
    new_documents = []
    """
        Save batch metadata
    """
    res = splitter.update_batch({
        'batch_id': args['batch_id'],
        'batch_metadata': args['batch_metadata'],
    })[0]
    if not res:
        response = {
            "errors": gettext('UPDATE_BATCH_ERROR'),
            "message": gettext('UPDATE_BATCH_ERROR')
        }
        return response, 401

    for document in args['documents']:
        """
            Save user added documents
        """
        if document['status'] == 'USERADD':
            res_splitter_index = splitter.get_next_splitter_index({'batch_id': args['batch_id']})
            if res_splitter_index[0]:
                new_document_id = splitter.create_document({
                    'batch_id': args['batch_id'],
                    'doctype_key': document['documentTypeKey'],
                    'split_index': res_splitter_index[0]['split_index'],
                    'data': json.dumps({'custom_fields': document['metadata']}),
                    'status': 'NEW',
                })
                new_documents.append({
                    'tmp_id': document['id'],
                    'id': new_document_id
                })
            else:
                response = {
                    "errors": gettext('ADD_DOCUMENT_ERROR'),
                    "message": gettext('ADD_DOCUMENT_ERROR')
                }
                return response, 401

        """
            Save documents metadata
        """
        document['id'] = document['id'].split('-')[-1]
        res = splitter.update_document({
            'document_id': document['id'].split('-')[-1],
            'doctype_key': document['documentTypeKey'],
            'document_metadata': document['metadata'],
        })[0]
        if not res:
            response = {
                "errors": gettext('UPDATE_DOCUMENT_ERROR'),
                "message": gettext('UPDATE_DOCUMENT_ERROR')
            }
            return response, 401
    """
        move pages
    """
    for movedPage in args['moved_pages']:
        """ Check if page is added in a new document """
        if movedPage['isAddInNewDoc']:
            for new_document_item in new_documents:
                if new_document_item['tmp_id'] == movedPage['newDocumentId']:
                    movedPage['newDocumentId'] = new_document_item['id']

        res = splitter.update_page({
            'page_id': movedPage['pageId'],
            'document_id': movedPage['newDocumentId'],
        })[0]
        if not res:
            response = {
                "errors": gettext('UPDATE_PAGES_ERROR'),
                "message": gettext('UPDATE_PAGES_ERROR')
            }
            return response, 401

    """
        Delete documents
    """
    for deleted_documents_id in args['deleted_documents_ids']:
        res = splitter.update_document({
            'document_id': deleted_documents_id.split('-')[-1],
            'status': 'DEL',
        })[0]
    if not res:
        response = {
            "errors": gettext('UPDATE_PAGES_ERROR'),
            "message": gettext('UPDATE_PAGES_ERROR')
        }
        return response, 401
    """
        Delete pages
    """
    for deleted_pages_id in args['deleted_pages_ids']:
        res = splitter.update_page({
            'page_id': deleted_pages_id,
            'status': 'DEL',
        })[0]
        if not res:
            response = {
                "errors": gettext('UPDATE_PAGES_ERROR'),
                "message": gettext('UPDATE_PAGES_ERROR')
            }
            return response, 401
    return True, 200


def test_cmis_connection(args):
    try:
        _CMIS(args['cmis_ws'], args['login'], args['password'], args['folder'])
    except Exception as e:
        response = {
            'status': False,
            "errors": gettext('CMIS_CONNECTION_ERROR'),
            "message": str(e)
        }
        return response, 200
    return {'status': True}, 200


def validate(args):
    print(args)
    now = _Files.get_now_date()
    _vars = create_classes_from_current_config()
    _cfg = _vars[1]

    """
    Save data before validate
    """
    save_response = save_infos({
        'documents': args['documents'],
        'batch_id': args['batchMetadata']['id'],
        'moved_pages': args['movedPages'],
        'batch_metadata': args['batchMetadata'],
        'deleted_pages_ids': args['deletedPagesIds'],
        'deleted_documents_ids': args['deletedDocumentsIds']
    })

    if save_response[1] != 200:
        return save_response

    batch = splitter.retrieve_batches({
        'batch_id': None,
        'page': None,
        'size': None,
        'where': ['id = %s'],
        'data': [args['batchMetadata']['id']]
    })[0]
    form = forms.get_form_by_id(batch[0]['form_id'])
    """
        Split document
    """
    pages = _Splitter.get_split_pages(args['documents'])

    if 'outputs' in form[0]:
        for output_id in form[0]['outputs']:
            output = outputs.get_output_by_id(output_id)
            parameters = get_output_parameters(output[0]['data']['options']['parameters'])
            if output:
                """
                    Export PDF files if required by output
                """
                if output[0]['output_type_id'] in ['export_pdf']:
                    res_export_pdf = export_pdf(batch, args['documents'], parameters, args['batchMetadata'], pages, now, output[0]['compress_type'])
                    if res_export_pdf[1] != 200:
                        return res_export_pdf
                """
                    Export XML file if required by output
                """
                if output[0]['output_type_id'] in ['export_xml']:
                    res_export_xml = export_xml(args['documents'], parameters, args['batchMetadata'], now)
                    if res_export_xml[1] != 200:
                        return res_export_xml
                """
                    Export to CMIS
                """
                if output[0]['output_type_id'] in ['export_cmis']:
                    cmis_auth = get_output_parameters(output[0]['data']['options']['auth'])
                    cmis_params = get_output_parameters(output[0]['data']['options']['parameters'])
                    cmis = _CMIS(cmis_auth['cmis_ws'],
                                 cmis_auth['login'],
                                 cmis_auth['password'],
                                 cmis_auth['folder'])
                    """
                        Export pdf for Alfresco
                    """
                    pdf_export_parameters = {
                        'extension': 'pdf',
                        'folder_out': _cfg.cfg['GLOBAL']['tmppath'],
                        'separator': cmis_params['separator'],
                        'filename': cmis_params['pdf_filename'],
                    }
                    res_export_pdf = export_pdf(batch, args['documents'], pdf_export_parameters, args['batchMetadata'], pages, now, output[0]['compress_type'])
                    if res_export_pdf[1] != 200:
                        return res_export_pdf
                    for file_path in res_export_pdf[0]['paths']:
                        cmis_res = cmis.create_document(file_path, 'application/pdf')
                        if not cmis_res[0]:
                            response = {
                                "errors": gettext('EXPORT_XML_ERROR'),
                                "message": cmis_res[1]
                            }
                            return response, 500
                    """
                        Export xml for Alfresco
                    """
                    xml_export_parameters = {
                        'separator': cmis_params['separator'],
                        'filename': cmis_params['xml_filename'],
                        'extension': 'xml',
                        'folder_out': _cfg.cfg['GLOBAL']['tmppath'],
                    }
                    res_export_xml = export_xml(args['documents'], xml_export_parameters, args['batchMetadata'], now)
                    if res_export_xml[1] != 200:
                        return res_export_xml
                    cmis_res = cmis.create_document(res_export_xml[0]['path'], 'text/xml')
                    if not cmis_res[0]:
                        response = {
                            "errors": gettext('EXPORT_XML_ERROR'),
                            "message": cmis_res[1]
                        }
                        return response, 500
                """
                    Export to Maarch
                """
                if output[0]['output_type_id'] in ['export_maarch']:
                    cmis_params = get_output_parameters(output[0]['data']['options']['parameters'])
                    maarch_auth = get_output_parameters(output[0]['data']['options']['auth'])
                    pdf_export_parameters = {
                        'filename': 'TMP_PDF_EXPORT_TO_MAARCH',
                        'extension': 'pdf',
                        'separator': cmis_params['separator'],
                        'file_name': cmis_params['filename'],
                    }
                    res_export_pdf = export_pdf(batch, args['documents'], pdf_export_parameters, args['batchMetadata'], pages, now, output[0]['compress_type'])
                    if res_export_pdf[1] != 200:
                        return res_export_pdf
                    subject_mask = parameters['subject']
                    for index, file_path in enumerate(res_export_pdf[0]['paths']):
                        mask_args = {
                            'mask': subject_mask,
                            'separator': ' ',
                            'format': parameters['format']
                        }
                        parameters['subject'] = _Splitter.get_mask_result(args['documents'][index], args['batchMetadata'],
                                                                          now, mask_args)
                        res_export_maarch = export_maarch(maarch_auth, file_path, parameters, batch)
                        if res_export_maarch[1] != 200:
                            return res_export_maarch
                """
                    Change status to END
                """
                splitter.change_status({
                    'id': args['batchMetadata']['id'],
                    'status': 'END'
                })

    return {"OK": True}, 200


def get_split_methods():
    _vars = create_classes_from_current_config()
    _config = _vars[1]
    split_methods = _Splitter.get_split_methods(_config)
    if len(split_methods) > 0:
        return split_methods, 200
    return split_methods, 401


def get_totals(status):
    totals = {}
    totals['today'], error = splitter.get_totals({'time': 'today', 'status': status})
    totals['yesterday'], error = splitter.get_totals({'time': 'yesterday', 'status': status})
    totals['older'], error = splitter.get_totals({'time': 'older', 'status': status})

    if error is None:
        return totals, 200

    response = {
        "errors": gettext('GET_TOTALS_ERROR'),
        "message": error
    }
    return response, 401


def merge_batches(parent_id, batches):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    _config = _vars[1]

    parent_info = splitter.get_batch_by_id({'id': parent_id})[0]
    parent_filename = _config.cfg['GLOBAL']['docserverpath'] + '/splitter/original_pdf/' + parent_info['file_path']
    parent_batch_pages = int(parent_info['page_number'])
    batch_folder = _config.cfg['GLOBAL']['docserverpath'] + '/splitter/batches/' + parent_info['batch_folder']
    parent_document_id = splitter.get_documents({'id': parent_id})[0][0]['id']
    parent_max_split_index = splitter.get_documents_max_split_index({'id': parent_id})[0][0]['split_index']
    parent_max_source_page = splitter.get_max_source_page({'id': parent_document_id})[0][0]['source_page']

    parent_pdf = PyPDF4.PdfFileReader(parent_filename)
    merged_pdf = PyPDF4.PdfFileWriter()
    for page in range(parent_pdf.numPages):
        merged_pdf.addPage(parent_pdf.getPage(page))

    batches_info = []
    for batch in batches:
        batch_info = splitter.get_batch_by_id({'id': batch})[0]
        parent_batch_pages += batch_info['page_number']
        batches_info.append(batch_info)
        pdf = PyPDF4.PdfFileReader(
            _config.cfg['GLOBAL']['docserverpath'] + '/splitter/original_pdf/' + batch_info['file_path'])
        for page in range(pdf.numPages):
            merged_pdf.addPage(pdf.getPage(page))

        documents = splitter.get_documents({'id': batch})
        cpt = 0
        for doc in documents[0]:
            if doc:
                if cpt >= 1:
                    previous_split_index = documents[0][cpt - 1]['split_index']
                    if previous_split_index != doc['split_index']:
                        parent_max_split_index += 1

                document_id = splitter.create_document({
                    'batch_id': parent_id,
                    'doctype_key': doc['doctype_key'],
                    'data': json.dumps({'custom_fields': doc['data']}),
                    'status': 'NEW',
                    'split_index': parent_max_split_index + doc['split_index']
                })

                for page in splitter.get_documents_pages({'id': doc['id']})[0]:
                    new_path = batch_folder + '/' + os.path.basename(page['thumbnail'])
                    parent_max_source_page = parent_max_source_page + 1
                    if not os.path.isfile(new_path):
                        shutil.copy(page['thumbnail'], new_path)

                    splitter.insert_page({
                        'document_id': document_id,
                        'path': new_path,
                        'source_page': parent_max_source_page
                    })

                splitter.change_status({
                    'id': batch,
                    'status': 'MERG'
                })

                cpt += 1
        parent_max_split_index += 1

    splitter.update_batch_page_number({'id': parent_id, 'number': parent_batch_pages})
    with open(parent_filename, 'wb') as file:
        merged_pdf.write(file)
