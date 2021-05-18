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

if 'FindDate' not in custom_array:
    from bin.src.process.FindDate import FindDate
else:
    FindDate = getattr(__import__(custom_array['FindDate']['path'] + '.' + custom_array['FindDate']['module'], fromlist=[custom_array['FindDate']['module']]), custom_array['FindDate']['module'])

if 'FindFooter' not in custom_array:
    from bin.src.process.FindFooter import FindFooter
else:
    FindFooter = getattr(__import__(custom_array['FindFooter']['path'] + '.' + custom_array['FindFooter']['module'], fromlist=[custom_array['FindFooter']['module']]),
                         custom_array['FindFooter']['module'])

if 'FindFooterRaw' not in custom_array:
    from bin.src.process.FindFooterRaw import FindFooterRaw
else:
    FindFooterRaw = getattr(__import__(custom_array['FindFooterRaw']['path'] + '.' + custom_array['FindFooterRaw']['module'], fromlist=[custom_array['FindFooterRaw']['module']]),
                         custom_array['FindFooterRaw']['module'])

if 'FindSupplier' not in custom_array:
    from bin.src.process.FindSupplier import FindSupplier
else:
    FindSupplier = getattr(__import__(custom_array['FindSupplier']['path'] + '.' + custom_array['FindSupplier']['module'], fromlist=[custom_array['FindSupplier']['module']]),
                           custom_array['FindSupplier']['module'])

if 'FindCustom' not in custom_array:
    from bin.src.process.FindCustom import FindCustom
else:
    FindSupplier = getattr(__import__(custom_array['FindCustom']['path'] + '.' + custom_array['FindCustom']['module'], fromlist=[custom_array['FindCustom']['module']]),
                           custom_array['FindCustom']['module'])

if 'FindInvoiceNumber' not in custom_array:
    from bin.src.process.FindInvoiceNumber import FindInvoiceNumber
else:
    FindInvoiceNumber = getattr(__import__(custom_array['FindInvoiceNumber']['path'] + '.' + custom_array['FindInvoiceNumber']['module'], fromlist=[custom_array['FindInvoiceNumber']['module']]),
                                custom_array['FindInvoiceNumber']['module'])

if 'FindDeliveryNumber' not in custom_array:
    from bin.src.process.FindDeliveryNumber import FindDeliveryNumber
else:
    FindDeliveryNumber = getattr(__import__(custom_array['FindDeliveryNumber']['path'] + '.' + custom_array['FindDeliveryNumber']['module'], fromlist=[custom_array['FindDeliveryNumber']['module']]),
                                custom_array['FindDeliveryNumber']['module'])

if 'FindOrderNumber' not in custom_array:
    from bin.src.process.FindOrderNumber import FindOrderNumber
else:
    FindOrderNumber = getattr(__import__(custom_array['FindOrderNumber']['path'] + '.' + custom_array['FindOrderNumber']['module'], fromlist=[custom_array['FindOrderNumber']['module']]),
                                custom_array['FindOrderNumber']['module'])

if 'Spreadsheet' not in custom_array:
    from bin.src.classes.Spreadsheet import Spreadsheet as _Spreadsheet
else:
    _Spreadsheet = getattr(__import__(custom_array['Spreadsheet']['path'] + '.' + custom_array['Spreadsheet']['module'], fromlist=[custom_array['Spreadsheet']['module']]),
                           custom_array['Spreadsheet']['module'])


