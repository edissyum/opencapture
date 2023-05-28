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
from flask_babel import gettext
from src.backend.import_classes import _Splitter, _Files, _CMIS, _MEMWebServices, _OpenADS
from src.backend.import_models import splitter, workflow, forms, outputs


def get_output_parameters(parameters):
    data = {}
    for parameter in parameters:
        if type(parameter['value']) is dict and 'id' in parameter['value']:
            data[parameter['id']] = parameter['value']['id']
        else:
            data[parameter['id']] = parameter['value']
    return data


def export_pdf(batch, output, log, docservers, configurations):
    pdfs_paths = []
    zip_pdfs = []
    zip_except_documents = []
    zip_except_doctype = ''
    zip_file_path = ''
    zip_filename = ''

    """
        Add PDF file to zip archive if enabled
    """
    if 'zip_filename' in output['parameters'] and output['parameters']['zip_filename']:
        zip_except_doctype = re.search(r'\[Except=(.*?)\]', output['parameters']['zip_filename']) \
            if 'Except' in output['parameters']['zip_filename'] else ''
        mask_args = {
            'mask': output['parameters']['zip_filename'].split('[Except=')[0],
            'separator': output['parameters']['separator'],
            'extension': 'zip'
        }
        metadata = batch['data']['custom_fields']
        metadata['export_date'] = batch['export_date']
        zip_filename = _Splitter.get_value_from_mask(None, batch['data']['custom_fields'], mask_args)

    documents_doctypes = []
    for index, document in enumerate(batch['documents']):
        if not document['pages']:
            continue
        """
            Add PDF file names using masks
        """
        batch['documents'][index]['document_index'] = documents_doctypes.count(document['doctype_key']) + 1
        documents_doctypes.append(document['doctype_key'])
        mask_args = {
            'mask': output['parameters']['filename'] if 'filename' in output['parameters'] else _Files.get_random_string(10),
            'separator': output['parameters']['separator'],
            'extension': output['parameters']['extension']
        }

        batch['documents'][index]['filename'] = _Splitter.get_value_from_mask(document, batch['data']['custom_fields'], mask_args)

        if not zip_except_doctype or zip_except_doctype.group(1) not in batch['documents'][index]['doctype_key']:
            zip_pdfs.append({
                'input_path': output['parameters']['folder_out'] + '/' + batch['documents'][index]['filename'],
                'path_in_zip': batch['documents'][index]['filename']
            })
        else:
            zip_except_documents.append(batch['documents'][index]['id'])

        document['file_path'] = docservers['SPLITTER_ORIGINAL_PDF'] + '/' + batch['file_path']
        document['compress_type'] = output['compress_type']
        document['folder_out'] = output['parameters']['folder_out']

        exported_pdf, error = _Files.export_pdf({
            'log': log,
            'reduce_index': 1,
            'document': document,
            'lang': configurations['locale'],
            'batch_metadata': batch['data']['custom_fields']
        })
        if error:
            response = {
                "errors": gettext('EXPORT_PDF_ERROR'),
                "message": error
            }
            return response, 400
        pdfs_paths.append(exported_pdf)

    if 'zip_filename' in output['parameters'] and output['parameters']['zip_filename'] and zip_pdfs:
        zip_file_path = output['parameters']['folder_out'] + '/' + zip_filename
        _Files.zip_files(zip_pdfs, zip_file_path, True)

    return {'paths': pdfs_paths, 'zip_except_documents': zip_except_documents, 'zip_file_path': zip_file_path}, 200


def handle_pdf_output(batch, output, log, docservers, configurations, regex):
    res_export_pdf = export_pdf(batch, output, log, docservers, configurations)
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


def handle_xml_output(batch, parameters, regex):
    mask_args = {
        'mask': parameters['filename'],
        'separator': parameters['separator'],
        'extension': parameters['extension']
    }
    xml_filename = _Splitter.get_value_from_mask(None, batch['data']['custom_fields'], mask_args)

    metadata = batch['data']['custom_fields']
    metadata['xml_filename'] = xml_filename
    metadata['export_date'] = batch['export_date']
    metadata['zip_filename'] = batch['zip_filename']
    metadata['zip_except_documents'] = batch['zip_except_documents']

    res_xml = _Splitter.export_xml(batch['documents'], metadata, parameters, regex)
    if not res_xml[0]:
        response = {
            "errors": gettext('EXPORT_XML_ERROR'),
            "message": res_xml[1]
        }
        return response, 400
    return {'path': res_xml[1]}, 200


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
                res_export_xml = handle_xml_output(data['documents'], parameters, data['batchMetadata'], now)
                if res_export_xml[1] != 200:
                    return res_export_xml
                cmis_res = cmis.create_document(res_export_xml[0]['path'], 'text/xml')
                if not cmis_res[0]:
                    response = {
                        "errors": gettext('EXPORT_XML_ERROR'),
                        "message": cmis_res[1]
                    }
                    return response, 500


