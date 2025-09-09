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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

import os
import re
import json
import pyheif
import shutil
import base64
import random
import facturx
import datetime
import mimetypes
import subprocess
import pandas as pd
from PIL import Image
from xml.dom import minidom
from zipfile import ZipFile
from unidecode import unidecode
from flask_babel import gettext
import xml.etree.ElementTree as Et
from src.backend.classes.CMIS import CMIS
from src.backend.classes.Files import Files
from src.backend.classes.OpenCRMWebServices import OpenCRMWebServices
from src.backend.models import attachments, monitoring
from src.backend.classes.MEMWebServices import MEMWebServices
from src.backend.classes.COOGWebServices import COOGWebServices
from src.backend.splitter_exports import get_output_parameters


def export_xml(data, log, document_info, database, enable_log=True):
    if 'id' in document_info and document_info['id'] and enable_log:
        task = monitoring.get_process_by_document_id(document_info['id'])[0]
        if task and task[0]:
            log.task_id_monitor = task[0]['id']
            log.monitoring_status = task[0]['status']
            log.current_step = len(task[0]['steps']) + 1

    if enable_log:
        log.info('Output execution : XML export')

    folder_out = separator = filename = extension = xml_template = ''
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
        elif setting['id'] == 'xml_template':
            xml_template = setting['value']

    _technical_data = []
    # Create the XML filename
    _data = construct_with_var(filename, document_info, separator)
    filename = separator.join(str(x) for x in _data) + '.' + extension
    filename = filename.replace('/', '-').replace(' ', '_')
    filename = unidecode(filename)
    # END create the XML filename

    # Fill XML with document informations
    if os.path.isdir(folder_out):
        with open(folder_out + '/' + filename, 'w', encoding='utf-8') as xml_file:
            if xml_template:
                xml_root = xml_template
                for var in re.findall(r'#(.*?)#', xml_root):
                    var_value = ''.join(construct_with_var('#' + var + '#', document_info, separator))
                    xml_root = xml_root.replace('#' + var + '#', var_value)
            else:
                root = Et.Element('ROOT')
                xml_datas = Et.SubElement(root, 'DATAS')
                xml_technical = Et.SubElement(root, 'TECHNICAL')

                for technical in document_info:
                    if technical in ['path', 'filename', 'register_date', 'nb_pages', 'original_filename']:
                        new_field = Et.SubElement(xml_technical, technical)
                        new_field.text = str(document_info[technical])

                for document_data in document_info['datas']:
                    value = document_data

                    if document_data == 'document_due_date' or document_data == 'document_date':
                        try:
                            if document_info['datas'][document_data]:
                                document_info['datas'][document_data] = pd.to_datetime(document_info['datas'][document_data]).strftime('%Y-%m-%d')
                        except ValueError:
                            pass

                    if 'custom_' in document_data:
                        custom_field = database.select({
                            'select': ['label_short', 'type'],
                            'table': ['custom_fields'],
                            'where': ['id = %s', 'module = %s'],
                            'data': [document_data.replace('custom_', ''), 'verifier']
                        })
                        if custom_field and custom_field[0]:
                            value = 'custom_' + custom_field[0]['label_short']
                            if custom_field[0]['type'] == 'date':
                                try:
                                    document_info['datas'][document_data] = pd.to_datetime(document_info['datas'][document_data]).strftime('%Y-%m-%d')
                                except ValueError:
                                    pass

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
                                new_field.text = str(line_ht) if line_ht else ''
                                new_field = Et.SubElement(line_element, 'quantity')
                                new_field.text = str(quantity) if quantity else ''
                                new_field = Et.SubElement(line_element, 'unit_price')
                                new_field.text = str(unit_price) if unit_price else ''
                                new_field = Et.SubElement(line_element, 'description')
                                new_field.text = str(description) if description else ''
                    else:
                        if 'vat_rate' not in value and 'vat_amount' not in value and 'no_rate_amount' not in value and \
                                'line_ht' not in value and 'quantity' not in value and 'unit_price' not in value and \
                                'description' not in value:
                            new_field = Et.SubElement(xml_datas, value)
                            new_field.text = str(document_info['datas'][document_data]) if document_info['datas'][document_data] else ''

                xml_root = minidom.parseString(Et.tostring(root, encoding="unicode")).toprettyxml()
            xml_file.write(xml_root)
            xml_file.close()
        # END Fill XML with document informations
        return folder_out + '/' + filename, 200
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
    if 'id' in document_info and document_info['id']:
        task = monitoring.get_process_by_document_id(document_info['id'])[0]
        if task and task[0]:
            log.task_id_monitor = task[0]['id']
            log.monitoring_status = task[0]['status']
            log.current_step = len(task[0]['steps']) + 1

    log.info('Output execution : FacturX export')

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
    _data = construct_with_var(filename, document_info, separator)
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
        if 'invoice_number' in document_info['datas']:
            invoice_id = Et.SubElement(facturx_document, 'ram:ID')
            invoice_id.text = document_info['datas']['invoice_number']
        type_code = Et.SubElement(facturx_document, 'ram:TypeCode')
        type_code.text = '380'

        issue_date_parent = Et.SubElement(facturx_document, 'ram:IssueDateTime')
        issue_date = Et.SubElement(issue_date_parent, 'udt:DateTimeString', {'format': '102'})
        if document_info['datas']['document_due_date']:
            issue_date.text = datetime.datetime.strptime(document_info['datas']['document_due_date'], '%Y-%m-%d').strftime('%Y%m%d')
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
        return folder_out + '/' + filename, 200
    else:
        if log:
            log.error(gettext('PDF_DESTINATION_FOLDER_DOESNT_EXISTS') + ' : ' + folder_out)

        response = {
            "errors": gettext('PDF_DESTINATION_FOLDER_DOESNT_EXISTS'),
            "message": folder_out
        }
        return response, 40


