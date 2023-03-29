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

# @dev : Oussama Brich <oussama.brich@edissyum.com>

import re
import json
import pypdf
import base64
import shutil
import os.path
import datetime
import pandas as pd
from flask import current_app
from flask_babel import gettext
from flask import request, g as current_context
from src.backend.main_splitter import launch
from src.backend.import_models import splitter, doctypes, accounts
from src.backend.import_controllers import forms, outputs, user
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id
from src.backend.import_classes import _Files, _Splitter, _CMIS, _MEMWebServices, _OpenADS


def handle_uploaded_file(files, input_id, user_id):
    custom_id = retrieve_custom_from_url(request)
    path = current_app.config['UPLOAD_FOLDER_SPLITTER']

    for file in files:
        f = files[file]
        filename = _Files.save_uploaded_file(f, path, False)
        launch({
            'custom_id': custom_id,
            'input_id': input_id,
            'user_id': user_id,
            'file': filename,
        })

    return True


def launch_referential_update(form_data):
    if 'database' in current_context and 'log' in current_context and 'config' in current_context and 'docservers' in current_context:
        log = current_context.log
        config = current_context.config
        database = current_context.database
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        log = _vars[5]
        config = _vars[1]
        database = _vars[0]
        docservers = _vars[9]

    available_methods = docservers['SPLITTER_METADATA_PATH'] + "/metadata_methods.json"
    call_on_splitter_view = False
    try:
        with open(available_methods, encoding='UTF-8') as json_file:
            available_methods = json.load(json_file)
            for method in available_methods['methods']:
                if method['id'] == form_data['metadata_method']:
                    call_on_splitter_view = method['callOnSplitterView']
                    args = {
                        'log': log,
                        'config': config,
                        'database': database,
                        'method_data': method,
                        'docservers': docservers,
                        'form_id': form_data['form_id']
                    }
                    metadata_load = _Splitter.import_method_from_script(docservers['SPLITTER_METADATA_PATH'],
                                                                        method['script'],
                                                                        method['method'])
                    metadata_load(args)
    except Exception as e:
        response = {
            'status': False,
            "errors": gettext('LOAD_METADATA_ERROR'),
            "message": str(e)
        }
        return response, 500
    return {'OK': True, 'callOnSplitterView': call_on_splitter_view}, 200


def retrieve_referential(form_id):
    form = forms.get_form_by_id(form_id)
    if form and form[0]['settings']['metadata_method']:
        res = launch_referential_update({
            'form_id': form[0]['id'],
            'metadata_method': form[0]['settings']['metadata_method']
        })
        if res[1] != 200:
            return res
    metadata, error = splitter.retrieve_metadata({
        'type': 'referential',
        'form_id': str(form[0]['id'])
    })

    response = {
        "metadata": metadata
    }
    return response, 200


def retrieve_batches(args):
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]

    user_customers = user.get_customers_by_user_id(args['user_id'])

    if user_customers[1] != 200:
        return user_customers[0], user_customers[1]
    user_customers = user_customers[0]

    user_forms = user.get_forms_by_user_id(args['user_id'])
    if user_forms[1] != 200:
        return user_forms[0], user_forms[1]
    user_forms = user_forms[0]

    args['select'] = ['*', "to_char(creation_date, 'DD-MM-YYYY " + gettext('AT') + " HH24:MI:SS') as batch_date"]
    args['where'] = ['customer_id = ANY(%s)', 'form_id = ANY(%s)']
    args['data'] = [user_customers, user_forms]

    if 'search' in args and args['search']:
        args['where'].append("id = %s OR file_name like %s ")
        args['data'].append(args['search'])
        args['data'].append(f"%{args['search']}%")

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
            form = forms.get_form_by_id(batch['form_id'])
            batches[index]['form_label'] = form[0]['label'] if 'label' in form[0] else gettext('FORM_UNDEFINED')

            customer = accounts.get_customer_by_id({'customer_id': batch['customer_id']})
            batches[index]['customer_name'] = customer[0]['name'] if 'name' in customer[0] else gettext('CUSTOMER_UNDEFINED')

            try:
                thumbnail = f"{docservers['SPLITTER_THUMB']}/{batches[index]['batch_folder']}/{batches[index]['thumbnail']}"
                with open(thumbnail, 'rb') as image_file:
                    encoded_string = base64.b64encode(image_file.read())
                    batches[index]['thumbnail'] = encoded_string.decode("utf-8")
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


