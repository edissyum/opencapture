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

# @dev : Oussama BRICH <oussama.brich@edissyum.com>

import os
import re
import pandas as pd
from datetime import datetime
from flask_babel import gettext
from src.backend.import_classes import _Splitter, _Files, _CMIS, _MEMWebServices, _OpenADS


def get_output_parameters(parameters):
    data = {}
    for parameter in parameters:
        if type(parameter['value']) is dict and 'id' in parameter['value']:
            data[parameter['id']] = parameter['value']['id']
        else:
            data[parameter['id']] = parameter['value']
    return data


def export_pdf(batch, documents, parameters, pages, now, output_parameter, log, docservers, configurations):
    filename = docservers['SPLITTER_ORIGINAL_PDF'] + '/' + batch['file_path']
    pdf_filepaths = []
    zip_except_documents = []
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
        documents[index]['metadata']['document_index'] = documents_doctypes.count(document['doctypeKey']) + 1
        documents_doctypes.append(document['doctypeKey'])
        mask_args = {
            'mask': parameters['filename'] if 'filename' in parameters else _Files.get_random_string(10),
            'separator': parameters['separator'],
            'extension': parameters['extension']
        }

        documents[index]['fileName'] = _Splitter.get_value_from_mask(document, batch['metadata'], now, mask_args)

        if not except_from_zip_doctype or except_from_zip_doctype.group(1) not in documents[index]['doctypeKey']:
            pdf_filepaths.append({
                'input_path': parameters['folder_out'] + '/' + documents[index]['fileName'],
                'path_in_zip': documents[index]['fileName']
            })
        else:
            zip_except_documents.append(documents[index]['id'])

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

    return {'paths': export_pdf_res, 'zip_except_documents': zip_except_documents, 'zip_file_path': zip_file_path}, 200


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


def export_mem(auth_data, file_path, args, batch, custom_id, log):
    host = auth_data['host']
    login = auth_data['login']
    password = auth_data['password']
    if host and login and password:
        ws = _MEMWebServices(
            host,
            login,
            password,
            log
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


def export_pdf_files(batch, data, parameters, pages, now, output, log, docservers, configurations, regex):
    res_export_pdf = export_pdf(batch, data['documents'], parameters, pages, now, output, log, docservers, configurations)
    if res_export_pdf[1] != 200:
        return res_export_pdf

    exported_files = []
    exported_files.extend(res_export_pdf[0]['paths'])
    exported_files.extend(res_export_pdf[0]['zip_except_documents'])
    if res_export_pdf[0]['zip_file_path']:
        exported_files.append(res_export_pdf[0]['zip_file_path'])

    response = {
        'paths': exported_files,
        'zip_except_documents': res_export_pdf[0]['zip_except_documents'],
        'zip_filename': os.path.basename(res_export_pdf[0]['zip_file_path'])
    }
    return response, 200


def export_xml_file(data, parameters, now, regex):
    parameters['doc_loop_regex'] = regex['splitter_doc_loop']
    parameters['condition_regex'] = regex['splitter_condition']
    parameters['empty_line_regex'] = regex['splitter_empty_line']
    parameters['xml_comment_regex'] = regex['splitter_xml_comment']

    res_export_xml = export_xml(data['documents'], parameters, data['batchMetadata'], now)
    if res_export_xml[1] != 200:
        return res_export_xml

    exported_file = res_export_xml[0]['path']
    return exported_file


def export_to_cmis(output, batch, data, pages, now, log, docservers, configurations, regex):
    cmis_auth = get_output_parameters(output[0]['data']['options']['auth'])
    cmis_params = get_output_parameters(output[0]['data']['options']['parameters'])
    cmis = _CMIS(cmis_auth['cmis_ws'],
                 cmis_auth['login'],
                 cmis_auth['password'],
                 cmis_auth['folder'])

    # Export PDF for Alfresco
    parameters = {
        'extension': 'pdf',
        'folder_out': docservers['TMP_PATH'],
        'separator': cmis_params['separator'],
        'filename': cmis_params['pdf_filename'],
    }
    exported_files = export_pdf(batch, data['documents'], parameters, pages, now, output, log, docservers, configurations, regex)
    if isinstance(exported_files, list):
        for file_path in exported_files:
            cmis_res = cmis.create_document(file_path, 'application/pdf')
            if not cmis_res[0]:
                log.error(f'File not sent : {file_path}')
                log.error(f'CMIS Response : {str(cmis_res)}')
                response = {
                    "errors": gettext('EXPORT_PDF_ERROR'),
                    "message": cmis_res[1]
                }
                return response, 500

            # Export XML for Alfresco
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
                res_export_xml = export_xml(data['documents'], parameters, data['batchMetadata'], now)
                if res_export_xml[1] != 200:
                    return res_export_xml
                cmis_res = cmis.create_document(res_export_xml[0]['path'], 'text/xml')
                if not cmis_res[0]:
                    response = {
                        "errors": gettext('EXPORT_XML_ERROR'),
                        "message": cmis_res[1]
                    }
                    return response, 500


def export_to_mem(output, data, batch, pages, now, log, docservers, configurations, regex):
    mem_params = get_output_parameters(output[0]['data']['options']['parameters'])
    mem_auth = get_output_parameters(output[0]['data']['options']['auth'])
    parameters = {
        'filename': 'TMP_PDF_EXPORT_TO_MEM',
        'extension': 'pdf',
        'separator': mem_params['separator'],
        'file_name': mem_params['filename'],
    }
    res_export_pdf = export_pdf(batch, data['documents'], parameters, pages, now, output, log, docservers, configurations, regex)

    if res_export_pdf[1] != 200:
        return res_export_pdf

    subject_mask = parameters['subject']
    for index, file_path in enumerate(res_export_pdf):
        mask_args = {
            'mask': subject_mask,
            'separator': ' ',
            'format': parameters['format']
        }
        parameters['subject'] = _Splitter.get_value_from_mask(data['documents'][index], data['batchMetadata'],
                                                              now, mask_args)
        res_export_mem = export_mem(mem_auth, file_path, parameters, batch)
        if res_export_mem[1] != 200:
            return res_export_mem


def export_to_openads(output, data, batch, docservers, pages, now, log):
    openads_auth = get_output_parameters(output[0]['data']['options']['auth'])
    openads_params = get_output_parameters(output[0]['data']['options']['parameters'])
    _openads = _OpenADS(openads_auth['openads_api'], openads_auth['login'], openads_auth['password'])

    folder_id_mask = {
        'mask': openads_params['folder_id'],
        'separator': '',
    }
    folder_id = _Splitter.get_value_from_mask(None, data['batchMetadata'], now, folder_id_mask)
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
    res_export_pdf = export_pdf(batch, data['documents'], parameters, pages, now, output, log, docservers, configurations, regex)
    if res_export_pdf[1] != 200:
        return res_export_pdf

    openads_res = _openads.create_documents(folder_id, res_export_pdf, data['documents'])
    if not openads_res['status']:
        response = {
            "errors": gettext('OPENADS_ADD_DOC_ERROR'),
            "message": openads_res['error']
        }
        return response, 500