def compress_file(file, compress_type, log, folder_out, filename, document_filename):
    compressed_file_path = '/tmp/min_' + document_filename
    compress_pdf(file, compressed_file_path, compress_type)
    try:
        shutil.move(compressed_file_path, folder_out + '/' + filename)
    except (shutil.Error, FileNotFoundError) as _e:
        log.error('Moving file ' + compressed_file_path + ' error : ' + str(_e))


def export_pdf(data, log, document_info, compress_type, ocrise, enable_log=True):
    if 'id' in document_info and document_info['id'] and enable_log:
        task = monitoring.get_process_by_document_id(document_info['id'])[0]
        if task and task[0]:
            log.task_id_monitor = task[0]['id']
            log.monitoring_status = task[0]['status']
            log.current_step = len(task[0]['steps']) + 1

    if enable_log:
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
    _data = construct_with_var(filename, document_info, separator)
    filename = separator.join(str(x) for x in _data)
    if ocrise or compress_type:
        filename = filename + '.pdf'
    else:
        filename = filename + '.' + os.path.splitext(document_info['filename'])[1].replace('.', '')
    filename = filename.replace('/', '-').replace(' ', '_')
    filename = unidecode(filename)
    # END create the PDF filename

    if os.path.isdir(folder_out):
        file = document_info['path'] + '/' + document_info['filename']
        if ocrise:
            Files.ocrise_pdf(file, log, folder_out + '/' + filename)
        else:
            if not file.lower().endswith('.pdf'):
                if file.lower().endswith(('.heif', '.heic', '.jpg', '.jpeg', '.png')):
                    if file.lower().endswith(('.heif', '.heic')):
                        heif_file = pyheif.read(file)
                        image_file = Image.frombytes(
                            heif_file.mode,
                            heif_file.size,
                            heif_file.data,
                            "raw",
                            heif_file.mode,
                            heif_file.stride,
                        )
                        filename = filename.replace('.heif', '.jpg')
                        filename = filename.replace('.heic', '.jpg')
                    else:
                        image_file = Image.open(file)
                    image_file.save(folder_out + '/' + filename)

        if compress_type:
            if os.path.isfile(folder_out + '/' + filename):
                file = folder_out + '/' + filename
            compress_file(file, compress_type, log, folder_out, filename, document_info['filename'])

        if not ocrise and not compress_type and os.path.isfile(file):
            shutil.copy(file, folder_out + '/' + filename)

        if 'id' in document_info and document_info['id']:
            attachments_list = attachments.get_attachments_by_document_id(document_info['id'])
            if attachments_list:
                pdf_filename, pdf_extension = os.path.splitext(filename)
                zip_filename =  pdf_filename + '_attachments.zip'
                with ZipFile(folder_out + '/' + zip_filename, 'w') as zip_file:
                    for attachment in attachments_list:
                        if attachment:
                            if os.path.exists(attachment['path']):
                                zip_file.write(attachment['path'], attachment['filename'])
        return folder_out + '/' + filename, 200
    else:
        if log:
            log.error(gettext('PDF_DESTINATION_FOLDER_DOESNT_EXISTS') + ' : ' + folder_out)

        response = {
            "errors": gettext('PDF_DESTINATION_FOLDER_DOESNT_EXISTS'),
            "message": folder_out
        }
        return response, 400


