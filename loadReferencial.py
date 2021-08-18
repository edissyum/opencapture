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

import os
import sys
import argparse
import mimetypes
from src.backend.import_classes import _Config, _Log, _Database, _Spreadsheet


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument("-c", "--config", required=True, help="path to config file")
    ap.add_argument("-f", "--file", required=False, help="path to referential file")
    args = vars(ap.parse_args())

    if not os.path.exists(args['config']):
        sys.exit('Config file couldn\'t be found')

    config_name = _Config(args['config'])
    config = _Config(config_name.cfg['PROFILE']['cfgpath'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini')
    log = _Log(config.cfg['GLOBAL']['logfile'])
    spreadsheet = _Spreadsheet(log, config)
    db_type = config.cfg['DATABASE']['databasetype']
    db_user = config.cfg['DATABASE']['postgresuser']
    db_pwd = config.cfg['DATABASE']['postgrespassword']
    db_name = config.cfg['DATABASE']['postgresdatabase']
    db_host = config.cfg['DATABASE']['postgreshost']
    db_port = config.cfg['DATABASE']['postgresport']
    database = _Database(log, db_type, db_name, db_user, db_pwd, db_host, db_port, config.cfg['DATABASE']['databasefile'])

    file = spreadsheet.referencialSuppplierSpreadsheet
    if args['file']:
        if os.path.exists(args['file']):
            file = args['file']

    mime = mimetypes.guess_type(file)[0]
    contentSupplierSheet = None
    existingMimeType = False
    if mime in ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']:
        contentSupplierSheet = spreadsheet.read_excel_sheet(file)
        existingMimeType = True
    elif mime in ['application/vnd.oasis.opendocument.spreadsheet']:
        contentSupplierSheet = spreadsheet.read_ods_sheet(file)
        existingMimeType = True
    elif mime in ['text/csv']:
        contentSupplierSheet = spreadsheet.read_csv_sheet(file)
        existingMimeType = True

    if existingMimeType:
        spreadsheet.construct_supplier_array(contentSupplierSheet)

        # Retrieve the list of existing suppliers in the database
        args = {
            'select': ['vat_number'],
            'table': ['suppliers'],
        }
        list_existing_supplier = database.select(args)
        # Insert into database all the supplier not existing into the database
        for taxe_number in spreadsheet.referencialSupplierData:
            if not any(str(taxe_number) in value['vat_number'] for value in list_existing_supplier):
                args = {
                    'table': 'suppliers',
                    'columns': {
                        'vat_number': str(taxe_number),
                        'name': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['name']]),
                        'siren': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['SIREN']]),
                        'siret': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['SIRET']]),
                        'adress1': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['adress1']]),
                        'adress2': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['adress2']]),
                        'postal_code': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['adressPostalCode']]),
                        'city': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['adressTown']]),
                        'typology': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['typology']]),
                    }
                }
                res = database.insert(args)
                if res:
                    log.info('The following supplier was successfully added into database : ' +
                             str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['name']]))
                else:
                    log.error('While adding supplier : ' +
                              str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['name']]))
            else:
                company_type = str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['companyType']])
                args = {
                    'table': ['suppliers'],
                    'set': {
                        'name': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['name']]),
                        'siren': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['SIREN']]),
                        'siret': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['SIRET']]),
                        'adress1': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['adress1']]),
                        'adress2': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['adress2']]),
                        'postal_code': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['adressPostalCode']]),
                        'city': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['adressTown']]),
                        'typology': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['typology']]),
                    },
                    'where': ['vat_number = %s'],
                    'data': [taxe_number]
                }
                res = database.update(args)
                if res[0]:
                    log.info('The following supplier was successfully updated into database : ' +
                             str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['name']]))
                else:
                    log.error('While updating supplier : ' +
                              str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['name']]))

        # Commit and close database connection
        database.conn.commit()
        database.conn.close()
