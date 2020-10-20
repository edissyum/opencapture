import mimetypes
import argparse
import os
import sys

from webApp.functions import get_custom_id, check_python_customized_files

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'Config' not in custom_array:
    from bin.src.classes.Config import Config as _Config
else:
    _Config = getattr(__import__(custom_array['Config']['path'] + '.' + custom_array['Config']['module'], fromlist=[custom_array['Config']['module']]), custom_array['Config']['module'])

if 'log' not in custom_array:
    from bin.src.classes.Log import Log as _Log
else:
    _Log = getattr(__import__(custom_array['Log']['path'] + '.' + custom_array['Log']['module'], fromlist=[custom_array['Log']['module']]), custom_array['Log']['module'])

if 'database' not in custom_array:
    from bin.src.classes.Database import Database as _Database
else:
    _Database = getattr(__import__(custom_array['Database']['path'] + '.' + custom_array['Database']['module'], fromlist=[custom_array['Database']['module']]), custom_array['Database']['module'])

if 'spreadsheet' not in custom_array:
    from bin.src.classes.Spreadsheet import Spreadsheet as _Spreadsheet
else:
    _Spreadsheet = getattr(__import__(custom_array['Spreadsheet']['path'] + '.' + custom_array['Spreadsheet']['module'], fromlist=[custom_array['Spreadsheet']['module']]),
                           custom_array['Spreadsheet']['module'])

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument("-c", "--config", required=True, help="path to config file")
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

    # Load the referencials into array before inject it into database
    # Read MIME type from file

    # TODO
    # Add the MIME type into a config file
    mime = mimetypes.guess_type(spreadsheet.referencialSuppplierSpreadsheet)[0]
    if mime in ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']:
        contentSupplierSheet = spreadsheet.read_excel_sheet(spreadsheet.referencialSuppplierSpreadsheet)
    else:
        contentSupplierSheet = spreadsheet.read_ods_sheet(spreadsheet.referencialSuppplierSpreadsheet)

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
                    'typology': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['typology']])
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
                    'typology': str(spreadsheet.referencialSupplierData[taxe_number][0][spreadsheet.referencialSupplierArray['typology']])
                },
                'where': ['vat_number = ?'],
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