def insert(database, log, files, config, supplier, file, invoice_number, date, footer, nb_pages, full_jpg_filename, tiff_filename, status, custom_columns, original_file, delivery_number, order_number):
    if files.isTiff == 'True':
        try:
            filename = os.path.splitext(files.custom_fileName_tiff)
            improved_img = filename[0] + '_improved' + filename[1]
            os.remove(files.custom_fileName_tiff)
            os.remove(improved_img)
        except FileNotFoundError:
            pass
        path = config.cfg['GLOBAL']['tiffpath'] + '/' + tiff_filename.replace('-%03d', '-001')
    else:
        try:
            filename = os.path.splitext(files.custom_fileName)
            improved_img = filename[0] + '_improved' + filename[1]
            os.remove(files.custom_fileName)
            os.remove(improved_img)
        except FileNotFoundError:
            pass
        path = config.cfg['GLOBAL']['fullpath'] + '/' + full_jpg_filename.replace('-%03d', '-001')
    columns = {
        'vat_number': supplier[0] if supplier and supplier[0] else '',
        'vat_number_position': str(supplier[1]) if supplier and supplier[1] else '',
        'supplier_page': str(supplier[3]) if supplier and supplier[3] else '1',
        'invoice_date': date[0] if date and date[0] else '',
        'invoice_date_position': str(date[1]) if date and date[1] else '',
        'invoice_date_page': str(date[2]) if date and date[2] else '1',
        'invoice_due_date': str(date[3][0]) if date and date[3] else '',
        'invoice_due_date_position': str(date[3][1]) if date and date[3] else '',
        'invoice_due_date_page': str(date[2]) if date and date[2] else '1',
        'invoice_number': invoice_number[0] if invoice_number and invoice_number[0] else '',
        'invoice_number_position': str(invoice_number[1]) if invoice_number and invoice_number[1] else '',
        'invoice_number_page': str(invoice_number[2]) if invoice_number and invoice_number[2] else '1',
        'delivery_number_1': delivery_number[0] if delivery_number and delivery_number[0] else '',
        'delivery_number_1_position': str(delivery_number[1]) if delivery_number and delivery_number[1] else '',
        'order_number_1': order_number[0] if order_number and order_number[0] else '',
        'order_number_1_position': str(order_number[1]) if order_number and order_number[1] else '',
        'total_ttc': str(footer[1][0]) if footer and footer[1] else '',
        'total_ttc_position': str(footer[1][1]) if footer and footer[1] and len(footer[1]) > 1 else '',
        'no_taxes_1': str(footer[0][0]) if footer and footer[0] else '',
        'no_taxes_1_position': str(footer[0][1]) if footer and footer[0] else '',
        'vat_1': str(footer[2][0]) if footer and footer[2] else '',
        'vat_1_position': str(footer[2][1]) if footer and footer[2] else '',
        'vat_amount_1': str(footer[4][0]) if footer and footer[4] else '',
        'vat_amount_1_position': str(footer[4][1]) if footer and footer[4] and len(footer[4]) > 1 else '',
        'footer_page': str(footer[3]) if footer and footer[3] else '1',
        'filename': os.path.basename(file),
        'path': os.path.dirname(file),
        'img_width': str(files.get_size(path)),
        'full_jpg_filename': full_jpg_filename.replace('-%03d', '-001'),
        'tiff_filename': tiff_filename.replace('-%03d', '-001'),
        'status': status,
        'nb_pages': str(nb_pages),
        'original_filename': original_file
    }

    # Add supplier id to invoice
    if columns['vat_number'] != '':
        res = database.select({
            'select': ['id'],
            'table': ['suppliers'],
            'where': ['vat_number = ?'],
            'data': [columns['vat_number']],
        })
        if res:
            if len(res) > 0:
                columns['id_supplier'] = str(res[0]['id'])

    if custom_columns:
        columns.update(custom_columns)

    res = database.insert({
        'table': 'invoices',
        'columns': columns
    })

    # Commit database connection
    if res:
        database.conn.commit()
        log.info('Invoice inserted in database')
        try:
            os.remove(files.jpgName_footer)
            os.remove(files.jpgName_header)
            os.remove(files.jpgName)
            os.remove(files.tiffName_footer)
            os.remove(files.tiffName_header)
            os.remove(files.tiffName)
        except FileNotFoundError:
            pass
    else:
        log.error('Error while inserting')


