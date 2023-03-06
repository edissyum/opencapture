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

import re
import uuid
import facturx
from unidecode import unidecode
from xml.etree import ElementTree as Et

###
# FACTUREX_CORRESPONDANCE is used to convert XML data to Open-Capture data
# The options are:
#   - id: the tag containing the information
#   - tagParent: the parent tag of the tag containing the information (if the tag name is not unique)
#   - attribTag: the attribute name containing specific information
#   - attribValue: the value of the attribute name.
#       This is used to find information if same tag is used to differents values (ex: VAT number and Tax number)
###

FACTUREX_CORRESPONDANCE = {
    'facturation': {
        'total_tva': {'id': 'TaxTotalAmount'},
        'total_ttc': {'id': 'GrandTotalAmount'},
        'currency': {'id': 'InvoiceCurrencyCode'},
        'total_ht': {'id': 'TaxBasisTotalAmount'},
        'note': {'id': 'Content', 'tagParent': 'IncludedNote'},
        'date': {'id': 'DateTimeString', 'tagParent': 'IssueDateTime'},
        'invoice_number': {'id': 'ID', 'tagParent': 'ExchangedDocument'},
        'due_date': {'id': 'DateTimeString', 'tagParent': 'DueDateDateTime'},
        'order_number': {'id': 'IssuerAssignedID', 'tagParent': 'BuyerOrderReferencedDocument'},
        'contract_reference': {'id': 'IssuerAssignedID', 'tagParent': 'ContractReferencedDocument'}
    },
    'payment': {
        'reference': {'id': 'PaymentReference'},
        'iban': {'id': 'IBANID', 'tagParent': 'PayeePartyCreditorFinancialAccount'},
        'conditions': {'id': 'Description', 'tagParent': 'SpecifiedTradePaymentTerms'},
        'bic': {'id': 'BICID', 'tagParent': 'PayeeSpecifiedCreditorFinancialInstitution'},
        'type_code': {'id': 'TypeCode', 'tagParent': 'SpecifiedTradeSettlementPaymentMeans'},
        'informations': {'id': 'Information', 'tagParent': 'SpecifiedTradeSettlementPaymentMeans'}
    },
    'taxes': {
        'type_code': {'id': 'TypeCode',  'tagParent': 'ApplicableTradeTax'},
        'ht_price': {'id': 'BasisAmount',  'tagParent': 'ApplicableTradeTax'},
        'category_code': {'id': 'CategoryCode', 'tagParent': 'ApplicableTradeTax'},
        'vat_amount': {'id': 'CalculatedAmount', 'tagParent': 'ApplicableTradeTax'},
        'vat_percentage': {'id': 'RateApplicablePercent', 'tagParent': 'ApplicableTradeTax'}
    },
    'facturation_lines': {
        'name': {'id': 'Name'},
        'product_id': {'id': 'GlobalID'},
        'quantity': {'id': 'BilledQuantity'},
        'trade_tax_type_code': {'id': 'TypeCode'},
        'seller_assigned_id': {'id': 'SellerAssignedID'},
        'trade_tax_category_code': {'id': 'CategoryCode'},
        'trade_tax_amount': {'id': 'RateApplicablePercent'},
        'value': {'id': 'Value', 'tagParent': 'ApplicableProductCharacteristic'},
        'allowance_reason': {'id': 'Reason', 'tagParent': 'AppliedTradeAllowanceCharge'},
        'unit_price_ht': {'id': 'ChargeAmount', 'tagParent': 'NetPriceProductTradePrice'},
        'gross_price_ht': {'id': 'ChargeAmount', 'tagParent': 'GrossPriceProductTradePrice'},
        'description': {'id': 'Description', 'tagParent': 'ApplicableProductCharacteristic'},
        'allowance_amount': {'id': 'ActualAmount', 'tagParent': 'AppliedTradeAllowanceCharge'},
        'ht_price': {'id': 'LineTotalAmount', 'tagParent': 'SpecifiedTradeSettlementLineMonetarySummation'}
    },
    'supplier': {
        'global_id': {'id': 'GlobalID'},
        'supplier_name': {'id': 'Name'},
        'number': {'id': 'ID', 'tagParent': 'SellerTradeParty'},
        'vat_number': {'id': 'ID', 'attribTag': 'schemeID', 'attribValue': 'VA'},
        'tax_number': {'id': 'ID', 'attribTag': 'schemeID', 'attribValue': 'FC'}
    },
    'buyer': {
        'buyer_name': {'id': 'Name'},
        'number': {'id': 'ID', 'tagParent': 'BuyerTradeParty'},
        'vat_number': {'id': 'ID', 'attribTag': 'schemeID', 'attribValue': 'VA'},
        'tax_number': {'id': 'ID', 'attribTag': 'schemeID', 'attribValue': 'FC'},
        'legal_organization_id': {'id': 'ID', 'tagParent': 'SpecifiedLegalOrganization'}
    },
    'supplier_trade_contact': {
        'email': {'id': 'URIID'},
        'name': {'id': 'PersonName'},
        'phone': {'id': 'CompleteNumber'}
    },
    'buyer_trade_contact': {
        'email': {'id': 'URIID'},
        'name': {'id': 'PersonName'},
        'phone': {'id': 'CompleteNumber'}
    },
    'supplier_address': {
        'city': {'id': 'CityName'},
        'address1': {'id': 'LineOne'},
        'address2': {'id': 'LineTwo'},
        'country': {'id': 'CountryID'},
        'postal_code': {'id': 'PostcodeCode'}
    },
    'buyer_address': {
        'city': {'id': 'CityName'},
        'address1': {'id': 'LineOne'},
        'address2': {'id': 'LineTwo'},
        'country': {'id': 'CountryID'},
        'postal_code': {'id': 'PostcodeCode'}
    }
}

