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
import random
from xml.dom import minidom
import xml.etree.cElementTree as ET
from src.backend.classes.Files import Files


class Splitter:
    def __init__(self, config, database, locale, separator_qr, log):
        self.log = log
        self.db = database
        self.qr_pages = []
        self.config = config
        self.locale = locale
        self.result_batches = []
        self.separator_qr = separator_qr
        self.doc_start = self.config.cfg['SPLITTER']['docstart']
        self.bundle_start = self.config.cfg['SPLITTER']['bundlestart']

    def split(self, pages):
        doctype = None
        for index, path in pages:
            separator_type = None
            is_separator = list(filter(lambda separator: int(separator['num']) + 1 == int(index),
                                       self.separator_qr.pages))
            if is_separator:
                qr_code = is_separator[0]['qr_code']
                if self.doc_start in qr_code:
                    separator_type = self.doc_start
                    if 'DOCTYPE' in qr_code:
                        doctype = qr_code.split("|")[2]
                    else:
                        doctype = None

                elif self.bundle_start in qr_code:
                    separator_type = self.bundle_start
                    doctype = None

                if separator_type:
                    self.log.info("Separator type in page " + str(index) + " : " + separator_type)

                if doctype:
                    self.log.info("Doctype in page " + str(index) + " : " + doctype)

            self.qr_pages.append({
                'source_page': index,
                'separator_type': separator_type,
                'doctype': doctype,
                'path': path,
            })

    def get_result_documents(self, blank_pages):
        split_document = 1
        self.result_batches.append([])
        is_previous_code_qr = False

        for index, page in enumerate(self.qr_pages):
            if int(index) in blank_pages:
                if self.config.cfg['REMOVE-BLANK-PAGES']['enabled'] == 'True' or is_previous_code_qr:
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
                    'doctype': page['doctype'],
                    'split_document': split_document,
                    'path': page['path']
                })
                is_previous_code_qr = False

    def save_documents(self, batch_folder, orig_file, input_id):
        for index, batch in enumerate(self.result_batches):
            batch_name = os.path.basename(os.path.normpath(batch_folder))
            input_settings = self.db.select({
                'select': ['*'],
                'table': ['inputs'],
                'where': ['input_id = %s', 'module = %s'],
                'data': [input_id, 'splitter'],
            })

            args = {
                'table': 'splitter_batches',
                'columns': {
                    'file_name': orig_file.rsplit('/')[-1],
                    'batch_folder': batch_name,
                    'first_page': batch[0]['path'],
                    'page_number': str(max((node['split_document'] for node in batch))),
                    'form_id': str(input_settings[0]['default_form_id'])
                }
            }

            batch_id = self.db.insert(args)
            documents_id = 0
            previous_split_document = 0
            for page in batch:
                if page['split_document'] != previous_split_document:
                    args = {
                        'table': 'splitter_documents',
                        'columns': {
                            'batch_id': str(batch_id),
                            'split_index': page['split_document'],
                            'doctype_key': page['doctype'],
                            'data': '{}',
                        }
                    }
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
                pages[-1].append(page['sourcePage'])
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
        separator = mask_args['separator'] if mask_args['separator'] else ''
        for mask_value in mask_values:
            if mask_value in metadata:
                mask_result.append(metadata[mask_value].replace(' ', separator))
            elif mask_value == 'doctype':
                mask_result.append(document['documentTypeName'].replace(' ', separator))
            elif mask_value == 'date':
                mask_result.append(_date.replace(' ', separator))
            elif mask_value == 'random':
                mask_result.append(random_num.replace(' ', separator))
            else:
                mask_result.append(mask_value.replace(' ', separator))

        mask_result = separator.join(str(x) for x in mask_result)
        if 'extension' in mask_args:
            mask_result += '.{}'.format(mask_args['extension'])
        return mask_result

    @staticmethod
    def export_xml(documents, metadata, output_dir, filename, now):
        year = str(now.year)
        month = str(now.month).zfill(2)
        day = str(now.day).zfill(2)
        hour = str(now.hour).zfill(2)
        minute = str(now.minute).zfill(2)
        second = str(now.second).zfill(2)

        root = ET.Element("OPENCAPTURESPLITTER")
        bundle_tag = ET.SubElement(root, "BUNDLE")
        ET.SubElement(bundle_tag, "BUNDLEINDEX").text = "1"
        ET.SubElement(bundle_tag, "FILENAME").text = filename
        ET.SubElement(bundle_tag,
                      "DATE").text = day + "-" + month + "-" + year + " " + hour + ":" + minute + ":" + second
        ET.SubElement(bundle_tag, "BUNDLE_NUMBER").text = filename.split('.')[0]
        ET.SubElement(bundle_tag, "NBDOC").text = str(len(documents))
        ET.SubElement(bundle_tag, "USER_ID_OC").text = metadata['userName']
        ET.SubElement(bundle_tag, "USER_NAME_OC").text = metadata['userLastName']
        ET.SubElement(bundle_tag, "USER_SURNAME_OC").text = metadata['userFirstName']

        header_tag = ET.SubElement(root, "HEADER")
        for key in metadata:
            ET.SubElement(header_tag, key).text = metadata[key]

        documents_tag = ET.SubElement(root, "Documents")
        for index, document in enumerate(documents):
            document_tag = ET.SubElement(documents_tag, "Document")
            file_tag = ET.SubElement(document_tag, "File")
            ET.SubElement(file_tag, "FILEINDEX").text = str(index + 1)
            ET.SubElement(file_tag, "FILENAME").text = document['fileName']
            ET.SubElement(file_tag, "FORMAT").text = "PDF"

            fields_tag = ET.SubElement(document_tag, "FIELDS")
            ET.SubElement(fields_tag, "DOCTYPE").text = document['documentTypeKey']
            for key in document['metadata']:
                ET.SubElement(fields_tag, key).text = document['metadata'][key]

        xml_str = minidom.parseString(ET.tostring(root)).toprettyxml(indent="    ")

        xml_file_path = output_dir + filename
        try:
            with open(xml_file_path, "w", encoding="utf-8") as f:
                f.write(xml_str)
        except IOError:
            return {'OK': False, 'error': "Unable to create file on disk."}

        return {'OK': True, 'path': xml_file_path}

    @staticmethod
    def get_split_methods():
        with open('bin/scripts/splitter_methods/splitter_methods.json') as methods_json:
            methods = json.load(methods_json)
            return methods['methods']
