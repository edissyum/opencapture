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
import facturx
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
        'vat_percentage': {'id': 'RateApplicablePercent'},
        'date': {'id': 'DateTimeString', 'tagParent': 'IssueDateTime'},
        'invoice_number': {'id': 'ID', 'tagParent': 'ExchangedDocument'},
        'due_date': {'id': 'DateTimeString', 'tagParent': 'DueDateDateTime'}
    },
    'supplier': {
        'email': {'id': 'URIID'},
        'global_id': {'id': 'GlobalID'},
        'supplier_name': {'id': 'Name'},
        'phone': {'id': 'CompleteNumber'},
        'number': {'id': 'ID', 'tagParent': 'SellerTradeParty'},
        'vat_number': {'id': 'ID', 'attribTag': 'schemeID', 'attribValue': 'VA'},
        'tax_number': {'id': 'ID', 'attribTag': 'schemeID', 'attribValue': 'FC'}
    },
    'address': {
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

default_namespace = '{urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100}'
FACTUREX_DATA = {
    'facturation': [
        [
            './/' + default_namespace + 'IssueDateTime'
        ],
        [
            './/{urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100}ExchangedDocument',
            default_namespace + 'ID'
        ],
        [
            './/' + default_namespace + 'ApplicableHeaderTradeSettlement',
            './/' + default_namespace + 'SpecifiedTradeSettlementHeaderMonetarySummation'
        ],
        [
            './/' + default_namespace + 'ApplicableHeaderTradeSettlement',
            './/' + default_namespace + 'ApplicableTradeTax'
        ],
        [
            './/' + default_namespace + 'ApplicableHeaderTradeSettlement',
            './/' + default_namespace + 'SpecifiedTradePaymentTerms',
            './/' + default_namespace + 'DueDateDateTime'
        ]
    ],
    'supplier': [
        [
            './/' + default_namespace + 'SellerTradeParty',
            default_namespace + 'DefinedTradeContact',
            default_namespace + 'EmailURIUniversalCommunication'
        ],
        [
            './/' + default_namespace + 'SellerTradeParty',
            default_namespace + 'DefinedTradeContact',
            './/' + default_namespace + 'TelephoneUniversalCommunication'
        ],
        [
            default_namespace + 'SellerTradeParty'
        ],
        [
            './/' + default_namespace + 'SellerTradeParty',
            './/' + default_namespace + 'SpecifiedTaxRegistration'
        ]
    ],
    'address': [
        [
            './/' + default_namespace + 'SellerTradeParty',
            './/' + default_namespace + 'PostalTradeAddress'
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
                            return_data[key] = child_data.text
                else:
                    return_data[key] = data.text
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


def process(args):
    root = Et.fromstring(args['xml_content'])
    data = {
        'facturation': browse_xml(root, 'facturation', root),
        'supplier': browse_xml(root, 'supplier', root),
        'address': browse_xml(root, 'address', root)
    }
    print('-------------')
    print(data['facturation'])
    print(data['supplier'])
    print(data['address'])
    return True


if __name__ == '__main__':
    with open('/home/nathan/BASIC_Einfach.pdf', 'rb') as f:
        _, xml_content = facturx.get_facturx_xml_from_pdf(f.read())
        process({'xml_content': xml_content})
    with open('/home/nathan/EXTENDED_Warenrechnung.pdf', 'rb') as f:
        _, xml_content = facturx.get_facturx_xml_from_pdf(f.read())
        process({'xml_content': xml_content})
    print('-------------')
