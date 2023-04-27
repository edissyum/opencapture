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

import os
import uuid
import json
import datetime
from src.backend import verifier_exports
from src.backend.import_classes import _PyTesseract, _Files
from src.backend.import_controllers import artificial_intelligence
from src.backend.functions import delete_documents, rotate_document, find_form_with_ia
from src.backend.import_process import FindDate, FindFooter, FindInvoiceNumber, FindSupplier, FindCustom, \
    FindDeliveryNumber, FindFooterRaw, FindQuotationNumber


def execute_outputs(output_info, log, regex, document_data, database, current_lang):
    data = output_info['data']
    ocrise = output_info['ocrise']
    compress_type = output_info['compress_type']

    if output_info['output_type_id'] == 'export_xml':
        verifier_exports.export_xml(data, log, regex, document_data, database)
    elif output_info['output_type_id'] == 'export_mem':
        verifier_exports.export_mem(output_info['data'], document_data, log, regex, database)
    elif output_info['output_type_id'] == 'export_pdf':
        verifier_exports.export_pdf(data, log, regex, document_data, current_lang, compress_type, ocrise)


def insert(args, files, database, datas, positions, pages, full_jpg_filename, file, original_file, supplier, status,
           nb_pages, docservers, workflow_settings, input_settings, log, regex, supplier_lang_different, current_lang):
    try:
        filename = os.path.splitext(files.custom_file_name)
        improved_img = filename[0] + '_improved' + filename[1]
        os.remove(files.custom_file_name)
        os.remove(improved_img)
    except FileNotFoundError:
        pass

    now = datetime.datetime.now()
    year_and_month = now.strftime('%Y') + '/' + now.strftime('%m')
    path = docservers['VERIFIER_IMAGE_FULL'] + '/' + year_and_month + '/' + full_jpg_filename + '-001.jpg'

    document_data = {
        'filename': os.path.basename(file),
        'path': os.path.dirname(file),
        'img_width': str(files.get_width(path)),
        'full_jpg_filename': full_jpg_filename + '-001.jpg',
        'original_filename': original_file,
        'positions': json.dumps(positions),
        'datas': json.dumps(datas),
        'pages': json.dumps(pages),
        'form_id': datas['form_id'],
        'nb_pages': nb_pages,
        'status': status,
        'customer_id': 0
    }

    if supplier:
        document_data.update({
            'supplier_id': supplier[2]['supplier_id'],
        })

    if args.get('isMail') is None or args.get('isMail') is False:
        if 'input_id' in args and args['input_id'] and input_settings:
            if input_settings['purchase_or_sale']:
                document_data.update({
                    'purchase_or_sale': input_settings['purchase_or_sale']
                })
            if input_settings['customer_id']:
                document_data.update({
                    'customer_id': input_settings['customer_id']
                })
        elif 'workflow_id' in args and args['workflow_id']:
            if workflow_settings:
                if 'customer_id' in workflow_settings['input'] and workflow_settings['input']['customer_id']:
                    document_data.update({
                        'customer_id': workflow_settings['input']['customer_id']
                    })
    else:
        if 'customer_id' in args and args['customer_id']:
            document_data.update({
                'customer_id': args['customer_id']
            })

    insert_document = True
    if status == 'END' and 'form_id' in document_data and document_data['form_id']:
        outputs = database.select({
            'select': ['outputs'],
            'table': ['form_models'],
            'where': ['id = %s'],
            'data': [document_data['form_id']],
        })

        if outputs:
            for output_id in outputs[0]['outputs']:
                output_info = database.select({
                    'select': ['output_type_id', 'data', 'compress_type', 'ocrise'],
                    'table': ['outputs'],
                    'where': ['id = %s'],
                    'data': [output_id]
                })
                if output_info and supplier_lang_different:
                    _regex = database.select({
                        'select': ['regex_id', 'content'],
                        'table': ['regex'],
                        'where': ["lang in ('global', %s)"],
                        'data': [current_lang],
                    })

                    for _r in _regex:
                        regex[_r['regex_id']] = _r['content']
                execute_outputs(output_info[0], log, regex, document_data, database, current_lang)

    elif workflow_settings and (not workflow_settings['process']['use_interface'] or not workflow_settings['input']['apply_process']):
        if 'output' in workflow_settings and workflow_settings['output']:
            for output_id in workflow_settings['output']['outputs_id']:
                output_info = database.select({
                    'select': ['output_type_id', 'data', 'compress_type', 'ocrise'],
                    'table': ['outputs'],
                    'where': ['id = %s'],
                    'data': [output_id]
                })
                if output_info:
                    execute_outputs(output_info[0], log, regex, document_data, database, current_lang)

    if workflow_settings:
        if workflow_settings['input']['apply_process']:
            if workflow_settings['process']['delete_documents']:
                delete_documents(docservers, document_data['path'], document_data['filename'], full_jpg_filename)
                log.info('Document not inserted in database based on workflow settings')
                insert_document = False

    if insert_document:
        document_data['datas'] = json.dumps(datas)
        document_id = database.insert({
            'table': 'documents',
            'columns': document_data
        })
        return document_id
    return None


