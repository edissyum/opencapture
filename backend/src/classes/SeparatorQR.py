# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# See LICENCE file at the root folder for more details.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
# @dev : Pierre-Yvon Bezert <pierreyvon.bezert@edissyum.com>

import os
import re
import uuid
import pypdf
import shutil
import base64
import qrcode
import pdf2image
import subprocess
from .. import shared
from fpdf import FPDF
from io import BytesIO
from unidecode import unidecode
from pyzbar.pyzbar import decode
from fpdf.enums import RenderStyle
import xml.etree.ElementTree as Et
from PIL import Image, ImageEnhance


class SeparatorQR:
    def __init__(self, log, config, tmp_folder, splitter_or_verifier, files, remove_blank_pages, docservers,
                 splitter_method):
        self.log = log
        self.pages = []
        self.nb_doc = 0
        self.nb_pages = 0
        self.error = False
        self.files = files
        self.divider = '_'
        self.barcodes = None
        self.config = config
        self.enabled = False
        self.splitter_method = splitter_method
        self.remove_blank_pages = remove_blank_pages
        self.splitter_or_verifier = splitter_or_verifier
        self.convert_to_pdfa = config['SEPARATORQR']['exportpdfa']
        tmp_folder_name = os.path.basename(os.path.normpath(tmp_folder))
        self.tmp_dir = shared.tmp_path + '/' + tmp_folder_name + '/'
        self.output_dir = shared.data_path + '/exported_pdf/' + tmp_folder_name + '/'
        self.output_dir_pdfa = shared.data_path + '/exported_pdfa/' + tmp_folder_name + '/'

        if not os.path.exists(self.tmp_dir):
            os.mkdir(self.tmp_dir)
        if not os.path.exists(self.output_dir):
            os.mkdir(self.output_dir)
        if not os.path.exists(self.output_dir_pdfa):
            os.mkdir(self.output_dir_pdfa)

    @staticmethod
    def sorted_files(data):
        convert = lambda text: int(text) if text.isdigit() else text.lower()
        alphanum_key = lambda key: [convert(c) for c in re.split(r'(\d+)', key)]
        return sorted(data, key=alphanum_key)

    def remove_blank_page(self, file):
        pages = pdf2image.convert_from_path(file)
        i = 1
        for page in pages:
            page.save(self.output_dir + '/result-' + str(i) + '.jpg', 'JPEG')
            i = i + 1

        blank_page_exists = False
        pages_to_keep = []
        for _file in self.sorted_files(os.listdir(self.output_dir)):
            if _file.lower().endswith('.jpg'):
                if not self.files.is_blank_page(self.output_dir + '/' + _file):
                    pages_to_keep.append(os.path.splitext(_file)[0].split('-')[1])
                else:
                    blank_page_exists = True

                try:
                    os.remove(self.output_dir + '/' + _file)
                except FileNotFoundError:
                    pass

        if blank_page_exists:
            infile = pypdf.PdfReader(file)
            output = pypdf.PdfWriter()
            for i in self.sorted_files(pages_to_keep):
                _page = infile.pages[int(i) - 1]
                output.add_page(_page)

            with open(file, 'wb') as binary_f:
                output.write(binary_f)

    def split_document_every_x_pages(self, file, page_per_doc):
        path = os.path.dirname(file)
        file_without_extention = os.path.splitext(os.path.basename(file))[0]

        pdf = pypdf.PdfReader(file, strict=False)
        nb_pages = len(pdf.pages)
        array_of_files = []
        _break = False
        offset = 0
        end = int(page_per_doc)

        pages = pdf2image.convert_from_path(file)
        i = 0
        for page in pages:
            page.save(self.tmp_dir + '/result-' + str(i) + '.jpg', 'JPEG')
            i = i + 1

        for cpt in range(0, nb_pages):
            if self.remove_blank_pages:
                if self.files.is_blank_page(self.tmp_dir + '/result-' + str(cpt) + '.jpg'):
                    continue

            output = pypdf.PdfWriter()
            for i in range(offset, end):
                if i >= nb_pages:
                    _break = True
                    break
                output.add_page(pdf.pages[i])

            newname = path + '/' + file_without_extention + "-" + str(cpt + 1) + ".pdf"
            with open(newname, 'wb') as output_stream:
                output.write(output_stream)
            array_of_files.append(newname)

            if offset >= nb_pages or _break:
                break
            offset = offset + int(page_per_doc)
            end = end + int(page_per_doc)
        return array_of_files

    def run(self, file, saved_pages=None):
        """

        :param file: file to separate
        :param saved_pages: Images list if pages already saved
        :return:
        """
        self.log.info('Start page separation using QR CODE')
        self.pages = []
        try:
            pdf = pypdf.PdfReader(file)
            self.nb_pages = len(pdf.pages)
            if self.splitter_or_verifier == 'verifier':
                self.get_xml(file, saved_pages)
                if self.remove_blank_pages:
                    self.remove_blank_page(file)
                self.parse_xml()
                self.check_empty_docs()
                self.set_doc_ends()
                self.extract_and_convert_docs(file)
            elif self.splitter_or_verifier == 'splitter':
                self.get_xml(file, saved_pages, ['QRCODE'])
                self.parse_xml_multi()
        except (Exception,) as e:
            self.error = True
            self.log.error("INIT : " + str(e))

    def get_xml_zbarimg(self, file):
        try:
            xml = subprocess.Popen([
                'zbarimg',
                '--xml',
                '-q',
                '-Sdisable',
                '-Sqr.enable',
                file
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            out, err = xml.communicate()
            if err.decode('utf-8') and not err.decode('utf-8').startswith('WARNING:'):
                self.log.error('ZBARIMG : ' + str(err))
            self.barcodes = Et.fromstring(out)
        except subprocess.CalledProcessError as cpe:
            if cpe.returncode != 4:
                self.log.error("ZBARIMG : \nreturn code: %s\ncmd: %s\noutput: %s\nglobal : %s" % (
                    cpe.returncode, cpe.cmd, cpe.output, cpe))

    def get_xml(self, file, saved_pages=None, default_symbols=['CODE128', 'QRCODE']):
        """
        Retrieve the content of a C128 Code

        :param default_symbols: List of symbols to search
        :param file: Path to pdf file
        :param saved_pages: Images list if pages already saved
        """
        barcodes = []
        cpt = 0

        if saved_pages:
            for page in saved_pages:
                img = Image.open(page)
                img = ImageEnhance.Contrast(img).enhance(2.0)
                detected_barcode = decode(img)
                img.close()
                if detected_barcode:
                    for barcode in detected_barcode:
                        if barcode.type in default_symbols:
                            barcodes.append({
                                'type': barcode.type,
                                'text': barcode.data.decode('utf-8'),
                                'attrib': {'num': cpt}
                            })
                cpt += 1
        else:
            pages = pdf2image.convert_from_path(file)
            for page in pages:
                detected_barcode = decode(page)
                if detected_barcode:
                    for barcode in detected_barcode:
                        if barcode.type in default_symbols:
                            barcodes.append({
                                'type': barcode.type,
                                'text': barcode.data.decode('utf-8'),
                                'attrib': {'num': cpt}
                            })
                cpt += 1
        if barcodes:
            self.barcodes = barcodes

    def parse_xml_multi(self):
        if self.barcodes is None:
            return

        for index in self.barcodes:
            self.pages.append({
                "qr_code": index['text'],
                "num": index['attrib']['num']
            })

    def parse_xml(self):
        if self.barcodes is None:
            return

        for index in self.barcodes:
            page = {}
            if ((self.splitter_method == 'qr_code_OC' and index['type'] == 'QRCODE') or
                    (self.splitter_method == 'c128_OC' and index['type'] == 'CODE128')):
                page['service'] = index['text']
                page['index_sep'] = index['attrib']['num']
            else:
                continue

            if page['index_sep'] + 1 >= self.nb_pages:  # If last page is a separator
                page['is_empty'] = True
            else:
                page['is_empty'] = False
                page['index_start'] = page['index_sep'] + 2

            page['uuid'] = str(uuid.uuid4())  # Generate random number for pdf filename
            page['pdf_filename'] = self.output_dir + page['service'] + self.divider + page['uuid'] + '.pdf'
            page['pdfa_filename'] = self.output_dir_pdfa + page['service'] + self.divider + page['uuid'] + '.pdf'
            self.pages.append(page)
        self.nb_doc = len(self.pages)

    def check_empty_docs(self):
        for i in range(self.nb_doc - 1):
            if self.pages[i]['index_sep'] + 1 == self.pages[i + 1]['index_sep']:
                self.pages[i]['is_empty'] = True

    def set_doc_ends(self):
        for i in range(self.nb_doc):
            if self.pages[i]['is_empty']:
                continue
            if i + 1 < self.nb_doc:
                self.pages[i]['index_end'] = self.pages[i + 1]['index_sep']
            else:
                self.pages[i]['index_end'] = self.nb_pages

    def extract_and_convert_docs(self, file):
        if len(self.pages) == 0:
            try:
                shutil.move(file, self.output_dir)
            except shutil.Error as _e:
                self.log.error('Moving file ' + file + ' error : ' + str(_e))
            return
        try:
            for page in self.pages:
                if page['is_empty']:
                    continue

                pages_to_keep = range(page['index_start'], page['index_end'] + 1)
                self.split_pdf(file, page['pdf_filename'], pages_to_keep)

                if self.convert_to_pdfa == 'True':
                    self.convert_to_pdfa(page['pdfa_filename'], page['pdf_filename'])
            os.remove(file)
        except (Exception,) as _e:
            self.log.error("EACD: " + str(_e))

    @staticmethod
    def convert_to_pdfa(pdfa_filename, pdf_filename):
        gs_command = 'gs#-dPDFA#-dNOOUTERSAVE#-sProcessColorModel=DeviceCMYK#-sDEVICE=pdfwrite#-o#%s#-dPDFACompatibilityPolicy=1#PDFA_def.ps#%s' \
                     % (pdfa_filename, pdf_filename)
        gs_args = gs_command.split('#')
        subprocess.check_call(gs_args)
        os.remove(pdf_filename)

    @staticmethod
    def split_pdf(input_path, output_path, pages):
        input_pdf = pypdf.PdfReader(input_path)
        output_pdf = pypdf.PdfWriter()

        for page in pages:
            output_pdf.add_page(input_pdf.pages[page - 1])

        with open(output_path, 'wb') as stream:
            output_pdf.write(stream)

    @staticmethod
    def generate_separator(docservers, separators):
        """
        Generate separator file
        :param docservers: docservers lists
        :param separators: separator list to generate
        :return: base64 encoded separator file, thumbnail and total
        """

        # Defining the ELEMENTS that will compose the template
        total = 0
        encoded_thumbnails = []
        for separator in separators:
            qrcode_path = shared.tmp_path + f"/code_qr_{separator['qr_code_value']}.png"
            img = qrcode.make(separator['qr_code_value'])
            img.save(qrcode_path)

            file_path = shared.tmp_path + "/last_generated_doctype_file.pdf"

            pdf = SeparatorPDF(format='A4', unit='mm')
            pdf.build({
                'code_qr': qrcode_path,
                'type': separator['type'],
                'qr_code_value': separator['qr_code_value'],
                'logo': shared.assets_path + "/imgs/opencapture.png",
                'company_logo': shared.assets_path + "/imgs/logo_company.png",
                'label': unidecode(separator['label']).encode('latin-1', 'replace').decode('latin-1')
            })

            try:
                pdf.output(file_path)

                with open(file_path, 'rb') as pdf_file:
                    encoded_file = f"data:application/pdf;base64, {base64.b64encode(pdf_file.read()).decode('utf-8')}"
                pages = pdf2image.convert_from_path(file_path, size=(None, 720))

                for page in pages:
                    buffered = BytesIO()
                    page.save(buffered, format="JPEG")
                    encoded_thumbnails.append(
                        f"data:image/jpeg;base64," f"{base64.b64encode(buffered.getvalue()).decode('utf-8')}")
            except (Exception,) as _e:
                return {'error': str(_e)}

        return {
            'total': total,
            'encoded_file': encoded_file,
            'encoded_thumbnails': encoded_thumbnails
        }


class SeparatorPDF(FPDF):
    def build(self, data: dict):
        self.add_page()
        self.set_auto_page_break(auto=False)
        self.set_font('Arial', '', 12)

        # ── Bordure arrondie verte ──────────────────────────────
        self.set_draw_color(175, 213, 192)
        self.set_line_width(0.5)
        self._draw_rounded_rect(x=10, y=10, w=190, h=275, r=5, round_corners=True, style=RenderStyle.D)
        self.set_draw_color(0, 0, 0)

        # ── Logo ───────────────────────────────────────────────
        self.image(data['logo'], x=20, y=17, w=0, h=13)

        # ── Type ───────────────────────────────────────────────
        self.set_xy(15, 60.5)
        self.cell(w=185, h=5, txt=data.get('type', ''), align='C')

        # ── Label (multiline) ──────────────────────────────────
        self.set_font('Arial', 'B', 16)
        self.set_xy(15, 80)
        self.multi_cell(w=185, h=5, txt=data.get('label', ''), align='C')

        # ── QR Code ────────────────────────────────────────────
        self.image(data['code_qr'], x=60, y=90, w=100, h=100)

        # ── Valeur QR ──────────────────────────────────────────
        self.set_font('Arial', '', 12)
        self.set_xy(15, 200)
        self.cell(w=185, h=5, txt=data.get('qr_code_value', ''), align='C')

        # ── Company logo ───────────────────────────────────────
        self.image(data['company_logo'], x=20, y=270, w=0, h=10)

        # ── Liens ──────────────────────────────────────────────
        self.set_text_color(145, 146, 155)
        self.set_xy(15, 271)
        self.cell(w=180, h=5, txt='https://open-capture.com', align='R')
        self.set_xy(15, 276)
        self.cell(w=180, h=5, txt='https://edissyum.com', align='R')
        self.set_text_color(0, 0, 0)
