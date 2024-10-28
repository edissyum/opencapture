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
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
# @dev : Serena Tetart <serena.tetart@edissyum.com>
# @dev : Oussama Brich <oussama.brich@edissyum.com>

import os
import re
import cv2
import json
import time
import uuid
import pypdf
import pyheif
import string
import random
import shutil
import imutils
import tempfile
import datetime
import subprocess
import numpy as np
from PIL import Image
from zipfile import ZipFile
from flask import current_app
from deskew import determine_skew
from pyocr.builders import LineBox
from skimage.color import rgb2gray
from skimage.transform import rotate
from pdf2image import convert_from_path
from werkzeug.utils import secure_filename
from pytesseract import pytesseract, Output
from src.backend.process.find_date import FindDate
from src.backend.functions import generate_searchable_pdf

Image.MAX_IMAGE_PIXELS = 933120000

def convert_heif_to_jpg(file):
    heif_file = pyheif.read(file)
    heif_file = Image.frombytes(
        heif_file.mode,
        heif_file.size,
        heif_file.data,
        "raw",
        heif_file.mode,
        heif_file.stride,
    )
    heif_file = heif_file.convert('RGB')
    with tempfile.NamedTemporaryFile() as tf:
        heif_file.save(tf.name + '.jpg', format="JPEG")
        rotate_img(tf.name + '.jpg')
        heif_file = Image.open(tf.name + '.jpg')
        os.remove(tf.name + '.jpg')
    return heif_file


def rotate_img(img):
    if current_app.config['ROTATE_MODEL'] is not None:
        model_results = current_app.config['ROTATE_MODEL'](img, verbose=False)
        if model_results:
            need_rotate = model_results[0].probs.top1
            if need_rotate != 0:
                src = Image.open(img).convert("RGB")
                if need_rotate == 1:
                    src = src.rotate(180, expand=True)
                elif need_rotate == 2:
                    src = src.rotate(90, expand=True)
                elif need_rotate == 3:
                    src = src.rotate(270, expand=True)
                src.save(img)
    else:
        try:
            src = cv2.imread(img)
            rgb = cv2.cvtColor(src, cv2.COLOR_BGR2RGB)
            results = pytesseract.image_to_osd(rgb, output_type=Output.DICT)
            if results['orientation'] != 0 and results['rotate'] != 0:
                src = imutils.rotate_bound(src, angle=results["rotate"])
                cv2.imwrite(img, src)
            else:
                grayscale = rgb2gray(src)
                angle = determine_skew(grayscale)
                if angle != 0:
                    rotated = rotate(src, angle, resize=True) * 255
                    cv2.imwrite(img, rotated.astype(np.uint8))
        except (pytesseract.TesseractError, TypeError) as _e:
            pass