def export_to_openads(output, data, batch, docservers, pages, now, log, configurations, regex):
    openads_auth = get_output_parameters(output[0]['data']['options']['auth'])
    openads_params = get_output_parameters(output[0]['data']['options']['parameters'])
    _openads = _OpenADS(openads_auth['openads_api'], openads_auth['login'], openads_auth['password'])

    folder_id_mask = {
        'mask': openads_params['folder_id'],
        'separator': '',
    }
    folder_id = _Splitter.get_value_from_mask(None, batch['data']['custom_fields'], now, folder_id_mask)
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
    res_export_pdf = export_pdf(batch, output, now, log, docservers, configurations)
    if res_export_pdf[1] != 200:
        return res_export_pdf

    openads_res = _openads.create_documents(folder_id, res_export_pdf, batch['documents'])
    if not openads_res['status']:
        response = {
            "errors": gettext('OPENADS_ADD_DOC_ERROR'),
            "message": openads_res['error']
        }
        return response, 500


def launch_export(batch_id, log, docservers, configurations, regex):
    export_date = _Files.get_now_date()
    exported_files = []

    batch = splitter.retrieve_batches({
        'batch_id': None,
        'page': None,
        'size': None,
        'where': ['id = %s'],
        'data': [batch_id]
    })[0][0]

    documents, error = splitter.get_batch_documents({'batch_id': batch['id']})
    if error:
        return error, 400

    for document in documents:
        document['pages'], error = splitter.get_document_pages({'document_id': document['id']})
        if error:
            return error, 400

    batch['documents'] = documents
    batch['export_date'] = export_date

    workflow_settings, error = workflow.get_workflow_by_id({'workflow_id': batch['workflow_id']})
    if error:
        return error, 400

    form = forms.get_form_by_id({'form_id': batch['form_id']})
    if 'outputs' in form[0]:
        for output_id in form[0]['outputs']:
            output = outputs.get_output_by_id({'output_id': output_id})
            if not output:
                return gettext('OUTPUT_NOT_FOUND'), 400
            else:
                output = output[0]
            output['parameters'] = get_output_parameters(output['data']['options']['parameters'])

            match output['output_type_id']:
                case 'export_pdf':
                    res_export_pdf = handle_pdf_output(batch, output, log, docservers, configurations, regex)
                    if res_export_pdf[1] != 200:
                        return res_export_pdf
                    res_export_pdf = res_export_pdf[0]

                    batch['zip_filename'] = res_export_pdf['zip_filename']
                    batch['zip_except_documents'] = res_export_pdf['zip_except_documents']

                case 'export_xml':
                    res_export_xml = handle_xml_output(batch, output['parameters'], regex)
                    if res_export_xml[1] != 200:
                        return res_export_xml
                    exported_files.append(res_export_xml[0]['path'])

                case 'export_cmis':
                    res_export_cmis = export_to_cmis(output, batch, log, docservers, configurations, regex)
                    if res_export_cmis[1] != 200:
                        return res_export_cmis

                case 'export_openads':
                    res_export_openads = export_to_openads(output, batch, log, docservers, configurations, regex)
                    if res_export_openads[1] != 200:
                        return res_export_openads

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
            'substitute': '_'
        }
        export_zip_file = _Splitter.get_value_from_mask(None, batch['data']['custom_fields'], mask_args)
        _Files.zip_files(files_to_zip, export_zip_file, True)

    """
        Process after validation
    """
    splitter.update_status({
        'ids': [batch['id']],
        'status': 'NEW'
    })

    if workflow_settings['process']['delete_documents']:
        _Files.remove_file(f"{docservers['SPLITTER_ORIGINAL_PDF']}/{batch['file_path']}", log)

    return True, 200
