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
from src.backend.import_classes import _Splitter, _Files, _CMIS, _OpenADS
from src.backend.import_models import splitter, workflow, forms, outputs


def get_output_parameters(parameters):
    data = {}
    for parameter in parameters:
        if type(parameter['value']) is dict and 'id' in parameter['value']:
            data[parameter['id']] = parameter['value']['id']
        else:
            data[parameter['id']] = parameter['value']
    return data


def export_batch(batch_id, log, docservers, configurations, regex):
    export_date = _Files.get_now_date()
    export_zip_file = ''
    exported_files = []
    outputs_id = []

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
    batch['pdf_output_compress_file'] = ''

    workflow_settings, error = workflow.get_workflow_by_id({'workflow_id': batch['workflow_id']})
    if error:
        return error, 400

    if workflow_settings['process']['use_interface']:
        form, error = forms.get_form_by_id({'form_id': batch['form_id']})
        if error:
            return error, 400
        outputs_id = form['outputs']
        export_zip_file = form['settings']['export_zip_file']
    else:
        outputs_id = workflow_settings['output']['outputs_id']

    for output_id in outputs_id:
        output = outputs.get_output_by_id({'output_id': output_id})
        if not output:
            return gettext('OUTPUT_NOT_FOUND'), 400
        else:
            output = output[0]
        output['parameters'] = get_output_parameters(output['data']['options']['parameters'])

        match output['output_type_id']:
            case 'export_pdf':
                res_export_pdf, status = handle_pdf_output(batch, output, log, docservers, configurations)
                if status != 200:
                    return res_export_pdf, status
                batch = res_export_pdf['result_batch']

            case 'export_xml':
                res_export_xml, status = handle_xml_output(batch, output['parameters'], regex)
                if status != 200:
                    return res_export_xml, status
                batch = res_export_xml['result_batch']

            case 'export_cmis':
                res_export_cmis, status = handle_cmis_output(output, batch, log, docservers, configurations)
                if status != 200:
                    return res_export_cmis, status

            case 'export_openads':
                res_export_openads, status = handle_openads_output(output, batch, log, docservers, configurations)
                if status != 200:
                    return res_export_openads, status

    if export_zip_file:
        compress_outputs_result(batch, exported_files, export_zip_file)

    process_after_outputs(batch, 'END', workflow_settings, docservers, log)
    return True, 200


def export_pdf_files(batch, parameters, log, docservers, configurations):
    compress_files = []
    zip_except_documents = []
    zip_except_doctype = ''
    zip_file_path = ''
    zip_filename = ''

    documents_doctypes = []
    for index, document in enumerate(batch['documents']):
        if not document['pages']:
            continue

        batch['documents'][index]['document_index'] = documents_doctypes.count(document['doctype_key']) + 1
        documents_doctypes.append(document['doctype_key'])
        mask_args = {
            'mask': parameters['filename'] if 'filename' in parameters else _Files.get_random_string(10),
            'separator': parameters['separator'],
            'extension': parameters['extension']
        }

        filename = _Splitter.get_value_from_mask(document, batch['data']['custom_fields'], mask_args)

        document['file_path'] = docservers['SPLITTER_ORIGINAL_PDF'] + '/' + batch['file_path']
        document['compress_type'] = parameters['compress_type']
        document['folder_out'] = parameters['folder_out']
        document['filename'] = filename

        export_path, error = _Files.export_pdf({
            'log': log,
            'reduce_index': 1,
            'document': document,
            'batch_metadata': batch['data']['custom_fields']
        })
        if error:
            response = {
                "errors": gettext('EXPORT_PDF_ERROR'),
                "message": error
            }
            return response, 400

        batch['documents'][index]['export_path'] = export_path
    return {'result_batch': batch}, 200


def handle_pdf_output(batch, output, log, docservers, configurations):
    compress_except_documents = []
    compress_file = ''
    compress_pdfs = []
    parameters = {
        'compress_type': output['compress_type'],
        'filename': output['parameters']['filename'],
        'separator': output['parameters']['separator'],
        'extension': output['parameters']['extension'],
        'folder_out': output['parameters']['folder_out'],
    }
    res_export_pdf, status = export_pdf_files(batch, parameters, log, docservers, configurations)
    if status != 200:
        return res_export_pdf, status
    batch = res_export_pdf['result_batch']

    compress_file = output['parameters']['zip_filename']
    if compress_file:
        zip_except_doctype = re.search(r'\[Except=(.*?)\]', compress_file) if 'Except' in compress_file else ''
        metadata = batch['data']['custom_fields']
        metadata['export_date'] = batch['export_date']
        mask_args = {
            'mask': output['parameters']['zip_filename'].split('[Except=')[0],
            'separator': parameters['separator'],
            'extension': 'zip'
        }
        compress_file = _Splitter.get_value_from_mask(None, metadata, mask_args)
        compress_file = parameters['folder_out'] + '/' + compress_file

        for index, document in enumerate(batch['documents']):
            if zip_except_doctype and document['doctype_key'].startswith(zip_except_doctype.group(1)):
                batch['documents'][index]['is_file_added_to_zip'] = False
                continue
            batch['documents'][index]['is_file_added_to_zip'] = True
            compress_pdfs.append({
                'filepath': document['export_path'],
                'filename': document['filename']
            })

        _Files.compress_files(compress_pdfs, compress_file, remove_compressed_files=True)

    batch['pdf_output_compress_file'] = compress_file
    return {'result_batch': batch}, 200


