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

def process(args, file, Log, Separator, Config, Files, Ocr, Locale, Database, tmpFolder, q = None,):
    Log.info('Processing file for separation : ' + file)

    # Get the OCR of the file as a list of line content and position
    Files.pdf_to_jpg(file, False)

    files = Files.sorted_file(tmpFolder, 'jpg')

    text_extracted = []
    for f in files:
        img = Files.open_image_return(f[1])
        text = Ocr.text_builder(img)
        text = text.replace('-\n', '')
        text_extracted.append(text)
    invoices_separated = Separator.get_page_separate_order(text_extracted)

    Separator.save_image_from_pdf(files ,invoices_separated, tmpFolder, file)

