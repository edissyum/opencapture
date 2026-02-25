# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan CHEVAL <nathan.cheval@edissyum.com>

def process(args):
    """
    Process custom split for file
    :param args: has :
    - log: log object
    - user_id: User id
    - docservers: paths
    - files: Files object
    - config: Config object
    - ocr: PyTesseract object
    - file: File path to split
    - splitter: Splitter object
    - regex: regex content values
    - customer_id: used customer id
    - batch_folder: batch folder path
    - configurations: configuration values
    - ocrise: bool, launch OCR on file or not
    - artificial_intelligence: ArtificialIntelligence object
    :return: N/A
    """

    args['log'].info('Processing file for separation : ' + args['file'])
    batch_folder_path = f"{args['docservers']['SPLITTER_BATCHES']}/{args['batch_folder']}/"
    batch_thumbs_path = f"{args['docservers']['SPLITTER_THUMB']}/{args['batch_folder']}/"
    args['files'].save_img_with_pdf2image(args['file'], batch_folder_path + "page")
    args['files'].save_img_with_pdf2image_min(args['file'], batch_thumbs_path + "page", single_file=False, module='splitter')

    list_files = args['files'].sorted_file(batch_folder_path, 'jpg')

    separate_by_document_number_value = 2
    if 'separate_by_document_number_value' in args['workflow_settings']['input'] and args['workflow_settings']['input']['separate_by_document_number_value']:
        separate_by_document_number_value = int(args['workflow_settings']['input']['separate_by_document_number_value'])

    split(args['splitter'], list_files, separate_by_document_number_value)
    args['splitter'].get_result_documents([])
    original_file = args['file']

    file = args['files'].move_to_docservers(args['docservers'], args['file'], 'splitter')
    if args['ocrise']:
        args['files'].ocrise_pdf(file, args['log'])

    process_res = args['splitter'].create_batches(args, file, original_file)
    return process_res


def split(splitter, pages, separate_by_document_number_value):
    """
    Customized split method
    :param separate_by_document_number_value: Number of pages to separate documents
    :param splitter: Splitter object
    :param pages: pages list
    :return: N/A
    """

    for index, path in pages:
        if (int(index) - 1) % separate_by_document_number_value == 0:
            splitter.qr_pages.append({
                'source_page': index,
                'separator_type': splitter.doc_start,
                'doctype_value': None,
                'mem_value': None,
                'metadata_1': None,
                'metadata_2': None,
                'metadata_3': None,
                'path': path
            })

        splitter.qr_pages.append({
            'source_page': index,
            'separator_type': None,
            'doctype_value': None,
            'mem_value': None,
            'metadata_1': None,
            'metadata_2': None,
            'metadata_3': None,
            'path': path
        })
