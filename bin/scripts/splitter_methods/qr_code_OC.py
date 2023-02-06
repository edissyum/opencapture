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
    :return: N/A
    """

    args['log'].info('Processing file for separation : ' + args['file'])
    batch_folder_path = f"{args['docservers']['SPLITTER_BATCHES']}/{args['batch_folder']}/"
    batch_thumbs_path = f"{args['docservers']['SPLITTER_THUMB']}/{args['batch_folder']}/"
    args['files'].save_img_with_pdf2image(args['file'], batch_folder_path + "page")
    args['files'].save_img_with_pdf2image_min(args['file'], batch_thumbs_path + "page", single_file=False)

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

    args['splitter'].separator_qr.run(args['file'])
    split(args['splitter'], list_files)
    args['splitter'].get_result_documents(blank_pages)
    original_file = args['file']
    file = args['files'].move_to_docservers(args['docservers'], args['file'], 'splitter')
    if args['ocrise']:
        args['files'].ocrise_pdf(file, args['configurations']['locale'], args['log'])
    args['splitter'].create_batch(args['batch_folder'], file, args['input_id'], args['user_id'], original_file)


def split(splitter, pages):
    """
    Customized split method
    :param splitter: Splitter object
    :param pages: pages list
    :return: N/A
    """
    doctype_value = None
    metadata_1 = None
    metadata_2 = None
    metadata_3 = None

    for index, path in pages:
        separator_type = None
        is_separator = list(filter(lambda separator: int(separator['num']) + 1 == int(index),
                                   splitter.separator_qr.pages))
        if is_separator:
            qr_code = is_separator[0]['qr_code']
            splitter.log.info("QR Code in page " + str(index) + " : " + str(qr_code))

            """
                Open-Capture separator
            """
            if splitter.doc_start in qr_code:
                separator_type = splitter.doc_start
                if len(qr_code.split('|')) > 1:
                    doctype_value = qr_code.split("|")[1] if qr_code.split("|")[1] else None
                    if len(qr_code.split('|')) > 2:
                        metadata_1 = qr_code.split("|")[2] if qr_code.split("|")[2] else None
                        if len(qr_code.split('|')) > 3:
                            metadata_2 = qr_code.split("|")[3] if qr_code.split("|")[3] else None
                            if len(qr_code.split('|')) > 4:
                                metadata_3 = qr_code.split("|")[4] if qr_code.split("|")[4] else None
                            else:
                                metadata_3 = None
                        else:
                            metadata_2 = None
                    else:
                        metadata_1 = None
                else:
                    doctype_value = None

            elif splitter.bundle_start in qr_code:
                separator_type = splitter.bundle_start
                doctype_value = None

            splitter.log.info("Code QR in page " + str(index) + " : " + qr_code)

        splitter.qr_pages.append({
            'source_page': index,
            'separator_type': separator_type,
            'doctype_value': doctype_value,
            'mem_value': None,
            'metadata_1': metadata_1,
            'metadata_2': metadata_2,
            'metadata_3': metadata_3,
            'path': path,
        })
