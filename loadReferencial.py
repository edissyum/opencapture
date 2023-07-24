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
import sys
import argparse
import mimetypes
from src.backend.main import create_classes_from_custom_id
from src.backend.functions import retrieve_config_from_custom_id


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument("-c", "--custom-id", required=False, help="Identifier of the custom")
    ap.add_argument("-f", "--file", required=False, help="path to referential file")
    args = vars(ap.parse_args())

    if not retrieve_config_from_custom_id(args['custom_id']):
        sys.exit('Custom config file couldn\'t be found')

    database, config, _, _, _, log, _, spreadsheet, _, _, _, _, _ = create_classes_from_custom_id(args['custom_id'])

    file = spreadsheet.referencialSuppplierSpreadsheet
    if args['file']:
        if os.path.exists(args['file']):
            file = args['file']

    mime = mimetypes.guess_type(file)[0]
    CONTENT_SUPPLIER_SHEET = None
    EXISTING_MIME_TYPE = False
    if mime in ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']:
        CONTENT_SUPPLIER_SHEET = spreadsheet.read_excel_sheet(file)
        EXISTING_MIME_TYPE = True
    elif mime in ['application/vnd.oasis.opendocument.spreadsheet']:
        CONTENT_SUPPLIER_SHEET = spreadsheet.read_ods_sheet(file)
        EXISTING_MIME_TYPE = True
    elif mime in ['text/csv']:
        CONTENT_SUPPLIER_SHEET = spreadsheet.read_csv_sheet(file)
        EXISTING_MIME_TYPE = True

    if EXISTING_MIME_TYPE:
        spreadsheet.construct_supplier_array(CONTENT_SUPPLIER_SHEET)

        # Retrieve the list of existing suppliers in the database
        args = {
            'select': ['vat_number'],
            'table': ['accounts_supplier'],
            'where': ['vat_number <> %s'],
            'data': ['NULL']
        }
        list_existing_supplier = database.select(args)
        # Insert into database all the supplier not existing into the database
        for vat_number in spreadsheet.referencialSupplierData:
            if not any(str(vat_number)[:20] == value['vat_number'] for value in list_existing_supplier):
                args = {
                    'table': 'addresses',
                    'columns': {
                        'address1': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['address1']]),
                        'address2': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['address2']]),
                        'postal_code': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['addressPostalCode']]),
                        'city': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['addressTown']]),
                        'country': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['addressCountry']]),
                    }
                }

                address_id = database.insert(args)
                GET_ONLY_RAW_FOOTER = True
                if spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['get_only_raw_footer']] and \
                        spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['get_only_raw_footer']].lower() == 'true':
                    GET_ONLY_RAW_FOOTER = False

                args = {
                    'table': 'accounts_supplier',
                    'columns': {
                        'vat_number': str(vat_number)[:20],
                        'name': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['name']]),
                        'siren': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['SIREN']]),
                        'siret': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['SIRET']]),
                        'iban': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['IBAN']]),
                        'email': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['EMAIL']]),
                        'get_only_raw_footer': GET_ONLY_RAW_FOOTER,
                        'address_id': str(address_id),
                        'document_lang': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['doc_lang']]),
                        'duns': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['DUNS']]),
                        'bic': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['BIC']]),
                    }
                }
                res = database.insert(args)

                if res:
                    log.info('The following supplier was successfully added into database : ' +
                             str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['name']]))
                    if spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['positions_mask_id']]:
                        database.update({
                            'table': ['positions_masks'],
                            'set': {
                                'supplier_id': res
                            },
                            'where': ['id = %s'],
                            'data': [str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['positions_mask_id']])]
                        })
                else:
                    log.error('While adding supplier : ' +
                              str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['name']]), False)
            else:
                if vat_number:
                    current_supplier = database.select({
                        'select': ['id', 'address_id'],
                        'table': ['accounts_supplier'],
                        'where': ['vat_number = %s'],
                        'data': [str(vat_number)[:20]]
                    })[0]

                    GET_ONLY_RAW_FOOTER = True
                    if spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['get_only_raw_footer']].lower() == 'true':
                        GET_ONLY_RAW_FOOTER = False

                    args = {
                        'table': ['addresses'],
                        'set': {
                            'address1': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['address1']]),
                            'address2': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['address2']]),
                            'postal_code': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['addressPostalCode']]),
                            'city': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['addressTown']]),
                            'country': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['addressCountry']]),
                        },
                        'where': ['id = %s'],
                        'data': [current_supplier['address_id'] if current_supplier['address_id'] else 0]
                    }
                    if current_supplier['address_id']:
                        database.update(args)
                        address_id = current_supplier['address_id']
                    else:
                        args['columns'] = args['set']
                        args['table'] = args['table'][0]
                        del args['set']
                        del args['where']
                        del args['data']
                        address_id = database.insert(args)

                    args = {
                        'table': ['accounts_supplier'],
                        'set': {
                            'name': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['name']]),
                            'siren': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['SIREN']]),
                            'siret': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['SIRET']]),
                            'iban': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['IBAN']]),
                            'email': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['EMAIL']]),
                            'get_only_raw_footer': GET_ONLY_RAW_FOOTER,
                            'address_id': address_id,
                            'document_lang': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['doc_lang']]),
                            'duns': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['DUNS']]),
                            'bic': str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['BIC']]),
                        },
                        'where': ['vat_number = %s'],
                        'data': [str(vat_number)]
                    }
                    res = database.update(args)

                    if str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['positions_mask_id']]):
                        database.update({
                            'table': ['positions_masks'],
                            'set': {
                                'supplier_id': current_supplier['id']
                            },
                            'where': ['id = %s'],
                            'data': [str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['positions_mask_id']])]
                        })
                    if res[0]:
                        log.info('The following supplier was successfully updated into database : ' +
                                 str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['name']]))
                    else:
                        log.error('While updating supplier : ' +
                                  str(spreadsheet.referencialSupplierData[vat_number][0][spreadsheet.referencialSupplierArray['name']]), False)

        # Commit and close database connection
        database.conn.commit()
        database.conn.close()