def construct_json(data, document_info, database, return_data=None):
    if return_data is None:
        return_data = {}

    for parameter in data:
        if isinstance(data[parameter], str):
            return_data[parameter] = ''.join(construct_with_var(data[parameter], document_info))
            if return_data[parameter] == '':
                del return_data[parameter]
            else:
                if 'custom_' in data[parameter]:
                    c_id = data[parameter].replace('custom_', '')
                    if isinstance(c_id, int) or c_id.isdigit():
                        custom_type = database.select({
                            'select': ['type'],
                            'table': ['custom_fields'],
                            'where': ['id = %s', 'module = %s'],
                            'data': [c_id, 'verifier']
                        })
                        if custom_type and custom_type[0]:
                            data_type = custom_type[0]['type']
                            if data_type == 'date':
                                try:
                                    return_data[parameter] = pd.to_datetime(return_data[parameter]).strftime('%Y-%m-%d')
                                except ValueError:
                                    pass

        elif isinstance(data[parameter], dict):
            return_data[parameter] = construct_json(data[parameter], document_info, database)
            if return_data[parameter] == {}:
                del return_data[parameter]
        elif isinstance(data[parameter], list):
            return_data[parameter] = []
            for sub_param in data[parameter]:
                if isinstance(sub_param, dict):
                    return_data[parameter].append(construct_json(sub_param, document_info, database))
            if not return_data[parameter]:
                del return_data[parameter]

            if parameter == 'references':
                # Loop through reference in reverse to avoid error with cpt when deleting values
                ref_cpt = len(return_data['references']) - 1
                for ref in reversed(return_data['references']):
                    if 'reference' not in ref or not ref['reference']:
                        del return_data['references'][ref_cpt]
                    ref_cpt -= 1
    return return_data


def export_coog(data, document_info, log, database):
    if 'id' in document_info and document_info['id']:
        task = monitoring.get_process_by_document_id(document_info['id'])[0]
        if task and task[0]:
            log.task_id_monitor = task[0]['id']
            log.monitoring_status = task[0]['status']
            log.current_step = len(task[0]['steps']) + 1

    log.info('Output execution : COOG export')
    host = token = cert_path = ''
    auth_data = data['options']['auth']
    for _data in auth_data:
        if _data['id'] == 'host':
            host = _data['value']
        if _data['id'] == 'token':
            token = _data['value']
        if _data['id'] == 'cert_path':
            cert_path = _data['value']

    if host and token:
        _ws = COOGWebServices(
            host,
            token,
            cert_path,
            log
        )
        if _ws.access_token[0]:
            if document_info:
                try:
                    parameters = json.loads(data['options']['parameters'][0]['value'])[0]
                except json.JSONDecodeError:
                    response = {
                        "errors": gettext('EXPORT_COOG_ERROR'),
                        "message": gettext('COOG_JSON_ERROR')
                    }
                    return response, 400

                ws_data = [construct_json(parameters, document_info, database)]
                res = _ws.create_task(ws_data)
                if res[0]:
                    coog_id = res[1][0]['id']
                    document_id = document_info['id']
                    attachments_list = attachments.get_attachments_by_document_id(document_id)
                    if attachments_list:
                        attachments_files = []
                        for attachment in attachments_list:
                            if attachment:
                                if os.path.isfile(attachment['path']):
                                    with open(attachment['path'], 'rb') as _file:
                                        b64_encoded = base64.b64encode(_file.read()).decode('utf-8')

                                    attachments_files.append({
                                        "content": {
                                            "type": "data",
                                            "data": b64_encoded,
                                            "filename": attachment['filename']
                                        }
                                    })

                        args = {
                            "id": coog_id,
                            "attachments": attachments_files
                        }
                        _ws.create_attachment(args)
                    return {}, 200
                else:
                    response = {
                        "errors": gettext('EXPORT_COOG_ERROR'),
                        "message": res[1]
                    }
                    return response, 400
            else:
                response = {
                    "errors": gettext('EXPORT_COOG_ERROR'),
                    "message": ''
                }
                return response, 400
        else:
            response = {
                "errors": gettext('COOG_WS_INFO_WRONG'),
                "message": _ws.access_token[1]
            }
            return response, 400
    else:
        response = {
            "errors": gettext('COOG_WS_INFO_EMPTY'),
            "message": ''
        }
        return response, 400


