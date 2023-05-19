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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

import os
import uuid
import json
import shutil
import facturx
import datetime
import subprocess
import pandas as pd
from xml.dom import minidom
from flask_babel import gettext
import xml.etree.ElementTree as Et
from .functions import generate_searchable_pdf
from src.backend.import_classes import _MEMWebServices


def export_xml(data, log, regex, document_info, database):
    log.info('Output execution : XML export')
    folder_out = separator = filename = extension = ''
    parameters = data['options']['parameters']
    for setting in parameters:
        if setting['id'] == 'folder_out':
            folder_out = setting['value']
        elif setting['id'] == 'separator':
            separator = setting['value']
        elif setting['id'] == 'filename':
            filename = setting['value']
        elif setting['id'] == 'extension':
            extension = setting['value']

    _technical_data = []
    # Create the XML filename
    _data = construct_with_var(filename, document_info, regex, separator)
    filename = separator.join(str(x) for x in _data) + '.' + extension
    filename = filename.replace('/', '-').replace(' ', '_')
    # END create the XML filename

    # Fill XML with document informations
    if os.path.isdir(folder_out):
        with open(folder_out + '/' + filename, 'w', encoding='UTF-8') as xml_file:
            root = Et.Element('ROOT')
            xml_datas = Et.SubElement(root, 'DATAS')
            xml_technical = Et.SubElement(root, 'TECHNICAL')

            for technical in document_info:
                if technical in ['path', 'filename', 'register_date', 'nb_pages', 'purchase_or_sale',
                                 'original_filename']:
                    new_field = Et.SubElement(xml_technical, technical)
                    new_field.text = str(document_info[technical])

            for document_data in document_info['datas']:
                value = document_data

                if 'custom_' in document_data:
                    custom_field = database.select({
                        'select': ['label_short'],
                        'table': ['custom_fields'],
                        'where': ['id = %s', 'module = %s'],
                        'data': [document_data.replace('custom_', ''), 'verifier']
                    })
                    if custom_field and custom_field[0]:
                        value = 'custom_' + custom_field[0]['label_short']

                if document_data == 'taxes_count':
                    taxes_count = document_info['datas'][document_data]
                    if taxes_count:
                        taxes_element = Et.SubElement(xml_datas, 'taxes')
                        for cpt in range(taxes_count):
                            taxs_element = Et.SubElement(taxes_element, 'tax')
                            taxs_element.set('number', str(cpt + 1))
                            if cpt == 0:
                                vat_rate_title = 'vat_rate'
                                vat_amount_title = 'vat_amount'
                                no_rate_amount_title = 'no_rate_amount'
                            else:
                                vat_rate_title = 'vat_rate_' + str(cpt)
                                vat_amount_title = 'vat_amount_' + str(cpt)
                                no_rate_amount_title = 'no_rate_amount_' + str(cpt)

                            vat_rate = get_data(document_info, vat_rate_title)
                            vat_amount = get_data(document_info, vat_amount_title)
                            no_rate_amount = get_data(document_info, no_rate_amount_title)

                            new_field = Et.SubElement(taxs_element, 'vat_rate')
                            new_field.text = str(vat_rate)
                            new_field = Et.SubElement(taxs_element, 'vat_amount')
                            new_field.text = str(vat_amount)
                            new_field = Et.SubElement(taxs_element, 'no_rate_amount')
                            new_field.text = str(no_rate_amount)

                elif document_data == 'lines_count':
                    lines_count = document_info['datas'][document_data]
                    if lines_count:
                        lines_element = Et.SubElement(xml_datas, 'lines')
                        for cpt in range(lines_count):
                            line_element = Et.SubElement(lines_element, 'line')
                            line_element.set('number', str(cpt + 1))
                            if cpt == 0:
                                line_ht_title = 'line_ht'
                                quantity_title = 'quantity'
                                unit_price_title = 'unit_price'
                                description_title = 'description'
                            else:
                                line_ht_title = 'line_ht_' + str(cpt)
                                quantity_title = 'quantity_' + str(cpt)
                                unit_price_title = 'unit_price_' + str(cpt)
                                description_title = 'description_' + str(cpt)

                            line_ht = get_data(document_info, line_ht_title)
                            quantity = get_data(document_info, quantity_title)
                            unit_price = get_data(document_info, unit_price_title)
                            description = get_data(document_info, description_title)

                            new_field = Et.SubElement(line_element, 'line_ht')
                            new_field.text = str(line_ht)
                            new_field = Et.SubElement(line_element, 'quantity')
                            new_field.text = str(quantity)
                            new_field = Et.SubElement(line_element, 'unit_price')
                            new_field.text = str(unit_price)
                            new_field = Et.SubElement(line_element, 'description')
                            new_field.text = str(description)
                else:
                    if 'vat_rate' not in value and 'vat_amount' not in value and 'no_rate_amount' not in value and \
                            'line_ht' not in value and 'quantity' not in value and 'unit_price' not in value and \
                            'description' not in value:
                        new_field = Et.SubElement(xml_datas, value)
                        new_field.text = str(document_info['datas'][document_data])

            xml_root = minidom.parseString(Et.tostring(root, encoding="unicode")).toprettyxml()
            xml_file.write(xml_root)
            xml_file.close()
        # END Fill XML with document informations
        return '', 200
    else:
        if log:
            log.error(gettext('XML_DESTINATION_FOLDER_DOESNT_EXISTS') + ' : ' + folder_out)

        response = {
            "errors": gettext('XML_DESTINATION_FOLDER_DOESNT_EXISTS'),
            "message": folder_out
        }
        return response, 400


