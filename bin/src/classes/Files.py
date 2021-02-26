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
import ast
import subprocess

import cv2
import time
import uuid
import shutil
import PyPDF4
import datetime
import numpy as np
from PIL import Image
from skimage import io
from PyPDF4 import utils
from xml.dom import minidom
from wand.color import Color
from wand.api import library
from deskew import determine_skew
from skimage.color import rgb2gray
import xml.etree.ElementTree as Et
from wand.image import Image as Img
from skimage.transform import rotate
from wand.exceptions import PolicyError, CacheError
from werkzeug.utils import secure_filename

from webApp.functions import retrieve_custom_positions
from xml.sax.saxutils import escape


class Files:
    def __init__(self, img_name, res, quality, xml, log, is_tiff):
        self.isTiff = is_tiff
        self.jpgName = img_name + '.jpg'
        self.jpgName_header = img_name + '_header.jpg'
        self.jpgName_footer = img_name + '_footer.jpg'
        self.tiffName = img_name + '.tiff'
        self.tiffName_header = img_name + '_header.tiff'
        self.tiffName_footer = img_name + '_footer.tiff'
        self.jpgName_last = img_name + '_last.jpg'
        self.jpgName_last_header = img_name + '_last_header.jpg'
        self.jpgName_last_footer = img_name + '_last_footer.jpg'
        self.tiffName_last = img_name + '_last.tiff'
        self.tiffName_last_header = img_name + '_last_header.tiff'
        self.tiffName_last_footer = img_name + '_last_footer.tiff'
        self.custom_fileName_tiff = img_name + '_custom.tiff'
        self.custom_fileName = img_name + '_custom.jpg'
        self.resolution = res
        self.compressionQuality = quality
        self.img = None
        self.heightRatio = ''
        self.xml = xml
        self.Log = log

    # Convert the first page of PDF to JPG and open the image
    def pdf_to_jpg(self, pdf_name, open_img=True, crop=False, zone_to_crop=False, last_image=False, is_custom=False):
        if crop:
            if zone_to_crop == 'header':
                if is_custom:
                    self.crop_image_header(pdf_name, False, last_image, self.custom_fileName)
                else:
                    self.crop_image_header(pdf_name, False, last_image)
                if open_img:
                    if last_image:
                        self.img = Image.open(self.jpgName_last_header)
                    else:
                        self.img = Image.open(self.jpgName_header)
            elif zone_to_crop == 'footer':
                if is_custom:
                    self.crop_image_footer(pdf_name, False, last_image, self.custom_fileName)
                else:
                    self.crop_image_footer(pdf_name, False, last_image)
                if open_img:
                    if last_image:
                        self.img = Image.open(self.jpgName_last_footer)
                    else:
                        self.img = Image.open(self.jpgName_footer)
        else:
            if last_image:
                target = self.jpgName_last
            elif is_custom:
                target = self.custom_fileName
            else:
                target = self.jpgName
            self.save_img_with_wand(pdf_name, target)
            if open_img:
                self.img = Image.open(target)

    def pdf_to_tiff(self, pdf_name, output_file, convert_only_first_page=False, open_img=True, crop=False, zone_to_crop=False, last_page=None):
        # Convert firstly the PDF to full tiff file
        # It will be used to crop header and footer later
        if not os.path.isfile(output_file):
            args = [
                "gs", "-q", "-dNOPAUSE", "-dBATCH",
                "-r" + str(self.resolution), "-sCompression=lzw",
                "-dDownScaleFactor=1",
                "-sDEVICE=tiff32nc",
                "-sOutputFile=" + output_file,
            ]

            if convert_only_first_page:
                args.extend(["-dFirstPage=1", "-dLastPage=1"])
            elif last_page:
                args.extend(["-dFirstPage=" + str(last_page), "-dLastPage=" + str(last_page)])

            args.extend([pdf_name])
            subprocess.call(args)
        if crop:
            if zone_to_crop == 'header':
                if output_file == self.custom_fileName_tiff:
                    self.crop_image_header(pdf_name, True, last_page, output_file)
                else:
                    self.crop_image_header(pdf_name, True, last_page)
            elif zone_to_crop == 'footer':
                if output_file == self.custom_fileName_tiff:
                    self.crop_image_footer(pdf_name, True, last_page, output_file)
                else:
                    self.crop_image_footer(pdf_name, True, last_page)

        if open_img:
            if zone_to_crop == 'header':
                if last_page:
                    self.img = Image.open(self.tiffName_last_header)
                else:
                    self.img = Image.open(self.tiffName_header)
            elif zone_to_crop == 'footer':
                if last_page:
                    self.img = Image.open(self.tiffName_last_footer)
                else:
                    self.img = Image.open(self.tiffName_footer)
            else:
                if last_page:
                    self.img = Image.open(self.tiffName_last)
                else:
                    self.img = Image.open(self.tiffName)

    def save_pdf_to_tiff_in_docserver(self, pdf_name, output):
        args = [
            "gs", "-q", "-dNOPAUSE", "-dBATCH",
            "-r" + str(self.resolution), "-sCompression=lzw",
            "-sDEVICE=tiff32nc",
            "-sOutputFile=" + output,
            " -f" + pdf_name
        ]
        subprocess.call(args)

    # Simply open an image
    def open_img(self, img):
        self.img = Image.open(img)

    # Save pdf with one or more pages into JPG file
    def save_img_with_wand(self, pdf_name, output):
        try:
            with Img(filename=pdf_name, resolution=self.resolution) as pic:
                library.MagickResetIterator(pic.wand)
                pic.scene = 1  # Start cpt of filename at 1 instead of 0
                pic.compression_quality = self.compressionQuality
                pic.background_color = Color("white")
                pic.alpha_channel = 'remove'
                pic.save(filename=output)
        except (PolicyError, CacheError) as e:
            self.Log.error('Error during WAND conversion : ' + str(e))

    # Crop the file to get the header
    # 1/3 + 10% is the ratio we used
    def crop_image_header(self, pdf_name, is_tiff, last_image, output_name=None):
        try:
            if not is_tiff:
                with Img(filename=pdf_name, resolution=self.resolution) as pic:
                    pic.compression_quality = self.compressionQuality
                    pic.background_color = Color("white")
                    pic.alpha_channel = 'remove'
                    self.heightRatio = int(pic.height / 3 + pic.height * 0.1)
                    pic.crop(width=pic.width, height=int(pic.height - self.heightRatio), gravity='north')
                    if output_name:
                        pic.save(filename=output_name)
                    if last_image:
                        pic.save(filename=self.jpgName_last_header)
                    else:
                        pic.save(filename=self.jpgName_header)
            else:
                if output_name:
                    target = output_name
                elif last_image:
                    target = self.tiffName_last
                else:
                    target = self.tiffName

                with Img(filename=target, resolution=self.resolution) as pic:
                    pic.compression_quality = self.compressionQuality
                    pic.background_color = Color("white")
                    pic.alpha_channel = 'remove'
                    self.heightRatio = int(pic.height / 3 + pic.height * 0.1)
                    pic.crop(width=pic.width, height=int(pic.height - self.heightRatio), gravity='north')
                    if output_name:
                        pic.save(filename=output_name)
                    elif last_image:
                        pic.save(filename=self.tiffName_last_header)
                    else:
                        pic.save(filename=self.tiffName_header)
        except (PolicyError, CacheError) as e:
            self.Log.error('Error during WAND conversion : ' + str(e))

    # Crop the file to get the footer
    # 1/3 + 10% is the ratio we used
    def crop_image_footer(self, img, is_tiff=False, last_image=False, output_name=None):
        try:
            if not is_tiff:
                with Img(filename=img, resolution=self.resolution) as pic:
                    pic.compression_quality = self.compressionQuality
                    pic.background_color = Color("white")
                    pic.alpha_channel = 'remove'
                    self.heightRatio = int(pic.height / 3 + pic.height * 0.1)
                    pic.crop(width=pic.width, height=int(pic.height - self.heightRatio), gravity='south')
                    if output_name:
                        pic.save(filename=output_name)
                    if last_image:
                        pic.save(filename=self.jpgName_last_footer)
                    else:
                        pic.save(filename=self.jpgName_footer)

            else:
                if output_name:
                    target = output_name
                elif last_image:
                    target = self.tiffName_last
                else:
                    target = self.tiffName
                with Img(filename=target, resolution=self.resolution) as pic:
                    pic.compression_quality = self.compressionQuality
                    pic.background_color = Color("white")
                    pic.alpha_channel = 'remove'
                    self.heightRatio = int(pic.height / 3 + pic.height * 0.1)
                    pic.crop(width=pic.width, height=int(pic.height - self.heightRatio), gravity='south')
                    if output_name:
                        pic.save(filename=output_name)
                    elif last_image:
                        pic.save(filename=self.tiffName_last_footer)
                    else:
                        pic.save(filename=self.tiffName_footer)
        except (PolicyError, CacheError) as e:
            self.Log.error('Error during WAND conversion : ' + str(e))

    # When we crop footer we need to rearrange the position of founded text
    # So we add the heightRatio we used (by default 1/3 + 10% of the full image)
    # And also add the position found on the cropped section divided by 2.8
    def return_position_with_ratio(self, line, target):
        position = {0: {}, 1: {}}
        position[0][0] = line.position[0][0]
        position[1][0] = line.position[1][0]

        if target == 'footer':
            position[0][1] = line.position[0][1] + self.heightRatio
            position[1][1] = line.position[1][1] + self.heightRatio
        else:
            position[0][1] = line.position[0][1]
            position[1][1] = line.position[1][1]

        return position

    def export_xml(self, cfg, invoice_number, parent, fill_position=False, db=None, vat_number=False):
        self.xml.construct_filename(invoice_number, vat_number)
        filename = cfg.cfg['GLOBAL']['exportaccountingfolder'] + '/' + secure_filename(self.xml.filename)
        root = Et.Element("ROOT")

        for parentElement in parent:
            element = Et.SubElement(root, parentElement)
            for child in parent[parentElement]:
                for childElement in child:
                    clean_child = childElement.replace(parentElement + '_', '')
                    if clean_child not in ['noDelivery', 'noCommands']:
                        if fill_position is not False and db is not False:
                            new_field = Et.SubElement(element, escape(clean_child))
                            new_field.text = child[childElement]['field']

                            # Add position in supplier database
                            clean_child_position = child[childElement]['position']
                            if clean_child_position is not None:
                                if 'no_taxes' in clean_child or 'invoice_number' in clean_child or 'order_number' in clean_child \
                                        or 'delivery_number' in clean_child or ('vat' in clean_child and clean_child != 'vat_number'):
                                    db.update({
                                        'table': ['suppliers'],
                                        'set': {
                                            clean_child + '_position': clean_child_position
                                        },
                                        'where': ['vat_number = ?'],
                                        'data': [vat_number]
                                    })
                                    db.conn.commit()

                                new_field = Et.SubElement(element, escape(clean_child + '_position'))
                                new_field.text = clean_child_position

        xml_root = minidom.parseString(Et.tostring(root, encoding="unicode")).toprettyxml()
        file = open(filename, 'w')
        file.write(xml_root)
        file.close()

        res = db.select({
            'select': ['typology'],
            'table': ['suppliers'],
            'where': ['vat_number = ?'],
            'data': [vat_number]
        })
        if res:
            root = Et.parse(filename).getroot()
            typo = res[0]['typology']
            list_of_fields = retrieve_custom_positions(typo, cfg)
            select = []
            if list_of_fields:
                for index in list_of_fields:
                    field = index.split('-')[1]
                    field_position = field + '_position'
                    select.append(field_position)

                if select:
                    res = db.select({
                        'select': select,
                        'table': ['invoices'],
                        'where': ['invoice_number = ?'],
                        'data': [invoice_number]
                    })
                    if res:
                        for title in root:
                            for element in title:
                                for position in select:
                                    if element.tag == position.split('_position')[0]:
                                        sub_element_to_append = root.find(title.tag)
                                        new_field = Et.SubElement(sub_element_to_append, position)
                                        new_field.text = res[0][position]
                        xml_root = minidom.parseString(Et.tostring(root, encoding="unicode")).toprettyxml().replace('\n\n', '\n')
                        file = open(filename, 'w')
                        file.write(xml_root)
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

    def get_pages(self, file, config):
        with open(file, 'rb') as doc:
            pdf = PyPDF4.PdfFileReader(doc)
            try:
                return pdf.getNumPages()
            except ValueError as e:
                self.Log.error(e)
                shutil.move(file, config.cfg['GLOBAL']['errorpath'] + os.path.basename(file))
                return 1

    @staticmethod
    def is_blank_page(image, config):
        params = cv2.SimpleBlobDetector_Params()
        params.minThreshold = 10
        params.maxThreshold = 200
        params.filterByArea = True
        params.minArea = 20
        params.filterByCircularity = True
        params.minCircularity = 0.1
        params.filterByConvexity = True
        params.minConvexity = 0.87
        params.filterByInertia = True
        params.minInertiaRatio = 0.01

        detector = cv2.SimpleBlobDetector_create(params)
        im = cv2.imread(image)
        keypoints = detector.detect(im)
        rows, cols, channel = im.shape
        blobs_ratio = len(keypoints) / (1.0 * rows * cols)

        if blobs_ratio < float(config['blobsratio']):
            return True
        return False

    @staticmethod
    def create_directory(path):
        try:
            os.mkdir(path)
        except OSError:
            print("Creation of the directory %s failed" % path)

    @staticmethod
    def sorted_file(path, extension):
        file_json = []
        for file in os.listdir(path):
            if file.endswith("." + extension):
                filename = os.path.splitext(file)[0]
                is_countable = filename.split('-')
                if len(is_countable) > 1:
                    cpt = ('%03d' % int(is_countable[1]))
                    file_json.append((cpt, path + '/' + file))
                else:
                    file_json.append(('000', path + '/' + file))
        sorted_file = sorted(file_json, key=lambda file_cpt: file_cpt[0])
        return sorted_file

    @staticmethod
    def merge_pdf(file_sorted, tmp_path, _return=False):
        merger = PyPDF4.PdfFileMerger()
        for pdf in file_sorted:
            merger.append(pdf[1])
            os.remove(pdf[1])
        merger.write(tmp_path + '/result.pdf')
        file_to_return = open(tmp_path + '/result.pdf', 'rb').read()

        if _return:
            return tmp_path + '/result.pdf'
        else:
            os.remove(tmp_path + '/result.pdf')
            return file_to_return

    @staticmethod
    def check_file_integrity(file, config):
        is_full = False
        while not is_full:
            with open(file, 'rb') as doc:
                size = os.path.getsize(file)
                time.sleep(1)
                size2 = os.path.getsize(file)
                if size2 == size:
                    if file.endswith(".pdf"):
                        try:
                            PyPDF4.PdfFileReader(doc)
                        except PyPDF4.utils.PdfReadError:
                            shutil.move(file, config.cfg['GLOBAL']['errorpath'] + os.path.basename(file))
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
    def ocr_on_fly(img, selection, ocr, thumb_size=None, regex=None, remove_line=False):
        rand = str(uuid.uuid4())
        if thumb_size is not None:
            with Image.open(img) as im:
                ratio = im.size[0] / thumb_size['width']
        else:
            ratio = 1

        x1 = selection['x1'] * ratio
        y1 = selection['y1'] * ratio
        x2 = selection['x2'] * ratio
        y2 = selection['y2'] * ratio
        crop_ratio = (x1, y1, x2, y2)

        extension = os.path.splitext(img)[1]
        with Image.open(img) as im2:
            cropped_image = im2.crop(crop_ratio)
            cropped_image.save('/tmp/cropped_' + rand + extension)

        # Rotate the image
        image = cv2.imread('/tmp/cropped_' + rand + extension)
        grayscale = rgb2gray(image)
        angle = determine_skew(grayscale)
        if angle and angle < -80:
            rotated = rotate(image, angle, resize=True) * 255
            io.imsave('/tmp/cropped_' + rand + extension, rotated.astype(np.uint8))

        if remove_line:
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

        cropped_image = Image.open('/tmp/cropped_' + rand + extension)
        text = ocr.text_builder(cropped_image)

        try:
            litteral_number = ast.literal_eval(text)
            if type(litteral_number) != int:
                first_part = str(ast.literal_eval(text)[0]).replace(',', '').replace('.', '')
                second_part = str(ast.literal_eval(text)[1])
                text = first_part + '.' + second_part
        except (ValueError, SyntaxError):
            pass

        if regex:
            for res in re.finditer(r"" + regex, text):
                os.remove('/tmp/cropped_' + rand + extension)
                return res.group().replace('\x0c', '').strip()
            return False

        os.remove('/tmp/cropped_' + rand + extension)
        return text.replace('\x0c', '').strip()

    @staticmethod
    def get_size(img):
        im = Image.open(img)
        return im.size[0]

    @staticmethod
    def improve_image_detection(img):
        filename = os.path.splitext(img)
        improved_img = filename[0] + '_improved' + filename[1]
        if not os.path.isfile(improved_img):
            src = cv2.imread(img)
            gray = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY)
            _, black_and_white = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)
            nlabels, labels, stats, centroids = cv2.connectedComponentsWithStats(black_and_white, None, None, None, 8, cv2.CV_32S)

            # get CC_STAT_AREA component
            sizes = stats[1:, -1]
            img2 = np.zeros(labels.shape, np.uint8)

            for i in range(0, nlabels - 1):
                # Filter small dotted regions
                if sizes[i] >= 20:
                    img2[labels == i + 1] = 255

            dst = cv2.bitwise_not(img2)

            kernel = np.ones((1, 2), np.uint8)
            src = cv2.adaptiveThreshold(dst, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
            dst = cv2.erode(src, kernel)
            cv2.imwrite(improved_img, dst)

        return improved_img

    @staticmethod
    def move_to_docservers(cfg, file):
        now = datetime.datetime.now()
        year = str(now.year)
        day = str('%02d' % now.day)
        month = str('%02d' % now.month)
        hour = str('%02d' % now.hour)
        minute = str('%02d' % now.minute)
        seconds = str('%02d' % now.second)
        docserver_path = cfg['GLOBAL']['docserverpath']

        # Check if docserver folder exists, if not, create it
        if not os.path.exists(docserver_path):
            os.mkdir(docserver_path)

        # Check if year folder exist, if not, create it
        if not os.path.exists(docserver_path + '/' + year):
            os.mkdir(docserver_path + '/' + year)

        # Do the same with month
        if not os.path.exists(docserver_path + '/' + year + '/' + month):
            os.mkdir(docserver_path + '/' + year + '/' + month)

        new_filename = day + month + year + '_' + hour + minute + seconds + '_' + uuid.uuid4().hex + '.pdf'
        final_directory = docserver_path + '/' + year + '/' + month + '/' + new_filename

        shutil.move(file, final_directory)

        return final_directory

    @staticmethod
    def open_image_return(img):
        return Image.open(img)

    @staticmethod
    def delete_file_with_extension(dir_path, extension):
        files = os.listdir(dir_path)

        for item in files:
            if item.endswith(extension):
                os.remove(os.path.join(dir_path, item))

    @staticmethod
    def get_uuid_with_date():
        random_number = uuid.uuid4().hex
        # date object of today's date
        today = datetime.date.today()
        uuid_with_date = str(today.year) + str(today.month) + str(today.day) + str(random_number)
        return uuid_with_date
