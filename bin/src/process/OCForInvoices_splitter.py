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

import os
import shutil


def process(file, log, splitter, files, ocr, tmp_folder, config):
    log.info('Processing file for separation : ' + file)

    # Get the OCR of the file as a list of line content and position
    if files.isTiff == "False":
        files.pdf_to_jpg(file, open_img=False)
        extension = 'jpg'
    else:
        tiff_filename = files.jpgName.replace('.jpg', '') + '-%03d.tiff'
        files.save_pdf_to_tiff_in_docserver(file, tiff_filename)
        extension = 'tiff'

    list_files = files.sorted_file(tmp_folder, extension)

    text_extracted = []

    # Remove blank pages
    # Recreate the array if somes pages are deleted to get the correct indexes of pages
    if config.cfg['REMOVE-BLANK-PAGES']['enabled'] == 'True':
        cpt = 0
        blank_pages_exists = False
        tmp_list_files = list_files
        for f in tmp_list_files:
            if files.is_blank_page(f[1], config.cfg['REMOVE-BLANK-PAGES']):
                del tmp_list_files[cpt]
                blank_pages_exists = True
            cpt = cpt + 1

        if blank_pages_exists:
            list_files = []
            for idx, item in enumerate(tmp_list_files):
                idx = idx + 1
                file_name = item[1].split('-')[0]
                new_file = file_name + '-' + str(idx) + '.jpg'
                shutil.move(item[1], new_file)
                list_files.append(('%03d' % idx, new_file))

    # Create array of text within pages
    for f in list_files:
        img = files.open_image_return(f[1])
        text = ocr.text_builder(img)
        text = text.replace('-\n', '')
        text_extracted.append(text)
        # Remove temporary files
        if files.isTiff == "True":
            try:
                os.remove(f[1])
            except OSError:
                pass

    invoices_separated = splitter.get_page_separate_order(text_extracted)

    # get jpg format which is used to display images
    if files.isTiff == "True":
        extension = 'jpg'
        files.pdf_to_jpg(file, False)
        list_files = files.sorted_file(tmp_folder, extension)

    splitter.save_image_from_pdf(list_files, invoices_separated, tmp_folder, file)