def convert(file, files, ocr, nb_pages, custom_pages=False):
    if custom_pages:
        if files.isTiff == 'True':
            try:
                filename = os.path.splitext(files.custom_fileName_tiff)
                improved_img = filename[0] + '_improved' + filename[1]
                os.remove(files.custom_fileName_tiff)
                os.remove(improved_img)
            except FileNotFoundError:
                pass
            files.pdf_to_tiff(file, files.custom_fileName_tiff, open_img=False, last_page=nb_pages)
        else:
            try:
                filename = os.path.splitext(files.custom_fileName)
                improved_img = filename[0] + '_improved' + filename[1]
                os.remove(files.custom_fileName)
                os.remove(improved_img)
            except FileNotFoundError:
                pass
            files.pdf_to_jpg(file + '[' + str(int(nb_pages - 1)) + ']', open_img=False, is_custom=True)
    else:
        if files.isTiff == 'True':
            files.pdf_to_tiff(file, files.tiffName, True, True, True, 'header')
            ocr.header_text = ocr.line_box_builder(files.img)
            files.pdf_to_tiff(file, files.tiffName, True, True, True, 'footer')
            ocr.footer_text = ocr.line_box_builder(files.img)
            files.pdf_to_tiff(file, files.tiffName, True)
            ocr.text = ocr.line_box_builder(files.img)
            if nb_pages > 1:
                files.pdf_to_tiff(file, files.tiffName_last, False, True, True, 'header', nb_pages)
                ocr.header_last_text = ocr.line_box_builder(files.img)
                files.pdf_to_tiff(file, files.tiffName_last, False, True, True, 'footer', nb_pages)
                ocr.footer_last_text = ocr.line_box_builder(files.img)
                files.pdf_to_tiff(file, files.tiffName_last, last_page=nb_pages)
                ocr.last_text = ocr.line_box_builder(files.img)
        else:
            files.pdf_to_jpg(file + '[0]', True, True, 'header')
            ocr.header_text = ocr.line_box_builder(files.img)
            files.pdf_to_jpg(file + '[0]', True, True, 'footer')
            ocr.footer_text = ocr.line_box_builder(files.img)
            files.pdf_to_jpg(file + '[0]')
            ocr.text = ocr.line_box_builder(files.img)
            if nb_pages > 1:
                files.pdf_to_jpg(file + '[' + str(nb_pages - 1) + ']', True, True, 'header', True)
                ocr.header_last_text = ocr.line_box_builder(files.img)
                files.pdf_to_jpg(file + '[' + str(nb_pages - 1) + ']', True, True, 'footer', True)
                ocr.footer_last_text = ocr.line_box_builder(files.img)
                files.pdf_to_jpg(file + '[' + str(nb_pages - 1) + ']', last_image=True)
                ocr.last_text = ocr.line_box_builder(files.img)


def update_typo_database(database, vat_number, typo, log, config):
    spreadsheet = _Spreadsheet(log, config)
    mime = mimetypes.guess_type(spreadsheet.referencialSuppplierSpreadsheet)[0]
    if mime in ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']:
        spreadsheet.write_typo_excel_sheet(vat_number, typo)
    else:
        spreadsheet.write_typo_ods_sheet(vat_number, typo)

    database.update({
        'table': ['suppliers'],
        'set': {
            'typology': typo,
        },
        'where': ['vat_number = ?'],
        'data': [vat_number]
    })


