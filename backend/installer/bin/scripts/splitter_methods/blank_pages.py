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

import cv2

def is_blank_page(image):
    import numpy as np
    img = cv2.imread(image, cv2.IMREAD_GRAYSCALE)
    white = np.sum(img > 245)
    total = img.size
    return (white / total) > 0.98

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

    split(args['splitter'], list_files)
    args['splitter'].get_result_documents([])
    original_file = args['file']
    file = args['files'].move_to_docservers(args['docservers'], args['file'], 'splitter')
    if args['ocrise']:
        args['files'].ocrise_pdf(file, args['log'])

    process_res = args['splitter'].create_batches(args, file, original_file)
    return process_res


def split(splitter, pages):
    """
    Customized split method
    :param splitter: Splitter object
    :param pages: pages list
    :return: N/A
    """

    for index, path in pages:
        separator_type = None

        if is_blank_page(path):
            if int(index) < len(pages):
                # If the page is blank and it's not the last page, we consider it as a separator for a new document.
                separator_type = splitter.doc_start
            else:
                # If the page is blank and it's the last page, do not considerate it
                continue

        splitter.qr_pages.append({
            'source_page': index,
            'separator_type': separator_type,
            'doctype_value': None,
            'mem_value': None,
            'metadata_1': None,
            'metadata_2': None,
            'metadata_3': None,
            'path': path
        })