def export_opencrm(data, document_info, log, database):
    if 'id' in document_info and document_info['id']:
        task = monitoring.get_process_by_document_id(document_info['id'])[0]
        if task and task[0]:
            log.task_id_monitor = task[0]['id']
            log.monitoring_status = task[0]['status']
            log.current_step = len(task[0]['steps']) + 1

    if not document_info:
        response = {
            "errors": gettext('EXPORT_OPENCRM_ERROR'),
            "message": ''
        }
        return response, 400

    log.info('Output execution : OpenCRM export')
    host = client_id = client_secret = ''
    auth_data = data['options']['auth']
    for _data in auth_data:
        if _data['id'] == 'host':
            host = _data['value']
        if _data['id'] == 'client_id':
            client_id = _data['value']
        if _data['id'] == 'client_secret':
            client_secret = _data['value']

    if host and client_id and client_secret:
        _ws = OpenCRMWebServices(
            host,
            client_id,
            client_secret,
            log
        )
        if _ws.access_token[0]:
            try:
                parameters = json.loads(data['options']['parameters'][0]['value'])
            except json.JSONDecodeError:
                response = {
                    "errors": gettext('EXPORT_OPENCRM_ERROR'),
                    "message": gettext('OPENCRM_JSON_ERROR')
                }
                return response, 400

            attachments_files = []
            attachments_list = attachments.get_attachments_by_document_id(document_info['id'])
            if attachments_list:
                for attachment in attachments_list:
                    if os.path.isfile(attachment['path']):
                        with open(attachment['path'], 'rb') as _file:
                            b64_encoded = base64.b64encode(_file.read()).decode('utf-8')

                        attachments_files.append({
                            "nom": attachment['filename'],
                            "type_mime": mimetypes.guess_type(attachment['path'])[0],
                            "base64": b64_encoded
                        })

            ws_data = construct_json(parameters, document_info, database)
            ws_data['data']['requete']['documents'].append(attachments_files)
            res = _ws.create_entry(ws_data)
            if res[0]:
                return {}, 200
            else:
                response = {
                    "errors": gettext('EXPORT_COOG_ERROR'),
                    "message": res[1]
                }
                return response, 400
        else:
            response = {
                "errors": gettext('OPENCRM_WS_INFO_WRONG'),
                "message": _ws.access_token[1]
            }
            return response, 400
    else:
        response = {
            "errors": gettext('OPENCRM_WS_INFO_EMPTY'),
            "message": ''
        }
        return response, 400


