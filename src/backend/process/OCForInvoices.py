# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import os
import json
import uuid
import mimetypes
from src.backend.import_classes import _Spreadsheet
from src.backend.import_process import FindDate, FindFooter, FindInvoiceNumber, FindSupplier, FindCustom, \
    FindOrderNumber, FindDeliveryNumber, FindFooterRaw


def insert(args, files, database, datas, positions, pages, full_jpg_filename, file, original_file, supplier, status,
           nb_pages, docservers):
    try:
        filename = os.path.splitext(files.custom_file_name)
        improved_img = filename[0] + '_improved' + filename[1]
        os.remove(files.custom_file_name)
        os.remove(improved_img)
    except FileNotFoundError:
        pass
    path = docservers['VERIFIER_IMAGE_FULL'] + '/' + full_jpg_filename.replace('-%03d', '-001')

    invoice_data = {
        'filename': os.path.basename(file),
        'path': os.path.dirname(file),
        'img_width': str(files.get_width(path)),
        'full_jpg_filename': full_jpg_filename.replace('-%03d', '-001'),
        'original_filename': original_file,
        'positions': json.dumps(positions),
        'datas': json.dumps(datas),
        'pages': json.dumps(pages),
        'nb_pages': nb_pages,
        'status': status,
        'customer_id': 0
    }

    if supplier:
        invoice_data.update({
            'supplier_id': supplier[2]['supplier_id'],
        })

    if args.get('isMail') is None or args.get('isMail') is False:
        if 'input_id' in args:
            input_settings = database.select({
                'select': ['*'],
                'table': ['inputs'],
                'where': ['input_id = %s', 'module = %s'],
                'data': [args['input_id'], 'verifier'],
            })

            if input_settings:
                input_settings = input_settings[0]
                if input_settings['purchase_or_sale']:
                    invoice_data.update({
                        'purchase_or_sale': input_settings['purchase_or_sale']
                    })
                if input_settings['override_supplier_form'] or not supplier or supplier[2]['form_id'] in ['', [], None]:
                    invoice_data.update({
                        'form_id': input_settings['default_form_id']
                    })
                if input_settings['customer_id']:
                    invoice_data.update({
                        'customer_id': input_settings['customer_id']
                    })
    else:
        if 'customer_id' in args and args['customer_id']:
            invoice_data.update({
                'customer_id': args['customer_id']
            })
        if 'form_id' in args and args['form_id']:
            invoice_data.update({
                'form_id': args['form_id']
            })

    database.insert({
        'table': 'invoices',
        'columns': invoice_data
    })


def convert(file, files, ocr, nb_pages, custom_pages=False):
    if custom_pages:
        try:
            filename = os.path.splitext(files.custom_file_name)
            improved_img = filename[0] + '_improved' + filename[1]
            os.remove(files.custom_file_name)
            os.remove(improved_img)
        except FileNotFoundError:
            pass
        files.pdf_to_jpg(file + '[' + str(int(nb_pages - 1)) + ']', open_img=False, is_custom=True)
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


def update_typo_database(database, vat_number, typo, log, config, docservers):
    spreadsheet = _Spreadsheet(log, docservers, config)
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
        'where': ['vat_number = %s', 'status <> %s'],
        'data': [vat_number, 'DEL']
    })