def download_original_file(batch_id):
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]

    res = splitter.get_batch_by_id({
        'id': batch_id
    })
    if res[0]:
        try:
            batch = res[0]
            file_path = docservers['SPLITTER_ORIGINAL_PDF'] + "/" + batch['file_path']
            with open(file_path, 'rb') as pdf_file:
                encoded_file = base64.b64encode(pdf_file.read()).decode('utf-8')
            return {'encodedFile': encoded_file, 'filename': batch['file_name']}, 200
        except Exception as e:
            response = {
                "errors": "ERROR",
                "message": str(e)
            }
            return response, 401

    response = {
        "errors": "ERROR",
        "message": res[1]
    }
    return response, 401


def update_status(args):
    if 'database' in current_context:
        database = current_context.database

    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    for _id in args['ids']:
        batches = splitter.get_batch_by_id({'id': _id})
        if len(batches[0]) < 1:
            response = {
                "errors": gettext('BATCH_NOT_FOUND'),
                "message": gettext('BATCH_ID_NOT_FOUND', id=_id)
            }
            return response, 401

    res = splitter.update_status(args)
    if res:
        return '', 200
    else:
        response = {
            "errors": gettext('UPDATE_STATUS_ERROR'),
            "message": ''
        }
        return response, 401


def change_form(args):
    res = splitter.change_form(args)

    if res:
        return res, 200
    else:
        return res, 401


def lock_batch(args):
    res = splitter.lock_batch(args)

    if res:
        return res, 200
    else:
        return res, 401


def remove_lock_by_user_id(user_id):
    _, error = splitter.remove_lock_by_user_id({
        'set': {"locked": False, "locked_by": None},
        'where': ['locked_by = %s'],
        'user_id': user_id
    })

    if error in [None, '']:
        return '', 200
    else:
        response = {
            "errors": gettext('REMOVE_LOCK_BY_USER_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def get_page_full_thumbnail(page_id):
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]

    res, error = splitter.get_page_by_id({
        'id': page_id
    })
    if not res:
        response = {
            "errors": "ERROR",
            "message": gettext(error)
        }
        return response, 401

    try:
        thumb_path = f"{docservers['SPLITTER_BATCHES']}/{res[0]['thumbnail']}"
        with open(thumb_path, 'rb') as image_file:
            encoded_string = base64.b64encode(image_file.read())
            full_thumbnail = encoded_string.decode("utf-8")
            return {'fullThumbnail': full_thumbnail}, 200
    except Exception as e:
        response = {
            "errors": "ERROR",
            "message": str(e)
        }
        return response, 401


def retrieve_documents(batch_id):
    res_documents = []
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]

    args = {
        'id': batch_id
    }
    documents, _ = splitter.get_batch_documents(args)
    if documents:
        for document in documents:
            document_pages = []
            doctype_key = None
            doctype_label = None

            args = {
                'id': document['id']
            }
            pages, _ = splitter.get_documents_pages(args)
            if pages:
                for page_index, _ in enumerate(pages):
                    thumbnail = f"{docservers['SPLITTER_THUMB']}/{pages[page_index]['thumbnail']}"
                    with open(thumbnail, 'rb') as image_file:
                        encoded_string = base64.b64encode(image_file.read())
                        pages[page_index]['thumbnail'] = encoded_string.decode("utf-8")
                        document_pages.append(pages[page_index])

            dotypes = doctypes.retrieve_doctypes({
                'where': ['status = %s', 'key = %s'],
                'data': ['OK', document['doctype_key']]
            })[0]

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
                'split_index': document['split_index'],
                'display_order': document['display_order']
            })

    response = {"documents": res_documents}

    return response, 200