###
# FACTUREX_DATA array is used to find various information in the PDF xml content
# Each array is composed of a list of path to find the information
# Each list start with lower path possible and then each element is a child of the previous element
# The last element of the list is the tag containing the information
###

NAMESPACE = '{urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100}'
FACTUREX_DATA = {
    'notes': [
        [
            './/' + NAMESPACE + 'IncludedNote'
        ]
    ],
    'facturation': [
        [
            './/' + NAMESPACE + 'IssueDateTime'
        ],
        [
            './/{urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100}ExchangedDocument',
            NAMESPACE + 'ID'
        ],
        [
            './/' + NAMESPACE + 'BuyerOrderReferencedDocument'
        ],
        [
            './/' + NAMESPACE + 'ContractReferencedDocument'
        ],
        [
            './/' + NAMESPACE + 'ApplicableHeaderTradeSettlement',
            './/' + NAMESPACE + 'SpecifiedTradeSettlementHeaderMonetarySummation'
        ],
        [
            './/' + NAMESPACE + 'ApplicableHeaderTradeSettlement',
            './/' + NAMESPACE + 'SpecifiedTradePaymentTerms',
            './/' + NAMESPACE + 'DueDateDateTime'
        ]
    ],
    'payment': [
        [
            './/' + NAMESPACE + 'ApplicableHeaderTradeSettlement',
            './/' + NAMESPACE + 'SpecifiedTradeSettlementPaymentMeans',
            './/' + NAMESPACE + 'PayeePartyCreditorFinancialAccount'
        ],
        [
            './/' + NAMESPACE + 'ApplicableHeaderTradeSettlement',
            './/' + NAMESPACE + 'SpecifiedTradeSettlementPaymentMeans',
            './/' + NAMESPACE + 'PayeeSpecifiedCreditorFinancialInstitution'
        ],
        [
            './/' + NAMESPACE + 'ApplicableHeaderTradeSettlement',
            './/' + NAMESPACE + 'SpecifiedTradePaymentTerms'
        ]
    ],
    'facturation_lines': [
        [
            './/' + NAMESPACE + 'IncludedSupplyChainTradeLineItem'
        ]
    ],
    'supplier_trade_contact': [
        [
            './/' + NAMESPACE + 'SellerTradeParty',
            NAMESPACE + 'DefinedTradeContact',
            NAMESPACE + 'EmailURIUniversalCommunication'
        ],
        [
            './/' + NAMESPACE + 'SellerTradeParty',
            NAMESPACE + 'DefinedTradeContact',
            './/' + NAMESPACE + 'TelephoneUniversalCommunication'
        ],
        [
            NAMESPACE + 'SellerTradeParty'
        ]
    ],
    'buyer_trade_contact': [
        [
            './/' + NAMESPACE + 'BuyerTradeParty',
            NAMESPACE + 'DefinedTradeContact',
            NAMESPACE + 'EmailURIUniversalCommunication'
        ],
        [
            './/' + NAMESPACE + 'BuyerTradeParty',
            NAMESPACE + 'DefinedTradeContact',
            './/' + NAMESPACE + 'TelephoneUniversalCommunication'
        ]
    ],
    'supplier': [
        [
            './/' + NAMESPACE + 'SellerTradeParty',
            './/' + NAMESPACE + 'SpecifiedTaxRegistration'
        ]
    ],
    'buyer': [
        [
            './/' + NAMESPACE + 'BuyerTradeParty',
            './/' + NAMESPACE + 'SpecifiedTaxRegistration'
        ],
        [
            './/' + NAMESPACE + 'BuyerTradeParty',
            './/' + NAMESPACE + 'SpecifiedLegalOrganization'
        ]
    ],
    'supplier_address': [
        [
            './/' + NAMESPACE + 'SellerTradeParty',
            './/' + NAMESPACE + 'PostalTradeAddress'
        ]
    ],
    'buyer_address': [
        [
            './/' + NAMESPACE + 'BuyerTradeParty',
            './/' + NAMESPACE + 'PostalTradeAddress'
        ]
    ]
}


