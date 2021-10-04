# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
# @dev : Oussama BRICH <oussama.brich@edissyum.com>

def process(args, file, log, splitter, files, tmp_folder, config):
    log.info('Processing file for separation : ' + file)

    # Get the OCR of the file as a list of line content and position
    files.pdf_to_jpg(file, open_img=False)
    list_files = files.sorted_file(tmp_folder, '.jpg')
    blank_pages = []

    # Remove blank pages
    cpt = 0
    tmp_list_files = list_files
    for f in tmp_list_files:
        if files.is_blank_page(f[1], config.cfg['REMOVE-BLANK-PAGES']):
            blank_pages.append(cpt)
        cpt = cpt + 1

    splitter.separator_qr.run(file)
    splitter.split(list_files)
    splitter.get_result_documents(blank_pages)
    splitter.save_documents(tmp_folder, file, args['input_id'])
