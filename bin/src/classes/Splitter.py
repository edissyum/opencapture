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
# @dev : Oussama Brich <oussama.brich@edissyum.com>


import os
import re
import uuid

import PyPDF2
import shutil
from datetime import date, datetime
from bin.src.classes.Files import Files

class Splitter:
    def __init__(self, Config, Database, Locale):
        self.Config = Config
        self.db = Database
        self.Locale = Locale

    # separate by page number
    # TODO :
        # find better way to capture page number
    def is_next_page(self, text_array, current_page):
        next_page = current_page + 1
        # delete \n (if we keep it regex won't work well)
        text_array[current_page] = text_array[current_page].replace('\n', ' ').replace('\r', '')
        for match_number_current_page in re.finditer(self.Locale.pageNumber, text_array[current_page].replace(' ', '')):
            if match_number_current_page:
                split_text_array_current_page = x = match_number_current_page.group().split()
                # split index found (A/B) (result is ['A','/','B']
                current_page_index = split_text_array_current_page[0]
                current_page_index_max = split_text_array_current_page[1]

                #  if next page exist
                if current_page + 1 < len(text_array):
                    for match_number_next_page in re.finditer(self.Locale.pageNumber, text_array[next_page].replace(' ', '')):
                        split_text_array_next_page = x = match_number_next_page.group().split()
                        # split
                        # index found (A/B) (result is ['A','/','B']
                        next_page_index = split_text_array_next_page[1]
                        next_page_index_max = split_text_array_next_page[3]
                        if int(current_page_index) + 1 != int(next_page_index) or int(current_page_index_max) != int(
                                next_page_index_max):
                            return False
        return True

    @staticmethod
    def is_same_reference(text_array, current_page, regex):
        # regroup the functions
        # regex in the parameters
        # if reference info (siret, siren, vatn, number of page)
        is_same_refrence = True
        next_page = current_page + 1
        is_found = False
        # delete \n (if we keep it regex won't work well)
        text_array[current_page] = text_array[current_page].replace('\n', ' ').replace('\r', '')
        for match_siren_current_page in re.finditer(regex, text_array[current_page].replace(' ', '')):
            if match_siren_current_page:
                if is_found:
                    break
                # verify if next page exit
                if current_page + 1 < len(text_array):
                    for match_siren_next_page in re.finditer(regex, text_array[next_page].replace(' ', '')):
                        if match_siren_next_page:
                            if match_siren_current_page.group() != match_siren_next_page.group():
                                is_same_refrence = False
                            else:
                                is_same_refrence = True
                                is_found = True
                                break
        return is_same_refrence

    def get_page_separate_order(self, pages_text_array):
        invoices = []
        # start from 0 and append the fist page
        invoice_index = 0
        invoices.append([])
        invoices[0].append(0)
        # pages_text_array = self.split_pages_from_pdf(self, path)

        # loop without the last page (number page -1)
        for page in range(len(pages_text_array) - 1):
            is_next_page_different_VATN = self.is_same_reference( pages_text_array, page, self.Locale.VATNumberRegex)
            is_next_page_different_SIREN = self.is_same_reference( pages_text_array, page, self.Locale.SIRENRegex)
            is_next_page_different_SIRET = self.is_same_reference( pages_text_array, page, self.Locale.SIRETRegex)
            is_next_page_different_invoice_number = self.is_same_reference( pages_text_array, page, self.Locale.invoiceRegex)
            # is_next_page_by_page_number             = self.is_next_page(self, pages_text_array, page)
            if is_next_page_different_VATN and is_next_page_different_SIREN and is_next_page_different_SIRET \
                    and is_next_page_different_invoice_number:
                invoices[invoice_index].append(page + 1)
            else:
                invoice_index += 1
                invoices.append([])
                invoices[invoice_index].append(page + 1)
        return invoices

    # TODO : Move from here
    @staticmethod
    def get_date_uuid_name():
        now = datetime.now()
        day = str(now.day)
        year = str(now.year)
        month = str('%02d' % now.month)
        hour = str('%02d' % now.hour)
        minute = str('%02d' % now.minute)
        seconds = str('%02d' % now.second)
        newFilename = day + month + year + '_' + hour + minute + seconds + '_' + uuid.uuid4().hex
        return newFilename

    def save_image_from_pdf(self, path_output_image, invoices_order, batch_folder, origFile):
        invoice_index = 0
        invoice_second_index = 0
        batch_name = os.path.basename(os.path.normpath(batch_folder))
        for invoice_order in invoices_order:
            new_directory_path = batch_folder + 'invoice_' + str(invoice_index) + '/'
            new_directory_path_to_compare = batch_folder + '/invoice_' + str(invoice_index) + '/'

            Files.create_directory(new_directory_path)
            for invoice_page_item in invoice_order:
                for page_index, page in path_output_image:
                    image = Files.open_image_return(page)
                    save_path = new_directory_path + 'page' + str(invoice_second_index) + '.jpg'
                    page_index_start_from_zero = int(page_index) - 1

                    if int(('%03d' % invoice_page_item)) == page_index_start_from_zero:
                        args = {
                            'table': 'image_page_number',
                            'columns': {
                                'batch_name': batch_name,
                                'image_path': batch_name + '/invoice_' +
                                              str(invoice_index) + "/page" +
                                              str(invoice_second_index) +
                                              ".jpg",
                                'image_number': str(page_index_start_from_zero),
                            }
                        }
                        self.db.insert(args)

                        image.save(save_path, 'JPEG')
                        invoice_second_index += 1
            invoice_second_index = 0
            invoice_index += 1
        #  save new file to database
        args = {
            'table': 'invoices_batch_',
            'columns': {
                'dir_name': origFile.rsplit('/')[-1], # getting the file name from path
                'image_folder_name': batch_name,
                'first_page': batch_name + "/invoice_0/page0.jpg",
                'page_number': str(invoice_index)
            }
        }
        self.db.insert(args)
        self.db.conn.commit()
        self.delete_not_necessary_file(self.Config.cfg['SPLITTER']['tmpbatchpath'] + batch_name)
        return batch_folder

    @staticmethod
    def delete_not_necessary_file(dir_path):
        files = os.listdir(dir_path)

        for item in files:
            if item.endswith(".jpg"):
                os.remove(os.path.join(dir_path, item))

    @staticmethod
    def delete_invoices_hist(path):
        file_list = [f for f in os.listdir(path)]
        for f in file_list:
            shutil.rmtree(path + '/' + f)

    def get_page_order_after_user_change(self, images_order, pdf_path_input, pdf_path_output):
        pages_order_result = []
        for invoice_index, invoice_pages in enumerate(images_order):
            pages_order_result.append([])
            for invoice_page in invoice_pages:
                #  append page number in original file if image path equal to path saved
                args = {
                    'select': ['*'],
                    'table': ['image_page_number'],
                    'where': ['image_path = ?'],
                    'data': [invoice_page]
                }
                page_number = self.db.select(args)[0]
                if page_number['image_path'] == str(invoice_page):
                    pages_order_result[invoice_index].append(int( page_number['image_number']))
        self.save_pdf_result_after_separate(pages_order_result, pdf_path_input, pdf_path_output)

    # save result after user separate in pdf (pdf for every invoice)
    def save_pdf_result_after_separate(self, pages_list, pdf_path_input, pdf_path_output):
        pdf_writer = PyPDF2.PdfFileWriter()
        pdf_reader = PyPDF2.PdfFileReader(self.Config.cfg['SPLITTER']['pdforiginpath'] + pdf_path_input)
        lot_name = self.get_lot_name()
        for invoice_index, pages in enumerate(pages_list):
            for page in pages:
                pdf_writer.addPage(pdf_reader.getPage(page))
            with open(pdf_path_output + '/invoice' + str(invoice_index + 1) + '_' + lot_name + '.pdf', 'wb') as fh:
                pdf_writer.write(fh)
            # init writer
            pdf_writer = PyPDF2.PdfFileWriter()

    def get_lot_name(self):
        random_number = uuid.uuid4().hex
        # date object of today's date
        today = date.today()
        lot_name = str(today.year) + str(today.month) + str(today.day) + str(random_number)
        return lot_name
