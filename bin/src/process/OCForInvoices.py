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
import uuid
import shutil
import PyPDF4
import datetime

from webApp.functions import get_custom_id, check_python_customized_files

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'FindDate' not in custom_array: from .FindDate import FindDate
else: FindDate = getattr(__import__(custom_array['FindDate']['path'] + '.' + custom_array['FindDate']['module'], fromlist=[custom_array['FindDate']['module']]), custom_array['FindDate']['module'])

if 'FindFooter' not in custom_array: from .FindFooter import FindFooter
else: FindFooter = getattr(__import__(custom_array['FindFooter']['path'] + '.' + custom_array['FindFooter']['module'], fromlist=[custom_array['FindFooter']['module']]), custom_array['FindFooter']['module'])

if 'FindSupplier' not in custom_array: from .FindSupplier import FindSupplier
else: FindSupplier = getattr(__import__(custom_array['FindSupplier']['path'] + '.' + custom_array['FindSupplier']['module'], fromlist=[custom_array['FindSupplier']['module']]), custom_array['FindSupplier']['module'])

if 'FindCustom' not in custom_array: from .FindCustom import FindCustom
else: FindSupplier = getattr(__import__(custom_array['FindCustom']['path'] + '.' + custom_array['FindCustom']['module'], fromlist=[custom_array['FindCustom']['module']]), custom_array['FindCustom']['module'])

if 'FindInvoiceNumber' not in custom_array: from .FindInvoiceNumber import FindInvoiceNumber
else: FindInvoiceNumber = getattr(__import__(custom_array['FindInvoiceNumber']['path'] + '.' + custom_array['FindInvoiceNumber']['module'], fromlist=[custom_array['FindInvoiceNumber']['module']]), custom_array['FindInvoiceNumber']['module'])

def insert(Database, Log, Files, Config, supplier, file, invoiceNumber, date, footer, nb_pages, full_jpg_filename, tiff_filename, status, custom_columns):
    if Files.isTiff == 'True':
        path = Config.cfg['GLOBAL']['tiffpath'] + '/' + tiff_filename.replace('-%03d', '-001')
    else:
        path = Config.cfg['GLOBAL']['fullpath'] + '/' + full_jpg_filename.replace('-%03d', '-001')

    columns = {
        'vat_number': supplier[0] if supplier else '',
        'vat_number_position': str(supplier[1]) if supplier else '',
        'invoice_date': date[0] if date else '',
        'invoice_date_position': str(date[1]) if date else '',
        'invoice_number': invoiceNumber[0] if invoiceNumber is not False else '',
        'invoice_number_position': str(invoiceNumber[1]) if invoiceNumber is not False else '',
        'total_amount': str(footer[1][0]) if [footer, footer[1]] is not False else '',
        'total_amount_position': str(footer[1][1]) if footer[1] is not False else '',
        'ht_amount1': str(footer[0][0]) if footer[0] is not False else '',
        'ht_amount1_position': str(footer[0][1]) if footer[0] is not False else '',
        'vat_rate1': str(footer[2][0]) if footer[2] is not False else '',
        'vat_rate1_position': str(footer[2][1]) if footer[2] is not False else '',
        'filename': os.path.basename(file),
        'path': os.path.dirname(file),
        'img_width': str(Files.get_size(path)),
        'full_jpg_filename': full_jpg_filename.replace('-%03d', '-001'),
        'tiff_filename': tiff_filename.replace('-%03d', '-001'),
        'status': status,
        'nb_pages': str(nb_pages),
    }

    if custom_columns:
        columns.update(custom_columns)

    res = Database.insert({
        'table': 'invoices',
        'columns': columns
    })

    # Commit database connection
    if res:
        Database.conn.commit()
        Log.info('Invoice inserted in database')
        try:
            os.remove(Files.jpgName_footer)
            os.remove(Files.jpgName_header)
            os.remove(Files.jpgName)
            os.remove(Files.jpgName_tiff_footer)
            os.remove(Files.jpgName_tiff_header)
            os.remove(Files.jpgName_tiff)
        except FileNotFoundError:
            pass
    else:
        Log.error('Error while inserting')