def export_mem(data, document_info, log, regex, database):
    if 'id' in document_info and document_info['id']:
        task = monitoring.get_process_by_document_id(document_info['id'])[0]
        if task and task[0]:
            log.task_id_monitor = task[0]['id']
            log.monitoring_status = task[0]['status']
            log.current_step = len(task[0]['steps']) + 1

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
        _ws = MEMWebServices(
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
                    'email': supplier[0]['email'] if supplier[0]['email'] else
                    'A_renseigner_' + supplier[0]['name'].replace(' ', '_') + '@' + supplier[0]['vat_number'] + '.fr'
                }

                if custom_field_contact_id and supplier[0]['vat_number'] and supplier[0]['siret']:
                    contact['customFields'] = {
                        custom_field_contact_id['id']: supplier[0]['vat_number'] + supplier[0]['siret']
                    }

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
                        subject = construct_with_var(_data['value'], document_info)
                        args.update({
                            'subject': ''.join(subject)
                        })

                file = document_info['path'] + '/' + document_info['filename']
                if os.path.isfile(file):
                    with open(file, 'rb') as file:
                        args.update({
                            'fileContent': file.read()
                        })

                    if 'document_date' in document_info['datas'] and document_info['datas']['document_date']:
                        try:
                            document_date = pd.to_datetime(document_info['datas']['document_date'],
                                                           format=regex['format_date'])
                        except ValueError:
                            document_date = pd.to_datetime(document_info['datas']['document_date'])

                        args.update({
                            'documentDate': str(document_date.date())
                        })
                    else:
                        args.update({'documentDate': None})

                    res, message = _ws.insert_with_args(args)
                    if res:
                        res_id = message['resId']
                        document_id = document_info['id']
                        attachments_list = attachments.get_attachments_by_document_id(document_id)
                        if attachments_list:
                            for attachment in attachments_list:
                                if attachment:
                                    if os.path.isfile(attachment['path']):
                                        with open(attachment['path'], 'rb') as _file:
                                            b64_encoded = base64.b64encode(_file.read()).decode('utf-8')

                                        attachments_files = {
                                            "file_content": b64_encoded,
                                            "extension": os.path.splitext(attachment['filename'])[1].replace('.', ''),
                                            "filename": attachment['filename']
                                        }
                                        _ws.insert_attachment(res_id, attachments_files)
                            if link_resource:
                                if opencapture_field:
                                    opencapture_field = ''.join(construct_with_var(opencapture_field, document_info))
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


def export_cmis(data, document_info, log, database, docservers, compress_type, ocerise):
    if 'id' in document_info and document_info['id']:
        task = monitoring.get_process_by_document_id(document_info['id'])[0]
        if task and task[0]:
            log.task_id_monitor = task[0]['id']
            log.monitoring_status = task[0]['status']
            log.current_step = len(task[0]['steps']) + 1

    if not document_info:
        response = {
            "errors": gettext('EXPORT_CMIS_ERROR'),
            "message": ''
        }
        return response, 400

    log.info('Output execution : CMIS export')
    cmis_ws = login = password = folder = ''
    auth_data = data['options']['auth']
    for _data in auth_data:
        if _data['id'] == 'cmis_ws':
            cmis_ws = _data['value']
        if _data['id'] == 'login':
            login = _data['value']
        if _data['id'] == 'password':
            password = _data['value']
        if _data['id'] == 'folder':
            folder = _data['value']

    if cmis_ws and login and password and folder:
        _ws = CMIS(cmis_ws, login, password, folder)
        if _ws.root_folder:
            cmis_params = get_output_parameters(data['options']['parameters'])
            data['options']['parameters'].append({'id': 'folder_out', 'value': docservers['TMP_PATH']})
            data['options']['parameters'].append({'id': 'filename', 'value': cmis_params['pdf_filename']})
            res_pdf_export, _ = export_pdf(data, log, document_info, compress_type, ocerise, enable_log=False)

            data['options']['parameters'].append({'id': 'folder_out', 'value': docservers['TMP_PATH']})
            data['options']['parameters'].append({'id': 'filename', 'value': cmis_params['xml_filename']})
            data['options']['parameters'].append({'id': 'extension', 'value': 'xml'})

            cmis_res = _ws.create_document(res_pdf_export, 'application/pdf')
            if cmis_res[0]:
                if cmis_params['xml_filename']:
                    data['options']['parameters'].append({'id': 'folder_out', 'value': docservers['TMP_PATH']})
                    data['options']['parameters'].append({'id': 'filename', 'value': cmis_params['xml_filename']})
                    data['options']['parameters'].append({'id': 'extension', 'value': 'xml'})
                    res_xml_export, _ = export_xml(data, log, document_info, database, enable_log=False)
                    if res_xml_export and os.path.isfile(res_xml_export):
                        _ws.create_document(res_xml_export, 'text/xml')
                        if os.path.isfile(res_xml_export):
                            os.remove(res_xml_export)

                    if not cmis_res[0]:
                        response = {
                            "errors": gettext('EXPORT_XML_ERROR'),
                            "message": cmis_res[1]
                        }
                        return response, 500

                if os.path.isfile(res_pdf_export):
                    os.remove(res_pdf_export)
                return {}, 200
            else:
                if os.path.isfile(res_pdf_export):
                    os.remove(res_pdf_export)

                log.error(f"File not sent : {res_pdf_export}")
                log.error(f"CMIS Response : {str(cmis_res)}")
                response = {
                    "errors": gettext('EXPORT_PDF_ERROR'),
                    "message": cmis_res[1]
                }
                return response, 500
        else:
            response = {
                "errors": gettext('CMIS_WS_INFO_WRONG'),
                "message": ''
            }
            return response, 400
    else:
        response = {
            "errors": gettext('CMIS_WS_INFO_EMPTY'),
            "message": ''
        }
        return response, 400


