# This file is part of Open-Capture.

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
import random
import pathlib
from xml.dom import minidom
from datetime import datetime
from unidecode import unidecode


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

            else:
                self.result_batches[-1].append({
                    'path': page['path'],
                    'mem_value': page['mem_value'],
                    'metadata_1': page['metadata_1'],
                    'metadata_2': page['metadata_2'],
                    'metadata_3': page['metadata_3'],
                    'split_document': split_document,
                    'source_page': page['source_page'],
                    'doctype_value': page['doctype_value'],
                })
                is_previous_code_qr = False

    def get_default_values(self, form_id, user_id):
        user = None
        default_values = {
            'batch': {},
            'document': {}
        }

        fields = self.db.select({
            'select': ['*'],
            'table': ['form_models_field'],
            'where': ['form_id = %s'],
            'data': [form_id],
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

        for field in fields['fields']['batch_metadata']:
            if 'defaultValue' in field:
                mask = {
                    'mask': field['defaultValue'],
                    'separator': ' ',
                }
                default_values['batch'][field['label_short']] = self.get_value_from_mask(None, data, mask)

        for field in fields['fields']['document_metadata']:
            if 'defaultValue' in field:
                mask = {
                    'mask': field['defaultValue'],
                    'separator': ' ',
                }
                default_values['document'][field['label_short']] = self.get_value_from_mask(None, data, mask)

        return default_values

    def create_batches(self, batch_folder, file, workflow_id, user_id, original_filename, artificial_intelligence):
        batches_id = []
        for _, batch in enumerate(self.result_batches):
            workflow_settings = self.db.select({
                'select': ['id', 'input, process'],
                'table': ['workflows'],
                'where': ['workflow_id = %s', 'module = %s'],
                'data': [workflow_id, 'splitter']
            })

            clean_path = re.sub(r"/+", "/", file)
            clean_ds = re.sub(r"/+", "/", self.docservers['SPLITTER_ORIGINAL_PDF'])

            default_values = {
                'document': {},
                'batch': {}
            }
            form_id = None
            if workflow_settings[0]['process']['use_interface'] and \
                    'form_id' in workflow_settings[0]['process'] and workflow_settings[0]['process']['form_id']:
                form_id = workflow_settings[0]['process']['form_id']
                default_values = self.get_default_values(form_id, user_id)

            args = {
                'table': 'splitter_batches',
                'columns': {
                    'form_id': form_id,
                    'batch_folder': batch_folder,
                    'workflow_id': workflow_settings[0]['id'],
                    'file_path': clean_path.replace(clean_ds, ''),
                    'thumbnail': os.path.basename(batch[0]['path']),
                    'file_name': os.path.basename(original_filename),
                    'data': json.dumps({'custom_fields': default_values['batch']}),
                    'customer_id': str(workflow_settings[0]['input']['customer_id']),
                    'documents_count': str(max((node['split_document'] for node in batch)))
                }
            }
            batch_id = self.db.insert(args)
            batches_id.append(batch_id)

            documents_id = 0
            previous_split_document = 0
            for page in batch:
                if page['split_document'] != previous_split_document:
                    documents_data = {'custom_fields': default_values['document']}
                    args = {
                        'table': 'splitter_documents',
                        'columns': {
                            'batch_id': str(batch_id),
                            'split_index': page['split_document'],
                            'display_order': page['split_document'],
                            'data': documents_data,
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
                            'select': ['id', 'min_proba', 'model_path', 'documents', 'module'],
                            'table': ['ai_models'],
                            'where': ['id = %s'],
                            'data': [model_id]
                        })
                        if ai_model:
                            result, status = artificial_intelligence.predict_from_file_path(
                                file, ai_model[0], page=int(page['source_page']))
                            if result[2] >= ai_model[0]['min_proba']:
                                args['columns']['doctype_key'] = page['doctype_value'] = result[3]

                    else:
                        default_doctype = self.db.select({
                            'select': ['*'],
                            'table': ['doctypes'],
                            'where': ['status <> %s', 'form_id = %s', 'is_default = %s'],
                            'data': ['DEL', workflow_settings[0]['process']['form_id'], 'true'],
                        })
                        if default_doctype:
                            args['columns']['doctype_key'] = default_doctype[0]['key']

                    if page['metadata_1'] or page['metadata_2'] or page['metadata_3']:
                        custom_fields = self.db.select({
                            'select': ['*'],
                            'table': ['custom_fields'],
                            'where': ['module = %s', 'status <> %s'],
                            'data': ['splitter', 'DEL'],
                        })
                        for custom_field in custom_fields:
                            if page['metadata_1'] and custom_field['metadata_key'] == 'SEPARATOR_META1':
                                documents_data['custom_fields'][custom_field['label_short']] = page['metadata_1']
                            if page['metadata_2'] and custom_field['metadata_key'] == 'SEPARATOR_META2':
                                documents_data['custom_fields'][custom_field['label_short']] = page['metadata_2']
                            if page['metadata_3'] and custom_field['metadata_key'] == 'SEPARATOR_META3':
                                documents_data['custom_fields'][custom_field['label_short']] = page['metadata_3']
                    args['columns']['data'] = json.dumps(documents_data)
                    """
                        MEM Courrier entity separator
                    """
                    if page['mem_value']:
                        entity = page['mem_value']
                        if len(entity.split('_')) == 2:
                            entity = entity.split('_')[1]
                        documents_data = {}
                        custom_fields = self.db.select({
                            'select': ['*'],
                            'table': ['custom_fields'],
                            'where': ['metadata_key = %s', 'status <> %s'],
                            'data': ['SEPARATOR_MEM', 'DEL'],
                        })
                        documents_data['custom_fields'] = {}
                        for custom_field in custom_fields:
                            documents_data['custom_fields'][custom_field['label_short']] = entity
                            args['columns']['data'] = json.dumps(documents_data)
                    documents_id = self.db.insert(args)

                previous_split_document = page['split_document']
                paths_elements = pathlib.Path(page['path'])
                thumbnail = os.path.join(*paths_elements.parts[-2:])
                rotation = workflow_settings[0]['process']['rotation']
                args = {
                    'table': 'splitter_pages',
                    'columns': {
                        'thumbnail': thumbnail,
                        'document_id': str(documents_id),
                        'source_page': page['source_page'],
                        'rotation': rotation if rotation != 'no_rotation' else 0,
                    }
                }
                self.db.insert(args)
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
                    'source_page': page['sourcePage'],
                })
        return documents_pages

    @staticmethod
    def get_value_from_mask(document, metadata, mask_args):
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
            elif key == 'id':
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
        if 'extension' in mask_args:
            mask_result += '.{}'.format(mask_args['extension'])

        return mask_result

    @staticmethod
    def export_xml(documents, metadata, parameters, regex):
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
        doc_loop_item_template = re.search(regex['splitter_doc_loop'], xml_as_string, re.DOTALL)

        xml_as_string = xml_as_string.replace('#date#', date)
        xml_as_string = xml_as_string.replace('#user_lastname#', user_lastname)
        xml_as_string = xml_as_string.replace('#user_firstname#', user_firstname)
        xml_as_string = xml_as_string.replace('#documents_count#', str(len(documents)))
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
            if not metadata[condition_var]:
                xml_as_string = xml_as_string.replace(condition[1], '')

        """
            Add documents metadata
        """
        documents_tags = ""
        if doc_loop_item_template:
            for index, document in enumerate(documents):
                if 'is_file_added_to_zip' in document and document['is_file_added_to_zip']:
                    continue

                doc_loop_item = doc_loop_item_template.group(1)
                doc_loop_item = doc_loop_item.replace('#date#', date)
                doc_loop_item = doc_loop_item.replace('#user_lastname#', user_lastname)
                doc_loop_item = doc_loop_item.replace('#user_lastname#', user_lastname)
                doc_loop_item = doc_loop_item.replace('#documents_count#', str(len(documents)))
                doc_loop_item = doc_loop_item.replace('#doctype#', str(document['doctype_key']))
                doc_loop_item = doc_loop_item.replace('#document_identifier#', str(document['id']))
                doc_loop_item = doc_loop_item.replace('#random#', str(random.randint(0, 99999)).zfill(5))
                doc_loop_item = doc_loop_item.replace('#filename#', document['filename'] if 'filename' in document else '')

                for key in document['data']['custom_fields']:
                    if f'#{key}#' in xml_as_string:
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
            with open(xml_file_path, "w") as f:
                minidom.parseString(xml_as_string)
                f.write(xml_as_string)
        except Exception as e:
            return False, str(e)

        return True, xml_file_path

    @staticmethod
    def get_split_methods(docservers):
        with open(docservers['SPLITTER_METHODS_PATH'] + '/splitter_methods.json', encoding="UTF-8") as methods_json:
            methods = json.load(methods_json)
            return methods['methods']

    @staticmethod
    def get_metadata_methods(docservers, method_id):
        res_methods = []
        with open(docservers['SPLITTER_METADATA_PATH'] + '/metadata_methods.json', encoding="UTF-8") as methods_json:
            methods = json.load(methods_json)
            for method in methods['methods']:
                res_methods.append({
                    'id': method['id'],
                    'label': method['label'],
                    'callOnSplitterView': method['callOnSplitterView'],
                })
            if method_id:
                res_methods = [method for method in res_methods if method['id'] == method_id]
            return res_methods

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

    def batch_auto_validate(self, batch_id):
        batch = self.db.select({
            'select': ['*'],
            'table': ['splitter_batches'],
            'where': ['id = %s'],
            'data': [str(batch_id)],
        })

        return True, ''