def handle_xml_output(batch, parameters, regex):
    mask_args = {
        'mask': parameters['filename'],
        'separator': parameters['separator'],
        'extension': parameters['extension']
    }
    metadata_file = _Splitter.get_value_from_mask(None, batch['data']['custom_fields'], mask_args)

    metadata = {
        'export_date': batch['export_date'],
        'metadata_file': metadata_file,
        'custom_fields': batch['data']['custom_fields'],
        'pdf_output_compress_file': batch['pdf_output_compress_file'],
    }
    export_ok, export_result = _Splitter.export_xml(batch['documents'], metadata, parameters, regex)
    if not export_ok:
        response = {
            "errors": gettext('EXPORT_XML_ERROR'),
            "message": export_result
        }
        return response, 400

    batch['metadata_file'] = export_result
    return {'result_batch': batch}, 200


def handle_cmis_output(output, batch, log, docservers, configurations, regex):
    cmis_auth = get_output_parameters(output['data']['options']['auth'])
    cmis_params = get_output_parameters(output['data']['options']['parameters'])
    cmis = _CMIS(cmis_auth['cmis_ws'],
                 cmis_auth['login'],
                 cmis_auth['password'],
                 cmis_auth['folder'])

    parameters = {
        'extension': 'pdf',
        'folder_out': docservers['TMP_PATH'],
        'separator': cmis_params['separator'],
        'filename': cmis_params['pdf_filename'],
    }
    res_pdf_export = export_pdf_files(batch, parameters, log, docservers, configurations)
    pdf_paths = res_pdf_export['paths']
    for file_path in pdf_paths:
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
            res_export_xml, status = handle_xml_output(batch, parameters, regex)
            if status != 200:
                return res_export_xml, status
            cmis_res = cmis.create_document(res_export_xml['result_batch']['metadata_file'], 'text/xml')
            if not cmis_res[0]:
                response = {
                    "errors": gettext('EXPORT_XML_ERROR'),
                    "message": cmis_res[1]
                }
                return response, 500


def handle_openads_output(output, batch, docservers, log, configurations):
    openads_auth = get_output_parameters(output['data']['options']['auth'])
    openads_params = get_output_parameters(output['data']['options']['parameters'])
    _openads = _OpenADS(openads_auth['openads_api'], openads_auth['login'], openads_auth['password'])

    openads_folder = {
        'mask': openads_params['folder_id'],
        'separator': '',
    }
    openads_folder = _Splitter.get_value_from_mask(None, batch['data']['custom_fields'], openads_folder)
    openads_res = _openads.check_folder_by_id(openads_folder)
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
    res_export_pdf, status = export_pdf_files(batch, parameters, log, docservers, configurations)
    if status != 200:
        return res_export_pdf

    pdf_paths = res_export_pdf['paths']
    openads_res = _openads.create_documents(openads_folder, pdf_paths, batch['documents'])
    if not openads_res['status']:
        response = {
            "errors": gettext('OPENADS_ADD_DOC_ERROR'),
            "message": openads_res['error']
        }
        return response, 500


def compress_outputs_result(batch, exported_files, export_zip_file):
    compress_files = []
    for file in exported_files:
        compress_files.append({
            'filepath': file,
            'filename': os.path.basename(file)
        })
    mask_args = {
        'mask': export_zip_file,
        'separator': '',
        'substitute': '_'
    }
    outputs_compress_path = _Splitter.get_value_from_mask(None, batch['data']['custom_fields'], mask_args)
    _Files.compress_files(compress_files, outputs_compress_path, remove_compressed_files=True)


def process_after_outputs(batch, close_status, workflow_settings, docservers, log):
    splitter.update_status({
        'ids': [batch['id']],
        'status': close_status
    })
    if workflow_settings['process']['delete_documents']:
        _Files.remove_file(f"{docservers['SPLITTER_ORIGINAL_PDF']}/{batch['file_path']}", log)
