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
import json
import os
import re
import cv2
import time
import uuid
import shutil
import PyPDF4
import datetime
import subprocess
import numpy as np
from PIL import Image
from PyPDF4 import utils
from wand.color import Color
from wand.api import library
from wand.image import Image as Img
from werkzeug.utils import secure_filename
from src.backend.functions import get_custom_array
from wand.exceptions import PolicyError, CacheError

custom_array = get_custom_array()

if 'FindDate' not in custom_array:
    from src.backend.process.FindDate import FindDate
else:
    FindDate = getattr(__import__(custom_array['FindDate']['path'] + '.' + custom_array['FindDate']['module'],
                                  fromlist=[custom_array['FindDate']['module']]), custom_array['FindDate']['module'])


class Files:
    def __init__(self, img_name, res, quality, log, is_tiff, locale, config):
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
        self.Log = log
        self.Locale = locale
        self.Config = config

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

    def pdf_to_tiff(self, pdf_name, output_file, convert_only_first_page=False, open_img=True, crop=False,
                    zone_to_crop=False, last_page=None):
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

    def get_pages(self, file, config):
        try:
            with open(file, 'rb') as doc:
                pdf = PyPDF4.PdfFileReader(doc)
                try:
                    return pdf.getNumPages()
                except ValueError as e:
                    self.Log.error(e)
                    shutil.move(file, config.cfg['GLOBAL']['errorpath'] + os.path.basename(file))
                    return 1
        except PyPDF4.utils.PdfReadError:
            pdf_read_rewrite = PyPDF4.PdfFileReader(file, strict=False)
            pdfwrite = PyPDF4.PdfFileWriter()
            for page_count in range(pdf_read_rewrite.numPages):
                pages = pdf_read_rewrite.getPage(page_count)
                pdfwrite.addPage(pages)

            fileobjfix = open(file, 'wb')
            pdfwrite.write(fileobjfix)
            fileobjfix.close()
            return pdf_read_rewrite.getNumPages()

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

    def ocr_on_fly(self, img, selection, ocr, thumb_size=None, regex=None, remove_line=False):
        rand = str(uuid.uuid4())
        if thumb_size is not None:
            with Image.open(img) as im:
                ratio = im.size[0] / thumb_size['width']
        else:
            ratio = 1

        x1 = selection['x'] * ratio
        y1 = selection['y'] * ratio
        x2 = (selection['x'] + selection['width']) * ratio
        y2 = (selection['y'] + selection['height']) * ratio
        crop_ratio = (x1, y1, x2, y2)

        extension = os.path.splitext(img)[1]
        with Image.open(img) as im2:
            cropped_image = im2.crop(crop_ratio)
            cropped_image.save('/tmp/cropped_' + rand + extension)

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
        is_number = False
        if not text or text == '' or text.isspace():
            self.improve_image_detection('/tmp/cropped_' + rand + extension)
            improved_cropped_image = Image.open('/tmp/cropped_' + rand + '_improved' + extension)
            text = ocr.text_builder(improved_cropped_image)

        try:
            text = text.replace(' ', '.')
            text = text.replace('\x0c', '')
            text = text.replace('\n', '')
            text = text.replace(',', '.')
            splitted_number = text.split('.')
            if len(splitted_number) > 1:
                last_index = splitted_number[len(splitted_number) - 1]
                if len(last_index) > 2:
                    text = text.replace('.', '')
                    is_number = True
                else:
                    splitted_number.pop(-1)
                    text = ''.join(splitted_number) + '.' + last_index
                    is_number = True
        except (ValueError, SyntaxError, TypeError):
            pass

        if not is_number:
            for res in re.finditer(r"" + self.Locale.dateRegex + "", text):
                date_class = FindDate('', self.Log, self.Locale, self.Config, self, ocr, '', '', '', '', '')
                date = date_class.format_date(res.group(), (('', ''), ('', '')), True)
                if date:
                    text = date[0]
        if regex:
            for res in re.finditer(r"" + regex, text):
                os.remove('/tmp/cropped_' + rand + extension)
                if os.path.isfile('/tmp/cropped_' + rand + '_improved' + extension):
                    os.remove('/tmp/cropped_' + rand + '_improved' + extension)
                return res.group().replace('\x0c', '').strip()
            return False

        os.remove('/tmp/cropped_' + rand + extension)
        if os.path.isfile('/tmp/cropped_' + rand + '_improved' + extension):
            os.remove('/tmp/cropped_' + rand + '_improved' + extension)
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
            nlabels, labels, stats, centroids = cv2.connectedComponentsWithStats(black_and_white, None, None, None, 8,
                                                                                 cv2.CV_32S)

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
    def save_uploaded_file(f, path):
        filename, file_ext = os.path.splitext(f.filename)
        file = filename.replace(' ', '_') + file_ext.lower()
        new_path = os.path.join(path, secure_filename(file))
        f.save(new_path)
        return new_path

    @staticmethod
    def delete_file_with_extension(dir_path, extension):
        files = os.listdir(dir_path)
        for item in files:
            if item.endswith(extension):
                os.remove(os.path.join(dir_path, item))

    @staticmethod
    def get_uuid_with_date():
        random_number = uuid.uuid4().hex
        today = datetime.date.today()
        uuid_with_date = str(today.year) + str(today.month) + str(today.day) + str(random_number)
        return uuid_with_date

    @staticmethod
    def reformat_positions(positions):
        if type(positions) in [tuple, dict] and positions:
            x1 = positions[0][0]
            y1 = positions[0][1]
            x2 = positions[1][0]
            y2 = positions[1][1]
            if x1 and y1 and x2 and y2:
                positions = {
                    'x': x1,
                    'y': y1,
                    'width': x2 - x1,
                    'height': y2 - y1,
                }
                return positions
            else:
                return ''
        else:
            try:
                positions = json.loads(positions)
                return positions
            except TypeError:
                return ''