def create_document(args):
    res = splitter.create_document({
        'data': '{}',
        'status': 'NEW',
        'doctype_key': None,
        'batch_id': args['batchId'],
        'split_index': args['splitIndex'],
        'display_order': args['displayOrder'],
    })
    if res:
        for update_data in args['updatedDocuments']:
            splitter.update_document({
                'id': update_data['id'],
                'display_order': update_data['displayOrder']
            })
    else:
        response = {
            "errors": gettext('ADD_DOCUMENT_ERROR'),
            "message": ''
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


def export_mem(auth_data, file_path, args, batch):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    host = auth_data['host']
    login = auth_data['login']
    password = auth_data['password']
    if host and login and password:
        ws = _MEMWebServices(
            host,
            login,
            password,
            _vars[5]
        )
        if os.path.isfile(file_path):
            args.update({
                'fileContent': open(file_path, 'rb').read(),
                'documentDate': str(pd.to_datetime(batch['creation_date']).date())
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
                    "errors": gettext('EXPORT_MEM_ERROR'),
                    "message": message['errors']
                }
                return response, 400
        else:
            response = {
                "errors": gettext('EXPORT_MEM_ERROR'),
                "message": ''
            }
            return response, 400
    else:
        response = {
            "errors": gettext('MEM_WS_INFO_EMPTY'),
            "message": ''
        }
        return response, 400


def export_pdf(batch, documents, parameters, pages, now, output_parameter, log):
    if 'docservers' in current_context and 'configurations' in current_context:
        docservers = current_context.docservers
        configurations = current_context.configurations
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]
        configurations = _vars[10]

    filename = docservers['SPLITTER_ORIGINAL_PDF'] + '/' + batch['file_path']
    pdf_filepaths = []
    doc_except_from_zip = []
    except_from_zip_doctype = ''
    zip_file_path = ''
    zip_filename = ''
    """
        Add PDF file to zip archive if enabled
    """
    if 'add_to_zip' in parameters and parameters['add_to_zip']:
        except_from_zip_doctype = re.search(r'\[Except=(.*?)\]', parameters['add_to_zip']) \
            if 'Except' in parameters['add_to_zip'] else ''
        mask_args = {
            'mask': parameters['add_to_zip'].split('[Except=')[0],
            'separator': parameters['separator'],
            'extension': 'zip'
        }
        zip_filename = _Splitter.get_value_from_mask(None, batch['metadata'], now, mask_args)

    documents_doctypes = []
    for index, document in enumerate(documents):
        """
            Add PDF file names using masks
        """
        documents[index]['metadata']['document_index'] = documents_doctypes.count(document['documentTypeKey']) + 1
        documents_doctypes.append(document['documentTypeKey'])
        mask_args = {
            'mask': parameters['filename'] if 'filename' in parameters else _Files.get_random_string(10),
            'separator': parameters['separator'],
            'extension': parameters['extension']
        }

        documents[index]['fileName'] = _Splitter.get_value_from_mask(document, batch['metadata'], now, mask_args)

        if not except_from_zip_doctype or except_from_zip_doctype.group(1) not in documents[index]['documentTypeKey']:
            pdf_filepaths.append({
                'input_path': parameters['folder_out'] + '/' + documents[index]['fileName'],
                'path_in_zip': documents[index]['fileName']
            })
        else:
            doc_except_from_zip.append(documents[index]['id'])

    export_pdf_res = _Files.export_pdf({
        'log': log,
        'pages': pages,
        'reduce_index': 1,
        'filename': filename,
        'documents': documents,
        'metadata': batch['metadata'],
        'lang': configurations['locale'],
        'folder_out': parameters['folder_out'],
        'output_parameter': output_parameter
    })

    if not export_pdf_res[0]:
        response = {
            "errors": gettext('EXPORT_PDF_ERROR'),
            "message": export_pdf_res[1]
        }
        return response, 400

    if 'add_to_zip' in parameters and parameters['add_to_zip'] and pdf_filepaths:
        zip_file_path = parameters['folder_out'] + '/' + zip_filename
        _Files.zip_files(pdf_filepaths, zip_file_path, True)

    return {'paths': export_pdf_res, 'doc_except_from_zip': doc_except_from_zip, 'zip_file_path': zip_file_path}, 200


def export_xml(documents, parameters, metadata, now):
    mask_args = {
        'mask': parameters['filename'],
        'separator': parameters['separator'],
        'extension': parameters['extension']
    }
    file_name = _Splitter.get_value_from_mask(None, metadata, now, mask_args)
    res_xml = _Splitter.export_xml(documents, metadata, parameters, file_name, now)
    if not res_xml[0]:
        response = {
            "errors": gettext('EXPORT_XML_ERROR'),
            "message": res_xml[1]
        }
        return response, 400
    return {'path': res_xml[1]}, 200


def save_infos(args):
    new_documents = []

    res = splitter.update_batch({
        'batch_id': args['batch_id'],
        'batch_metadata': args['batch_metadata'],
    })[0]
    if not res:
        response = {
            "errors": gettext('UPDATE_BATCH_ERROR'),
            "message": ''
        }
        return response, 401

    for document in args['documents']:
        if document['displayOrder']:
            res = splitter.update_document({
                'id': document['id'].split('-')[-1],
                'display_order': document['displayOrder'],
            })[0]
            if not res:
                response = {
                    "errors": gettext('UPDATE_DOCUMENTS_ERROR'),
                    "message": ''
                }
                return response, 401

        document['id'] = document['id'].split('-')[-1]
        res = splitter.update_document({
            'id': document['id'].split('-')[-1],
            'doctype_key': document['documentTypeKey'] if 'documentTypeKey' in document else None,
            'document_metadata': document['metadata'],
        })[0]
        if not res:
            response = {
                "errors": gettext('UPDATE_DOCUMENT_ERROR'),
                "message": ''
            }
            return response, 401

        """
            Save pages rotation
        """
        for page in document['pages']:
            res = splitter.update_page({
                'page_id': page['id'],
                'rotation':  page['rotation'],
            })[0]
            if not res:
                response = {
                    "errors": gettext('UPDATE_PAGES_ERROR'),
                    "message": ''
                }
                return response, 401

    """
        moved pages
    """
    for moved_page in args['moved_pages']:
        """ Check if page is added in a new document """
        if moved_page['isAddInNewDoc']:
            for new_document_item in new_documents:
                if new_document_item['tmp_id'] == moved_page['newDocumentId']:
                    moved_page['newDocumentId'] = new_document_item['id']

        res = splitter.update_page({
            'page_id': moved_page['pageId'],
            'document_id': moved_page['newDocumentId'],
        })[0]
        if not res:
            response = {
                "errors": gettext('UPDATE_PAGES_ERROR'),
                "message": ''
            }
            return response, 401

    """
        Deleted documents
    """
    for deleted_documents_id in args['deleted_documents_ids']:
        res = splitter.update_document({
            'id': deleted_documents_id.split('-')[-1],
            'status': 'DEL',
        })[0]
    if not res:
        response = {
            "errors": gettext('UPDATE_PAGES_ERROR'),
            "message": ''
        }
        return response, 401

    """
        Deleted pages
    """
    for deleted_pages_id in args['deleted_pages_ids']:
        res = splitter.update_page({
            'page_id': deleted_pages_id,
            'status': 'DEL',
        })[0]
        if not res:
            response = {
                "errors": gettext('UPDATE_PAGES_ERROR'),
                "message": ''
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


def test_openads_connection(args):
    _openads = _OpenADS(args['openads_api'], args['login'], args['password'])
    res = _openads.test_connection()
    if not res['status']:
        response = {
            'status': False,
            "errors": gettext('OPENADS_CONNECTION_ERROR'),
            "message": res['message']
        }
        return response, 401
    return {'status': True}, 200


def validate(args):
    now = _Files.get_now_date()
    if 'regex' in current_context and 'log' in current_context and 'docservers' in current_context:
        log = current_context.log
        regex = current_context.regex
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        regex = _vars[2]
        log = _vars[5]
        docservers = _vars[9]
    exported_files = []

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
    })[0][0]
    form = forms.get_form_by_id(batch['form_id'])
    pages = _Splitter.get_split_pages(args['documents'])
    batch['metadata'] = args['batchMetadata']
    if 'outputs' in form[0]:
        for output_id in form[0]['outputs']:
            output = outputs.get_output_by_id(output_id)
            parameters = get_output_parameters(output[0]['data']['options']['parameters'])
            if output:
                """
                    Export PDF files
                """
                if output[0]['output_type_id'] in ['export_pdf']:
                    res_export_pdf = export_pdf(batch, args['documents'], parameters, pages, now, output[0], log)
                    if res_export_pdf[1] != 200:
                        return res_export_pdf

                    exported_files.extend(res_export_pdf[0]['paths'])
                    exported_files.extend(res_export_pdf[0]['doc_except_from_zip'])
                    if res_export_pdf[0]['zip_file_path']:
                        exported_files.append(res_export_pdf[0]['zip_file_path'])
                    args['batchMetadata']['zip_filename'] = os.path.basename(res_export_pdf[0]['zip_file_path'])
                    args['batchMetadata']['doc_except_from_zip'] = res_export_pdf[0]['doc_except_from_zip']

                """
                    Export XML file
                """
                if output[0]['output_type_id'] in ['export_xml']:
                    parameters['doc_loop_regex'] = regex['splitter_doc_loop']
                    parameters['condition_regex'] = regex['splitter_condition']
                    parameters['empty_line_regex'] = regex['splitter_empty_line']
                    parameters['xml_comment_regex'] = regex['splitter_xml_comment']

                    res_export_xml = export_xml(args['documents'], parameters, args['batchMetadata'], now)
                    if res_export_xml[1] != 200:
                        return res_export_xml
                    exported_files.append(res_export_xml[0]['path'])
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
                    parameters = {
                        'extension': 'pdf',
                        'folder_out': docservers['TMP_PATH'],
                        'separator': cmis_params['separator'],
                        'filename': cmis_params['pdf_filename'],
                    }
                    res_export_pdf = export_pdf(batch, args['documents'], parameters, pages, now, output[0], log)
                    if res_export_pdf[1] != 200:
                        return res_export_pdf
                    for file_path in res_export_pdf[0]['paths']:
                        cmis_res = cmis.create_document(file_path, 'application/pdf')
                        if not cmis_res[0]:
                            log.error(f'File not sent : {file_path}')
                            log.error(f'CMIS Response : {str(cmis_res)}')
                            response = {
                                "errors": gettext('EXPORT_PDF_ERROR'),
                                "message": cmis_res[1]
                            }
                            return response, 500

                    """
                        Export xml for Alfresco
                    """
                    if cmis_params['xml_filename']:
                        parameters = {
                            'extension': 'xml',
                            'folder_out': docservers['TMP_PATH'],
                            'separator': cmis_params['separator'],
                            'filename': cmis_params['xml_filename'],
                            'doc_loop_regex': regex['splitter_doc_loop'],
                            'condition_regex': regex['splitter_condition'],
                            'empty_line_regex': regex['splitter_empty_line'],
                            'xml_comment_regex': regex['splitter_xml_comment'],
                        }
                        res_export_xml = export_xml(args['documents'], parameters, args['batchMetadata'], now)
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
                    Export to MEM Courrier
                """
                if output[0]['output_type_id'] in ['export_mem']:
                    mem_params = get_output_parameters(output[0]['data']['options']['parameters'])
                    mem_auth = get_output_parameters(output[0]['data']['options']['auth'])
                    parameters = {
                        'filename': 'TMP_PDF_EXPORT_TO_MEM',
                        'extension': 'pdf',
                        'separator': mem_params['separator'],
                        'file_name': mem_params['filename'],
                    }
                    res_export_pdf = export_pdf(batch, args['documents'], parameters, pages, now, output[0], log)

                    if res_export_pdf[1] != 200:
                        return res_export_pdf

                    subject_mask = parameters['subject']
                    for index, file_path in enumerate(res_export_pdf[0]['paths']):
                        mask_args = {
                            'mask': subject_mask,
                            'separator': ' ',
                            'format': parameters['format']
                        }
                        parameters['subject'] = _Splitter.get_value_from_mask(args['documents'][index], args['batchMetadata'],
                                                                              now, mask_args)
                        res_export_mem = export_mem(mem_auth, file_path, parameters, batch)
                        if res_export_mem[1] != 200:
                            return res_export_mem
                """
                    Export to OpenADS
                """
                if output[0]['output_type_id'] in ['export_openads']:
                    openads_auth = get_output_parameters(output[0]['data']['options']['auth'])
                    openads_params = get_output_parameters(output[0]['data']['options']['parameters'])
                    _openads = _OpenADS(openads_auth['openads_api'], openads_auth['login'], openads_auth['password'])

                    folder_id_mask = {
                        'mask': openads_params['folder_id'],
                        'separator': '',
                    }
                    folder_id = _Splitter.get_value_from_mask(None, args['batchMetadata'], now, folder_id_mask)
                    openads_res = _openads.check_folder_by_id(folder_id)
                    if not openads_res['status']:
                        response = {
                            "errors": gettext('CHECK_FOLDER_ERROR'),
                            "message": openads_res['error'] if 'error' in openads_res else gettext('FOLDER_DOES_NOT_EXIST')
                        }
                        return response, 500

                    parameters = {
                        'extension': 'pdf',
                        'folder_out': docservers['TMP_PATH'],
                        'separator': openads_params['separator'],
                        'filename': openads_params['pdf_filename'],
                    }
                    res_export_pdf = export_pdf(batch, args['documents'], parameters, pages, now, output[0], log)
                    if res_export_pdf[1] != 200:
                        return res_export_pdf

                    openads_res = _openads.create_documents(folder_id, res_export_pdf[0]['paths'], args['documents'])
                    if not openads_res['status']:
                        response = {
                            "errors": gettext('OPENADS_ADD_DOC_ERROR'),
                            "message": openads_res['error']
                        }
                        return response, 500
        """
            Zip all exported files if enabled
        """
        if form[0]['settings']['export_zip_file']:
            files_to_zip = []
            for file in exported_files:
                files_to_zip.append({
                    'input_path': file,
                    'path_in_zip': os.path.basename(file)
                })
            mask_args = {
                'mask': form[0]['settings']['export_zip_file'],
                'separator': '',
                'substitute': '_',
            }
            export_zip_file = _Splitter.get_value_from_mask(None, args['batchMetadata'], now, mask_args)
            _Files.zip_files(files_to_zip, export_zip_file, True)

        """
            Change status to END
        """
        splitter.update_status({
            'id': args['batchMetadata']['id'],
            'status': 'END'
        })

    return {"OK": True}, 200


def get_split_methods():
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]
    split_methods = _Splitter.get_split_methods(docservers)
    if len(split_methods) > 0:
        return split_methods, 200
    return split_methods, 401


def get_metadata_methods(form_method=False):
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]
    metadata_methods = _Splitter.get_metadata_methods(docservers, form_method)
    if len(metadata_methods) > 0:
        return metadata_methods, 200
    return metadata_methods, 401


def get_totals(status, user_id):
    totals = {}
    user_customers = user.get_customers_by_user_id(user_id)
    if user_customers[1] != 200:
        return user_customers[0], user_customers[1]
    user_customers = user_customers[0]

    user_forms = user.get_forms_by_user_id(user_id)
    if user_forms[1] != 200:
        return user_forms[0], user_forms[1]
    user_forms = user_forms[0]

    totals['today'], error = splitter.get_totals({
        'time': 'today',
        'status': status,
        'user_forms': user_forms,
        'user_customers': user_customers
    })
    totals['yesterday'], error = splitter.get_totals({
        'time': 'yesterday',
        'status': status,
        'user_forms': user_forms,
        'user_customers': user_customers
    })
    totals['older'], error = splitter.get_totals({
        'time': 'older',
        'status': status,
        'user_forms': user_forms,
        'user_customers': user_customers
    })

    if error is None:
        return totals, 200

    response = {
        "errors": gettext('GET_TOTALS_ERROR'),
        "message": gettext(error)
    }
    return response, 401


def merge_batches(parent_id, batches):
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]

    parent_info = splitter.get_batch_by_id({'id': parent_id})[0]
    parent_filename = docservers['SPLITTER_ORIGINAL_PDF'] + '/' + parent_info['file_path']
    parent_batch_documents = int(parent_info['documents_count'])
    parent_document_id = splitter.get_documents({'id': parent_id})[0][0]['id']
    parent_max_split_index = splitter.get_documents_max_split_index({'id': parent_id})[0][0]['split_index']
    parent_max_source_page = splitter.get_max_source_page({'id': parent_document_id})[0][0]['source_page']

    parent_pdf = pypdf.PdfReader(parent_filename)
    merged_pdf = pypdf.PdfWriter()
    for page in range(len(parent_pdf.pages)):
        merged_pdf.add_page(parent_pdf.pages[page])

    batches_info = []
    for batch in batches:
        batch_info = splitter.get_batch_by_id({'id': batch})[0]
        parent_batch_documents += batch_info['documents_count']
        batches_info.append(batch_info)
        pdf = pypdf.PdfReader(docservers['SPLITTER_ORIGINAL_PDF'] + '/' + batch_info['file_path'])
        for page in range(len(pdf.pages)):
            merged_pdf.add_page(pdf.pages[page])

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
                    parent_max_source_page = parent_max_source_page + 1
                    new_page = parent_info['batch_folder'] + '/' + 'page-' + str(parent_max_source_page).zfill(3) + '.jpg'

                    new_page_absolute = docservers['SPLITTER_BATCHES'] + '/' + new_page
                    if not os.path.isfile(new_page_absolute):
                        shutil.copy(docservers['SPLITTER_BATCHES'] + '/' + page['thumbnail'], new_page_absolute)

                    new_thumb_absolute = docservers['SPLITTER_THUMB'] + '/' + new_page
                    if not os.path.isfile(new_thumb_absolute):
                        shutil.copy(docservers['SPLITTER_THUMB'] + '/' + page['thumbnail'], new_thumb_absolute)

                    splitter.insert_page({
                        'document_id': document_id,
                        'path': new_page,
                        'source_page': parent_max_source_page
                    })

                splitter.update_status({
                    'id': batch,
                    'status': 'MERG'
                })

                cpt += 1
        parent_max_split_index += 1

    splitter.update_batch_documents_count({'id': parent_id, 'number': parent_batch_documents})
    with open(parent_filename, 'wb') as file:
        merged_pdf.write(file)
