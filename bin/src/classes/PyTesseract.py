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
import pyocr
import pytesseract
import pyocr.builders
import xml.etree.ElementTree as ET

class PyTesseract:
    def __init__(self, locale, Log, Config):
        self.Log                = Log
        self.text               = ''
        self.footer_text        = ''
        self.header_text        = ''
        self.tool               = ''
        self.lang               = locale
        self.Config             = Config
        self.searchablePdf      = ''
        self.OCRErrorsTable     = {}

        tools       = pyocr.get_available_tools()
        self.tool   = tools[0]
        self.getOCRErrorsTable()

    def text_builder(self, img):
        try:
            text = pytesseract.image_to_string(
                img,
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
                builder=pyocr.builders.LineBoxBuilder()
            )

        except pytesseract.pytesseract.TesseractError as t:
            self.Log.error('Tesseract ERROR : ' + str(t))

    def word_box_builder(self, img):
        try:
            self.text = self.tool.image_to_string(
                img,
                lang=self.lang,
                builder=pyocr.builders.WordBoxBuilder()
            )

        except pytesseract.pytesseract.TesseractError as t:
            self.Log.error('Tesseract ERROR : ' + str(t))

    def generate_searchable_pdf(self, pdf, Image, Pdf, Config):
        tmpPath = Config.cfg['GLOBAL']['tmppath']
        Image.save_img_with_wand(pdf, tmpPath + 'tmp.jpg')
        i = 0
        sortedImgList = Image.sorted_file(tmpPath, 'jpg')
        for img in sortedImgList:
            tmpSearchablePdf =  pytesseract.image_to_pdf_or_hocr(
                img[1],
                extension='pdf'
            )
            f = open(tmpPath + 'tmp-'+ str(i) +'.pdf', 'wb')
            f.write(bytearray(tmpSearchablePdf))
            f.close()
            i = i + 1
            os.remove(img[1])

        sortedPdfList       = Image.sorted_file(tmpPath, 'pdf')
        self.searchablePdf  = Pdf.merge_pdf(sortedPdfList, tmpPath)

    def getOCRErrorsTable(self):
        configPath  = self.Config.cfg['GLOBAL']['ocrerrorpath']
        root        = ET.parse(configPath).getroot()

        for element in root:
            self.OCRErrorsTable[element.tag] = {}
            for child in element.findall('.//ELEMENT'):
                fix, misread = list(child)
                self.OCRErrorsTable[element.tag][fix.text] = misread.text

    @staticmethod
    def prepare_ocr_on_fly(position):
        position        = eval(position)
        positionArray   = {}
        positionArray.update({'x1': position[0][0]})
        positionArray.update({'y1': position[0][1]})
        positionArray.update({'x2': position[1][0]})
        positionArray.update({'y2': position[1][1]})

        return positionArray