class Files:
    def __init__(self, img_name, log, docservers, configurations, regex, languages, database):
        self.log = log
        self.img = None
        self.regex = regex
        self.height_ratio = ''
        self.img_name = img_name
        self.database = database
        self.languages = languages
        self.docservers = docservers
        self.configurations = configurations
        self.jpg_name = img_name + '.jpg'
        self.jpg_name_last = img_name + '_last.jpg'
        self.jpg_name_header = img_name + '_header.jpg'
        self.jpg_name_footer = img_name + '_footer.jpg'
        self.custom_file_name = img_name + '_custom.jpg'
        self.jpg_name_last_header = img_name + '_last_header.jpg'
        self.jpg_name_last_footer = img_name + '_last_footer.jpg'

    def pdf_to_jpg(self, file, page, open_img=True, crop=False, zone_to_crop=False, last_image=False, is_custom=False,
                   convert_function='pdf2image'):
        temp_filename = None
        if crop:
            if file.lower().endswith(('.jpg', 'jpeg', '.png')):
                with tempfile.NamedTemporaryFile() as tf:
                    temp_filename = tf.name + '.jpg'
                    shutil.copyfile(file, temp_filename)
                    file = temp_filename

            if zone_to_crop == 'header':
                if is_custom:
                    self.crop_image_header(file, last_image, page, self.custom_file_name,
                                           convert_function=convert_function)
                else:
                    self.crop_image_header(file, last_image, page, convert_function=convert_function)
                if open_img:
                    if last_image:
                        self.img = Image.open(self.jpg_name_last_header)
                    else:
                        self.img = Image.open(self.jpg_name_header)
            elif zone_to_crop == 'footer':
                if is_custom:
                    self.crop_image_footer(file, last_image, page, self.custom_file_name,
                                           convert_function=convert_function)
                else:
                    self.crop_image_footer(file, last_image, page, convert_function=convert_function)
                if open_img:
                    if last_image:
                        self.img = Image.open(self.jpg_name_last_footer)
                    else:
                        self.img = Image.open(self.jpg_name_footer)
        else:
            target = self.jpg_name
            if last_image:
                target = self.jpg_name_last
            elif is_custom:
                target = self.custom_file_name

            if file.lower().endswith('.pdf'):
                self.save_img_with_pdf2image(file, target, page, convert_function=convert_function)
            elif file.lower().endswith(('.heic', '.heif')):
                heif_file = convert_heif_to_jpg(file)
                heif_file.save(target, 'JPEG')
            else:
                shutil.copyfile(file, target)
            rotate_img(target)

            if open_img:
                self.img = Image.open(target)

        if temp_filename and os.path.isfile(temp_filename):
            os.remove(temp_filename)

    def open_img(self, img):
        self.img = Image.open(img)

    def save_img_with_pdf2image(self, file, output, page=None, docservers=False, chunk_size=10, page_to_save=False,
                                convert_function='pdf2image'):
        try:
            outputs_paths = []
            directory = os.path.dirname(output)
            output = os.path.splitext(output)[0]
            bck_output = os.path.splitext(output)[0]
            if page:
                output_path = output + '.jpg'
                if convert_function == 'imagemagick':
                    cmd = f'convert -density 200 {file}[{str(page - 1)}] -quality 100 -alpha remove {output_path}'
                    process = subprocess.Popen(cmd.split(' '))
                    process.communicate()
                else:
                    images = convert_from_path(file, first_page=page, last_page=page, dpi=300)
                    images[0].save(output_path, 'JPEG')
                outputs_paths.append(output_path)
            else:
                cpt = 1
                with open(file, 'rb') as pdf:
                    pdf_reader = pypdf.PdfReader(pdf)
                    page_count = len(pdf_reader.pages)

                for chunk_idx in range(0, page_count, chunk_size):
                    start_page = 0 if chunk_idx == 0 else chunk_idx + 1
                    end_page = min(chunk_idx + chunk_size, page_count)
                    chunk_images = convert_from_path(file, first_page=start_page, last_page=end_page, dpi=300)
                    for image in chunk_images:
                        if page_to_save:
                            if cpt != page_to_save:
                                cpt = cpt + 1
                                continue

                        if not page:
                            output = bck_output + '-' + str(cpt).zfill(3)
                        output_path = output + '.jpg'
                        image.save(output_path, 'JPEG')
                        if docservers:
                            self.move_to_docservers_image(directory, output_path)
                        outputs_paths.append(output_path)
                        cpt = cpt + 1
                        del image
                    del chunk_images
            return outputs_paths
        except (Exception,) as error:
            self.log.error('Error during pdf2image conversion : ' + str(error))
            return False

    def save_img_with_pdf2image_min(self, file, output, single_file=True, module='verifier', chunk_size=10):
        try:
            outputs_paths = []
            output = os.path.splitext(output)[0]
            directory = os.path.dirname(output)
            if single_file:
                images = convert_from_path(file, single_file=single_file, size=(None, 720))
                output_path = output + '-001.jpg'
                images[0].save(output_path, 'JPEG')
                if module == 'verifier':
                    self.move_to_docservers_image(directory, output_path)
                outputs_paths.append(output_path)
            else:
                cpt = 1
                with open(file, 'rb') as pdf:
                    pdf_reader = pypdf.PdfReader(pdf)
                    page_count = len(pdf_reader.pages)

                for chunk_idx in range(0, page_count, chunk_size):
                    start_page = 0 if chunk_idx == 0 else chunk_idx + 1
                    end_page = min(chunk_idx + chunk_size, page_count)
                    chunk_images = convert_from_path(file, first_page=start_page, last_page=end_page,
                                                     size=(None, 720))

                    for image in chunk_images:
                        output_path = output + '-' + str(cpt).zfill(3) + '.jpg'
                        image.save(output_path, 'JPEG')
                        if module == 'verifier':
                            self.move_to_docservers_image(directory, output_path)
                        outputs_paths.append(output_path)
                        cpt = cpt + 1
                        del image
                    del chunk_images
            return outputs_paths
        except (Exception,) as error:
            self.log.error('Error during pdf2image conversion : ' + str(error))
            return False

    @staticmethod
    def return_img(file, convert_function, page, output):
        if convert_function == 'imagemagick' or file.lower().endswith('.png'):
            cmd = f'convert -density 200 {file}[{str(page - 1)}] -quality 100 -alpha remove {output}'
            process = subprocess.Popen(cmd.split(' '))
            process.communicate()
            images = [Image.open(output)]
        elif file.lower().endswith(('.jpg', 'jpeg')):
            shutil.copyfile(file, output)
            images = [Image.open(output)]
        elif file.lower().endswith(('.heic', '.heif')):
            heif_file = convert_heif_to_jpg(file)
            heif_file.save(output, 'JPEG')
            images = [Image.open(output)]
        else:
            images = convert_from_path(file, first_page=page, last_page=page, dpi=300)
        return images

    # Crop the file to get the header
    # 1/3 + 10% is the ratio we used
    def crop_image_header(self, file, last_image, page, output_name=None, convert_function='pdf2image'):
        try:
            if last_image:
                output = self.jpg_name_last_header
            else:
                output = self.jpg_name_header

            if output_name:
                output = output_name

            images = self.return_img(file, convert_function, page, output)

            for i in range(len(images)):
                self.height_ratio = int(images[i].height / 3 + images[i].height * 0.1)
                crop_ratio = (0, 0, images[i].width, int(images[i].height - self.height_ratio))
                _im = images[i].crop(crop_ratio).convert('RGB')
                _im.save(output, 'JPEG')
        except (Exception,) as error:
            self.log.error('Error during pdf2image conversion : ' + str(error))

    # Crop the file to get the footer
    # 1/3 + 10% is the ratio we used
    def crop_image_footer(self, file, last_image, page, output_name=None, convert_function='pdf2image'):
        try:
            if last_image:
                output = self.jpg_name_last_footer
            else:
                output = self.jpg_name_footer

            if output_name:
                output = output_name

            images = self.return_img(file, convert_function, page, output)

            for i in range(len(images)):
                self.height_ratio = int(images[i].height / 3 + images[i].height * 0.1)
                crop_ratio = (0, self.height_ratio, images[i].width, images[i].height)
                _im = images[i].crop(crop_ratio).convert('RGB')
                _im.save(output, 'JPEG')
        except (Exception,) as error:
            self.log.error('Error during pdf2image conversion : ' + str(error))

    # When we crop footer we need to rearrange the position of founded text
    # So we add the height_ratio we used (by default 1/3 + 10% of the full image)
    # And also add the position found on the cropped section divided by 2.8
    def return_position_with_ratio(self, line, target):
        position = {0: {}, 1: {}}

        if isinstance(line, LineBox):
            line = line.__dict__

        if line['position']:
            position[0][0] = line['position'][0][0]
            position[1][0] = line['position'][1][0]

            if target == 'footer':
                position[0][1] = line['position'][0][1] + self.height_ratio
                position[1][1] = line['position'][1][1] + self.height_ratio
            else:
                position[0][1] = line['position'][0][1]
                position[1][1] = line['position'][1][1]
        return position

    def get_pages(self, docservers, file):
        try:
            pdf = pypdf.PdfReader(file)
            if pdf.is_encrypted:
                pdf.decrypt('')
            try:
                return len(pdf.pages)
            except ValueError as file_error:
                self.log.error(file_error)
                shutil.move(file, docservers['ERROR_PATH'] + os.path.basename(file))
                return 1
        except pypdf.errors.PdfReadError:
            pdf_read_rewrite = pypdf.PdfReader(file, strict=False)
            pdfwrite = pypdf.PdfWriter()
            for page_count in range(len(pdf_read_rewrite.pages)):
                pages = pdf_read_rewrite.pages[page_count]
                pdfwrite.add_page(pages)

            with open(file, 'wb') as fileobjfix:
                pdfwrite.write(fileobjfix)
            fileobjfix.close()
            return len(pdf_read_rewrite.pages)

    @staticmethod
    def is_blank_page(image):
        params = cv2.SimpleBlobDetector_Params()
        params.minThreshold = 10
        params.maxThreshold = 200
        params.filterByArea = True
        params.minArea = 20
        params.filterByCircularity = True
        params.minCircularity = 0.1
        params.filterByConvexity = True
        params.minConvexity = 0.50 # Lower if you have a false blank page. Increase if you have an unwanted blank page.
        params.filterByInertia = True
        params.minInertiaRatio = 0.01

        detector = cv2.SimpleBlobDetector_create(params)
        image = cv2.imread(image)
        keypoints = detector.detect(image)
        rows, cols, _ = image.shape
        blobs_ratio = len(keypoints) / (1.0 * rows * cols)

        if blobs_ratio < float(1E-6):
            return True
        return False

    @staticmethod
    def sorted_file(path, extension):
        file_json = []
        for file in os.listdir(path):
            if file.lower().endswith("." + extension):
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
    def check_file_integrity(file, docservers):
        is_full = False
        while not is_full:
            size = os.path.getsize(file)
            time.sleep(1)
            size2 = os.path.getsize(file)
            if size2 == size:
                if file.lower().endswith('.pdf'):
                    try:
                        reader = pypdf.PdfReader(file)
                        _ = reader.pages[0]
                        return True, ''
                    except (Exception,) as _e:
                        try:
                            shutil.move(file, docservers['ERROR_PATH'] + os.path.basename(file))
                        except FileNotFoundError:
                            pass
                        return False, str(_e)
                elif file.lower().endswith(('.jpg', '.jpeg', '.png')):
                    try:
                        Image.open(file)
                        return True, ''
                    except (Exception,) as _e:
                        try:
                            shutil.move(file, docservers['ERROR_PATH'] + os.path.basename(file))
                        except FileNotFoundError:
                            pass
                        return False, str(_e)
                elif file.lower().endswith(('.heic', '.heif')):
                    try:
                        convert_heif_to_jpg(file)
                        return True, ''
                    except (Exception,) as _e:
                        try:
                            shutil.move(file, docservers['ERROR_PATH'] + os.path.basename(file))
                        except FileNotFoundError:
                            pass
                        return False, str(_e)
                else:
                    return False, ''
            else:
                continue

    def ocr_on_fly(self, img, selection, ocr, thumb_size=None, regex_name=None, remove_line=False, lang='fra'):
        rand = str(uuid.uuid4())
        if thumb_size is not None:
            with Image.open(img) as image:
                ratio = image.size[0] / thumb_size['width']
        else:
            ratio = 1

        try:
            selection = json.loads(selection)
        except TypeError:
            pass

        x1 = selection['x'] * ratio
        y1 = selection['y'] * ratio
        x2 = (selection['x'] + selection['width']) * ratio
        y2 = (selection['y'] + selection['height']) * ratio
        crop_ratio = (x1, y1, x2, y2)
        extension = os.path.splitext(img)[1]
        with Image.open(img) as im2:
            cropped_image = im2.crop(crop_ratio)
            cropped_image = cropped_image.convert('RGB')
            cropped_image.save('/tmp/cropped_' + rand + extension)

        if remove_line:
            image = cv2.imread('/tmp/cropped_' + rand + extension)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
            horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (20, 1))
            detected_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horizontal_kernel, iterations=2)
            cnts = cv2.findContours(detected_lines, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            cnts = cnts[0] if len(cnts) == 2 else cnts[1]
            for contour in cnts:
                cv2.drawContours(image, [contour], -1, (255, 255, 255), 3)
            repair_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
            result = 255 - cv2.morphologyEx(255 - image, cv2.MORPH_CLOSE, repair_kernel, iterations=1)
            cv2.imwrite('/tmp/cropped_' + rand + extension, result)

        cropped_image = Image.open('/tmp/cropped_' + rand + extension)
        text = ocr.text_builder(cropped_image)
        tmp_text = text
        is_number = False
        if not text or text == '' or text.isspace():
            self.improve_image_detection('/tmp/cropped_' + rand + extension)
            improved_cropped_image = Image.open('/tmp/cropped_' + rand + '_improved' + extension)
            text = ocr.text_builder(improved_cropped_image)

        try:
            text = text.replace('%', '').replace('€', '').replace('$', '').replace('£', '')
            text = text.strip()
            text = text.replace(' ', '.')
            text = text.replace('\n', '')
            text = text.replace(',', '.')
            text = text.replace('\x0c', '')

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

        if is_number and re.match(r'[A-Z]', text, flags=re.IGNORECASE):
            is_number = False

        if not is_number:
            regex_dict = self.regex
            if lang != self.configurations['locale']:
                _regex = self.database.select({
                    'select': ['regex_id', 'content'],
                    'table': ['regex'],
                    'where': ["lang in ('global', %s)"],
                    'data': [lang]
                })
                if _regex:
                    regex_dict = {}
                    for _r in _regex:
                        regex_dict[_r['regex_id']] = _r['content']

            for res in re.finditer(r"" + regex_dict['date'], tmp_text):
                date_class = FindDate(ocr, self.log, regex_dict, self.configurations, self, '', '', '', self.docservers,
                                      '', '')
                date, _ = date_class.format_date(res.group(), (('', ''), ('', '')), True, False)
                if date:
                    text = date

        if regex_name:
            for res in re.finditer(r"" + self.regex[regex_name], text):
                os.remove('/tmp/cropped_' + rand + extension)
                if os.path.isfile('/tmp/cropped_' + rand + '_improved' + extension):
                    os.remove('/tmp/cropped_' + rand + '_improved' + extension)
                return str(res.group()).replace('\x0c', '').strip()
            return False

        os.remove('/tmp/cropped_' + rand + extension)
        if os.path.isfile('/tmp/cropped_' + rand + '_improved' + extension):
            os.remove('/tmp/cropped_' + rand + '_improved' + extension)
        return text.replace('\x0c', '').strip()

    @staticmethod
    def get_width(img):
        image = Image.open(img)
        return image.size[0]

    @staticmethod
    def improve_image_detection(img, remove_lines=True):
        filename = os.path.splitext(img)
        improved_img = filename[0] + '_improved' + filename[1]
        if not os.path.isfile(improved_img):
            src = cv2.imread(img)
            rgb = cv2.cvtColor(src, cv2.COLOR_BGR2RGB)
            try:
                results = pytesseract.image_to_osd(rgb, output_type=Output.DICT)
                if results['orientation'] != 0 and results['rotate'] != 0:
                    src = imutils.rotate_bound(rgb, angle=results["rotate"])
                else:
                    grayscale = rgb2gray(rgb)
                    angle = determine_skew(grayscale)
                    rotated = rotate(src, angle, resize=True) * 255
                    src = rotated.astype(np.uint8)
            except (pytesseract.TesseractError, TypeError):
                pass

            gray = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY)
            _, black_and_white = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)
            nlabels, labels, stats, _ = cv2.connectedComponentsWithStats(black_and_white, None, None,
                                                                         None, 8, cv2.CV_32S)

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

            if remove_lines:
                # Remove horizontal lines
                horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
                remove_horizontal = cv2.morphologyEx(black_and_white, cv2.MORPH_OPEN, horizontal_kernel, iterations=2)
                cnts = cv2.findContours(remove_horizontal, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                cnts = cnts[0] if len(cnts) == 2 else cnts[1]
                for _c in cnts:
                    cv2.drawContours(dst, [_c], -1, (255, 255, 255), 5)

                # Remove vertical lines
                vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 40))
                remove_vertical = cv2.morphologyEx(black_and_white, cv2.MORPH_OPEN, vertical_kernel, iterations=2)
                cnts = cv2.findContours(remove_vertical, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                cnts = cnts[0] if len(cnts) == 2 else cnts[1]

                for _c in cnts:
                    cv2.drawContours(dst, [_c], -1, (255, 255, 255), 5)

            cv2.imwrite(improved_img, dst)
        return improved_img

    @staticmethod
    def move_to_docservers_image(docserver_path, file, output=False, copy=False, rotate=False):
        now = datetime.datetime.now()
        year = str(now.year)
        month = str('%02d' % now.month)

        # Check if docserver folder exists, if not, create it
        if not os.path.exists(docserver_path):
            os.mkdir(docserver_path)

        # Check if year folder exist, if not, create it
        if not os.path.exists(docserver_path + '/' + year):
            os.mkdir(docserver_path + '/' + year)

        # Do the same with month
        if not os.path.exists(docserver_path + '/' + year + '/' + month):
            os.mkdir(docserver_path + '/' + year + '/' + month)

        final_directory = docserver_path + '/' + year + '/' + month + '/' + os.path.basename(file)
        if output:
            final_directory = docserver_path + '/' + year + '/' + month + '/' + output

        if copy:
            if file.lower().endswith(('.heic', '.heif')):
                heif_image = convert_heif_to_jpg(file)
                heif_image.save(final_directory, 'JPEG')
            elif file.lower().endswith(('.jpg', '.jpeg', '.png')):
                shutil.copyfile(file, final_directory)
        else:
            shutil.move(file, final_directory)

        if rotate:
            rotate_img(final_directory)
        return final_directory

    @staticmethod
    def move_to_docservers(docservers, file, module='verifier', attachments=False):
        now = datetime.datetime.now()
        year = str(now.year)
        day = str('%02d' % now.day)
        month = str('%02d' % now.month)
        hour = str('%02d' % now.hour)
        minute = str('%02d' % now.minute)
        seconds = str('%02d' % now.second)

        docserver_path = docservers['VERIFIER_ORIGINAL_DOC']
        if attachments:
            docserver_path = docservers['VERIFIER_ATTACHMENTS']

        if module == 'splitter':
            docserver_path = docservers['SPLITTER_ORIGINAL_DOC']
            if attachments:
                docserver_path = docservers['SPLITTER_ATTACHMENTS']

        # Check if docserver folder exists, if not, create it
        if not os.path.exists(docserver_path):
            os.mkdir(docserver_path)

        # Check if year folder exist, if not, create it
        if not os.path.exists(docserver_path + '/' + year):
            os.mkdir(docserver_path + '/' + year)

        # Do the same with month
        if not os.path.exists(docserver_path + '/' + year + '/' + month):
            os.mkdir(docserver_path + '/' + year + '/' + month)

        extension = os.path.splitext(file)[1]
        new_filename = day + month + year + '_' + hour + minute + seconds + '_' + uuid.uuid4().hex + extension
        final_directory = docserver_path + '/' + year + '/' + month + '/' + new_filename
        shutil.move(file, final_directory)
        return final_directory

    @staticmethod
    def open_image_return(img):
        return Image.open(img)

    @staticmethod
    def save_uploaded_file(file, path, add_rand=True):
        filename, file_ext = os.path.splitext(file.filename)
        rand = ''.join(random.choice(string.ascii_lowercase) for _ in range(4))
        filename = filename.replace(' ', '_') + '_' + rand + file_ext.lower() if add_rand \
            else filename.replace(' ', '_') + file_ext.lower()
        new_path = os.path.join(path, secure_filename(filename))
        file.save(new_path)
        return new_path

    @staticmethod
    def get_now_date():
        return datetime.datetime.now()

    @staticmethod
    def reformat_positions(positions):
        if type(positions) in [tuple, dict] and 'x' not in positions and positions:
            if positions[0] and positions[1]:
                x1 = positions[0][0]
                y1 = positions[0][1]
                x2 = positions[1][0]
                y2 = positions[1][1]
                if x1 and y1 and x2 and y2:
                    positions = {
                        'x': x1,
                        'y': y1,
                        'width': x2 - x1,
                        'height': y2 - y1
                    }
                    return positions
            return ''
        else:
            try:
                positions = json.loads(positions)
                return positions
            except (TypeError, json.decoder.JSONDecodeError):
                if 'page' in positions:
                    del positions['page']
                return positions

    @staticmethod
    def ocrise_pdf(file_path, log, output=None):
        """
        :param file_path: path to file to OCRise
        :param output: output path, not mandatory
        :param log: log object
        """
        is_ocr = False
        if file_path.lower().endswith('.pdf'):
            pdf_reader = pypdf.PdfReader(file_path, strict=False)
            for index in range(pdf_reader.pages.__len__()):
                page_content = pdf_reader.pages[index].extract_text()
                if page_content:
                    is_ocr = True
                    break

        if not is_ocr:
            tmp_filename = '/tmp/' + str(uuid.uuid4()) + '.pdf'
            generate_searchable_pdf(file_path, tmp_filename)
            try:
                if output:
                    file_path = output
                shutil.move(tmp_filename, file_path)
            except shutil.Error as _e:
                log.error('Moving file ' + tmp_filename + ' error : ' + str(_e))
        else:
            if output:
                try:
                    shutil.copy(file_path, output)
                except shutil.Error as _e:
                    log.error('Moving file ' + file_path + ' error : ' + str(_e))

    @staticmethod
    def export_pdf(args):
        pdf_writer = pypdf.PdfWriter()
        try:
            pdf_reader = pypdf.PdfReader(args['document']['file_path'], strict=False)
            for page in args['document']['pages']:
                pdf_page = pdf_reader.pages[page['source_page'] - args['reduce_index']]
                if page['rotation'] != 0:
                    pdf_page.rotate(page['rotation'])
                pdf_writer.add_page(pdf_page)

            if pdf_reader.metadata:
                pdf_writer.add_metadata(pdf_reader.metadata)

            title = ''
            if 'title' in args['document']['data']['custom_fields']:
                title = args['document']['data']['custom_fields']['title']
            elif 'title' in args['batch_metadata']:
                title = args['batch_metadata']['title']

            subject = ''
            if 'subject' in args['document']['data']['custom_fields']:
                subject = args['document']['data']['custom_fields']['subject']
            elif 'subject' in args['batch_metadata']:
                subject = args['batch_metadata']['subject']

            user_firstname = args['batch_metadata']['userFirstName'] if 'userFirstName' in args['batch_metadata'] else ''
            user_lastname = args['batch_metadata']['userLastName'] if 'userLastName' in args['batch_metadata'] else ''

            pdf_writer.add_metadata({
                '/Author': f"{user_firstname} {user_lastname}",
                '/Title': title,
                '/Subject': subject,
                '/Creator': "Open-Capture"
            })

            file_path = args['document']['folder_out'] + '/' + args['document']['filename']

            if args['document']['compress_type']:
                tmp_filename = '/tmp/' + args['document']['filename']
                with open(tmp_filename, 'wb') as file:
                    pdf_writer.write(file)
                pdf_writer = pypdf.PdfWriter()
                compressed_file_path = '/tmp/min_' + args['document']['filename']
                compress_pdf(tmp_filename, compressed_file_path, args['document']['compress_type'])
                shutil.move(compressed_file_path, file_path)
            else:
                with open(file_path, 'wb') as file:
                    pdf_writer.write(file)
                    args['log'].info(f"Splitter file exported to : {file_path}")
                pdf_writer = pypdf.PdfWriter()
        except (Exception,) as err:
            return False, str(err)

        return file_path, ''

    @staticmethod
    def list_files(directory, extension):
        return [f for f in os.listdir(directory) if f.lower().endswith('.' + extension)]

    @staticmethod
    def get_random_string(length):
        letters = string.ascii_uppercase + string.digits
        return ''.join(random.choice(letters) for _ in range(length))

    @staticmethod
    def compress_files(files, output_path, remove_compressed_files=False):
        with ZipFile(output_path, 'w') as zip_obj:
            for file in files:
                if os.path.exists(file['filepath']):
                    zip_obj.write(file['filepath'], file['filename'] if file['filename'] else None)
                    if remove_compressed_files:
                        os.remove(file['filepath'])

    @staticmethod
    def adjust_image(image_path):
        """
        Preprocessing of a given image and reading of its text
        :param image_path: path of the image we want to use ocr on
        :return: the text extracted from the image in lowercase (string)
        """
        img = cv2.imread(image_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur = cv2.bilateralFilter(gray, 5, 75, 75)
        _, black_and_white_image = cv2.threshold(blur, 127, 255, cv2.THRESH_BINARY)
        return black_and_white_image

    @staticmethod
    def normalize(file_name):
        normalized = file_name.replace(' ', '_')
        normalized = normalized.replace('°', '')
        return normalized

    @staticmethod
    def save_img_with_pdf2image_static(pdf_name, output, log, page=None):
        try:
            output = os.path.splitext(output)[0]
            bck_output = os.path.splitext(output)[0]
            images = convert_from_path(pdf_name, first_page=page, last_page=page, dpi=300)
            cpt = 1
            for i in range(len(images)):
                if not page:
                    output = bck_output + '-' + str(cpt).zfill(3)
                images[i].save(output + '.jpg', 'JPEG')
                cpt = cpt + 1
        except (Exception,) as error:
            log.error('Error during pdf2image conversion : ' + str(error))

    @staticmethod
    def remove_file(path, log):
        try:
            if os.path.exists(path):
                os.remove(path)
                log.info(f'File {path} deleted')
                return True
            else:
                log.error(f'File {path} does not exist')
                return False
        except (Exception,) as error:
            log.error(f'Error during file deletion : {str(error)}')
            return False

    @staticmethod
    def remove_folder(path, log):
        try:
            if os.path.exists(path):
                shutil.rmtree(path)
                log.info(f'Folder {path} deleted')
                return True
            else:
                log.error(f'Folder {path} does not exist')
                return False
        except (Exception,) as error:
            log.error(f'Error during folder deletion : {str(error)}')
            return False


def compress_pdf(input_file, output_file, compress_id):
    gs_command = 'gs#-sDEVICE=pdfwrite#-dCompatibilityLevel=1.4#-dPDFSETTINGS=/%s#-dNOPAUSE#-dQUIET#-o#%s#%s' \
                 % (compress_id, output_file, input_file)
    gs_args = gs_command.split('#')
    subprocess.check_call(gs_args)
