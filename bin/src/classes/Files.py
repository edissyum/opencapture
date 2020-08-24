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
import re
import subprocess

import cv2
import time
import uuid
import shutil
import PyPDF4
import datetime
import numpy as np
from PIL import Image
from PyPDF4 import utils
from xml.dom import minidom
from wand.color import Color
from wand.api import library
import xml.etree.ElementTree as ET
from wand.image import Image as Img
from wand.exceptions import PolicyError, CacheError
from webApp.functions import retrieve_custom_positions
from xml.sax.saxutils import escape

class Files:
    def __init__(self, imgName, res, quality, Xml, Log, isTiff):
        self.isTiff                = isTiff
        self.jpgName               = imgName + '.jpg'
        self.jpgName_header        = imgName + '_header.jpg'
        self.jpgName_footer        = imgName + '_footer.jpg'
        self.tiffName              = imgName + '.tiff'
        self.tiffName_header       = imgName + '_header.tiff'
        self.tiffName_footer       = imgName + '_footer.tiff'
        self.resolution            = res
        self.compressionQuality    = quality
        self.img                   = None
        self.heightRatio           = ''
        self.Xml                   = Xml
        self.Log                   = Log

    # Convert the first page of PDF to JPG and open the image
    def pdf_to_jpg(self, pdfName, openImg=True, crop=False, zoneToCrop=False):
        if crop:
            if zoneToCrop == 'header':
                self.crop_image_header(pdfName)
                if openImg:
                    self.img = Image.open(self.jpgName_header)
            elif zoneToCrop == 'footer':
                self.crop_image_footer(pdfName)
                if openImg:
                    self.img = Image.open(self.jpgName_footer)
        else:
            self.save_img_with_wand(pdfName, self.jpgName)
            if openImg:
                self.img = Image.open(self.jpgName)

    def pdf_to_tiff(self, pdfName, convertOnlyFirstPage=False, openImg=True, crop=False, zoneToCrop=False):
        # Convert firstly the PDF to full tiff file
        # It will be used to crop header and footer later
        if not os.path.isfile(self.tiffName):
            args = [
                "gs", "-q", "-dNOPAUSE", "-dBATCH",
                "-r" + str(self.resolution), "-sCompression=lzw",
                "-dDownScaleFactor=1",
                "-sDEVICE=tiff32nc",
                "-sOutputFile=" + self.tiffName,
            ]

            if convertOnlyFirstPage:
                args.extend(["-dFirstPage=1", "-dLastPage=1"])
            args.extend([pdfName])

            subprocess.call(args)

        if crop:
            if zoneToCrop == 'header':
                self.crop_image_header(pdfName, True)
            elif zoneToCrop == 'footer':
                self.crop_image_footer(pdfName, True)

        if openImg:
            if zoneToCrop == 'header':
                self.img = Image.open(self.tiffName_header)
            elif zoneToCrop == 'footer':
                self.img = Image.open(self.tiffName_footer)
            else:
                self.img = Image.open(self.tiffName)

    def save_pdf_to_tiff_in_docserver(self, pdfName, output):
        args = [
            "gs", "-q", "-dNOPAUSE", "-dBATCH",
            "-r" + str(self.resolution), "-sCompression=lzw",
            "-sDEVICE=tiff32nc",
            "-sOutputFile=" + output,
            " -f" + pdfName
        ]
        subprocess.call(args)

    # Simply open an image
    def open_img(self, img):
        self.img = Image.open(img)

    @staticmethod
    def open_image_return(img):
        return Image.open(img)

    # Save pdf with one or more pages into JPG file
    def save_img_with_wand(self, pdfName, output):
        try:
            with Img(filename=pdfName, resolution=self.resolution) as pic:
                library.MagickResetIterator(pic.wand)
                pic.scene = 1 # Start cpt of filename at 1 instead of 0
                pic.compression_quality = self.compressionQuality
                pic.background_color = Color("white")
                pic.alpha_channel = 'remove'
                pic.save(filename=output)
        except (PolicyError, CacheError) as e:
            self.Log.error('Error during WAND conversion : ' + str(e))

    @staticmethod
    def sorted_file(path, extension):
        file_json = []
        for file in os.listdir(path):
            if file.endswith("." + extension):
                filename    = os.path.splitext(file)[0]
                isCountable = filename.split('-')
                if len(isCountable) > 1 :
                    cpt = ('%03d' % int(isCountable[1]))
                    file_json.append((cpt, path + file))
                else:
                    file_json.append(('000', path + file))
        sorted_file = sorted(file_json, key=lambda fileCPT: fileCPT[0])
        return sorted_file

    @staticmethod
    def merge_pdf(fileSorted, tmpPath):
        merger = PyPDF4.PdfFileMerger()
        for pdf in fileSorted:
            merger.append(pdf[1])
            os.remove(pdf[1])
        merger.write(tmpPath + '/result.pdf')
        fileToReturn = open(tmpPath + '/result.pdf', 'rb').read()
        os.remove(tmpPath + '/result.pdf')

        return fileToReturn

    @staticmethod
    def check_file_integrity(file, Config):
        isFull = False
        while not isFull:
            with open(file, 'rb') as doc:
                size = os.path.getsize(file)
                time.sleep(1)
                size2 = os.path.getsize(file)
                if size2 == size:
                    if file.endswith(".pdf"):
                        try:
                            PyPDF4.PdfFileReader(doc)
                        except PyPDF4.utils.PdfReadError:
                            shutil.move(file, Config.cfg['GLOBAL']['errorpath'] + os.path.basename(file))
                            return False
                        else:
                            return True
                    elif file.endswith(tuple(['.jpg', '.tiff'])):
                        try:
                            Image.open(file)
                        except OSError:
                            return False
                        else:
                            return True
                    else:
                        return False
                else:
                    continue

    @staticmethod
    def ocr_on_fly(img, selection, Ocr, thumbSize = None, regex = None, removeLines = False):
        rand = str(uuid.uuid4())
        if thumbSize is not None:
            with Image.open(img) as im:
                ratio       = im.size[0]/thumbSize['width']
        else:
            ratio       = 1

        x1          = selection['x1'] * ratio
        y1          = selection['y1'] * ratio
        x2          = selection['x2'] * ratio
        y2          = selection['y2'] * ratio
        cropRatio   = (x1, y1, x2, y2)

        extension = os.path.splitext(img)[1]
        with Image.open(img) as im2:
            croppedImage = im2.crop(cropRatio)
            croppedImage.save('/tmp/cropped_' + rand + extension)

        if removeLines:
            image = cv2.imread('/tmp/cropped_' + rand + extension)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
            horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (20, 1))
            detected_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horizontal_kernel, iterations=2)
            cnts = cv2.findContours(detected_lines, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            cnts = cnts[0] if len(cnts) == 2 else cnts[1]
            for c in cnts:
                cv2.drawContours(image, [c], -1, (255, 255, 255), 3)
            repair_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
            result = 255 - cv2.morphologyEx(255 - image, cv2.MORPH_CLOSE, repair_kernel, iterations=1)
            cv2.imwrite('/tmp/cropped_' + rand + extension, result)

        croppedImage = Image.open('/tmp/cropped_' + rand + extension)
        text = Ocr.text_builder(croppedImage)

        if regex:
            for res in re.finditer(r"" + regex, text):
                os.remove('/tmp/cropped_' + rand + extension)
                return res.group()
            return False

        os.remove('/tmp/cropped_' + rand + extension)
        return text

    @staticmethod
    def get_size(img):
        im = Image.open(img)
        return im.size[0]

    # Crop the file to get the header
    # 1/3 + 10% is the ratio we used
    def crop_image_header(self, pdfName, isTiff=False):
        try :
            if not isTiff:
                with Img(filename=pdfName, resolution=self.resolution) as pic:
                    pic.compression_quality = self.compressionQuality
                    pic.background_color    = Color("white")
                    pic.alpha_channel       = 'remove'
                    self.heightRatio        = int(pic.height / 3 + pic.height * 0.1)
                    pic.crop(width=pic.width, height=int(pic.height - self.heightRatio), gravity='north')
                    pic.save(filename=self.jpgName_header)
            else:
                with Img(filename=self.tiffName, resolution=self.resolution) as pic:
                    pic.compression_quality = self.compressionQuality
                    pic.background_color    = Color("white")
                    pic.alpha_channel       = 'remove'
                    self.heightRatio        = int(pic.height / 3 + pic.height * 0.1)
                    pic.crop(width=pic.width, height=int(pic.height - self.heightRatio), gravity='north')
                    pic.save(filename=self.tiffName_header)
        except (PolicyError, CacheError) as e:
            self.Log.error('Error during WAND conversion : ' + str(e))

    # Crop the file to get the footer
    # 1/3 + 10% is the ratio we used
    def crop_image_footer(self, img, isTiff=False):
        try:
            if not isTiff:
                with Img(filename=img, resolution=self.resolution) as pic:
                    pic.compression_quality = self.compressionQuality
                    pic.background_color    = Color("white")
                    pic.alpha_channel       = 'remove'
                    self.heightRatio        = int(pic.height / 3 + pic.height * 0.1)
                    pic.crop(width=pic.width, height=int(pic.height - self.heightRatio), gravity='south')
                    pic.save(filename=self.jpgName_footer)
            else:
                with Img(filename=self.tiffName, resolution=self.resolution) as pic:
                    pic.compression_quality = self.compressionQuality
                    pic.background_color = Color("white")
                    pic.alpha_channel = 'remove'
                    self.heightRatio = int(pic.height / 3 + pic.height * 0.1)
                    pic.crop(width=pic.width, height=int(pic.height - self.heightRatio), gravity='south')
                    pic.save(filename=self.tiffName_footer)
        except (PolicyError, CacheError) as e:
            self.Log.error('Error during WAND conversion : ' + str(e))

    @staticmethod
    def improve_image_detection(img):
        filename = os.path.splitext(img)
        improved_img = filename[0] + '_improved' + filename[1]
        if not os.path.isfile(improved_img):
            src     = cv2.imread(img)
            gray    = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY)
            _, blackAndWhite = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)
            nlabels, labels, stats, centroids = cv2.connectedComponentsWithStats(blackAndWhite, None, None, None, 8, cv2.CV_32S)

            # get CC_STAT_AREA component
            sizes = stats[1:, -1]
            img2 = np.zeros(labels.shape, np.uint8)

            for i in range(0, nlabels - 1):
                # Filter small dotted regions
                if sizes[i] >= 20:
                    img2[labels == i + 1] = 255

            dst = cv2.bitwise_not(img2)

            kernel = np.ones((1,2),np.uint8)
            src = cv2.adaptiveThreshold(dst, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY,11,2)
            dst = cv2.erode(src, kernel)
            cv2.imwrite(improved_img, dst)

        return improved_img

    @staticmethod
    def move_to_docservers(cfg, file):
        now             = datetime.datetime.now()
        year            = str(now.year)
        day             = str('%02d' % now.day)
        month           = str('%02d' % now.month)
        hour            = str('%02d' % now.hour)
        minute          = str('%02d' % now.minute)
        seconds         = str('%02d' % now.second)
        docserverPath   = cfg['GLOBAL']['docserverpath']

        # Check if docserver folder exists, if not, create it
        if not os.path.exists(docserverPath):
            os.mkdir(docserverPath)

        # Check if year folder exist, if not, create it
        if not os.path.exists(docserverPath + '/' + year):
            os.mkdir(docserverPath + '/' + year)

        # Do the same with month
        if not os.path.exists(docserverPath + '/' + year + '/' + month):
            os.mkdir(docserverPath + '/' + year + '/' + month)

        newFilename    = day + month + year + '_' + hour + minute + seconds + '_' + uuid.uuid4().hex + '.pdf'
        finalDirectory = docserverPath + '/' + year + '/' + month + '/' + newFilename

        shutil.move(file, finalDirectory)

        return finalDirectory

    # When we crop footer we need to rearrange the position of founded text
    # So we add the heightRatio we used (by default 1/3 + 10% of the full image)
    # And also add the position found on the cropped section divided by 2.8
    def returnPositionWithRatio(self, line, target):
        position       = {0: {}, 1: {}}
        position[0][0] = line.position[0][0]
        position[1][0] = line.position[1][0]

        if target == 'footer':
            # TODO
            # Améliorer calcul de position lors d'un crop footer (De temps en temps le résultat n'est pas correct (trop haut généralement))
            position[0][1] = line.position[0][1] + self.heightRatio
            position[1][1] = line.position[1][1] + self.heightRatio
        else:
            position[0][1] = line.position[0][1]
            position[1][1] = line.position[1][1]

        return position

    def exportXml(self, cfg, invoiceNumber, parent, fillPosition = False, db = None, vatNumber = False):
        self.Xml.construct_filename(invoiceNumber, vatNumber)
        filename    = cfg.cfg['GLOBAL']['exportaccountingfolder'] + '/' + self.Xml.filename
        root        = ET.Element("ROOT")

        for parentElement in parent:
            element = ET.SubElement(root, parentElement)
            for child in parent[parentElement]:
                for childElement in child:
                    cleanChild = childElement.replace(parentElement + '_', '')
                    if cleanChild not in ['noDelivery', 'noCommands']:
                        if fillPosition is not False and db is not False:
                            cleanChildPosition = child[childElement]['position']
                            # Add position in supplier database
                            if cleanChildPosition is not None:
                                if 'no_taxes' in cleanChild or 'invoice_number' in cleanChild or 'order_number' in cleanChild or 'delivery_number' in cleanChild or 'vat' in cleanChild:
                                    db.update({
                                        'table': ['suppliers'],
                                        'set': {
                                            cleanChild + '_position': cleanChildPosition
                                        },
                                        'where': ['vat_number = ?'],
                                        'data': [vatNumber]
                                    })
                                    db.conn.commit()
                        # Then create the XML
                        newField = ET.SubElement(element, escape(cleanChild))
                        newField.text = child[childElement]['field']
        xmlRoot = minidom.parseString(ET.tostring(root, encoding="unicode")).toprettyxml()
        file = open(filename, 'w')
        file.write(xmlRoot)
        file.close()

        res = db.select({
            'select': ['typology'],
            'table': ['suppliers'],
            'where': ['vat_number = ?'],
            'data': [vatNumber]
        })
        if res:
            root = ET.parse(filename).getroot()
            typo = res[0]['typology']
            list_of_fields = retrieve_custom_positions(typo, cfg)
            select = []
            for index in list_of_fields:
                field = index.split('-')[1]
                field_position = field + '_position'
                select.append(field_position)

            if select:
                res = db.select({
                    'select': select,
                    'table': ['invoices'],
                    'where': ['invoice_number = ?'],
                    'data': [invoiceNumber]
                })
                if res:
                    for title in root:
                        for element in title:
                            for position in select:
                                if element.tag == position.split('_position')[0] and title.tag not in ['supplierInfo']:
                                    subElementToAppend = root.find(title.tag)
                                    newField = ET.SubElement(subElementToAppend, position)
                                    newField.text = res[0][position]
                    xmlRoot = minidom.parseString(ET.tostring(root, encoding="unicode")).toprettyxml().replace('\n\n', '\n')
                    file = open(filename, 'w')
                    file.write(xmlRoot)
                    file.close()

                    # remove empty lines created by the append of subelement
                    tmp = open(filename, 'r')
                    lines = tmp.read().split("\n")
                    tmp.close()
                    non_empty_lines = [line for line in lines if line.strip() != ""]

                    file = open(filename, 'w')
                    string_without_empty_lines = ""
                    for line in non_empty_lines:
                        string_without_empty_lines += line + "\n"
                    file.write(string_without_empty_lines)
                    file.close()

    def getPages(self, file):
        with open(file, 'rb') as doc:
            pdf = PyPDF4.PdfFileReader(doc)
            try:
                return pdf.getNumPages()
            except ValueError as e:
                self.Log.error(e)
                shutil.move(file, self.Config.cfg['GLOBAL']['errorpath'] + os.path.basename(file))
                return 1
    # OBR01
    @staticmethod
    def create_directory(path):
        try:
            os.mkdir(path)
        except OSError:
            print("Creation of the directory %s failed" % path)
    # END OBR01