def construct_with_var(data, document_info, separator=None):
    _data = []
    if isinstance(document_info['datas'], str):
        data_tmp = json.loads(document_info['datas'])
        document_info['datas'] = data_tmp

    for column in data.split('#'):
        column_strip = column.strip()
        if column_strip in document_info['datas'] and document_info['datas'][column_strip]:
            if separator:
                _data.append(str(document_info['datas'][column_strip]).replace(' ', separator))
            else:
                _data.append(str(document_info['datas'][column_strip]))
        elif column_strip in document_info and document_info[column_strip]:
            data_to_append = document_info[column_strip]
            if column_strip == 'original_filename':
                data_to_append = os.path.splitext(document_info['original_filename'])[0]

            if separator:
                _data.append(str(data_to_append).replace(' ', separator))
            else:
                _data.append(str(data_to_append))
        elif column_strip == 'random':
            _data.append(str(random.randint(0, 99999)).zfill(5))
        elif column_strip == 'document_id':
            if 'id' in document_info and document_info['id']:
                _data.append(str(document_info['id']))
        elif column_strip == 'document_date_year':
            if 'document_date' in document_info['datas'] and document_info['datas']['document_date']:
                document_date = datetime.datetime.strptime(document_info['datas']['document_date'], '%Y-%m-%d')
                _data.append(str(document_date.year))
        elif column_strip == 'document_date_month':
            if 'document_date' in document_info['datas'] and document_info['datas']['document_date']:
                document_date = datetime.datetime.strptime(document_info['datas']['document_date'], '%Y-%m-%d')
                _data.append(str('%02d' % document_date.month))
        elif column_strip == 'document_date_day':
            if 'document_date' in document_info['datas'] and document_info['datas']['document_date']:
                document_date = datetime.datetime.strptime(document_info['datas']['document_date'], '%Y-%m-%d')
                _data.append(str('%02d' % document_date.day))
        elif column_strip == 'document_date_full':
            if 'document_date' in document_info['datas'] and document_info['datas']['document_date']:
                document_date = datetime.datetime.strptime(document_info['datas']['document_date'], '%Y-%m-%d')
                _data.append(str(document_date))
        elif column_strip == 'register_date_year':
            if 'register_date' in document_info and document_info['register_date']:
                _data.append(str(document_info['register_date'].year))
        elif column_strip == 'register_date_month':
            if 'register_date' in document_info and document_info['register_date']:
                _data.append(str(document_info['register_date'].month))
        elif column_strip == 'register_date_day':
            if 'register_date' in document_info and document_info['register_date']:
                _data.append(str(document_info['register_date'].day))
        elif column_strip == 'supplier_id':
            if 'supplier_id' in document_info and document_info['supplier_id']:
                _data.append(str(document_info['supplier_id']))
        elif column_strip == 'b64_file_content':
            file = document_info['path'] + '/' + document_info['filename']
            if os.path.isfile(file):
                with open(file, 'rb') as _file:
                    b64_encoded = base64.b64encode(_file.read())
                    _data.append(str(b64_encoded.decode('utf-8')))
        elif column_strip == 'mime_type':
            file = document_info['path'] + '/' + document_info['filename']
            if os.path.isfile(file):
                mime_type = mimetypes.guess_type(file)[0]
                if mime_type:
                    _data.append(mime_type)
        elif column_strip == 'current_date':
            _data.append(datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        elif column_strip == 'register_date_full':
            if 'register_date' in document_info and document_info['register_date']:
                _data.append(document_info['register_date'].strftime('%Y-%m-%d %H:%M:%S'))
        else:
            if separator:
                _data.append(column.replace(' ', separator))
            else:
                if column not in ['quotation_number', 'invoice_number', 'delivery_number', 'document_date_']:
                    _data.append(column)
        for key in _data:
            if re.match('^custom_[0-9]+$', key.strip()):
                del _data[_data.index(key)]
    return _data
