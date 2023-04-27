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
from io import BytesIO
from fpdf import Template
from pyzbar.pyzbar import decode
import xml.etree.ElementTree as Et


class SeparatorQR:
    def __init__(self, log, config, tmp_folder, splitter_or_verifier, files, remove_blank_pages, docservers,
                 splitter_method):
        self.log = log
        self.pages = []
        self.nb_doc = 0
        self.nb_pages = 0
        self.error = False
        self.qrList = None
        self.Files = files
        self.config = config
        self.enabled = False
        self.splitter_method = splitter_method
        self.remove_blank_pages = remove_blank_pages
        self.splitter_or_verifier = splitter_or_verifier
        self.divider = config['SEPARATORQR']['divider']
        self.convert_to_pdfa = config['SEPARATORQR']['exportpdfa']
        tmp_folder_name = os.path.basename(os.path.normpath(tmp_folder))
        self.tmp_dir = docservers['SEPARATOR_QR_TMP'] + '/' + tmp_folder_name + '/'
        self.output_dir = docservers['SEPARATOR_OUTPUT_PDF'] + '/' + tmp_folder_name + '/'
        self.output_dir_pdfa = docservers['SEPARATOR_OUTPUT_PDFA'] + '/' + tmp_folder_name + '/'

        os.mkdir(self.tmp_dir)
        os.mkdir(self.output_dir)
        os.mkdir(self.output_dir_pdfa)

    @staticmethod
    def sorted_files(data):
        convert = lambda text: int(text) if text.isdigit() else text.lower()
        alphanum_key = lambda key: [convert(c) for c in re.split('([0-9]+)', key)]
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
            if _file.endswith('.jpg'):
                if not self.Files.is_blank_page(self.output_dir + '/' + _file):
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
                if self.Files.is_blank_page(self.tmp_dir + '/result-' + str(cpt) + '.jpg'):
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

    def run(self, file):
        self.log.info('Start page separation using QR CODE')
        self.pages = []
        try:
            pdf = pypdf.PdfReader(file)
            self.nb_pages = len(pdf.pages)
            if self.splitter_method == 'qr_code_OC':
                self.get_xml_qr_code(file)
            elif self.splitter_method == 'c128_OC':
                self.get_xml_c128(file)

            if self.splitter_or_verifier == 'verifier':
                if self.remove_blank_pages:
                    self.remove_blank_page(file)
                self.parse_xml()
                self.check_empty_docs()
                self.set_doc_ends()
                self.extract_and_convert_docs(file)

            elif self.splitter_or_verifier == 'splitter':
                self.parse_xml_multi()

        except Exception as e:
            self.error = True
            self.log.error("INIT : " + str(e))

    def get_xml_c128(self, file):
        """
        Retrieve the content of a C128 Code

        :param file: Path to pdf file
        """
        pages = pdf2image.convert_from_path(file)
        barcodes = []
        cpt = 0
        for page in pages:
            detected_barcode = decode(page)
            if detected_barcode:
                for barcode in detected_barcode:
                    if barcode.type == 'CODE128':
                        barcodes.append({'text': barcode.data.decode('utf-8'), 'attrib': {'num': cpt}})
            cpt += 1

        if barcodes:
            self.qrList = barcodes

    def get_xml_qr_code(self, file):
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
            if err.decode('utf-8'):
                self.log.error('ZBARIMG : ' + str(err))
            self.qrList = Et.fromstring(out)
        except subprocess.CalledProcessError as cpe:
            if cpe.returncode != 4:
                self.log.error("ZBARIMG : \nreturn code: %s\ncmd: %s\noutput: %s\nglobal : %s" % (
                    cpe.returncode, cpe.cmd, cpe.output, cpe))

    def parse_xml_multi(self):
        if self.qrList is None:
            return

        for index in self.qrList[0]:
            self.pages.append({
                "qr_code": index[0][0].text,
                "num": index.attrib['num']
            })

    def parse_xml(self):
        if self.qrList is None:
            return

        if self.splitter_method == 'qr_code_OC':
            ns = {'bc': 'http://zbar.sourceforge.net/2008/barcode'}
            indexes = self.qrList[0].findall('bc:index', ns)
        elif self.splitter_method == 'c128_OC':
            indexes = self.qrList
        else:
            return

        for index in indexes:
            page = {}
            if self.splitter_method == 'qr_code_OC':
                data = index.find('bc:symbol', ns).find('bc:data', ns)
                page['service'] = data.text
                page['index_sep'] = int(index.attrib['num'])
            elif self.splitter_method == 'c128_OC':
                data = index
                page['service'] = data['text']
                page['index_sep'] = index['attrib']['num']

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
            except shutil.Error as e:
                self.log.error('Moving file ' + file + ' error : ' + str(e))
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
        except Exception as e:
            self.log.error("EACD: " + str(e))

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

        """ Defining the ELEMENTS that will compose the template"""
        total = 0
        encoded_file = ''
        encoded_thumbnails = []

        elements = [
            {'name': 'border_1', 'type': 'B', 'x1': 10.0, 'y1': 10.0, 'x2': 200.0, 'y2': 285.0, 'font': 'Arial',
             'size': 2.0, 'bold': 0, 'italic': 0, 'underline': 0, 'foreground': 0, 'background': 0, 'align': 'I',
             'text': None, 'priority': 0, },
            {'name': 'border_2', 'type': 'B', 'x1': 12.0, 'y1': 12.0, 'x2': 198.0, 'y2': 283.0, 'font': 'Arial',
             'size': 0.0, 'bold': 0, 'italic': 0, 'underline': 0, 'foreground': 0, 'background': 0, 'align': 'I',
             'text': None, 'priority': 0, },
            {'name': 'logo', 'type': 'I', 'x1': 20.0, 'y1': 17.0, 'x2': 78.0, 'y2': 30.0, 'font': None, 'size': 0.0,
             'bold': 0, 'italic': 0, 'underline': 0, 'foreground': 0, 'background': 0, 'align': 'I', 'text': 'logo',
             'priority': 2, },
            {'name': 'icon_loop', 'type': 'I', 'x1': 183.0, 'y1': 18.0, 'x2': 195.0, 'y2': 28.0, 'font': None, 'size': 0.0,
             'bold': 0, 'italic': 0, 'underline': 0, 'foreground': 0, 'background': 0, 'align': 'I', 'text': 'logo',
             'priority': 2, },
            {'name': 'title', 'type': 'T', 'x1': 15.0, 'y1': 32.5, 'x2': 200.0, 'y2': 37.5, 'font': 'Arial',
             'size': 12.0, 'bold': 0, 'italic': 0, 'underline': 0, 'foreground': 0, 'background': 0, 'align': 'C',
             'text': '', 'priority': 2, },
            {'name': 'type', 'type': 'T', 'x1': 15.0, 'y1': 60.5, 'x2': 200.0, 'y2': 37.5, 'font': 'Arial',
             'size': 12.0, 'bold': 0, 'italic': 0, 'underline': 0, 'foreground': 0, 'background': 0, 'align': 'C',
             'text': '', 'priority': 2, },
            {'name': 'label', 'type': 'T', 'x1': 15.00, 'y1': 80.0, 'x2': 200, 'y2': 85.0, 'font': 'Arial',
             'size': 16.0, 'bold': 1, 'italic': 0, 'underline': 0, 'foreground': 0, 'background': 0, 'align': 'C',
             'text': '', 'priority': 2, 'multiline': True},
            {'name': 'code_qr', 'type': 'I', 'x1': 80.0, 'y1': 120.0, 'x2': 140.0, 'y2': 120.0, 'font': None,
             'size': 0.0, 'bold': 0, 'italic': 0, 'underline': 0, 'foreground': 0, 'background': 0, 'align': 'I',
             'text': 'logo', 'priority': 2, },
            {'name': 'qr_code_value', 'type': 'T', 'x1': 15.00, 'y1': 260.0, 'x2': 200, 'y2': 120.0, 'font': 'Arial',
             'size': 12.0, 'bold': 0, 'italic': 0, 'underline': 0, 'foreground': 0, 'background': 0, 'align': 'C',
             'text': '', 'priority': 2, },
            {'name': 'powered_by', 'type': 'T', 'x1': 20.0, 'y1': 515.0, 'x2': 150.0, 'y2': 37.5, 'font': 'Arial',
             'size': 12.0, 'bold': 0, 'italic': 0, 'underline': 0, 'foreground': 0, 'background': 0, 'align': 'I',
             'text': 'Banner page powered by', 'priority': 2, },
            {'name': 'company_logo', 'type': 'I', 'x1': 70.0, 'y1': 271.0, 'x2': 100.0, 'y2': 280.0, 'font': None,
             'size': 0.0, 'bold': 0, 'italic': 0, 'underline': 0, 'foreground': 0, 'background': 0, 'align': 'I',
             'text': 'logo', 'priority': 2, },
            {'name': 'open_capture_website', 'type': 'T', 'x1': 140.0, 'y1': 505.0, 'x2': 150.0, 'y2': 37.5, 'font': 'Arial',
             'size': 12.0, 'bold': 0, 'italic': 0, 'underline': 0, 'foreground': 0, 'background': 0, 'align': 'I',
             'text': 'https://open-capture.com', 'priority': 2, },
            {'name': 'company_website', 'type': 'T', 'x1': 140.0, 'y1': 515.0, 'x2': 150.0, 'y2': 37.5, 'font': 'Arial',
             'size': 12.0, 'bold': 0, 'italic': 0, 'underline': 0, 'foreground': 0, 'background': 0, 'align': 'I',
             'text': 'https://edissyum.com', 'priority': 2, },
        ]

        # Instantiating the template and defining the HEADER
        f = Template(format="A4", elements=elements,
                     title="Separator file")
        for separator in separators:
            f.add_page()
            total += 1

            # We FILL some of the fields of the template with the information we want
            # Note we access the elements treating the template instance as a dict
            f["type"] = separator['type']
            f["label"] = separator['label'].encode('latin-1', 'replace').decode('latin-1')
            f["qr_code_value"] = separator['qr_code_value']
            f["logo"] = docservers['PROJECT_PATH'] + "/src/assets/imgs/login_image.png"
            f["company_logo"] = docservers['PROJECT_PATH'] + "/src/assets/imgs/logo_company.png"
            f["icon_loop"] = docservers['PROJECT_PATH'] + "/src/assets/imgs/Open-Capture_Splitter.png"

            qrcode_path = docservers['TMP_PATH'] + f"/code_qr_{separator['qr_code_value']}.png"
            img = qrcode.make(separator['qr_code_value'])
            img.save(qrcode_path)
            f["code_qr"] = qrcode_path

        file_path = docservers['TMP_PATH'] + "/last_generated_doctype_file.pdf"

        try:
            f.render(file_path)
            with open(file_path, 'rb') as pdf_file:
                encoded_file = f"data:application/pdf;base64," \
                               f"{base64.b64encode(pdf_file.read()).decode('utf-8')}"
            pages = pdf2image.convert_from_path(file_path, dpi=300)

            for page in pages:
                buffered = BytesIO()
                page.save(buffered, format="JPEG")
                encoded_thumbnails.append(f"data:image/jpeg;base64,"
                                          f"{base64.b64encode(buffered.getvalue()).decode('utf-8')}")
        except Exception as e:
            return {'error': str(e)}

        return {
            'total': total,
            'encoded_file': encoded_file,
            'encoded_thumbnails': encoded_thumbnails
        }