def convert(file, files, ocr, nb_pages, custom_pages=False):
    if custom_pages:
        try:
            filename = os.path.splitext(files.custom_file_name)
            improved_img = filename[0] + '_improved' + filename[1]
            os.remove(files.custom_file_name)
            os.remove(improved_img)
        except FileNotFoundError:
            pass
        files.pdf_to_jpg(file, nb_pages, open_img=False, is_custom=True)
    else:
        files.pdf_to_jpg(file, 1, True, True, 'header')
        ocr.header_text = ocr.line_box_builder(files.img)
        files.pdf_to_jpg(file, 1, True, True, 'footer')
        ocr.footer_text = ocr.line_box_builder(files.img)
        files.pdf_to_jpg(file, 1)
        ocr.text = ocr.line_box_builder(files.img)
        if nb_pages > 1:
            files.pdf_to_jpg(file, nb_pages, True, True, 'header', True)
            ocr.header_last_text = ocr.line_box_builder(files.img)
            files.pdf_to_jpg(file, nb_pages, True, True, 'footer', True)
            ocr.footer_last_text = ocr.line_box_builder(files.img)
            files.pdf_to_jpg(file, nb_pages, last_image=True)
            ocr.last_text = ocr.line_box_builder(files.img)


def process(args, file, log, config, files, ocr, regex, database, docservers, configurations, languages):
    log.info('Processing file : ' + file)
    datas = {}
    pages = {}
    positions = {}

    nb_pages = files.get_pages(docservers, file)
    splitted_file = os.path.basename(file).split('_')
    if splitted_file[0] == 'SPLITTER':
        original_file = os.path.basename(file).split('_')
        original_file = original_file[1] + '_' + original_file[2] + '.pdf'
    else:
        original_file = os.path.basename(file)

    input_settings = workflow_settings = None

    if 'workflow_id' in args:
        workflow_settings = database.select({
            'select': ['*'],
            'table': ['workflows'],
            'where': ['workflow_id = %s', 'module = %s'],
            'data': [args['workflow_id'], 'verifier'],
        })
        if workflow_settings and workflow_settings[0]['input']['apply_process']:
            workflow_settings = workflow_settings[0]
            if workflow_settings['process']['rotation']:
                if workflow_settings['process']['rotation'] != 'no_rotation':
                    rotate_document(file, workflow_settings['process']['rotation'])
                    log.info('Document rotated by ' + str(workflow_settings['process']['rotation']) +
                             '° based on workflow settings')

    # Convert files to JPG
    convert(file, files, ocr, nb_pages)

    form_id_found_with_ai = False
    if 'input_id' in args and args['input_id']:
        input_settings = database.select({
            'select': ['*'],
            'table': ['inputs'],
            'where': ['input_id = %s', 'module = %s'],
            'data': [args['input_id'], 'verifier'],
        })
        input_settings = input_settings[0]
        ai_model_id = input_settings['ai_model_id'] if input_settings['ai_model_id'] else False
        if ai_model_id:
            res = find_form_with_ia(file, ai_model_id, database, docservers, _Files, artificial_intelligence, ocr, log,
                                    'verifier')
            if res:
                form_id_found_with_ai = True
                datas.update({'form_id': res})

    if workflow_settings and 'workflow_id' in args:
        if 'ai_model_id' in workflow_settings['input'] and workflow_settings['input']['ai_model_id']:
            ai_model_id = workflow_settings['input']['ai_model_id']
            res = find_form_with_ia(file, ai_model_id, database, docservers, _Files, artificial_intelligence, ocr, log,
                                    'verifier')
            if res:
                form_id_found_with_ai = True
                datas.update({'form_id': res})

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
    supplier_lang_different = False
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

        if 'document_lang' in supplier[2] and supplier[2]['document_lang'] and \
                configurations['locale'] != supplier[2]['document_lang']:
            supplier_lang_different = True
            regex = {}
            _regex = database.select({
                'select': ['regex_id', 'content'],
                'table': ['regex'],
                'where': ['lang = %s'],
                'data': [supplier[2]['document_lang']]
            })

            for _r in _regex:
                regex[_r['regex_id']] = _r['content']
            ocr = _PyTesseract(supplier[2]['document_lang'], log, config, docservers)
            convert(file, files, ocr, nb_pages)

    if input_settings:
        if input_settings['override_supplier_form'] or not supplier or supplier[2]['form_id'] in ['', [], None]:
            if not form_id_found_with_ai:
                datas.update({'form_id': input_settings['form_id']})
        elif not input_settings['override_supplier_form'] and supplier and supplier[2]['form_id'] not in ['', [], None]:
            datas.update({'form_id': supplier[2]['form_id']})
    elif workflow_settings:
        if 'override_supplier_form' in workflow_settings['process'] and \
                workflow_settings['process']['override_supplier_form'] or not supplier or not supplier[2]['form_id']:
            if not form_id_found_with_ai:
                datas.update({'form_id': workflow_settings['process']['form_id']})
        elif ('override_supplier_form' not in workflow_settings['process'] or
              not workflow_settings['process']['override_supplier_form']) and supplier and supplier[2]['form_id']:
            datas.update({'form_id': supplier[2]['form_id']})

    # Find custom informations using mask
    custom_fields = FindCustom(ocr.header_text, log, regex, config, ocr, files, supplier, file, database,
                               docservers, datas['form_id']).run()
    if custom_fields:
        for field in custom_fields:
            datas.update({field: custom_fields[field][0]})
            if custom_fields[field][1]:
                positions.update({field: files.reformat_positions(custom_fields[field][1])})
            if custom_fields[field][2]:
                pages.update({field: custom_fields[field][2]})

    # Find invoice number
    invoice_number_class = FindInvoiceNumber(ocr, files, log, regex, config, database, supplier, file, ocr.header_text,
                                             1, False, ocr.footer_text, docservers, configurations, languages,
                                             datas['form_id'])
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
        log.info("Search document date using the same page as invoice number")
        text_custom = invoice_number_class.text
        page_for_date = tmp_nb_pages
    else:
        text_custom = ocr.text
        page_for_date = 1

    date_class = FindDate(text_custom, log, regex, configurations, files, ocr, supplier, page_for_date, database, file,
                          docservers, languages, datas['form_id'])
    date = date_class.run()

    if date:
        datas.update({'document_date': date[0]})
        if date[1]:
            positions.update({'document_date': files.reformat_positions(date[1])})
        if date[2]:
            pages.update({'document_date': date[2]})
        if len(date) > 3 and date[3]:
            datas.update({'document_due_date': date[3][0]})
            pages.update({'document_due_date': date[2]})
            if len(date[3]) > 1:
                positions.update({'document_due_date': files.reformat_positions(date[3][1])})

        # Find quotation number
    quotation_number_class = FindQuotationNumber(ocr, files, log, regex, config, database, supplier, file,
                                                 ocr.header_text, 1, False, ocr.footer_text, docservers, configurations,
                                                 datas['form_id'])
    quotation_number = quotation_number_class.run()
    if not quotation_number:
        quotation_number_class.text = ocr.header_last_text
        quotation_number_class.footer_text = ocr.footer_last_text
        quotation_number_class.nbPages = nb_pages
        quotation_number_class.customPage = True
        quotation_number = quotation_number_class.run()
        if quotation_number:
            quotation_number.append(nb_pages)

    if quotation_number:
        datas.update({'quotation_number': quotation_number[0]})
        if quotation_number[1]:
            positions.update({'quotation_number': files.reformat_positions(quotation_number[1])})
        if quotation_number[2]:
            pages.update({'quotation_number': quotation_number[2]})

    # Find footer informations (total amount, no rate amount etc..)
    footer_class = FindFooter(ocr, log, regex, config, files, database, supplier, file, ocr.footer_text, docservers,
                              datas['form_id'])
    if supplier and supplier[2]['get_only_raw_footer'] in [True, 'True']:
        footer_class = FindFooterRaw(ocr, log, regex, config, files, database, supplier, file, ocr.footer_text,
                                     docservers, datas['form_id'])

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
            datas.update({'taxes_count': 1})
            datas.update({'lines_count': 0})
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
    delivery_number_class = FindDeliveryNumber(ocr, files, log, regex, config, database, supplier, file,
                                               ocr.header_text, 1, False, docservers, configurations, datas['form_id'])
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

    full_jpg_filename = str(uuid.uuid4())
    file = files.move_to_docservers(docservers, file)

    # Convert all the pages to JPG (used to full web interface)
    files.save_img_with_pdf2image(file, docservers['VERIFIER_IMAGE_FULL'] + '/' + full_jpg_filename, docservers=True)
    files.save_img_with_pdf2image_min(file, docservers['VERIFIER_THUMB'] + '/' + full_jpg_filename)

    allow_auto = False
    if workflow_settings and workflow_settings['input']['apply_process']:
        if workflow_settings['process']['use_interface'] and workflow_settings['process']['allow_automatic_validation']:
            allow_auto = True
            for field in workflow_settings['process']['system_fields']:
                if field == 'footer' and footer:
                    continue
                if field in datas and datas[field]:
                    continue
                else:
                    allow_auto = False
                    break

    if supplier and not supplier[2]['skip_auto_validate'] and allow_auto:
        log.info('All the usefull informations are found. Execute outputs action and end process')
        document_id = insert(args, files, database, datas, positions, pages, full_jpg_filename, file, original_file,
                            supplier, 'END', nb_pages, docservers, workflow_settings, input_settings, log, regex,
                            supplier_lang_different, configurations['locale'])
    else:
        document_id = insert(args, files, database, datas, positions, pages, full_jpg_filename, file, original_file,
                            supplier, 'NEW', nb_pages, docservers, workflow_settings, input_settings, log, regex,
                            supplier_lang_different, configurations['locale'])

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
    return document_id
