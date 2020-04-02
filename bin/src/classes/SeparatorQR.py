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
# @dev : Pierre-Yvon Bezert <pierreyvon.bezert@edissyum.com>

import os
import sys
import uuid
import shutil
import subprocess
import xml.etree.ElementTree as ET
import PyPDF4

class SeparatorQR:
    def __init__(self, Log, Config):
        self.qrList             = None
        self.Log                = Log
        self.pages              = []
        self.nb_pages           = 0
        self.nb_doc             = 0
        self.enabled            = Config.cfg['SEPARATORQR']['enabled']
        self.output_dir         = Config.cfg['SEPARATORQR']['outputpdfpath']
        self.output_dir_pdfa    = Config.cfg['SEPARATORQR']['outputpdfapath']
        self.tmp_dir            = Config.cfg['SEPARATORQR']['tmppath']
        self.convert_to_pdfa    = Config.cfg['SEPARATORQR']['exportpdfa']
        self.divider            = Config.cfg['SEPARATORQR']['divider']
        self.error              = False

    def run(self, file):
        self.pages  =   []
        try:
            pdf = PyPDF4.PdfFileReader(open(file, 'rb'))
            self.nb_pages = pdf.getNumPages()
            self.get_xml_qr_code(file)
            self.parse_xml()
            self.check_empty_docs()
            self.set_doc_ends()
            self.extract_and_convert_docs(file)
        except Exception as e:
            self.error = True
            self.Log.error("INIT : " + str(e))


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
                self.Log.error('ZBARIMG : ' + str(err))
            self.qrList = ET.fromstring(out)
        except subprocess.CalledProcessError as cpe:
            if cpe.returncode != 4:
                self.Log.error("ZBARIMG : \nreturn code: %s\ncmd: %s\noutput: %s\nglobal : %s" % (cpe.returncode, cpe.cmd, cpe.output, cpe))
        except:
            self.Log.error("ZBARIMG : Unexpected error : " + str(sys.exc_info()[0]))

    def parse_xml(self):
        if self.qrList is None:
            return
        ns = {'bc': 'http://zbar.sourceforge.net/2008/barcode'}
        indexes = self.qrList[0].findall('bc:index', ns)
        for index in indexes:
            page                = {}
            data                = index.find('bc:symbol', ns).find('bc:data', ns)
            page['service']     = data.text
            page['index_sep']   = int(index.attrib['num'])

            if page['index_sep'] + 1 >= self.nb_pages: # If last page is a separator
                page['is_empty']    = True
            else:
                page['is_empty']    = False
                page['index_start'] = page['index_sep'] + 2

            page['uuid']            = str(uuid.uuid4())    # Generate random number for pdf filename
            page['pdf_filename']    = self.output_dir + page['service'] + self.divider + page['uuid'] + '.pdf'
            page['pdfa_filename']   = self.output_dir_pdfa + page['service'] + self.divider + page['uuid'] + '.pdf'
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
                self.Log.error('Moving file ' + file + ' error : ' + str(e))
            return
        try:
            for page in self.pages:
                if page['is_empty']:
                    continue

                pagesToKeep = range(page['index_start'], page['index_end'] + 1)
                self.split_pdf(file, page['pdf_filename'], pagesToKeep)

                if self.convert_to_pdfa == 'True':
                    self.convert_to_pdfa(page['pdfa_filename'], page['pdf_filename'])
            os.remove(file)
        except Exception as e:
            self.Log.error("EACD: " + str(e))


    @staticmethod
    def convert_to_pdfa(pdfa_filename, pdf_filename):
        gs_commandLine = 'gs#-dPDFA#-dNOOUTERSAVE#-sProcessColorModel=DeviceCMYK#-sDEVICE=pdfwrite#-o#%s#-dPDFACompatibilityPolicy=1#PDFA_def.ps#%s' \
                         % (pdfa_filename, pdf_filename)
        gs_args = gs_commandLine.split('#')
        subprocess.check_call(gs_args)
        os.remove(pdf_filename)

    @staticmethod
    def split_pdf(inputPath, outputPath, pages):
        inputPdf = PyPDF4.PdfFileReader(open(inputPath, "rb"))
        outputPdf = PyPDF4.PdfFileWriter()

        for page in pages:
            outputPdf.addPage(inputPdf.getPage(page - 1))

        with open(outputPath, "wb") as stream:
            outputPdf.write(stream)