def get_data(document_info, child):
    for document_data in document_info['datas']:
        if document_data == child:
            return document_info['datas'][document_data]


def compress_pdf(input_file, output_file, compress_id):
    gs_command = f"gs#-sDEVICE=pdfwrite#-dCompatibilityLevel=1.4#-dPDFSETTINGS=/{compress_id}#-dNOPAUSE#-dQUIET#-o" \
                 f"#{output_file}#{input_file}"
    gs_args = gs_command.split('#')
    subprocess.check_call(gs_args)


def export_facturx(data, log, regex, document_info):
    folder_out = separator = filename = ''
    parameters = data['options']['parameters']
    for setting in parameters:
        if setting['id'] == 'folder_out':
            folder_out = setting['value']
        elif setting['id'] == 'separator':
            separator = setting['value']
        elif setting['id'] == 'filename':
            filename = setting['value']

    # Create the PDF filename
    _data = construct_with_var(filename, document_info, regex, separator)
    filename = separator.join(str(x) for x in _data) + '.pdf'
    filename = filename.replace('/', '-').replace(' ', '_')
    # END create the PDF filename

    if os.path.isdir(folder_out):
        root = Et.Element('rsm:CrossIndustryInvoice', {
            'xmlns:rsm': 'urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100',
            'xmlns:qdt': 'urn:un:unece:uncefact:data:standard:QualifiedDataType:100',
            'xmlns:ram': 'urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100',
            'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
            'xmlns:udt': 'urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100'
        })
        if 'lines_count' in document_info['datas'] and document_info['datas']['lines_count'] <= 0 or \
                'taxes_count' in document_info['datas'] and document_info['datas']['taxes_count'] <= 0:
            facturx_type = 'basic'
        else:
            facturx_type = 'extended'

        facturx_validator = Et.SubElement(root, 'rsm:ExchangedDocumentContext')
        if facturx_type == 'extended':
            test_indication = Et.SubElement(facturx_validator, 'ram:TestIndicator')
            test_id = Et.SubElement(test_indication, 'udt:Indicator')
            test_id.text = 'true'

        header = Et.SubElement(facturx_validator, 'ram:GuidelineSpecifiedDocumentContextParameter')
        header_id = Et.SubElement(header, 'ram:ID')
        if facturx_type == 'basic':
            header_id.text = 'urn:factur-x.eu:1p0:basicwl'
        else:
            header_id.text = 'urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended'

        facturx_document = Et.SubElement(root, 'rsm:ExchangedDocument')
        invoice_id = Et.SubElement(facturx_document, 'ram:ID')
        invoice_id.text = document_info['datas']['invoice_number']
        type_code = Et.SubElement(facturx_document, 'ram:TypeCode')
        type_code.text = '380'

        issue_date_parent = Et.SubElement(facturx_document, 'ram:IssueDateTime')
        issue_date = Et.SubElement(issue_date_parent, 'udt:DateTimeString', {'format': '102'})
        if document_info['datas']['document_due_date']:
            issue_date.text = datetime.datetime.strptime(document_info['datas']['document_due_date'],
                                                         regex['format_date']).strftime('%Y%m%d')
        else:
            issue_date.text = '19700101'

        facturx_supply_chain = Et.SubElement(root, 'rsm:SupplyChainTradeTransaction')
        if 'lines_count' in document_info['datas'] and document_info['datas']['lines_count'] > 0:
            facturx_lines = Et.SubElement(facturx_supply_chain, 'ram:IncludedSupplyChainTradeLineItem')
            for cpt in range(document_info['datas']['lines_count']):
                index_ht = 'line_ht' if cpt == 0 else 'line_ht_' + str(cpt)
                index_quantity = 'quantity' if cpt == 0 else 'quantity_' + str(cpt)
                index_unit = 'unit_price' if cpt == 0 else 'unit_price_' + str(cpt)
                index_description = 'description' if cpt == 0 else 'description_' + str(cpt)
                index_vat = 'line_vat_rate' if cpt == 0 else 'line_vat_rate_' + str(cpt)

                line_id_parent = Et.SubElement(facturx_lines, 'ram:AssociatedDocumentLineDocument')
                line_id = Et.SubElement(line_id_parent, 'ram:LineID')
                line_id.text = str(cpt + 1)

                description_parent = Et.SubElement(facturx_lines, 'ram:SpecifiedTradeProduct')
                lien_description = Et.SubElement(description_parent, 'ram:Name')
                if index_description in document_info['datas'] and document_info['datas'][index_description]:
                    lien_description.text = document_info['datas'][index_description]

                data_parent = Et.SubElement(facturx_lines, 'ram:SpecifiedLineTradeAgreement')
                unit_price_parent = Et.SubElement(data_parent, 'ram:NetPriceProductTradePrice')
                unit_price = Et.SubElement(unit_price_parent, 'ram:ChargeAmount')
                if index_unit in document_info['datas'] and document_info['datas'][index_unit]:
                    unit_price.text = str(document_info['datas'][index_unit])
                else:
                    unit_price.text = '0.00'

                quantity_parent = Et.SubElement(facturx_lines, 'ram:SpecifiedLineTradeDelivery')
                quantity = Et.SubElement(quantity_parent, 'ram:BilledQuantity', {'unitCode': 'C62'})
                if index_quantity in document_info['datas'] and document_info['datas'][index_quantity]:
                    quantity.text = str(document_info['datas'][index_quantity])
                else:
                    quantity.text = '0.00'

                data_parent_trade = Et.SubElement(facturx_lines, 'ram:SpecifiedLineTradeSettlement')
                trade_tax = Et.SubElement(data_parent_trade, 'ram:ApplicableTradeTax')
                type_code = Et.SubElement(trade_tax, 'ram:TypeCode')
                type_code.text = 'VAT'
                category_code = Et.SubElement(trade_tax, 'ram:CategoryCode')
                category_code.text = 'S'
                vat = Et.SubElement(trade_tax, 'ram:RateApplicablePercent')
                if index_vat in document_info['datas'] and document_info['datas'][index_vat]:
                    vat.text = str(document_info['datas'][index_vat])
                else:
                    vat.text = '0.00'

                ht_parent = Et.SubElement(data_parent_trade, 'ram:SpecifiedTradeSettlementLineMonetarySummation')
                ht = Et.SubElement(ht_parent, 'ram:LineTotalAmount')
                if index_ht in document_info['datas'] and document_info['datas'][index_ht]:
                    ht.text = str(document_info['datas'][index_ht])
                else:
                    ht.text = '0.00'

        facturx_applicable_header = Et.SubElement(facturx_supply_chain, 'ram:ApplicableHeaderTradeAgreement')
        facturx_seller = Et.SubElement(facturx_applicable_header, 'ram:SellerTradeParty')
        supplier_name = Et.SubElement(facturx_seller, 'ram:Name')
        supplier_name.text = document_info['datas']['name']

        vat_number_parent = Et.SubElement(facturx_seller, 'ram:SpecifiedTaxRegistration')
        vat_number = Et.SubElement(vat_number_parent, 'ram:ID', {'schemeID': 'VA'})
        vat_number.text = document_info['datas']['vat_number']

        buyer = Et.SubElement(facturx_applicable_header, 'ram:BuyerTradeParty')
        Et.SubElement(buyer, 'ram:Name')

        buyer_order_ref = Et.SubElement(facturx_applicable_header, 'ram:BuyerOrderReferencedDocument')
        ored_ref = Et.SubElement(buyer_order_ref, 'ram:IssuerAssignedID')
        ored_ref.text = document_info['datas']['quotation_number']

        Et.SubElement(facturx_supply_chain, 'ram:ApplicableHeaderTradeDelivery')

        facturx_trade_settlement = Et.SubElement(facturx_supply_chain, 'ram:ApplicableHeaderTradeSettlement')
        payment_ref = Et.SubElement(facturx_trade_settlement, 'ram:PaymentReference')
        payment_ref.text = document_info['datas']['invoice_number']

        invoice_currency = Et.SubElement(facturx_trade_settlement, 'ram:InvoiceCurrencyCode')
        invoice_currency.text = document_info['datas']['currency'] if 'currency' in document_info['datas'] else 'EUR'

        if 'taxes_count' in document_info['datas'] and document_info['datas']['taxes_count'] > 0:
            for cpt_taxes in range(document_info['datas']['taxes_count']):
                index_rate = 'vat_rate' if cpt_taxes == 0 else 'vat_rate_' + str(cpt_taxes)
                index_amount = 'vat_amount' if cpt_taxes == 0 else 'vat_amount_' + str(cpt_taxes)
                index_ht = 'no_rate_amount' if cpt_taxes == 0 else 'no_rate_amount_' + str(cpt_taxes)

                applicable_trade_tax = Et.SubElement(facturx_trade_settlement, 'ram:ApplicableTradeTax')

                vat_amount = Et.SubElement(applicable_trade_tax, 'ram:CalculatedAmount')
                vat_amount.text = str(document_info['datas'][index_amount])
                type_code = Et.SubElement(applicable_trade_tax, 'ram:TypeCode')
                type_code.text = 'VAT'
                ht_amount = Et.SubElement(applicable_trade_tax, 'ram:BasisAmount')
                ht_amount.text = str(document_info['datas'][index_ht])
                category_code = Et.SubElement(applicable_trade_tax, 'ram:CategoryCode')
                category_code.text = 'S'
                vat_rate = Et.SubElement(applicable_trade_tax, 'ram:RateApplicablePercent')
                vat_rate.text = str(document_info['datas'][index_rate])

        data_parent = Et.SubElement(facturx_trade_settlement, 'ram:SpecifiedTradeSettlementHeaderMonetarySummation')

        total_ht = Et.SubElement(data_parent, 'ram:LineTotalAmount')
        total_ht.text = str(document_info['datas']['total_ht'])

        total_ht = Et.SubElement(data_parent, 'ram:TaxBasisTotalAmount')
        total_ht.text = str(document_info['datas']['total_ht'])

        total_vat = Et.SubElement(data_parent, 'ram:TaxTotalAmount', {
            'currencyID': document_info['datas']['currency'] if 'currency' in document_info['datas'] else 'EUR'})
        total_vat.text = str(document_info['datas']['total_vat'])

        total_ttc = Et.SubElement(data_parent, 'ram:GrandTotalAmount')
        total_ttc.text = str(document_info['datas']['total_ttc'])

        prepaid = Et.SubElement(data_parent, 'ram:TotalPrepaidAmount')
        prepaid.text = '0.00'
        due_payable = Et.SubElement(data_parent, 'ram:DuePayableAmount')
        due_payable.text = '0.00'

        file = document_info['path'] + '/' + document_info['filename']
        facturx.generate_facturx_from_file(file, Et.tostring(root), output_pdf_file=folder_out + '/' + filename)
        return '', 200
    else:
        if log:
            log.error(gettext('PDF_DESTINATION_FOLDER_DOESNT_EXISTS') + ' : ' + folder_out)

        response = {
            "errors": gettext('PDF_DESTINATION_FOLDER_DOESNT_EXISTS'),
            "message": folder_out
        }
        return response, 40


