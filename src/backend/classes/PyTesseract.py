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
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import pyocr
import pytesseract
import pyocr.builders
import xml.etree.ElementTree as Et


class PyTesseract:
    def __init__(self, locale, log, config):
        self.Log = log
        self.tool = ''
        self.text = ''
        self.lang = locale
        self.last_text = ''
        self.Config = config
        self.footer_text = ''
        self.header_text = ''
        self.searchablePdf = ''
        self.OCRErrorsTable = {}
        self.footer_last_text = ''
        self.header_last_text = ''

        tools = pyocr.get_available_tools()
        self.tool = tools[0]
        self.get_ocr_errors_table()

    def text_builder(self, img):
        try:
            text = pytesseract.image_to_string(
                img,
                config='--psm 6',
                lang=self.lang
            )
            return text
        except pytesseract.pytesseract.TesseractError as t:
            self.Log.error('Tesseract ERROR : ' + str(t))

    def line_box_builder(self, img):
        try:
            return self.tool.image_to_string(
                img,
                lang=self.lang,
                builder=pyocr.builders.LineBoxBuilder(6)  # Argument is the choosen PSM
            )

        except pytesseract.pytesseract.TesseractError as t:
            self.Log.error('Tesseract ERROR : ' + str(t))

    def get_ocr_errors_table(self):
        config_path = self.Config.cfg['GLOBAL']['ocrerrorpath']
        root = Et.parse(config_path).getroot()

        for element in root:
            self.OCRErrorsTable[element.tag] = {}
            for child in element.findall('.//ELEMENT'):
                fix, misread = list(child)
                self.OCRErrorsTable[element.tag][fix.text] = misread.text
