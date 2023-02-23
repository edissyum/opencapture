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

FACTUREX_CORRESPONDANCE = {
    'facturation': {
        'currency': {'id': 'InvoiceCurrencyCode'},
        'total_ht': {'id': 'TaxBasisTotalAmount'},
        'total_tva': {'id': 'TaxTotalAmount'},
        'total_ttc': {'id': 'GrandTotalAmount'},
        'vat_percentage': {'id': 'RateApplicablePercent'}
    },
    'supplier': {
        'supplier_name': {'id': 'Name'},
        'vat_number': {'id': 'ID', 'attribTag': 'schemeID', 'attribValue': 'VA'},
        'tax_number': {'id': 'ID', 'attribTag': 'schemeID', 'attribValue': 'FC'}
    },
    'address': {
        'postal_code': {'id': 'PostcodeCode'},
        'address1': {'id': 'LineOne'},
        'address2': {'id': 'LineTwo'},
        'city': {'id': 'CityName'},
        'country': {'id': 'CountryID'}
    }
}

FACTUREX = {
    'facturation': [
        [
            '{urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100}ApplicableHeaderTradeSettlement',
            '{urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100}SpecifiedTradeSettlementHeaderMonetarySummation',
        ],
        [
            '{urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100}ApplicableHeaderTradeSettlement',
            '{urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100}ApplicableTradeTax'
        ]
    ],
    'supplier': [
        [
            '{urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100}SellerTradeParty',
            '{urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100}SpecifiedTaxRegistration',
        ]
    ],
    'address': [
        [
            '{urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100}SellerTradeParty',
            '{urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100}PostalTradeAddress'
        ]
    ]
}


def browse_xml(root, data_type, return_data=None):
    if return_data is None:
        return_data = {}
    for level in range(len(FACTUREX[data_type])):
        for tree in FACTUREX[data_type][level]:
            for child in root.findall('.//' + tree):
                print(child.tag, child.text)
                # if level < len(FACTUREX[data_type]) - 1:
                #     return browse_xml(child, level + 1, data_type, return_data)
                for data in child:
                    tag = re.sub('{.*}', '', data.tag)
                    for key in FACTUREX_CORRESPONDANCE[data_type]:
                        if FACTUREX_CORRESPONDANCE[data_type][key]['id'] == tag:
                            if 'attribTag' in FACTUREX_CORRESPONDANCE[data_type][key]:
                                for test in root.findall('.//' + tree):
                                    for blabla in test:
                                        attrib_tag = FACTUREX_CORRESPONDANCE[data_type][key]['attribTag']
                                        attrib_value = FACTUREX_CORRESPONDANCE[data_type][key]['attribValue']
                                        if blabla.attrib[attrib_tag] == attrib_value:
                                            return_data[key] = blabla.text
                            else:
                                return_data[key] = data.text
    return return_data


def process(args):
    root = Et.fromstring(args['xml_content'])
    data = {
        # 'facturation': browse_xml(root, 'facturation'),
        # 'supplier': browse_xml(root, 'supplier'),
        'address': browse_xml(root, 'address')
    }
    print(data)
    return True


if __name__ == '__main__':
    with open('/home/nathan/BASIC_Einfach.pdf', 'rb') as f:
        _, xml_content = facturx.get_facturx_xml_from_pdf(f.read())
        process({'xml_content': xml_content})