def ocrise_file(file, lang, log, folder_out, filename):
    check_ocr = os.popen('pdffonts ' + file, 'r')
    tmp = []
    for line in check_ocr:
        tmp.append(line)
    tmp = '\n'.join(tmp)

    is_ocr = False
    if len(tmp.split('\n')) > 4:
        is_ocr = True

    if not is_ocr:
        tmp_filename = '/tmp/' + str(uuid.uuid4()) + '.pdf'
        log.info('Start OCR on document...')
        generate_searchable_pdf(file, tmp_filename, lang, log)
        try:
            shutil.move(tmp_filename, folder_out + '/' + filename)
        except shutil.Error as _e:
            log.error('Moving file ' + tmp_filename + ' error : ' + str(_e))


def compress_file(file, compress_type, log, folder_out, filename, document_filename):
    compressed_file_path = '/tmp/min_' + document_filename
    compress_pdf(file, compressed_file_path, compress_type)
    try:
        shutil.move(compressed_file_path, folder_out + '/' + filename)
    except shutil.Error as _e:
        log.error('Moving file ' + compressed_file_path + ' error : ' + str(_e))


def export_pdf(data, log, regex, document_info, lang, compress_type, ocrise):
    log.info('Output execution : PDF export')
    folder_out = separator = filename = ''
    parameters = data['options']['parameters']
    for setting in parameters:
        if setting['id'] == 'folder_out':
            folder_out = setting['value']
        elif setting['id'] == 'separator':
            separator = setting['value']
        elif setting['id'] == 'filename':
            filename = setting['value']

    # Create the PDF filename
    _data = construct_with_var(filename, document_info, regex, separator)
    filename = separator.join(str(x) for x in _data) + '.pdf'
    filename = filename.replace('/', '-').replace(' ', '_')
    # END create the PDF filename

    if os.path.isdir(folder_out):
        file = document_info['path'] + '/' + document_info['filename']
        if compress_type:
            compress_file(file, compress_type, log, folder_out, filename, document_info['filename'])
        else:
            if os.path.isfile(file):
                shutil.copy(file, folder_out + '/' + filename)

        if ocrise:
            ocrise_file(file, lang, log, folder_out, filename)
        return '', 200
    else:
        if log:
            log.error(gettext('PDF_DESTINATION_FOLDER_DOESNT_EXISTS') + ' : ' + folder_out)

        response = {
            "errors": gettext('PDF_DESTINATION_FOLDER_DOESNT_EXISTS'),
            "message": folder_out
        }
        return response, 400


