# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Oussama Bich <oussama.brich@edissyum.com>
# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import re
import os
import sys
import json
import pypdf
import base64
import random
import pathlib
import tempfile
from xml.dom import minidom
from datetime import datetime
from unidecode import unidecode

from .Database import Database
from .NFZ42020 import hash_file_content
from werkzeug.datastructures import FileStorage
from .. import shared
from ..scripting_functions import launch_script_splitter
from ..classes.OpenCaptureForMEMWebServices import OpenCaptureForMEMWebServices


def construct_with_var(data, document_info, key=None):
    _data = []
    for column in data.split('#'):
        if column in document_info:
            _data.append(str(document_info[column]))
        else:
            if not key or not key.startswith('custom_'):
                _data.append(column)
    return _data


def get_value_from_mask(document, metadata, mask_args, batch_id=None):
    if 'export_date' not in metadata:
        metadata['export_date'] = datetime.now()
    year = str(metadata['export_date'].year)
    day = str('%02d' % metadata['export_date'].day)
    month = str('%02d' % metadata['export_date'].month)
    hour = str('%02d' % metadata['export_date'].hour)
    minute = str('%02d' % metadata['export_date'].minute)
    seconds = str('%02d' % metadata['export_date'].second)
    _date = year + month + day + hour + minute + seconds

    mask_result = []
    random_num = str(random.randint(0, 99999)).zfill(5)
    mask_keys = mask_args['mask'].split('#')
    separator = mask_args['separator'] if mask_args['separator'] else ''
    substitute = mask_args['substitute'] if 'substitute' in mask_args else separator

    for key in mask_keys:
        if not key:
            continue
        """
            PDF or XML masks value
        """
        if key in metadata:
            mask_result.append(str(metadata[key]).replace(' ', substitute))
        elif key == 'date':
            mask_result.append(_date.replace(' ', substitute))
        elif key == 'random':
            mask_result.append(random_num.replace(' ', substitute))
        elif key == 'batch_identifier' and batch_id:
            mask_result.append(str(batch_id).replace(' ', substitute))
        elif key == 'id' and 'id' in metadata:
            mask_result.append(metadata['id'])
        elif document:
            """
                PDF masks value
            """
            if key in document['data']['custom_fields']:
                value = str(document['data']['custom_fields'][key] if document['data']['custom_fields'][key] else '')
                value = value.replace(' ', substitute)
                mask_result.append(value)
            elif key in metadata:
                value = str(metadata[key] if metadata[key] else '').replace(' ', substitute)
                mask_result.append(value)
            elif key == 'doctype':
                mask_result.append(document['doctype_key'].replace(' ', substitute))
            elif key == 'document_identifier':
                mask_result.append(document['id'])
            elif key == 'document_index':
                mask_result.append(document['id'])
            else:
                """
                    PDF value when mask value not found in metadata
                """
                mask_result.append(key.replace(' ', substitute))
        else:
            """
                XML value when mask value not found in metadata
            """
            mask_result.append(key.replace(' ', substitute))

    mask_result = separator.join(str(x) for x in mask_result)
    mask_result = unidecode(mask_result)
    mask_result = mask_result.rstrip(separator)
    if 'extension' in mask_args:
        mask_result += '.{}'.format(mask_args['extension'])

    return mask_result