def process(args, file, Log, Separator, Config, Files, Ocr, Locale, Database, WebServices, q = None):
    Log.info('Processing file : ' + file)

    # Open the pdf and convert it to JPG
    if os.path.splitext(file)[1] == '.pdf':
        # Check if pdf is already OCR and searchable
        checkOcr = os.popen('pdffonts ' + file, 'r')
        tmp = ''
        for line in checkOcr:
            tmp += line

        if len(tmp.split('\n')) > 3:
            isOcr = True
        else:
            isOcr = False
    else:  # Open the picture
        Files.open_img(file)
        isOcr = False

    if Files.isTiff == 'True':
        Files.pdf_to_tiff(file, True, True, True, 'header')
        Ocr.header_text = Ocr.line_box_builder(Files.img)
        Files.pdf_to_tiff(file, True, True, True, 'footer')
        Ocr.footer_text = Ocr.line_box_builder(Files.img)
        Files.pdf_to_tiff(file, True)
        Ocr.text = Ocr.line_box_builder(Files.img)
    else:
        Files.pdf_to_jpg(file + '[0]', True, True, 'header')
        Ocr.header_text = Ocr.line_box_builder(Files.img)
        Files.pdf_to_jpg(file + '[0]', True, True, 'footer')
        Ocr.footer_text = Ocr.line_box_builder(Files.img)
        Files.pdf_to_jpg(file + '[0]')
        Ocr.text = Ocr.line_box_builder(Files.img)

    # Find supplier in document
    supplier        = FindSupplier(Ocr, Log, Locale, Database, Files, file + '[0]').run()

    # Find custom informations using mask
    customFields    = FindCustom(Ocr.header_text, Log, Locale, Config, Ocr, Files, supplier).run()
    columns = {}
    if customFields:
        for field in customFields:
            field_name = field.split('-')[1]
            field_name_position = field_name + '_position'
            columns.update({
                field_name: customFields[field][0],
                field_name_position: customFields[field][1]
            })

    # Find invoice number
    invoiceNumber   = FindInvoiceNumber(Ocr, Files, Log, Locale, Config, Database, supplier).run()

    # Find invoice date number
    date            = FindDate(Ocr.text, Log, Locale, Config, Files, Ocr, supplier).run()

    # Find footer informations (total amount, no rate amount etc..)
    footer          = FindFooter(Ocr, Log, Locale, Config, Files, Database, supplier, file + '[0]').run()

    fileName        = str(uuid.uuid4())
    full_jpg_filename = 'full_' + fileName + '-%03d.jpg'
    tiff_filename    = 'tiff_' + fileName + '-%03d.tiff'

    # get the number of pages into the PDF documents
    with open(file, 'rb') as doc:
        pdf = PyPDF4.PdfFileReader(doc)
        try:
            nb_pages = pdf.getNumPages()
        except ValueError as e:
            Log.error(e)
            shutil.move(file, Config.cfg['GLOBAL']['errorpath'] + os.path.basename(file))
            return False

    file = Files.move_to_docservers(Config.cfg, file)

    # If all informations are found, do not send it to GED
    if supplier and date and invoiceNumber and footer and Config.cfg['GLOBAL']['allowautomaticvalidation'] == 'True':
        insert(Database, Log, Files, Config, supplier, file, invoiceNumber, date, footer, nb_pages, full_jpg_filename, tiff_filename, 'DEL')
        Log.info('All the usefull informations are found. Export the XML and end process')
        now = datetime.datetime.now()
        parent = {
            'pdfCreationDate'   : [{'pdfCreationDate'   : {'field'  : str(now.year) + '-' + str('%02d' % now.month) + '-'+ str(now.day)}}],
            'fileInfo'          : [{'fileInfoPath'      : {'field'  : os.path.dirname(file) + '/' + os.path.basename(file)}}],
            'supplierInfo'      : [{
                'supplierInfo_name'         : {'field': supplier[2]['name']},
                'supplierInfo_city'         : {'field': supplier[2]['city']},
                'supplierInfo_siretNumber'  : {'field': supplier[2]['siret']},
                'supplierInfo_sirenNumber'  : {'field': supplier[2]['siren']},
                'supplierInfo_address'      : {'field': supplier[2]['adress1']},
                'supplierInfo_vatNumber'    : {'field': supplier[2]['vat_number']},
                'supplierInfo_postal_code'  : {'field': str(supplier[2]['postal_code'])},
            }],
            'facturationInfo'   : [{
                'facturationInfo_NumberOfTVA'           : {'field': '1'},
                'facturationInfo_date'                  : {'field': date[0]},
                'facturationInfo_invoiceNumber'         : {'field': invoiceNumber[0]},
                'facturationInfo_noTaxes_1'             : {'field': str("%.2f" % (footer[0][0]))},
                'facturationInfo_VAT_1'                 : {'field': str("%.2f" % (footer[2][0]))},
                'facturationInfo_TOTAL_TVA_1'           : {'field': str("%.2f" % (footer[0][0] * (footer[2][0] / 100)))},
                'facturationInfo_totalHT'               : {'field': str("%.2f" % (footer[0][0]))},
                'facturationInfo_totalTTC'              : {'field': str("%.2f" % (footer[0][0] * (footer[2][0] / 100) + footer[0][0]))},
            }]
        }
        Files.exportXml(Config, invoiceNumber[0], parent)
        if Config.cfg['GED']['enabled'] == 'True':
            defaultProcess  = Config.cfg['GED']['defaultprocess']
            invoiceInfo     = Database.select({
                'select'    : ['*'],
                'table'     : ['invoices'],
                'where'     : ['invoice_number = ?'],
                'data'      : [invoiceNumber[0]]
            })

            contact = WebServices.retrieve_contact_by_VATNumber(supplier[2]['vat_number'])
            if not contact:
                contact = {
                    'isCorporatePerson': 'Y',
                    'function': '',
                    'lastname': '',
                    'firstname': '',
                    'contactType': Config.cfg[defaultProcess]['contacttype'],
                    'contactPurposeId': Config.cfg[defaultProcess]['contactpurposeid'],
                    'society': parent['supplierInfo'][0]['supplierInfo_name']['field'],
                    'addressTown': parent['supplierInfo'][0]['supplierInfo_city']['field'],
                    'societyShort': parent['supplierInfo'][0]['supplierInfo_name']['field'],
                    'addressStreet': parent['supplierInfo'][0]['supplierInfo_address']['field'],
                    'otherData': parent['supplierInfo'][0]['supplierInfo_vat_number']['field'],
                    'addressZip': parent['supplierInfo'][0]['supplierInfo_postal_code']['field']
                }
                contact['email'] = 'À renseigner ' + parent['supplierInfo'][0]['supplierInfo_name']['field'] + ' - ' + contact['otherData']

                res = WebServices.create_contact(contact)
                if res is not False:
                    contact = {'id': contact['addressId'], 'contact_id': contact['contactId']}

            data = {
                'date'          : date[0],
                'vatNumber'     : supplier[2]['vat_number'],
                'creationDate'  : invoiceInfo[0]['register_date'],
                'subject'       : 'Facture N°' + invoiceNumber[0],
                'status'        : Config.cfg[defaultProcess]['status'],
                'destination'   : Config.cfg[defaultProcess]['defaultdestination'],
                'fileContent'   : open(parent['fileInfo'][0]['fileInfoPath']['field'], 'rb').read(),
                Config.cfg[defaultProcess]['customvatnumber']       : supplier[2]['vat_number'],
                Config.cfg[defaultProcess]['customht']              : parent['facturationInfo'][0]['facturationInfo_totalHT']['field'],
                Config.cfg[defaultProcess]['customttc']             : parent['facturationInfo'][0]['facturationInfo_totalTTC']['field'],
                Config.cfg[defaultProcess]['custominvoicenumber']   : invoiceNumber[0],
                'contact'       : contact,
                'dest_user'     : Config.cfg[defaultProcess]['defaultdestuser']
            }
            res = WebServices.insert_with_args(data, Config)

            if res:
                Log.info("Insert OK : " + res)
                try:
                    os.remove(file)
                except FileNotFoundError as e:
                    Log.error('Unable to delete ' + file + ' : ' + str(e))
                return True
            else:
                shutil.move(file, Config.cfg['GLOBAL']['errorpath'] + os.path.basename(file))
                return False
    else:
        # Convert all the pages to JPG (used to full web interface)
        Files.save_img_with_wand(file, Config.cfg['GLOBAL']['fullpath'] + '/' + full_jpg_filename)
        # If tiff support enabled, save all the pages to TIFF (used for OCR ON FLY)
        if Files.isTiff == 'True':
            Files.save_pdf_to_tiff_in_docserver(file, Config.cfg['GLOBAL']['tiffpath'] + '/' + tiff_filename)

        insert(Database, Log, Files, Config, supplier, file, invoiceNumber, date, footer, nb_pages, full_jpg_filename, tiff_filename, 'NEW', columns)

    return True