def fill_data(child, corrrespondance, parent):
    return_data = {}
    for data in child:
        tag = re.sub('{.*}', '', data.tag)
        for key in corrrespondance:
            if corrrespondance[key]['id'] == tag:
                if 'tagParent' in corrrespondance[key] and corrrespondance[key]['tagParent'] != parent:
                    continue
                if 'attribTag' in corrrespondance[key]:
                    for child_data in child:
                        attrib_tag = corrrespondance[key]['attribTag']
                        attrib_value = corrrespondance[key]['attribValue']
                        if attrib_tag in child_data.attrib and child_data.attrib[attrib_tag] == attrib_value:
                            return_data[key] = unidecode(child_data.text.strip())
                else:
                    return_data[key] = unidecode(data.text.strip())
    return return_data


def browse_xml(root, data_type, original_root, level=0, cpt=0, return_data=None):
    if return_data is None:
        return_data = {}
    if level > 0:
        root = original_root

    xml_tree = FACTUREX_DATA[data_type]

    if not root.findall(xml_tree[level][cpt]):
        if cpt < len(xml_tree[level]) - 1:
            return browse_xml(root, data_type, original_root, level, cpt + 1, return_data)
        elif level < len(xml_tree) - 1:
            return browse_xml(root, data_type, original_root, level + 1, 0, return_data)

    for child in root.findall(xml_tree[level][cpt]):
        parent = re.sub('{.*}', '', child.tag)
        return_data.update(fill_data(child, FACTUREX_CORRESPONDANCE[data_type], parent))
        if cpt < len(xml_tree[level]) - 1:
            return browse_xml(child, data_type, original_root, level, cpt + 1, return_data)
        elif level < len(xml_tree) - 1:
            return browse_xml(child, data_type, original_root, level + 1, 0, return_data)
    return return_data


def browse_xml_specific(root, grand_parent, parent):
    taxes = []
    correspondances = FACTUREX_CORRESPONDANCE['taxes']
    for child in root.findall('.//' + NAMESPACE + grand_parent):
        for specific in child.findall(NAMESPACE + parent):
            if specific.text.strip():
                taxes.append(unidecode(specific.text.strip()))
            else:
                taxes.append(fill_data(specific, correspondances, parent))
    return taxes