def process(file, log, config, files, ocr, locale, database, webservices, typo):
    log.info('Processing file : ' + file)

    # get the number of pages into the PDF documents
    nb_pages = files.get_pages(file, config)

    splitted_file = os.path.basename(file).split('_')
    if splitted_file[0] == 'SPLITTER':
        original_file = os.path.basename(file).split('_')
        original_file = original_file[1] + '_' + original_file[2] + '.pdf'
    else:
        original_file = os.path.basename(file)

    # Convert files to JPG or TIFF
    convert(file, files, ocr, nb_pages)

    # Find supplier in document
    supplier = FindSupplier(ocr, log, locale, database, files, nb_pages, 1, False).run()

    i = 0
    tmp_nb_pages = nb_pages
    while not supplier:
        tmp_nb_pages = tmp_nb_pages - 1
        if i == 3 or int(tmp_nb_pages) == 1 or nb_pages == 1:
            break

        convert(file, files, ocr, tmp_nb_pages, True)
        supplier = FindSupplier(ocr, log, locale, database, files, nb_pages, tmp_nb_pages, True).run()
        i += 1

    if typo:
        update_typo_database(database, supplier[0], typo, log, config)

    # Find custom informations using mask
    custom_fields = FindCustom(ocr.header_text, log, locale, config, ocr, files, supplier, typo, file).run()
    columns = {}
    if custom_fields:
        for field in custom_fields:
            field_name = field.split('-')[1]
            field_name_position = field_name + '_position'
            columns.update({
                field_name: custom_fields[field][0],
                field_name_position: str(custom_fields[field][1])
            })

    # Find invoice number
    invoice_number_class = FindInvoiceNumber(ocr, files, log, locale, config, database, supplier, file, typo, ocr.header_text, 1, False, ocr.footer_text)
    invoice_number = invoice_number_class.run()
    if not invoice_number:
        invoice_number_class.text = ocr.header_last_text
        invoice_number_class.footer_text = ocr.footer_last_text
        invoice_number_class.nbPages = nb_pages
        invoice_number_class.customPage = True
        invoice_number = invoice_number_class.run()
        if invoice_number:
            invoice_number.append(nb_pages)

    j = 0
    tmp_nb_pages = nb_pages
    invoice_found_on_first_or_last_page = False
    while not invoice_number:
        tmp_nb_pages = tmp_nb_pages - 1
        if j == 3 or int(tmp_nb_pages) - 1 == 0 or nb_pages == 1:
            break
        convert(file, files, ocr, tmp_nb_pages, True)

        if files.isTiff == 'True':
            _file = files.custom_fileName_tiff
        else:
            _file = files.custom_fileName

        image = files.open_image_return(_file)

        invoice_number_class.text = ocr.line_box_builder(image)
        invoice_number_class.nbPages = tmp_nb_pages
        invoice_number_class.customPage = True

        invoice_number = invoice_number_class.run()
        if invoice_number:
            invoice_found_on_first_or_last_page = True
        j += 1

    # Find invoice date number
    if invoice_found_on_first_or_last_page:
        log.info("Search invoice date using the same page as invoice number")
        text_custom = invoice_number_class.text
        page_for_date = tmp_nb_pages
    else:
        text_custom = ocr.text
        page_for_date = 1

    date = FindDate(text_custom, log, locale, config, files, ocr, supplier, typo, page_for_date, database, file).run()
    k = 0
    tmp_nb_pages = nb_pages
    while not date:
        tmp_nb_pages = tmp_nb_pages - 1
        if k == 3 or int(tmp_nb_pages) - 1 == 0 or nb_pages == 1:
            break

    # Find footer informations (total amount, no rate amount etc..)
    footerClass = FindFooter(ocr, log, locale, config, files, database, supplier, file, ocr.footer_text, typo)
    if supplier and supplier[2]['get_only_raw_footer'] == 'True':
        footerClass = FindFooterRaw(ocr, log, locale, config, files, database, supplier, file, ocr.footer_text, typo)

    footer = footerClass.run()
    if not footer:
        footerClass.target = 'full'
        footerClass.text = ocr.last_text
        footerClass.nbPage = nb_pages
        footer = footerClass.run()
        if footer:
            if len(footer) == 4:
                footer[3] = nb_pages
            else:
                footer.append(nb_pages)
        i = 0
        tmp_nb_pages = nb_pages
        while not footer:
            tmp_nb_pages = tmp_nb_pages - 1
            if i == 3 or int(tmp_nb_pages) == 1 or nb_pages == 1:
                break
            convert(file, files, ocr, tmp_nb_pages, True)
            if files.isTiff == 'True':
                _file = files.custom_fileName_tiff
            else:
                _file = files.custom_fileName

            image = files.open_image_return(_file)
            text = ocr.line_box_builder(image)
            footerClass.text = text
            footerClass.target = 'full'
            footerClass.nbPage = tmp_nb_pages
            footer = footerClass.run()
            i += 1

    # Find delivery number
    delivery_number_class = FindDeliveryNumber(ocr, files, log, locale, config, database, supplier, file, typo, ocr.header_text, 1, False)
    delivery_number = delivery_number_class.run()
    if not delivery_number:
        delivery_number_class.text = ocr.footer_text
        delivery_number_class.target = 'footer'
        delivery_number = delivery_number_class.run()

    # Find order number
    order_number_class = FindOrderNumber(ocr, files, log, locale, config, database, supplier, file, typo, ocr.header_text, 1, False)
    order_number = order_number_class.run()
    if not order_number:
        order_number_class.text = ocr.footer_text
        order_number_class.target = 'footer'
        order_number = order_number_class.run()

    file_name = str(uuid.uuid4())
    full_jpg_filename = 'full_' + file_name + '-%03d.jpg'
    tiff_filename = 'tiff_' + file_name + '-%03d.tiff'

    file = files.move_to_docservers(config.cfg, file)
    # Convert all the pages to JPG (used to full web interface)
    files.save_img_with_wand(file, config.cfg['GLOBAL']['fullpath'] + '/' + full_jpg_filename)
    # If tiff support enabled, save all the pages to TIFF (used for OCR ON FLY)
    if files.isTiff == 'True':
        files.save_pdf_to_tiff_in_docserver(file, config.cfg['GLOBAL']['tiffpath'] + '/' + tiff_filename)

    # If all informations are found, do not send it to GED
    if supplier and supplier[2]['skip_auto_validate'] == 'False' and date and invoice_number and footer and config.cfg['GLOBAL']['allowautomaticvalidation'] == 'True':
        insert(database, log, files, config, supplier, file, invoice_number, date, footer, nb_pages, full_jpg_filename, tiff_filename, 'END', False, original_file, delivery_number, order_number)
        log.info('All the usefull informations are found. Export the XML and end process')
        now = datetime.datetime.now()
        xml_custom = {}
        for custom in custom_fields:
            field_name = custom.split('-')[1]
            field_name_position = field_name + '_position'
            xml_custom.update({
                field_name: {'field': custom_fields[custom][0]},
                field_name_position: {'field': custom_fields[custom][1]}
            })

        parent = {
            'pdf_creation_date': [{'pdf_creation_date': {'field': str(now.year) + '-' + str('%02d' % now.month) + '-' + str(now.day)}}],
            'fileInfo': [{'fileInfo_path': {'field': os.path.dirname(file) + '/' + os.path.basename(file)}}],
            'supplierInfo': [{
                'supplierInfo_name': {'field': supplier[2]['name']},
                'supplierInfo_city': {'field': supplier[2]['city']},
                'supplierInfo_siret_number': {'field': supplier[2]['siret']},
                'supplierInfo_siren_number': {'field': supplier[2]['siren']},
                'supplierInfo_address': {'field': supplier[2]['adress1']},
                'supplierInfo_vat_number': {'field': supplier[2]['vat_number']},
                'supplierInfo_postal_code': {'field': str(supplier[2]['postal_code'])},
            }],
            'facturationInfo': [{
                'facturationInfo_number_of_tva': {'field': '1'},
                'facturationInfo_invoice_date': {'field': date[0]},
                'facturationInfo_due_date': {'field': date[3][0] if date[3] else ''},
                'facturationInfo_invoice_number': {'field': invoice_number[0]},
                'facturationInfo_delivery_number_1': {'field': delivery_number[0] if delivery_number and delivery_number[0] else ''},
                'facturationInfo_order_number_1': {'field': order_number[0] if order_number and order_number[0] else ''},
                'facturationInfo_no_taxes_1': {'field': str("%.2f" % (float(footer[0][0])))},
                'facturationInfo_vat_1': {'field': str("%.2f" % (float(footer[2][0])))},
                'total_vat_1': {'field': str("%.2f" % (float(footer[0][0]) * (float(footer[2][0]) / 100)))},
                'total_ht': {'field': str("%.2f" % (float(footer[0][0])))},
                'total_ttc': {'field': str("%.2f" % (float(footer[0][0]) * (float(footer[2][0]) / 100) + float(footer[0][0])))},
            }],
            'customInfo': [xml_custom]
        }

        vat_1_calculated = False
        ht_calculated = False
        ttc_calculated = False

        if len(footer[0]) == 3:
            ht_calculated = footer[0][2]
        if len(footer[1]) == 3:
            ttc_calculated = footer[1][2]
        if len(footer[2]) == 3:
            vat_1_calculated = footer[2][2]

        files.export_xml(config, invoice_number[0], parent, False, database, supplier[2]['vat_number'], vat_1_calculated, ht_calculated, ttc_calculated)

        if config.cfg['GED']['enabled'] == 'True':
            default_process = config.cfg['GED']['defaultprocess']
            invoice_info = database.select({
                'select': ['*'],
                'table': ['invoices'],
                'where': ['invoice_number = ?'],
                'data': [invoice_number[0]]
            })

            contact = webservices.retrieve_contact_by_vat_number(supplier[2]['vat_number'])
            if not contact:
                contact = {
                    'contactType': config.cfg[default_process]['contacttype'],
                    'contactPurposeId': config.cfg[default_process]['contactpurposeid'],
                    'society': parent['supplierInfo'][0]['supplierInfo_name']['field'],
                    'addressTown': parent['supplierInfo'][0]['supplierInfo_city']['field'],
                    'societyShort': parent['supplierInfo'][0]['supplierInfo_name']['field'],
                    'addressStreet': parent['supplierInfo'][0]['supplierInfo_address']['field'],
                    'addressPostcode': parent['supplierInfo'][0]['supplierInfo_postal_code']['field'],
                    'customFields': {},
                    'email': 'A_renseigner_' + parent['supplierInfo'][0]['supplierInfo_name']['field'].replace(' ', '_') + '@' + parent['supplierInfo'][0]['supplierInfo_vat_number']['field'] + '.fr'
                }
                contact['customFields'][config.cfg['GED']['contactvatcustom']] = parent['supplierInfo'][0]['supplierInfo_vat_number']['field']

                res = webservices.create_contact(contact)
                if res is not False:
                    contact = {'id': contact['addressId'], 'contact_id': contact['contactId']}

            data = {
                'date': date[0],
                'vatNumber': supplier[2]['vat_number'],
                'creationDate': invoice_info[0]['register_date'],
                'subject': 'Facture N°' + invoice_number[0],
                'status': config.cfg[default_process]['statusend'],
                'destination': config.cfg[default_process]['defaultdestination'],
                'fileContent': open(parent['fileInfo'][0]['fileInfoPath']['field'], 'rb').read(),
                config.cfg[default_process]['customvatnumber']: supplier[2]['vat_number'],
                config.cfg[default_process]['customht']: parent['facturationInfo'][0]['total_ht']['field'],
                config.cfg[default_process]['customttc']: parent['facturationInfo'][0]['total_ttc']['field'],
                config.cfg[default_process]['custominvoicenumber']: invoice_number[0],
                'contact': contact,
                'dest_user': config.cfg[default_process]['defaultdestuser']
            }
            res = webservices.insert_with_args(data, config)

            if res:
                log.info("Insert OK : " + res)
                try:
                    os.remove(file)
                except FileNotFoundError as e:
                    log.error('Unable to delete ' + file + ' : ' + str(e))
                return True
            else:
                shutil.move(file, config.cfg['GLOBAL']['errorpath'] + os.path.basename(file))
                return False
    else:
        if supplier and supplier[2]['skip_auto_validate'] == 'True':
            log.info('Skip automatic validation this time')
            database.update({
                'table': ['suppliers'],
                'set': {
                    'skip_auto_validate': 'False'
                },
                'where': ['vat_number = ?'],
                'data': [supplier[2]['vat_number']]
            })
        insert(database, log, files, config, supplier, file, invoice_number, date, footer, nb_pages, full_jpg_filename, tiff_filename, 'NEW', columns, original_file, delivery_number, order_number)

    return True
