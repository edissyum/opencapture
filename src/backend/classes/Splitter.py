# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
import json
import os
import sys
import random
import re
from xml.dom import minidom
from unidecode import unidecode

from src.backend.classes.Files import Files


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
                    'source_page': page['source_page'],
                    'doctype_value': page['doctype_value'],
                    'maarch_value': page['maarch_value'],
                    'metadata_1': page['metadata_1'],
                    'metadata_2': page['metadata_2'],
                    'metadata_3': page['metadata_3'],
                    'split_document': split_document,
                    'path': page['path']
                })
                is_previous_code_qr = False

    def save_documents(self, batch_folder, file, input_id, original_filename):
        for _, batch in enumerate(self.result_batches):
            batch_name = os.path.basename(os.path.normpath(batch_folder))
            input_settings = self.db.select({
                'select': ['*'],
                'table': ['inputs'],
                'where': ['input_id = %s', 'module = %s'],
                'data': [input_id, 'splitter'],
            })

            clean_path = re.sub(r"/+", "/", file)
            clean_ds = re.sub(r"/+", "/", self.docservers['SPLITTER_ORIGINAL_PDF'])

            args = {
                'table': 'splitter_batches',
                'columns': {
                    'file_path': clean_path.replace(clean_ds, ''),
                    'file_name': os.path.basename(original_filename),
                    'batch_folder': batch_name,
                    'thumbnail': batch[0]['path'],
                    'page_number': str(max((node['split_document'] for node in batch))),
                    'form_id': str(input_settings[0]['default_form_id'])
                }
            }

            batch_id = self.db.insert(args)
            documents_id = 0
            previous_split_document = 0
            for page in batch:
                if page['split_document'] != previous_split_document:
                    documents_data = {'custom_fields': {}}
                    args = {
                        'table': 'splitter_documents',
                        'columns': {
                            'batch_id': str(batch_id),
                            'split_index': page['split_document'],
                            'display_order': page['split_document'],
                            'data': '{}',
                        }
                    }
                    """
                        Open-Capture separator
                    """
                    if page['doctype_value']:
                        args['columns']['doctype_key'] = page['doctype_value']
                    else:
                        default_doctype = self.db.select({
                            'select': ['*'],
                            'table': ['doctypes'],
                            'where': ['status <> %s', 'form_id = %s', 'is_default = %s'],
                            'data': ['DEL', input_settings[0]['default_form_id'], 'true'],
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
                        Maarch entity separator
                    """
                    if page['maarch_value']:
                        entity = page['maarch_value']
                        if len(entity.split('_')) == 2:
                            entity = entity.split('_')[1]
                        documents_data = {}
                        custom_fields = self.db.select({
                            'select': ['*'],
                            'table': ['custom_fields'],
                            'where': ['metadata_key = %s', 'status <> %s'],
                            'data': ['SEPARATOR_MAARCH', 'DEL'],
                        })
                        documents_data['custom_fields'] = {}
                        for custom_field in custom_fields:
                            documents_data['custom_fields'][custom_field['label_short']] = entity
                            args['columns']['data'] = json.dumps(documents_data)
                    documents_id = self.db.insert(args)

                previous_split_document = page['split_document']
                image = Files.open_image_return(page['path'])
                args = {
                    'table': 'splitter_pages',
                    'columns': {
                        'document_id': str(documents_id),
                        'thumbnail': page['path'],
                        'source_page': page['source_page'],
                    }
                }
                self.db.insert(args)
                image.save(page['path'], 'JPEG')
            self.db.conn.commit()

        return {'OK': True}

    @staticmethod
    def get_split_pages(documents):
        pages = []
        for document in documents:
            pages.append([])
            for page in document['pages']:
                pages[-1].append({
                    'page_id': page['id'],
                    'rotation': page['rotation'],
                    'source_page': page['sourcePage'],
                })
        return pages

    @staticmethod
    def get_mask_result(document, metadata, now_date, mask_args):
        mask_result = []
        year = str(now_date.year)
        day = str('%02d' % now_date.day)
        month = str('%02d' % now_date.month)
        hour = str('%02d' % now_date.hour)
        minute = str('%02d' % now_date.minute)
        seconds = str('%02d' % now_date.second)
        _date = year + month + day + hour + minute + seconds
        random_num = str(random.randint(0, 99999)).zfill(5)
        mask_values = mask_args['mask'].split('#')
        print("mask_values : ")
        print(mask_values)
        separator = mask_args['separator'] if mask_args['separator'] else ''
        for mask_value in mask_values:
            if not mask_value:
                continue
            """
                PDF or XML masks value
            """
            if mask_value in metadata:
                mask_result.append(metadata[mask_value].replace(' ', separator))
            elif mask_value == 'date':
                mask_result.append(_date.replace(' ', separator))
            elif mask_value == 'random':
                mask_result.append(random_num.replace(' ', separator))
            elif document:
                """
                    PDF masks value
                """
                if mask_value in document['metadata']:
                    mask_result.append(
                        (document['metadata'][mask_value] if document['metadata'][mask_value] else '')
                        .replace(' ', separator))
                elif mask_value == 'doctype':
                    mask_result.append(document['documentTypeKey'].replace(' ', separator))
                elif mask_value == 'document_identifier':
                    mask_result.append(document['id'])
                else:
                    """
                        PDF value when mask value not found in metadata
                    """
                    mask_result.append(mask_value.replace(' ', separator))
            else:
                """
                    XML value when mask value not found in metadata
                """
                mask_result.append(mask_value.replace(' ', separator))

        mask_result = separator.join(str(x) for x in mask_result)
        mask_result = unidecode(mask_result)
        if 'extension' in mask_args:
            mask_result += '.{}'.format(mask_args['extension'])
        return mask_result

    @staticmethod
    def export_xml(documents, metadata, parameters, filename, now):
        year = str(now.year)
        month = str(now.month).zfill(2)
        day = str(now.day).zfill(2)
        hour = str(now.hour).zfill(2)
        minute = str(now.minute).zfill(2)
        second = str(now.second).zfill(2)
        date = day + "-" + month + "-" + year + " " + hour + ":" + minute + ":" + second
        doc_loop_item_template = re.search(r'<!-- %BEGIN-DOCUMENT-LOOP -->(.*?)<!-- %END-DOCUMENT-LOOP -->',
                                           parameters['xml_template'], re.DOTALL)
        parameters['xml_template'] = parameters['xml_template'].replace('#date', date)
        parameters['xml_template'] = parameters['xml_template'].replace('#identifier', str(metadata['id']))
        parameters['xml_template'] = parameters['xml_template'].replace('#documents_count', str(len(documents)))
        parameters['xml_template'] = parameters['xml_template'].replace('#user_first_name',
                                                                        str(metadata['userFirstName']))
        parameters['xml_template'] = parameters['xml_template'].replace('#user_last_name',
                                                                        str(metadata['userLastName']))
        parameters['xml_template'] = parameters['xml_template'].replace('#random',
                                                                        str(random.randint(0, 99999)).zfill(5))
        """
            Add batch metadata
        """
        for key in metadata:
            if f'#{key}' in parameters['xml_template']:
                parameters['xml_template'] = parameters['xml_template'].replace(f'#{key}', str(metadata[key]))

        """
            Add document metadata
        """
        documents_tags = ""
        if doc_loop_item_template:
            for index, document in enumerate(documents):
                if document['id'] not in metadata['doc_except_from_zip'] and metadata['zip_filename']:
                    continue
                doc_loop_item = doc_loop_item_template.group(1)
                doc_loop_item = doc_loop_item.replace('#date', date)
                doc_loop_item = doc_loop_item.replace('#filename', document['fileName'] if 'fileName' in document else '')
                doc_loop_item = doc_loop_item.replace('#documents_count', str(len(documents)))
                doc_loop_item = doc_loop_item.replace('#document_identifier', str(document['id']))
                doc_loop_item = doc_loop_item.replace('#doctype', str(document['documentTypeKey']))
                doc_loop_item = doc_loop_item.replace('#user_last_name', str(metadata['userLastName']))
                doc_loop_item = doc_loop_item.replace('#random', str(random.randint(0, 99999)).zfill(5))
                doc_loop_item = doc_loop_item.replace('#user_first_name', str(metadata['userFirstName']))
                for key in document['metadata']:
                    if f'#{key}' in parameters['xml_template']:
                        doc_loop_item = doc_loop_item.replace(f'#{key}', str(document['metadata'][key]))
                documents_tags += doc_loop_item

            parameters['xml_template'] = parameters['xml_template'].replace(doc_loop_item_template.group(1), documents_tags)

        xml_file_path = parameters['folder_out'] + filename

        """
            Check XML Syntax and write file result 
        """
        try:
            with open(xml_file_path, "w", encoding="utf-8") as f:
                minidom.parseString(parameters['xml_template'])
                f.write(parameters['xml_template'])
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