def browse_xml_lines(root):
    cpt = 1
    lines = {}
    correspondances = FACTUREX_CORRESPONDANCE['facturation_lines']

    for i in range(1, len(root.findall('.//' + NAMESPACE + 'IncludedSupplyChainTradeLineItem')) + 1):
        lines[i] = {
            'global': {},
            'unit_price': {},
            'allowances': [],
            'trade_taxes': {},
            'characteristics': {}
        }

    for child in root.findall('.//' + NAMESPACE + 'IncludedSupplyChainTradeLineItem'):
        for specified_trade in child.findall(NAMESPACE + 'SpecifiedTradeProduct'):
            lines[cpt]['global'].update(fill_data(specified_trade, correspondances, None))
            for product_char in specified_trade.findall('.//' + NAMESPACE + 'ApplicableProductCharacteristic'):
                parent = 'ApplicableProductCharacteristic'
                lines[cpt]['characteristics'].update(fill_data(product_char, correspondances, parent))

        for delivery in child.findall(NAMESPACE + 'SpecifiedLineTradeDelivery'):
            lines[cpt]['global'].update(fill_data(delivery, correspondances, None))
            for data in delivery:
                tag = re.sub('{.*}', '', data.tag)
                if tag == 'BilledQuantity':
                    lines[cpt]['global']['unit_type'] = data.attrib['unitCode']

        for prices in child.findall('.//' + NAMESPACE + 'SpecifiedLineTradeSettlement'):
            for trade_tax in prices.findall(NAMESPACE + 'ApplicableTradeTax'):
                lines[cpt]['trade_taxes'].update(fill_data(trade_tax, correspondances, None))
            for trade_tax in prices.findall(NAMESPACE + 'SpecifiedTradeSettlementLineMonetarySummation'):
                parent = 'SpecifiedTradeSettlementLineMonetarySummation'
                lines[cpt]['global'].update(fill_data(trade_tax, correspondances, parent))

        for specified_line in child.findall(NAMESPACE + 'SpecifiedLineTradeAgreement'):
            for product_char in specified_line.findall('.//' + NAMESPACE + 'NetPriceProductTradePrice'):
                lines[cpt]['unit_price'].update(fill_data(product_char, correspondances, 'NetPriceProductTradePrice'))
            for product_char in specified_line.findall('.//' + NAMESPACE + 'GrossPriceProductTradePrice'):
                lines[cpt]['unit_price'].update(fill_data(product_char, correspondances, 'GrossPriceProductTradePrice'))
                for allowances in product_char.findall('.//' + NAMESPACE + 'AppliedTradeAllowanceCharge'):
                    parent = 'AppliedTradeAllowanceCharge'
                    lines[cpt]['allowances'].append(fill_data(allowances, correspondances, parent))

        cpt += 1
    return lines


def insert(args):
    files = args['files']
    database = args['database']
    docservers = args['docservers']
    if 'input_id' in args:
        input_settings = database.select({
            'select': ['*'],
            'table': ['inputs'],
            'where': ['input_id = %s', 'module = %s'],
            'data': [args['input_id'], 'verifier'],
        })

    # Generate thumbnail
    file_name = str(uuid.uuid4())
    jpg_filename = 'full_' + file_name
    files.save_img_with_pdf2image_min(args['file'], docservers['VERIFIER_IMAGE_FULL'] + '/' + jpg_filename, docservers=True)
    files.save_img_with_pdf2image_min(args['file'], docservers['VERIFIER_THUMB'] + '/' + jpg_filename)
    # files.pdf_to_jpg(args['file'], 1)
    return True


def process(args):
    root = Et.fromstring(args['xml_content'])
    del args['xml_content']
    data = {
        'buyer': browse_xml(root, 'buyer', root),
        'facturation_lines': browse_xml_lines(root),
        'payment': browse_xml(root, 'payment', root),
        'supplier': browse_xml(root, 'supplier', root),
        'facturation': browse_xml(root, 'facturation', root),
        'buyer_address': browse_xml(root, 'buyer_address', root),
        'notes': browse_xml_specific(root, 'IncludedNote', 'Content'),
        'supplier_address': browse_xml(root, 'supplier_address', root),
        'buyer_trade_contact': browse_xml(root, 'buyer_trade_contact', root),
        'supplier_trade_contact': browse_xml(root, 'supplier_trade_contact', root),
        'taxes': browse_xml_specific(root, 'ApplicableHeaderTradeSettlement', 'ApplicableTradeTax')
    }

    res = insert(args)

    return res


if __name__ == '__main__':
    # with open('/home/nathan/BASIC_Einfach.pdf', 'rb') as f:
    #     _, xml_content = facturx.get_facturx_xml_from_pdf(f.read())
    #     process({'xml_content': xml_content})
    with open('/home/nathan/Facture_FR_EXTENDED.pdf', 'rb') as f:
        _, xml_content = facturx.get_facturx_xml_from_pdf(f.read())
        process({'xml_content': xml_content})
    # with open('/home/nathan/Facture_FR_BASICWL.pdf', 'rb') as f:
    #     _, xml_content = facturx.get_facturx_xml_from_pdf(f.read())
    #     process({'xml_content': xml_content})
    # with open('/home/nathan/EXTENDED_Warenrechnung.pdf', 'rb') as f:
    #     _, xml_content = facturx.get_facturx_xml_from_pdf(f.read())
    #     process({'xml_content': xml_content})
    print('-------------')