def process(args, file, log, config, files, ocr, regex, database, typo, docservers, configurations, languages):
    log.info('Processing file : ' + file)

    datas = {}
    pages = {}
    positions = {}

    files.resolution = int(configurations['resolution'])
    files.compression_quality = int(configurations['compressionQuality'])

    nb_pages = files.get_pages(docservers, file)
    splitted_file = os.path.basename(file).split('_')
    if splitted_file[0] == 'SPLITTER':
        original_file = os.path.basename(file).split('_')
        original_file = original_file[1] + '_' + original_file[2] + '.pdf'
    else:
        original_file = os.path.basename(file)

    # Convert files to JPG
    convert(file, files, ocr, nb_pages)

    # Find supplier in document
    supplier = FindSupplier(ocr, log, regex, database, files, nb_pages, 1, False).run()

    i = 0
    tmp_nb_pages = nb_pages
    while not supplier:
        tmp_nb_pages = tmp_nb_pages - 1
        if i == 3 or int(tmp_nb_pages) == 1 or nb_pages == 1:
            break

        convert(file, files, ocr, tmp_nb_pages, True)
        supplier = FindSupplier(ocr, log, regex, database, files, nb_pages, tmp_nb_pages, True).run()
        i += 1

    if supplier:
        datas.update({
            'name': supplier[2]['name'],
            'vat_number': supplier[2]['vat_number'],
            'siret': supplier[2]['siret'],
            'siren': supplier[2]['siren'],
            'address1': supplier[2]['address1'],
            'address2': supplier[2]['address2'],
            'postal_code': supplier[2]['postal_code'],
            'city': supplier[2]['city'],
            'country': supplier[2]['country'],
        })
        if supplier[1]:
            positions.update({
                supplier[4]: files.reformat_positions(supplier[1])
            })
        if supplier[3]:
            pages.update({
                supplier[4]: supplier[3]
            })

    if typo:
        update_typo_database(database, supplier[0], typo, log, config, docservers)

    # Find custom informations using mask
    custom_fields = FindCustom(ocr.header_text, log, regex, config, ocr, files, supplier, file, database, docservers).run()
    if custom_fields:
        for field in custom_fields:
            datas.update({field: custom_fields[field][0]})
            if custom_fields[field][1]:
                positions.update({field: files.reformat_positions(custom_fields[field][1])})
            if custom_fields[field][2]:
                pages.update({field: custom_fields[field][2]})

    # Find invoice number
    invoice_number_class = FindInvoiceNumber(ocr, files, log, regex, config, database, supplier, file, typo,
                                             ocr.header_text, 1, False, ocr.footer_text, docservers, configurations)
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

        _file = files.custom_file_name
        image = files.open_image_return(_file)

        invoice_number_class.text = ocr.line_box_builder(image)
        invoice_number_class.nbPages = tmp_nb_pages
        invoice_number_class.customPage = True

        invoice_number = invoice_number_class.run()
        if invoice_number:
            invoice_found_on_first_or_last_page = True
        j += 1

    if invoice_number:
        datas.update({'invoice_number': invoice_number[0]})
        if invoice_number[1]:
            positions.update({'invoice_number': files.reformat_positions(invoice_number[1])})
        if invoice_number[2]:
            pages.update({'invoice_number': invoice_number[2]})

    # Find invoice date number
    if invoice_found_on_first_or_last_page:
        log.info("Search invoice date using the same page as invoice number")
        text_custom = invoice_number_class.text
        page_for_date = tmp_nb_pages
    else:
        text_custom = ocr.text
        page_for_date = 1

    date_class = FindDate(text_custom, log, regex, configurations, files, ocr, supplier, typo, page_for_date, database, file, docservers, languages)
    date = date_class.run()

    if date:
        datas.update({'invoice_date': date[0]})
        if date[1]:
            positions.update({'invoice_date': files.reformat_positions(date[1])})
        if date[2]:
            pages.update({'invoice_date': date[2]})
        if len(date) > 3 and date[3]:
            datas.update({'invoice_due_date': date[3][0]})
            pages.update({'invoice_due_date': date[2]})
            if len(date[3]) > 1:
                positions.update({'invoice_due_date': files.reformat_positions(date[3][1])})

    # Find footer informations (total amount, no rate amount etc..)
    footer_class = FindFooter(ocr, log, regex, config, files, database, supplier, file, ocr.footer_text, typo, docservers)
    if supplier and supplier[2]['get_only_raw_footer'] in [True, 'True']:
        footer_class = FindFooterRaw(ocr, log, regex, config, files, database, supplier, file, ocr.footer_text, typo, docservers)

    footer = footer_class.run()
    if not footer and nb_pages > 1:
        footer_class.target = 'full'
        footer_class.text = ocr.last_text
        footer_class.nbPage = nb_pages
        footer_class.isLastPage = True
        footer_class.rerun = False
        footer_class.rerun_as_text = False
        footer = footer_class.run()
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
            _file = files.custom_file_name

            image = files.open_image_return(_file)
            text = ocr.line_box_builder(image)
            footer_class.text = text
            footer_class.target = 'full'
            footer_class.nbPage = tmp_nb_pages
            footer = footer_class.run()
            i += 1

    if footer:
        if footer[0]:
            datas.update({'no_rate_amount': footer[0][0]})
            datas.update({'total_ht': footer[0][0]})
            if len(footer[0]) > 1:
                positions.update({'no_rate_amount': files.reformat_positions(footer[0][1])})
                positions.update({'total_ht': files.reformat_positions(footer[0][1])})
                if 'page' in footer[0][1]:
                    try:
                        pages.update({'no_rate_amount': footer[0][1]['page']})
                        pages.update({'total_ht': footer[0][1]['page']})
                    except (TypeError, json.decoder.JSONDecodeError):
                        if footer[3]:
                            pages.update({'no_rate_amount': footer[3]})
                            pages.update({'total_ht': footer[3]})
                elif footer[3]:
                    pages.update({'no_rate_amount': footer[3]})
                    pages.update({'total_ht': footer[3]})
        if footer[1]:
            datas.update({'total_ttc': footer[1][0]})
            if len(footer[1]) > 1:
                positions.update({'total_ttc': files.reformat_positions(footer[1][1])})
                if 'page' in footer[1][1]:
                    try:
                        pages.update({'total_ttc': footer[1][1]['page']})
                    except (TypeError, json.decoder.JSONDecodeError):
                        if footer[3]:
                            pages.update({'total_ttc': footer[3]})
                elif footer[3]:
                    pages.update({'total_ttc': footer[3]})
        if footer[2]:
            datas.update({'vat_rate': footer[2][0]})
            if len(footer[2]) > 1:
                positions.update({'vat_rate': files.reformat_positions(footer[2][1])})
                if 'page' in footer[2][1]:
                    try:
                        pages.update({'vat_rate': footer[2][1]['page']})
                    except (TypeError, json.decoder.JSONDecodeError):
                        if footer[3]:
                            pages.update({'vat_rate': footer[3]})
                elif footer[3]:
                    pages.update({'vat_rate': footer[3]})
        if footer[4]:
            datas.update({'vat_amount': footer[4][0]})
            datas.update({'total_vat': footer[4][0]})
            if len(footer[4]) > 1:
                positions.update({'vat_amount': files.reformat_positions(footer[4][1])})
                positions.update({'total_vat': files.reformat_positions(footer[4][1])})
                if 'page' in footer[4][1]:
                    try:
                        pages.update({'vat_amount': footer[4][1]['page']})
                        pages.update({'total_vat': footer[4][1]['page']})
                    except (TypeError, json.decoder.JSONDecodeError):
                        if footer[3]:
                            pages.update({'vat_amount': footer[3]})
                            pages.update({'total_vat': footer[3]})
                elif footer[3]:
                    pages.update({'vat_amount': footer[3]})
                    pages.update({'total_vat': footer[3]})

    # Find delivery number
    delivery_number_class = FindDeliveryNumber(ocr, files, log, regex, config, database, supplier, file, typo,
                                               ocr.header_text, 1, False, docservers, configurations)
    delivery_number = delivery_number_class.run()
    if not delivery_number:
        delivery_number_class.text = ocr.footer_text
        delivery_number_class.target = 'footer'
        delivery_number = delivery_number_class.run()

    if delivery_number:
        datas.update({'delivery_number': delivery_number[0]})
        if delivery_number[1]:
            positions.update({'delivery_number': files.reformat_positions(delivery_number[1])})
        if delivery_number[2]:
            pages.update({'delivery_number': delivery_number[2]})

    # Find order number
    order_number_class = FindOrderNumber(ocr, files, log, regex, config, database, supplier, file, typo,
                                         ocr.header_text, 1, False, docservers, configurations)
    order_number = order_number_class.run()
    if not order_number:
        order_number_class.text = ocr.footer_text
        order_number_class.target = 'footer'
        order_number = order_number_class.run()

    if order_number:
        datas.update({'order_number': order_number[0]})
        if order_number[1]:
            positions.update({'order_number': files.reformat_positions(order_number[1])})
        if order_number[2]:
            pages.update({'order_number': order_number[2]})

    file_name = str(uuid.uuid4())
    full_jpg_filename = 'full_' + file_name + '-%03d.jpg'
    file = files.move_to_docservers(config.cfg, docservers, file)
    # Convert all the pages to JPG (used to full web interface)
    files.save_img_with_wand(file, docservers['VERIFIER_IMAGE_FULL'] + '/' + full_jpg_filename)

    # If all informations are found, do not send it to GED
    allow_auto = configurations['allowAutomaticValidation']
    if supplier and supplier[2]['skip_auto_validate'] == 'False' and date and invoice_number and footer and allow_auto == 'True':
        log.info('All the usefull informations are found. Export the XML and end process')
        insert(args, files, database, datas, positions, pages, full_jpg_filename, file, original_file, supplier,
               'END', nb_pages, docservers)
    else:
        insert(args, files, database, datas, positions, pages, full_jpg_filename, file, original_file, supplier,
               'NEW', nb_pages, docservers)

        if supplier and supplier[2]['skip_auto_validate'] == 'True':
            log.info('Skip automatic validation for this supplier this time')
            database.update({
                'table': ['accounts_suppliers'],
                'set': {
                    'skip_auto_validate': 'False'
                },
                'where': ['vat_number = %s', 'status <> %s'],
                'data': [supplier[2]['vat_number'], 'DEL']
            })
    return True
