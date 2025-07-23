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

    file = spreadsheet.referencial_supplier_spreadsheet
    if args['file'] and os.path.exists(args['file']):
        file = args['file']

    mime = mimetypes.guess_type(file)[0]
    CONTENT_SUPPLIER_SHEET = None
    EXISTING_MIME_TYPE = False
    if mime in ['text/csv']:
        CONTENT_SUPPLIER_SHEET = spreadsheet.read_csv_sheet(file)
        EXISTING_MIME_TYPE = True

    if CONTENT_SUPPLIER_SHEET.empty:
        log.error('The file ' + file + ' is empty or not not well formatted')
        exit()

    if EXISTING_MIME_TYPE:
        spreadsheet.construct_supplier_array(CONTENT_SUPPLIER_SHEET)

        # Retrieve the list of existing suppliers in the database
        list_existing_supplier_args = {
            'select': ['vat_number', 'duns'],
            'table': ['accounts_supplier'],
            'where': ['vat_number <> %s OR duns <> %s'],
            'data': ['NULL', 'NULL']
        }
        list_existing_supplier = database.select(list_existing_supplier_args)
        for value in list_existing_supplier:
            if 'duns' not in value or not value['duns']:
                value['duns'] = ''
            if 'vat_number' not in value or not value['vat_number']:
                value['vat_number'] = ''

        # Insert into database all the supplier not existing into the database
        count = 0
        log.info("Line to process : " +  str(len(spreadsheet.referencial_supplier_data)))
        for data in spreadsheet.referencial_supplier_data:
            count = count + 1
            vat_number = data[spreadsheet.referencial_supplier_array['vat_number']]
            duns = data[spreadsheet.referencial_supplier_array['duns']]

            if vat_number != vat_number:
                vat_number = None

            if duns != duns:
                duns = None

            if not vat_number and not duns:
                log.error('The following supplier has no VAT number nor DUNS : ' +
                          str(data[spreadsheet.referencial_supplier_array['name']]))
                continue

            vat_number_exists = vat_number and any(str(vat_number) == value['vat_number'] for value in list_existing_supplier)
            duns_exists = duns and any(str(duns) == value['duns'] and value['duns'] for value in list_existing_supplier)

            if not vat_number_exists and not duns_exists:
                args = {
                    'table': 'addresses',
                    'columns': {
                        'address1': str(data[spreadsheet.referencial_supplier_array['address1']]),
                        'address2': str(data[spreadsheet.referencial_supplier_array['address2']]),
                        'postal_code': str(data[spreadsheet.referencial_supplier_array['postal_code']]),
                        'city': str(data[spreadsheet.referencial_supplier_array['city']]),
                        'country': str(data[spreadsheet.referencial_supplier_array['country']])
                    }
                }

                address_length = len(args['columns'])
                cpt_null = 0
                for key in args['columns']:
                    if args['columns'][key] == 'nan':
                        args['columns'][key] = None
                        cpt_null += 1

                address_id = 0
                if cpt_null < address_length:
                    address_id = database.insert(args)

                GET_ONLY_RAW_FOOTER = True
                if data[spreadsheet.referencial_supplier_array['get_only_raw_footer']] and \
                        (data[spreadsheet.referencial_supplier_array['get_only_raw_footer']] or
                        data[spreadsheet.referencial_supplier_array['get_only_raw_footer']].lower() == 'true'):
                    GET_ONLY_RAW_FOOTER = False

                _vat = data
                args = {
                    'table': 'accounts_supplier',
                    'columns': {
                        'vat_number': str(vat_number)[:20] if vat_number else None,
                        'name': str(_vat[spreadsheet.referencial_supplier_array['name']]),
                        'siren': str(_vat[spreadsheet.referencial_supplier_array['siren']]),
                        'siret': str(_vat[spreadsheet.referencial_supplier_array['siren']]),
                        'iban': str(_vat[spreadsheet.referencial_supplier_array['iban']]),
                        'email': str(_vat[spreadsheet.referencial_supplier_array['email']]),
                        'get_only_raw_footer': GET_ONLY_RAW_FOOTER,
                        'address_id': str(address_id),
                        'document_lang': str(_vat[spreadsheet.referencial_supplier_array['lang']]),
                        'duns': str(_vat[spreadsheet.referencial_supplier_array['duns']]),
                        'bic': str(_vat[spreadsheet.referencial_supplier_array['bic']]),
                        'default_currency': str(_vat[spreadsheet.referencial_supplier_array['default_currency']])
                    }
                }

                for key in args['columns']:
                    if args['columns'][key] == 'nan':
                        args['columns'][key] = None

                if 'name' in args['columns'] and args['columns']['name']:
                    try:
                        res = database.insert(args)
                    except Exception as _e:
                        log.error('While adding supplier : ' + str(data[spreadsheet.referencial_supplier_array['name']]) + ' ' + str(_e))
                        continue

                    list_existing_supplier.append({'vat_number': vat_number, 'duns': duns})

                    if res:
                        log.info('The following supplier was successfully added into database : ' +
                                 str(data[spreadsheet.referencial_supplier_array['name']]))
                        log.info('' + str(count) + 'lines added/updated')

                else:
                        log.error('While adding supplier : ' +
                              str(data[spreadsheet.referencial_supplier_array['name']]), False)
            else:
                if vat_number or duns:
                    current_supplier = database.select({
                        'select': ['id', 'address_id'],
                        'table': ['accounts_supplier'],
                        'where': ['vat_number = %s OR duns = %s'],
                        'data': [str(vat_number)[:20], str(duns)]
                    })[0]

                    GET_ONLY_RAW_FOOTER = True
                    if data[spreadsheet.referencial_supplier_array['get_only_raw_footer']] and \
                            (data[spreadsheet.referencial_supplier_array['get_only_raw_footer']] or
                             data[spreadsheet.referencial_supplier_array['get_only_raw_footer']].lower() == 'true'):
                        GET_ONLY_RAW_FOOTER = False

                    args = {
                        'table': ['addresses'],
                        'set': {
                            'address1': str(data[spreadsheet.referencial_supplier_array['address1']]),
                            'address2': str(data[spreadsheet.referencial_supplier_array['address2']]),
                            'postal_code': str(data[spreadsheet.referencial_supplier_array['postal_code']]),
                            'city': str(data[spreadsheet.referencial_supplier_array['city']]),
                            'country': str(data[spreadsheet.referencial_supplier_array['country']])
                        },
                        'where': ['id = %s'],
                        'data': [current_supplier['address_id'] if current_supplier['address_id'] else 0]
                    }

                    cpt_none = 0
                    for key in args['set']:
                        if args['set'][key] == 'nan':
                            args['set'][key] = None
                            cpt_none += 1
                        elif args['set'][key] is None:
                            cpt_none += 1

                    address_id = 0

                    if cpt_none < len(args['set']):
                        if current_supplier['address_id']:
                            database.update(args)
                            address_id = current_supplier['address_id']
                        else:
                            args['columns'] = args['set']
                            args['table'] = args['table'][0]
                            del args['set']
                            del args['data']
                            del args['where']
                            address_id = database.insert(args)

                    args = {
                        'table': ['accounts_supplier'],
                        'set': {
                            'vat_number': str(vat_number)[:20] if vat_number else None,
                            'name': str(data[spreadsheet.referencial_supplier_array['name']]),
                            'siren': str(data[spreadsheet.referencial_supplier_array['siren']]),
                            'siret': str(data[spreadsheet.referencial_supplier_array['siret']]),
                            'iban': str(data[spreadsheet.referencial_supplier_array['iban']]),
                            'email': str(data[spreadsheet.referencial_supplier_array['email']]),
                            'get_only_raw_footer': GET_ONLY_RAW_FOOTER,
                            'address_id': address_id,
                            'document_lang': str(data[spreadsheet.referencial_supplier_array['lang']]),
                            'duns': str(data[spreadsheet.referencial_supplier_array['duns']]),
                            'bic': str(data[spreadsheet.referencial_supplier_array['bic']]),
                            'default_currency': str(data[spreadsheet.referencial_supplier_array['default_currency']])
                        },
                        'where': ['vat_number = %s OR duns = %s'],
                        'data': [str(vat_number), str(duns)]
                    }

                    for key in args['set']:
                        if args['set'][key] == 'nan':
                            args['set'][key] = None
                    try:
                        res = database.update(args)
                    except Exception as _e:
                        log.error('While updating supplier : ' + str(data[spreadsheet.referencial_supplier_array['name']]) + ' ' + str(_e))
                        continue

                    if res[0]:
                        log.info('The following supplier was successfully updated into database : (' + str(current_supplier['id']) + ') ' +
                                 str(data[spreadsheet.referencial_supplier_array['name']]))
                        log.info(str(count) + ' line(s) created/updated')
                    else:
                        log.error('While updating supplier : ' +
                                  str(data[spreadsheet.referencial_supplier_array['name']]), False)

        # Commit and close database connection
        database.conn.commit()
        database.conn.close()
