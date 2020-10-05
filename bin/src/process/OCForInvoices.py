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
import mimetypes
import os
import uuid
import shutil
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

if 'Spreadsheet' not in custom_array: from bin.src.classes.Spreadsheet import Spreadsheet as _Spreadsheet
else: _Spreadsheet = getattr(__import__(custom_array['Spreadsheet']['path'] + '.' + custom_array['Spreadsheet']['module'], fromlist=[custom_array['Spreadsheet']['module']]), custom_array['Spreadsheet']['module'])

def insert(Database, Log, Files, Config, supplier, file, invoiceNumber, date, footer, nb_pages, full_jpg_filename, tiff_filename, status, custom_columns, original_file):
    if Files.isTiff == 'True':
        try:
            filename = os.path.splitext(Files.custom_fileName_tiff)
            improved_img = filename[0] + '_improved' + filename[1]
            os.remove(Files.custom_fileName_tiff)
            os.remove(improved_img)
        except FileNotFoundError:
            pass
        path = Config.cfg['GLOBAL']['tiffpath'] + '/' + tiff_filename.replace('-%03d', '-001')
    else:
        try:
            filename = os.path.splitext(Files.custom_fileName)
            improved_img = filename[0] + '_improved' + filename[1]
            os.remove(Files.custom_fileName)
            os.remove(improved_img)
        except FileNotFoundError:
            pass
        path = Config.cfg['GLOBAL']['fullpath'] + '/' + full_jpg_filename.replace('-%03d', '-001')

    columns = {
        'vat_number': supplier[0] if supplier and supplier[0] else '',
        'vat_number_position': str(supplier[1]) if supplier and supplier[1] else '',
        'supplier_page': str(supplier[3]) if supplier and supplier[3] else '1',
        'invoice_date': date[0] if date and date[0] else '',
        'invoice_date_position': str(date[1]) if date and date[1]  else '',
        'invoice_date_page': str(date[2]) if date and date[2]  else '1',
        'invoice_number': invoiceNumber[0] if invoiceNumber and invoiceNumber[0] else '',
        'invoice_number_position': str(invoiceNumber[1]) if invoiceNumber and invoiceNumber[1] else '',
        'invoice_number_page': str(invoiceNumber[2]) if invoiceNumber and invoiceNumber[2] else '1',
        'total_amount': str(footer[1][0]) if footer and footer[1] else '',
        'total_amount_position': str(footer[1][1]) if footer and footer[1] else '',
        'ht_amount1': str(footer[0][0]) if footer and footer[0] else '',
        'ht_amount1_position': str(footer[0][1]) if footer and footer[0] else '',
        'vat_rate1': str(footer[2][0]) if footer and footer[2] else '',
        'vat_rate1_position': str(footer[2][1]) if footer and footer[2] else '',
        'footer_page' : str(footer[3]) if footer and footer[3] else '1',
        'filename': os.path.basename(file),
        'path': os.path.dirname(file),
        'img_width': str(Files.get_size(path)),
        'full_jpg_filename': full_jpg_filename.replace('-%03d', '-001'),
        'tiff_filename': tiff_filename.replace('-%03d', '-001'),
        'status': status,
        'nb_pages': str(nb_pages),
        'original_filename': original_file
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
            os.remove(Files.tiffName_footer)
            os.remove(Files.tiffName_header)
            os.remove(Files.tiffName)
        except FileNotFoundError:
            pass
    else:
        Log.error('Error while inserting')

def convert(file, Files, Ocr, nb_pages, custom_pages = False):
    if custom_pages:
        if Files.isTiff == 'True':
            try:
                filename = os.path.splitext(Files.custom_fileName_tiff)
                improved_img = filename[0] + '_improved' + filename[1]
                os.remove(Files.custom_fileName_tiff)
                os.remove(improved_img)
            except FileNotFoundError:
                pass
            Files.pdf_to_tiff(file, Files.custom_fileName_tiff, False, False, True, 'full', nb_pages)
        else:
            try:
                filename = os.path.splitext(Files.custom_fileName)
                improved_img = filename[0] + '_improved' + filename[1]
                os.remove(Files.custom_fileName)
                os.remove(improved_img)
            except FileNotFoundError:
                pass
            Files.pdf_to_jpg(file + '[' + str(int(nb_pages - 1)) + ']', False, True, 'full', False, True)
    else:
        if Files.isTiff == 'True':
            Files.pdf_to_tiff(file, Files.tiffName, True, True, True, 'header')
            Ocr.header_text = Ocr.line_box_builder(Files.img)
            Files.pdf_to_tiff(file, Files.tiffName, True, True, True, 'footer')
            Ocr.footer_text = Ocr.line_box_builder(Files.img)
            Files.pdf_to_tiff(file, Files.tiffName, True)
            Ocr.text = Ocr.line_box_builder(Files.img)
            if nb_pages > 1 :
                Files.pdf_to_tiff(file, Files.tiffName_last, False, True, True, 'header', nb_pages)
                Ocr.header_last_text = Ocr.line_box_builder(Files.img)
                Files.pdf_to_tiff(file, Files.tiffName_last, False, True, True, 'footer', nb_pages)
                Ocr.footer_last_text = Ocr.line_box_builder(Files.img)
                Files.pdf_to_tiff(file, Files.tiffName_last, lastPage=nb_pages)
                Ocr.last_text = Ocr.line_box_builder(Files.img)
        else:
            Files.pdf_to_jpg(file + '[0]', True, True, 'header')
            Ocr.header_text = Ocr.line_box_builder(Files.img)
            Files.pdf_to_jpg(file + '[0]', True, True, 'footer')
            Ocr.footer_text = Ocr.line_box_builder(Files.img)
            Files.pdf_to_jpg(file + '[0]')
            Ocr.text = Ocr.line_box_builder(Files.img)
            if nb_pages > 1 :
                Files.pdf_to_jpg(file + '[' + str(nb_pages - 1) + ']', True, True, 'header', True)
                Ocr.header_last_text = Ocr.line_box_builder(Files.img)
                Files.pdf_to_jpg(file + '[' + str(nb_pages - 1) + ']', True, True, 'footer', True)
                Ocr.footer_last_text = Ocr.line_box_builder(Files.img)
                Files.pdf_to_jpg(file + '[' + str(nb_pages - 1) + ']', lastImage=True)
                Ocr.last_text = Ocr.line_box_builder(Files.img)

def update_typo_database(Database, vat_number, typo, Log, Config):
    Spreadsheet = _Spreadsheet(Log, Config)
    mime = mimetypes.guess_type(Spreadsheet.referencialSuppplierSpreadsheet)[0]
    if mime in ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']:
        Spreadsheet.write_typo_excel_sheet(vat_number, typo)
    else:
        Spreadsheet.write_typo_ods_sheet(vat_number, typo)

    Database.update({
        'table' : ['suppliers'],
        'set'   : {
            'typology' : typo,
        },
        'where' : ['vat_number = ?'],
        'data'  : [vat_number]
    })

def process(file, Log, Config, Files, Ocr, Locale, Database, WebServices, typo):
    Log.info('Processing file : ' + file)

    # get the number of pages into the PDF documents
    nb_pages = Files.getPages(file, Config)

    originalDirName = os.path.normpath(os.path.dirname(file))
    if originalDirName == os.path.normpath(Config.cfg['SPLITTER']['pdfoutputpath']):
        originalFile = os.path.basename(file).split('_')
        originalFile = originalFile[0] + '_' + originalFile[1] + '.pdf'
    else:
        originalFile = os.path.basename(file)

    # Convert files to JPG or TIFF
    convert(file, Files, Ocr, nb_pages)

    # Find supplier in document
    supplier = FindSupplier(Ocr, Log, Locale, Database, Files, nb_pages, False).run()
    i = 0
    tmp_nbPages = nb_pages
    while not supplier:
        tmp_nbPages = tmp_nbPages - 1
        if i == 3 or int(tmp_nbPages) - 1 == 0 or nb_pages == 1:
            break
        convert(file, Files, Ocr, tmp_nbPages, True)
        supplier = FindSupplier(Ocr, Log, Locale, Database, Files, tmp_nbPages, True).run()
        i += 1

    if typo:
        update_typo_database(Database, supplier[0], typo, Log, Config)

    # Find custom informations using mask
    customFields = FindCustom(Ocr.header_text, Log, Locale, Config, Ocr, Files, supplier, typo, file).run()
    columns = {}
    if customFields:
        for field in customFields:
            field_name = field.split('-')[1]
            field_name_position = field_name + '_position'
            columns.update({
                field_name: customFields[field][0],
                field_name_position: str(customFields[field][1])
            })

    # Find invoice number
    invoiceNumber = FindInvoiceNumber(Ocr, Files, Log, Locale, Config, Database, supplier, file, typo, Ocr.header_text, 1, False).run()
    if not invoiceNumber:
        invoiceNumber = FindInvoiceNumber(Ocr, Files, Log, Locale, Config, Database, supplier, file, typo, Ocr.header_last_text, nb_pages, True).run()
        if invoiceNumber:
            invoiceNumber.append(nb_pages)

    j = 0
    tmp_nbPages = nb_pages
    invoiceFoundOnFirtOrLastPage = False
    while not invoiceNumber:
        tmp_nbPages = tmp_nbPages - 1
        if j == 3 or int(tmp_nbPages) - 1 == 0 or nb_pages == 1:
            break
        convert(file, Files, Ocr, tmp_nbPages, True)
        invoiceNumberClass = FindInvoiceNumber(Ocr, Files, Log, Locale, Config, Database, supplier, file, typo, Ocr.header_last_text, tmp_nbPages, True)
        if Files.isTiff == 'True':
            _file = Files.custom_fileName_tiff
        else:
            _file = Files.custom_fileName

        image = Files.open_image_return(_file)
        invoiceNumberClass.text = Ocr.line_box_builder(image)
        invoiceNumber = invoiceNumberClass.run()
        if invoiceNumber:
            invoiceFoundOnFirtOrLastPage = True
        j += 1

    # Find invoice date number
    if invoiceFoundOnFirtOrLastPage:
        Log.info("Search invoice date using the same page as invoice number")
        text_custom = invoiceNumberClass.text
        page_for_date = tmp_nbPages
    else:
        text_custom = Ocr.text
        page_for_date = 1

    date = FindDate(text_custom, Log, Locale, Config, Files, Ocr, supplier, typo, page_for_date).run()
    k = 0
    tmp_nbPages = nb_pages
    while not date:
        tmp_nbPages = tmp_nbPages - 1
        if k == 3 or int(tmp_nbPages) - 1 == 0 or nb_pages == 1:
            break

    # Find footer informations (total amount, no rate amount etc..)
    footer = FindFooter(Ocr, Log, Locale, Config, Files, Database, supplier, file, Ocr.footer_text, typo).run()

    if not footer:
        footer = FindFooter(Ocr, Log, Locale, Config, Files, Database, supplier, file, Ocr.footer_last_text, typo).run()
        if footer:
            footer.append(nb_pages)

    fileName = str(uuid.uuid4())
    full_jpg_filename = 'full_' + fileName + '-%03d.jpg'
    tiff_filename = 'tiff_' + fileName + '-%03d.tiff'

    file = Files.move_to_docservers(Config.cfg, file)
    # Convert all the pages to JPG (used to full web interface)
    Files.save_img_with_wand(file, Config.cfg['GLOBAL']['fullpath'] + '/' + full_jpg_filename)
    # If tiff support enabled, save all the pages to TIFF (used for OCR ON FLY)
    if Files.isTiff == 'True':
        Files.save_pdf_to_tiff_in_docserver(file, Config.cfg['GLOBAL']['tiffpath'] + '/' + tiff_filename)

    # If all informations are found, do not send it to GED
    if supplier and date and invoiceNumber and footer and Config.cfg['GLOBAL']['allowautomaticvalidation'] == 'True':
        insert(Database, Log, Files, Config, supplier, file, invoiceNumber, date, footer, nb_pages, full_jpg_filename, tiff_filename, 'DEL', False, originalFile)
        Log.info('All the usefull informations are found. Export the XML and  endprocess')
        now = datetime.datetime.now()
        xmlCustom = {}
        for custom in customFields:
            field_name = custom.split('-')[1]
            field_name_position = field_name + '_position'
            xmlCustom.update({
                field_name : {'field' : customFields[custom][0]},
                field_name_position : {'field' : customFields[custom][1]}
            })

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
            }],
            'customInfo': [xmlCustom]
        }
        Files.exportXml(Config, invoiceNumber[0], parent, supplier[2]['vat_number'])
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
        insert(Database, Log, Files, Config, supplier, file, invoiceNumber, date, footer, nb_pages, full_jpg_filename, tiff_filename, 'NEW', columns, originalFile)

    return True
