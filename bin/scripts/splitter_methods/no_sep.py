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
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan CHEVAL <nathan.cheval@edissyum.com>

import re
from PIL import Image


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
    blank_pages = []

    # Remove blank pages
    if args['splitter'].separator_qr.remove_blank_pages:
        cpt = 0
        tmp_list_files = list_files
        for f in tmp_list_files:
            if args['files'].is_blank_page(f[1]):
                blank_pages.append(cpt)
            cpt = cpt + 1

    original_file = args['file']
    file = args['files'].move_to_docservers(args['docservers'], args['file'], 'splitter')
    if args['ocrise']:
        args['files'].ocrise_pdf(file, args['log'])

    args['splitter'].result_batches.append([])
    for page, page_path in list_files:
        args['splitter'].result_batches[-1].append({
            'path': page_path,
            'source_page': page,
            'split_document': 1,
            'doctype_value': None,
            'metadata_1': None,
            'metadata_2': None,
            'metadata_3': None,
            'mem_value': None,
        })

    process_res = args['splitter'].create_batches(args['batch_folder'], file, args['workflow_id'], args['user_id'],
                                                  original_file, args['artificial_intelligence'], args['attachments'])
    return process_res

