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

# @dev : Oussama BRICH <oussama.brich@edissyum.com>

import re
from PIL import Image


def process(args):
    """
    Process custom split for file
    :param args: has :
    - log: log object
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
    :return: N/A
    """
    args['log'].info('Processing file for separation : ' + args['file'])

    batch_folder_path = f"{args['docservers']['SPLITTER_BATCHES']}/{args['batch_folder']}/"
    batch_thumbs_path = f"{args['docservers']['SPLITTER_THUMB']}/{args['batch_folder']}/"
    args['files'].save_img_with_pdf2image(args['file'], batch_folder_path + "page")
    args['files'].save_img_with_pdf2image_min(args['file'], batch_thumbs_path + "page", single_file=False)

    list_files = args['files'].sorted_file(args['batch_folder'], 'jpg')
    blank_pages = []

    regex_content = {
        'invoice_number': args['regex']['invoice_number'],
        'vat_number': args['regex']['vat_number'],
        'siret': args['regex']['siret'],
        'siren': args['regex']['siren'],
        'iban': args['regex']['iban'],
    }

    # Remove blank pages
    if args['splitter'].separator_qr.remove_blank_pages:
        cpt = 0
        tmp_list_files = list_files
        for f in tmp_list_files:
            if args['files'].is_blank_page(f[1]):
                blank_pages.append(cpt)
            cpt = cpt + 1

    split(args['splitter'], list_files, args['ocr'], regex_content)
    original_file = args['file']
    file = args['files'].move_to_docservers(args['docservers'], args['file'], 'splitter')
    if args['ocrise']:
        args['files'].ocrise_pdf(file, args['configurations']['locale'], args['log'])
    args['splitter'].save_documents(args['batch_folder'], file, args['input_id'], original_file)


def split(splitter, pages, ocr, regex_content):
    """
    Customized split method
    :param splitter: Splitter object
    :param pages: pages list
    :param regex_content: references regex content
    :return: N/A
    """
    is_next_page_has_same_references = True
    splitter.result_batches = []
    split_document = 1
    text_array = []

    for index, path in pages:
        img = Image.open(path)
        text = ocr.text_builder(img)
        text_array.append(text)

    if pages:
        splitter.result_batches.append([])
    for index, path in pages:
        current_page = int(index) - 1
        is_next_page_has_same_invoice_number = is_next_page_has_same_reference(text_array, current_page, regex_content['invoice_number'])
        is_next_page_has_same_vat_number = is_next_page_has_same_reference(text_array, current_page, regex_content['vat_number'])
        is_next_page_has_same_siret = is_next_page_has_same_reference(text_array, current_page, regex_content['siret'])
        is_next_page_has_same_siren = is_next_page_has_same_reference(text_array, current_page, regex_content['siren'])
        is_next_page_has_same_iban = is_next_page_has_same_reference(text_array, current_page, regex_content['iban'])

        if not is_next_page_has_same_references:
            split_document += 1
        splitter.result_batches[-1].append({
            'path': path,
            'source_page': index,
            'split_document': split_document,
            'doctype_value': None,
            'metadata_1': None,
            'metadata_2': None,
            'metadata_3': None,
            'mem_value': None,
        })

        if not is_next_page_has_same_invoice_number or \
                not is_next_page_has_same_vat_number or \
                not is_next_page_has_same_siret or \
                not is_next_page_has_same_siren or \
                not is_next_page_has_same_iban:
            is_next_page_has_same_references = False
        else:
            is_next_page_has_same_references = True


def is_next_page_has_same_reference(text_array, current_page, regex):
    """
    check if the next page has the same reference
    :param text_array: array of text returned by ocr
    :param current_page: index of the currect page to verify if next page has the same reference
    :param regex: reference regex (vatn, invoice number, siret, siren, ...)
    :return bool: is the next page has a same reference
    """
    is_same_reference = True
    next_page = current_page + 1
    is_found = False
    # delete \n (if we keep it regex won't work well)
    text_array[current_page] = text_array[current_page].replace('\n', ' ').replace('\r', '')
    for matched_content_current_page in re.finditer(regex, text_array[current_page].replace(' ', '')):
        if matched_content_current_page:
            if is_found:
                break
            # verify if next page exit
            if current_page + 1 < len(text_array):
                for matched_content_next_page in re.finditer(regex, text_array[next_page].replace(' ', '')):
                    if matched_content_next_page:
                        if matched_content_current_page.group() != matched_content_next_page.group():
                            is_same_reference = False
                        else:
                            is_same_reference = True
                            is_found = True
                            break
    return is_same_reference