class Splitter:
    def __init__(self, config, database, separator_qr, log, docservers):
        self.log = log
        self.db = database
        self.qr_pages = []
        self.config = config
        self.docservers = docservers
        self.result_batches = []
        self.separator_qr = separator_qr
        self.doc_start = self.config['SPLITTER']['docstart']
        self.bundle_start = self.config['SPLITTER']['bundlestart']

    def get_result_documents(self, blank_pages):
        split_document = 1
        self.result_batches.append([])
        is_previous_code_qr = False

        for index, page in enumerate(self.qr_pages):
            if int(index) in blank_pages:
                if self.separator_qr.remove_blank_pages or is_previous_code_qr:
                    continue

            if page['separator_type'] == self.bundle_start:
                if len(self.result_batches[-1]) != 0:
                    self.result_batches.append([])
                split_document = 1
                is_previous_code_qr = True
            elif page['separator_type'] == self.doc_start:
                if len(self.result_batches[-1]) != 0:
                    split_document += 1
                is_previous_code_qr = True
                if 'add_page' in page and page['add_page']:
                    self.result_batches[-1].append({
                        'path': page['path'],
                        'mem_value': page['mem_value'],
                        'metadata_1': page['metadata_1'],
                        'metadata_2': page['metadata_2'],
                        'metadata_3': page['metadata_3'],
                        'split_document': split_document,
                        'source_page': page['source_page'],
                        'doctype_value': page['doctype_value']
                    })
            else:
                self.result_batches[-1].append({
                    'path': page['path'],
                    'mem_value': page['mem_value'],
                    'metadata_1': page['metadata_1'],
                    'metadata_2': page['metadata_2'],
                    'metadata_3': page['metadata_3'],
                    'split_document': split_document,
                    'source_page': page['source_page'],
                    'doctype_value': page['doctype_value']
                })
                is_previous_code_qr = False

    def get_default_values(self, form_id, user_id):
        user = {}
        default_values = {
            'batch': {},
            'document': {}
        }

        fields = self.db.select({
            'select': ['*'],
            'table': ['form_models_field'],
            'where': ['form_id = %s'],
            'data': [form_id]
        })[0]

        if user_id:
            user = self.db.select({
                'select': ['*'],
                'table': ['users'],
                'where': ['id = %s'],
                'data': [user_id]
            })[0]

        data = {
            'username': user['username'],
            'email': user['email'] if user['email'] else '',
            'lastname': user['lastname'] if user['lastname'] else '',
            'firstname': user['firstname'] if user['firstname'] else ''
        }

        if 'batch_metadata' in fields['fields'] and fields['fields']['batch_metadata']:
            for field in fields['fields']['batch_metadata']:
                if 'defaultValue' in field:
                    mask = {
                        'mask': field['defaultValue'],
                        'separator': ' '
                    }
                    default_values['batch'][field['label_short']] = get_value_from_mask(None, data, mask)

        if 'document_metadata' in fields['fields'] and fields['fields']['document_metadata']:
            for field in fields['fields']['document_metadata']:
                if 'defaultValue' in field:
                    mask = {
                        'mask': field['defaultValue'],
                        'separator': ' '
                    }
                    default_values['document'][field['label_short']] = get_value_from_mask(None, data, mask)

        return default_values

    def create_batches(self, upload_args, file, original_filename):
        batches_id = []
        for _, batch_pages in enumerate(self.result_batches):
            workflow_settings = self.db.select({
                'select': ['id', 'input, process'],
                'table': ['workflows'],
                'where': ['workflow_id = %s', 'module = %s'],
                'data': [upload_args['workflow_id'], 'splitter']
            })

            clean_path = re.sub(r"/+", "/", file)
            clean_ds = re.sub(r"/+", "/", self.docservers['SPLITTER_ORIGINAL_DOC'])

            default_values = {
                'document': {},
                'batch': {}
            }
            form_id = None
            if (workflow_settings[0]['process']['use_interface'] and 'form_id' in workflow_settings[0]['process'] and
                    workflow_settings[0]['process']['form_id']):
                form_id = workflow_settings[0]['process']['form_id']
                if upload_args['user_id']:
                    default_values = self.get_default_values(form_id, upload_args['user_id'])

            custom_fields = self.db.select({
                'select': ['*'],
                'table': ['custom_fields'],
                'where': ['module = %s', 'status <> %s'],
                'data': ['splitter', 'DEL']
            })

            if batch_pages:
                first_page = batch_pages[0]
                if first_page['metadata_1'] or first_page['metadata_2'] or first_page['metadata_3']:
                    for custom_field in custom_fields:
                        if first_page['metadata_1'] and custom_field['metadata_key'] == 'SEPARATOR_META1':
                            default_values['batch'][custom_field['label_short']] = first_page['metadata_1']
                        if first_page['metadata_2'] and custom_field['metadata_key'] == 'SEPARATOR_META2':
                            default_values['batch'][custom_field['label_short']] = first_page['metadata_2']
                        if first_page['metadata_3'] and custom_field['metadata_key'] == 'SEPARATOR_META3':
                            default_values['batch'][custom_field['label_short']] = first_page['metadata_3']

            md5 = hash_file_content(clean_path, hash_algorithm='md5')
            sha256 = hash_file_content(clean_path, hash_algorithm='sha256')

            args = {
                'table': 'splitter_batches',
                'columns': {
                    'md5': md5,
                    'sha256': sha256,
                    'form_id': form_id,
                    'batch_folder': upload_args['batch_folder'],
                    'original_filename': os.path.basename(upload_args['original_filename']),
                    'subject': upload_args['msg']['subject'][:254] if 'msg' in upload_args and upload_args['msg'] else '',
                    'workflow_id': workflow_settings[0]['id'],
                    'file_path': clean_path.replace(clean_ds, ''),
                    'thumbnail': os.path.basename(batch_pages[0]['path']),
                    'file_name': os.path.basename(original_filename),
                    'data': json.dumps({'custom_fields': default_values['batch']}),
                    'customer_id': str(workflow_settings[0]['input']['customer_id']),
                    'documents_count': str(max((node['split_document'] for node in batch_pages)))
                }
            }
            batch_id = self.db.insert(args)

            if upload_args['attachments']:
                from ..controllers import attachments
                attachments.handle_uploaded_file(upload_args['attachments'], None, batch_id, 'splitter', True)

            batches_id.append(batch_id)

            document_id = 0
            page_display_order = 1
            previous_split_document = 0
            for page in batch_pages:
                custom_fields_data = {}
                if page['split_document'] != previous_split_document:
                    for custom_field in custom_fields:
                        if page['metadata_1'] and custom_field['metadata_key'] == 'SEPARATOR_META1':
                            custom_fields_data[custom_field['label_short']] = page['metadata_1']
                        if page['metadata_2'] and custom_field['metadata_key'] == 'SEPARATOR_META2':
                            custom_fields_data[custom_field['label_short']] = page['metadata_2']
                        if page['metadata_3'] and custom_field['metadata_key'] == 'SEPARATOR_META3':
                            custom_fields_data[custom_field['label_short']] = page['metadata_3']
                    args = {
                        'table': 'splitter_documents',
                        'columns': {
                            'batch_id': str(batch_id),
                            'split_index': page['split_document'],
                            'display_order': page['split_document']
                        }
                    }

                    """
                        Doctype from Open-Capture separator, AI or default value
                    """
                    if page['doctype_value']:
                        args['columns']['doctype_key'] = page['doctype_value']
                    elif workflow_settings[0]['input']['ai_model_id']:
                        model_id = workflow_settings[0]['input']['ai_model_id']
                        ai_model = self.db.select({
                            'select': ['id', 'min_proba', 'model_label', 'model_path', 'documents', 'module'],
                            'table': ['ai_models'],
                            'where': ['id = %s'],
                            'data': [model_id]
                        })
                        if ai_model:
                            upload_args['log'].info(f"Search doctype using AI SLM model "
                                                    f"<strong>{ai_model[0]['model_label']}</strong> "
                                                    f"for page <strong>{page['source_page']}</strong>. "
                                                    f"Min proba : <strong>{ai_model[0]['min_proba']}</strong>")

                            result, _ = upload_args['artificial_intelligence'].predict_from_file_path(
                                file, ai_model[0], page=int(page['source_page']))

                            upload_args['log'].info(f"AI model prediction result: <strong>{result[3]}</strong> "
                                                    f"with proba <strong>{result[2]}</strong> "
                                                    f"for page <strong>{page['source_page']}</strong>")

                            if result[2] >= ai_model[0]['min_proba']:
                                upload_args['log'].info(f"Set doctype <strong>{result[3]}</strong> "
                                                        f"for page <strong>{page['source_page']}</strong> based on AI model prediction")
                                args['columns']['doctype_key'] = page['doctype_value'] = result[3]
                    else:
                        default_doctype = self.db.select({
                            'select': ['*'],
                            'table': ['doctypes'],
                            'where': ['status <> %s', 'form_id = %s', 'is_default = %s'],
                            'data': ['DEL', workflow_settings[0]['process']['form_id'], 'true']
                        })
                        if default_doctype:
                            args['columns']['doctype_key'] = default_doctype[0]['key']

                    """
                        MEM Courrier entity separator
                    """
                    if page['mem_value']:
                        entity = page['mem_value']
                        if len(entity.split('_')) == 2:
                            entity = entity.split('_')[1]

                        for custom_field in custom_fields:
                            if custom_field['metadata_key'] == 'SEPARATOR_MEM':
                                custom_fields_data[custom_field['label_short']] = entity

                    if custom_fields:
                        args['columns']['data'] = json.dumps({'custom_fields': custom_fields_data})
                    document_id = self.db.insert(args)
                    page_display_order = 1

                previous_split_document = page['split_document']
                paths_elements = pathlib.Path(page['path'])
                thumbnail = os.path.join(*paths_elements.parts[-2:])
                rotation = workflow_settings[0]['process']['rotation']
                args = {
                    'table': 'splitter_pages',
                    'columns': {
                        'thumbnail': thumbnail,
                        'document_id': str(document_id),
                        'source_page': page['source_page'],
                        'display_order': str(page_display_order),
                        'rotation': rotation if rotation != 'no_rotation' else 0
                    }
                }
                self.db.insert(args)
                page_display_order += 1

            stop_workflow = False
            if self.config['GLOBAL']['allowwfscripting'].lower() == 'true':
                args['file'] = file
                args['batches_id'] = [batch_id]
                args['custom_id'] = upload_args['custom_id']
                stop_workflow = launch_script_splitter(workflow_settings[0], self.docservers, 'process', self.log, self.db  , args, self.config, None)

            if not workflow_settings[0]['process']['use_interface'] and not stop_workflow:
                from ..splitter_exports import export_batch
                export_batch(batch_id, self.log, self.docservers, upload_args['regex'], self.config, self.db, upload_args['custom_id'])

            self.db.conn.commit()
        return {'batches_id': batches_id}

    @staticmethod
    def get_documents_pages(documents):
        documents_pages = []
        for document in documents:
            documents_pages.append([])
            for page in document['pages']:
                documents_pages[-1].append({
                    'page_id': page['id'],
                    'rotation': page['rotation'],
                    'source_page': page['sourcePage']
                })
        return documents_pages


    @staticmethod
    def export_opencaptureformem(batch, output, docservers, log):
        host = ''
        custom_id = ''
        secret_key = ''
        for key in output['data']['options']['auth']:
            if key['id'] == 'host':
                host = key['value']
            if key['id'] == 'secret_key':
                secret_key = key['value']
            if key['id'] == 'custom_id':
                custom_id = key['value']

        _ws = OpenCaptureForMEMWebServices(host, secret_key, custom_id, log)
        if _ws.access_token[0]:
            files = []
            for document in batch['documents']:
                data_to_send = {
                    'process': output['parameters']['process'],
                    'pdf_filename': output['parameters']['pdf_filename'],
                    'separator': output['parameters']['separator'],
                    'rdff': output['parameters']['rdff'],
                    'destination': output['parameters']['destination'],
                    'custom_fields': {}
                }
                if 'custom_fields' in output['parameters'] and output['parameters']['custom_fields']:
                    if isinstance(output['parameters']['custom_fields'], str):
                        data_to_send['custom_fields'] = json.loads(output['parameters']['custom_fields'])

                    for key in data_to_send['custom_fields']:
                        marks_args = {
                            'mask': data_to_send['custom_fields'][key],
                            'separator': ''
                        }
                        custom_field_value = get_value_from_mask(None, document['data']['custom_fields'], marks_args)
                        data_to_send['custom_fields'][key] = custom_field_value

                mask_args = {
                    'mask': data_to_send['pdf_filename'],
                    'separator': data_to_send['separator'],
                    'extension': 'pdf'
                }
                metadata_file = get_value_from_mask(None, document['data']['custom_fields'], mask_args)
                pdf_writer = pypdf.PdfWriter()
                with tempfile.NamedTemporaryFile() as tf:
                    pdf_reader = pypdf.PdfReader(docservers['SPLITTER_ORIGINAL_DOC'] + '/' + batch['file_path'])
                    for page in document['pages']:
                        pdf_page = pdf_reader.pages[page['source_page'] - 1]
                        if page['rotation'] != 0:
                            pdf_page.rotate(page['rotation'])
                        pdf_writer.add_page(pdf_page)
                    pdf_writer.write(tf.name)
                    files.append({
                        'file_content': base64.b64encode(open(tf.name, 'rb').read()).decode('utf-8'),
                        'file_name': metadata_file
                    })
                    res = _ws.send_documents(files, data_to_send)
            return res

    @staticmethod
    def export_xml(documents, metadata, parameters, regex, database):
        year = str(metadata['export_date'].year)
        month = str(metadata['export_date'].month).zfill(2)
        day = str(metadata['export_date'].day).zfill(2)
        hour = str(metadata['export_date'].hour).zfill(2)
        minute = str(metadata['export_date'].minute).zfill(2)
        second = str(metadata['export_date'].second).zfill(2)
        date = f"{day}-{month}-{year} {hour}:{minute}:{second}"

        user_lastname = metadata['custom_fields']['userLastName'] if 'userLastName' in metadata['custom_fields'] else ''
        user_firstname = metadata['custom_fields']['userFirstName'] if 'userFirstName' in metadata['custom_fields'] else ''

        xml_as_string = parameters['xml_template']

        xml_as_string = xml_as_string.replace('#date#', date)
        xml_as_string = xml_as_string.replace('#user_lastname#', user_lastname)
        xml_as_string = xml_as_string.replace('#user_firstname#', user_firstname)
        xml_as_string = xml_as_string.replace('#documents_count#', str(len(documents)))
        xml_as_string = xml_as_string.replace('#batch_identifier#', str(metadata['batch_id']))
        xml_as_string = xml_as_string.replace('#metadata_file#', metadata['metadata_file'])
        xml_as_string = xml_as_string.replace('#random#', str(random.randint(0, 99999)).zfill(5))
        xml_as_string = xml_as_string.replace('#pdf_output_compress_file#', metadata['pdf_output_compress_file'])

        """
            Add batch metadata
        """
        for key in metadata['custom_fields']:
            if f'#{key}#' in xml_as_string:
                xml_as_string = xml_as_string.replace(f'#{key}#', str(metadata['custom_fields'][key]))

        """
            Apply if conditions
        """
        conditions_template = re.findall(regex['splitter_condition'], xml_as_string, re.DOTALL)
        for condition in conditions_template:
            condition_var = re.sub('[{}]', '', condition[0])
            if condition_var not in metadata or not metadata[condition_var]:
                xml_as_string = xml_as_string.replace(condition[1], '')

        """
            Add documents metadata
        """
        documents_tags = ""

        doc_loop_item_template = re.search(regex['splitter_doc_loop'], xml_as_string, re.DOTALL)
        if doc_loop_item_template:
            for _, document in enumerate(documents):
                if 'is_file_added_to_zip' in document and document['is_file_added_to_zip']:
                    continue

                document_md5 = ''
                document_sha256 = ''
                print(document['export_path'])
                if 'export_path' in document and os.path.isfile(document['export_path']):
                    document_md5 = hash_file_content(document['export_path'], hash_algorithm='md5')
                    document_sha256 = hash_file_content(document['export_path'], hash_algorithm='sha256')
                    database.update({
                        'table': ['splitter_documents'],
                        'set': {
                            'md5': document_md5,
                            'sha256': document_sha256
                        },
                        'where': ['id = %s'],
                        'data': [document['id']]
                    })
                    database.conn.commit()


                doc_loop_item = doc_loop_item_template.group(1)
                doc_loop_item = doc_loop_item.replace('#date#', date)
                doc_loop_item = doc_loop_item.replace('#id#', str(document['id']))
                doc_loop_item = doc_loop_item.replace('#documents_count#', str(len(documents)))
                doc_loop_item = doc_loop_item.replace('#doctype#', str(document['doctype_key']))
                doc_loop_item = doc_loop_item.replace('#document_identifier#', str(document['id']))
                doc_loop_item = doc_loop_item.replace('#md5#', str(document_md5))
                doc_loop_item = doc_loop_item.replace('#sha256#', str(document_sha256))
                doc_loop_item = doc_loop_item.replace('#random#', str(random.randint(0, 99999)).zfill(5))
                doc_loop_item = doc_loop_item.replace('#filename#', document['filename'] if 'filename' in document else '')

                if 'custom_fields' in document['data'] and document['data']['custom_fields']:
                    for key in document['data']['custom_fields']:
                        if f'#{key}#' in doc_loop_item:
                            doc_loop_item = doc_loop_item.replace(f'#{key}#', str(document['data']['custom_fields'][key]))
                documents_tags += doc_loop_item

            xml_as_string = xml_as_string.replace(doc_loop_item_template.group(1), documents_tags)

        xml_file_path = f"{parameters['folder_out']}/{metadata['metadata_file']}"
        """
            Check XML Syntax and write file result & remove template comments
        """
        xml_as_string = re.sub(regex['splitter_xml_comment'], '', xml_as_string)
        xml_as_string = re.sub(regex['splitter_empty_line'], '', xml_as_string)

        try:
            with open(xml_file_path, "w", encoding='utf-8') as f:
                minidom.parseString(xml_as_string)
                f.write(xml_as_string)
        except (Exception,) as e:
            return False, str(e)

        return True, xml_file_path

    @staticmethod
    def export_verifier(batch, metadata, parameters, docservers, regex):
        from ..controllers import verifier

        parameters['body_template'] = re.sub(regex['splitter_xml_comment'], '', parameters['body_template'])
        json_body = json.loads(parameters['body_template'])

        if isinstance(json_body['datas'], str):
            json_body['datas'] = ''.join(construct_with_var(json_body['datas'], metadata['custom_fields']))
        elif isinstance(json_body['datas'], dict):
            for sub_key in json_body['datas']:
                json_body['datas'][sub_key] = ''.join(construct_with_var(json_body['datas'][sub_key],
                                                                         metadata['custom_fields'], sub_key))

        tmp_json_body = json.loads(parameters['body_template'])
        for document in batch['documents']:
            json_body['files'] = []
            if isinstance(json_body['datas'], str):
                json_body['datas'] = ''.join(construct_with_var(tmp_json_body['datas'], document['data']['custom_fields']))
            elif isinstance(json_body['datas'], dict):
                for sub_key in json_body['datas']:
                    json_body['datas'][sub_key] = ''.join(construct_with_var(tmp_json_body['datas'][sub_key],
                                                                             document['data']['custom_fields'], sub_key))

            for key in tmp_json_body['datas']:
                if tmp_json_body['datas'][key] == 'doctype':
                    json_body['datas'][key] = document['doctype_key']

                if tmp_json_body['datas'][key] in document['data']['custom_fields']:
                    json_body['datas'][key] = document['data']['custom_fields'][tmp_json_body['datas'][key]]

            pdf_writer = pypdf.PdfWriter()
            with tempfile.NamedTemporaryFile() as tf:
                pdf_reader = pypdf.PdfReader(docservers['SPLITTER_ORIGINAL_DOC'] + '/' + batch['file_path'])
                for page in document['pages']:
                    pdf_page = pdf_reader.pages[page['source_page'] - 1]
                    if page['rotation'] != 0:
                        pdf_page.rotate(page['rotation'])
                    pdf_writer.add_page(pdf_page)
                pdf_writer.write(tf.name)
                file = FileStorage(stream=open(tf.name, 'rb'), content_type='application/pdf',
                                   filename=document['doctype_key'] + '_' + str(document['id']) + '.pdf')
                json_body['files'].append(file)
            json_body['splitter_batch_id'] = batch['id']
            verifier.upload_documents(json_body)
        return True, 200

    @staticmethod
    def get_split_methods():
        with open(shared.custom_path + "/bin/scripts/splitter_methods/splitter_methods.json", encoding="utf-8") as methods_json:
            methods = json.load(methods_json)
            return methods['methods']

    @staticmethod
    def get_metadata_methods(method_id):
        res_methods = []
        path = shared.custom_path + '/bin/scripts/splitter_metadata/metadata_methods.json'
        if os.path.isfile(path):
            with open(path, encoding="utf-8") as methods_json:
                methods = json.load(methods_json)
                for method in methods['methods']:
                    res_methods.append({
                        'id': method['id'],
                        'label': method['label'],
                        'callOnSplitterView': method['callOnSplitterView']
                    })
                if method_id:
                    res_methods = [method for method in res_methods if method['id'] == method_id]
                return res_methods
        return None

    @staticmethod
    def import_method_from_script(script_path, script_name, method):
        """
        Import an attribute, function or class from a module.
        :param script_path: path to script to launch
        :param script_name: script name to launch
        :param method: method name to call
        """
        sys.path.append(script_path)
        script = script_name.replace('.py', '')
        module = __import__(script, fromlist=method)
        return getattr(module, method)