def export_mem(data, document_info, log, regex, database):
    log.info('Output execution : MEM export')
    host = login = password = ''
    auth_data = data['options']['auth']
    for _data in auth_data:
        if _data['id'] == 'host':
            host = _data['value']
        if _data['id'] == 'login':
            login = _data['value']
        if _data['id'] == 'password':
            password = _data['value']

    if host and login and password:
        _ws = _MEMWebServices(
            host,
            login,
            password,
            log
        )
        if _ws.status[0]:
            if document_info:
                args = {}
                supplier = database.select({
                    'select': ['*'] if 'select' not in args else args['select'],
                    'table': ['accounts_supplier'],
                    'where': ['id = %s'],
                    'data': [document_info['supplier_id']]
                })
                if supplier and supplier[0]['address_id']:
                    address = database.select({
                        'select': ['*'] if 'select' not in args else args['select'],
                        'table': ['addresses'],
                        'where': ['id = %s'],
                        'data': [supplier[0]['address_id']]
                    })
                    if address:
                        supplier[0].update(address[0])

                link_resource = False
                opencapture_field = mem_custom_field = mem_clause = custom_field_contact_id = None
                if 'links' in data['options']:
                    for _links in data['options']['links']:
                        if _links['id'] == 'enabled' and _links['value']:
                            link_resource = True
                        if _links['id'] == 'memCustomField' and _links['value']:
                            mem_custom_field = _links['value']
                        if _links['id'] == 'openCaptureField' and _links['value']:
                            opencapture_field = _links['value']
                        if _links['id'] == 'memClause' and _links['value']:
                            mem_clause = _links['value']
                        if _links['id'] == 'vatNumberContactCustom' and _links['value']:
                            custom_field_contact_id = _links['value']

                contact = {
                    'company': supplier[0]['name'],
                    'addressTown': supplier[0]['city'],
                    'societyShort': supplier[0]['name'],
                    'addressStreet': supplier[0]['address1'],
                    'addressPostcode': supplier[0]['postal_code'],
                    'email': supplier[0]['email'] if supplier[0]['email'] else 'A_renseigner_' + supplier[0][
                        'name'].replace(' ', '_') +
                                                                               '@' + supplier[0]['vat_number'] + '.fr'
                }

                if custom_field_contact_id and supplier[0]['vat_number'] and supplier[0]['siret']:
                    contact['customFields'] = {
                        custom_field_contact_id['id']: supplier[0]['vat_number'] + supplier[0]['siret']}

                res = _ws.create_contact(contact)
                if res is not False:
                    args['contact'] = {'id': res['id'], 'type': 'contact'}

                ws_data = data['options']['parameters']
                for _data in ws_data:
                    value = _data['value']
                    if 'webservice' in _data:
                        # Pour le webservices MEM Courrier, ce sont les identifiants qui sont utilisés
                        # et non les valeurs bruts (e.g COU plutôt que Service courrier)
                        if _data['value']:
                            value = _data['value']['id']

                    args.update({
                        _data['id']: value
                    })

                    if 'document_due_date' in document_info['datas'] and document_info['datas']['document_due_date']:
                        document_due_date = pd.to_datetime(document_info['datas']['document_due_date'],
                                                           format=regex['format_date'])
                        if document_due_date.date() > datetime.date.today():
                            args.update({
                                'processLimitDate': str(document_due_date.date())
                            })

                    if _data['id'] == 'priority' and 'processLimitDate' not in args:
                        priority = _ws.retrieve_priority(value)
                        if priority:
                            delays = priority['priority']['delays']
                            process_limit_date = datetime.date.today() + datetime.timedelta(days=delays)
                            args.update({
                                'processLimitDate': str(process_limit_date)
                            })

                    if _data['id'] == 'customFields':
                        args.update({
                            'customFields': {}
                        })
                        if _data['value']:
                            customs = json.loads(_data['value'])
                            for custom_id in customs:
                                if custom_id in customs and customs[custom_id] in document_info['datas']:
                                    args['customFields'].update({
                                        custom_id: document_info['datas'][customs[custom_id]]
                                    })
                    elif _data['id'] == 'subject':
                        subject = construct_with_var(_data['value'], document_info, regex)
                        args.update({
                            'subject': ''.join(subject)
                        })

                file = document_info['path'] + '/' + document_info['filename']
                if os.path.isfile(file):
                    with open(file, 'rb') as file:
                        args.update({
                            'fileContent': file.read(),
                        })

                    if 'document_date' in document_info['datas'] and document_info['datas']['document_date']:
                        document_date = pd.to_datetime(document_info['datas']['document_date'],
                                                       format=regex['format_date'])
                        args.update({
                            'documentDate': str(document_date.date())
                        })

                    res, message = _ws.insert_with_args(args)
                    if res:
                        if link_resource:
                            res_id = message['resId']
                            if opencapture_field:
                                opencapture_field = ''.join(construct_with_var(opencapture_field, document_info, regex))
                                if mem_custom_field:
                                    if 'res_id' not in data or not data['res_id']:
                                        docs = _ws.retrieve_doc_with_custom(mem_custom_field['id'], opencapture_field,
                                                                            mem_clause)
                                        if docs and docs['resources'] and len(docs['resources']) >= 1:
                                            res_id = docs['resources'][0]['res_id']
                                    else:
                                        res_id = data['res_id']
                                    if res_id != message['resId']:
                                        _ws.link_documents(str(res_id), message['resId'])
                        return '', 200
                    else:
                        response = {
                            "errors": gettext('EXPORT_MEM_ERROR'),
                            "message": message['errors']
                        }
                        return response, 400
                else:
                    response = {
                        "errors": gettext('EXPORT_MEM_ERROR'),
                        "message": gettext('PDF_FILE_NOT_FOUND')
                    }
                    return response, 400
            else:
                response = {
                    "errors": gettext('EXPORT_MEM_ERROR'),
                    "message": ''
                }
                return response, 400
        else:
            response = {
                "errors": gettext('MEM_WS_INFO_WRONG'),
                "message": _ws.status[1]
            }
            return response, 400
    else:
        response = {
            "errors": gettext('MEM_WS_INFO_EMPTY'),
            "message": ''
        }
        return response, 400


def construct_with_var(data, document_info, regex, separator=None):
    _data = []
    if isinstance(document_info['datas'], str):
        data_tmp = json.loads(document_info['datas'])
        document_info['datas'] = {}
        document_info['datas'] = data_tmp

    for column in data.split('#'):
        if column in document_info['datas']:
            if separator:
                _data.append(str(document_info['datas'][column]).replace(' ', separator))
            else:
                _data.append(document_info['datas'][column])
        elif column in document_info:
            if separator:
                _data.append(str(document_info[column]).replace(' ', separator))
            else:
                _data.append(document_info[column])
        elif column == 'document_date_year':
            _data.append(datetime.datetime.strptime(document_info['datas']['document_date'], regex['format_date']).year)
        elif column == 'document_date_month':
            _data.append(
                datetime.datetime.strptime(document_info['datas']['document_date'], regex['format_date']).month)
        elif column == 'document_date_day':
            _data.append(datetime.datetime.strptime(document_info['datas']['document_date'], regex['format_date']).day)
        elif column == 'register_date_year':
            _data.append(datetime.datetime.strptime(document_info['register_date'], regex['format_date']).year)
        elif column == 'register_date_month':
            _data.append(datetime.datetime.strptime(document_info['register_date'], regex['format_date']).month)
        elif column == 'register_date_day':
            _data.append(datetime.datetime.strptime(document_info['register_date'], regex['format_date']).day)
        else:
            if separator:
                _data.append(column.replace(' ', separator))
            else:
                if column not in ['quotation_number', 'invoice_number', 'delivery_number', 'document_date_']:
                    _data.append(column)
    return _data
