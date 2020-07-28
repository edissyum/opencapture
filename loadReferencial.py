import mimetypes
import argparse
import bin.src.classes.Log as logClass
import bin.src.classes.Config as configClass
import bin.src.classes.Database as databaseClass
import bin.src.classes.Spreadsheet as spreadsheetClass

from webApp.functions import get_custom_id, check_python_customized_files
custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'pdf' not in custom_array: from webApp import pdf
else: pdf = getattr(__import__(custom_array['pdf']['path'], fromlist=[custom_array['pdf']['module']]), custom_array['pdf']['module'])

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument("-c", "--config", required=False, help="path to config file")
    args = vars(ap.parse_args())

    configName          = configClass.Config(args['config'])
    Config              = configClass.Config(configName.cfg['PROFILE']['cfgpath'] + '/config_' + configName.cfg['PROFILE']['id'] + '.ini')
    Log                 = logClass.Log(Config.cfg['GLOBAL']['logfile'])
    Spreadsheet         = spreadsheetClass.Spreadsheet(Log, Config)
    dbType              = Config.cfg['DATABASE']['databasetype']
    dbUser              = Config.cfg['DATABASE']['postgresuser']
    dbPwd               = Config.cfg['DATABASE']['postgrespassword']
    dbname              = Config.cfg['DATABASE']['postgresdatabase']
    dbhost              = Config.cfg['DATABASE']['postgreshost']
    dbport              = Config.cfg['DATABASE']['postgresport']
    Database            = databaseClass.Database(Log, dbType, dbname, dbUser, dbPwd, dbhost, dbport, Config.cfg['DATABASE']['databasefile'])
    # Connect to database
    Database.connect()

    # Load the referencials into array before inject it into database
    # Read MIME type from file

    #TODO
        # Add the MIME type into a config file
    mime = mimetypes.guess_type(Spreadsheet.referencialSuppplierSpreadsheet)[0]
    if mime in ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']:
        contentSupplierSheet    = Spreadsheet.read_excel_sheet(Spreadsheet.referencialSuppplierSpreadsheet)
    else:
        contentSupplierSheet = Spreadsheet.read_ods_sheet(Spreadsheet.referencialSuppplierSpreadsheet)

    Spreadsheet.construct_supplier_array(contentSupplierSheet)

    # Retrieve the list of existing suppliers in the database
    args = {
        'select'    : ['vat_number'],
        'table'     : ['suppliers'],
    }
    listOfExistingSupplier = Database.select(args)

    # Insert into database all the supplier not existing into the database
    for taxeNumber in Spreadsheet.referencialSupplierData:
        if not any(str(taxeNumber) in value['vat_number'] for value in listOfExistingSupplier):
            args = {
                'table': 'suppliers',
                'columns': {
                    'vat_number': str(taxeNumber),
                    'name': str(Spreadsheet.referencialSupplierData[taxeNumber][0][Spreadsheet.referencialSupplierArray['name']]),
                    'siren': str(Spreadsheet.referencialSupplierData[taxeNumber][0][Spreadsheet.referencialSupplierArray['SIREN']]),
                    'siret': str(Spreadsheet.referencialSupplierData[taxeNumber][0][Spreadsheet.referencialSupplierArray['SIRET']]),
                    'adress1': str(Spreadsheet.referencialSupplierData[taxeNumber][0][Spreadsheet.referencialSupplierArray['adress1']]),
                    'adress2': str(Spreadsheet.referencialSupplierData[taxeNumber][0][Spreadsheet.referencialSupplierArray['adress2']]),
                    'postal_code': str(Spreadsheet.referencialSupplierData[taxeNumber][0][Spreadsheet.referencialSupplierArray['adressPostalCode']]),
                    'city': str(Spreadsheet.referencialSupplierData[taxeNumber][0][Spreadsheet.referencialSupplierArray['adressTown']]),
                }
            }
            res = Database.insert(args)
            if res:
                Log.info('The following supplier was successfully added into database : ' +
                            str(Spreadsheet.referencialSupplierData[taxeNumber][0][Spreadsheet.referencialSupplierArray['name']]))
            else:
                Log.error('While adding supplier : ' +
                            str(Spreadsheet.referencialSupplierData[taxeNumber][0][Spreadsheet.referencialSupplierArray['name']]))
        else:
            args = {
                'table': ['suppliers'],
                'set': {
                    'name': str(Spreadsheet.referencialSupplierData[taxeNumber][0][Spreadsheet.referencialSupplierArray['name']]),
                    'siren': str(Spreadsheet.referencialSupplierData[taxeNumber][0][Spreadsheet.referencialSupplierArray['SIREN']]),
                    'siret': str(Spreadsheet.referencialSupplierData[taxeNumber][0][Spreadsheet.referencialSupplierArray['SIRET']]),
                    'adress1': str(Spreadsheet.referencialSupplierData[taxeNumber][0][Spreadsheet.referencialSupplierArray['adress1']]),
                    'adress2': str(Spreadsheet.referencialSupplierData[taxeNumber][0][Spreadsheet.referencialSupplierArray['adress2']]),
                    'postal_code': str(Spreadsheet.referencialSupplierData[taxeNumber][0][Spreadsheet.referencialSupplierArray['adressPostalCode']]),
                    'city': str(Spreadsheet.referencialSupplierData[taxeNumber][0][Spreadsheet.referencialSupplierArray['adressTown']]),
                },
                'where' : ['vat_number = ?'],
                'data' : [taxeNumber]
            }
            res = Database.update(args)
            if res[0]:
                Log.info('The following supplier was successfully updated into database : ' +
                            str(Spreadsheet.referencialSupplierData[taxeNumber][0][Spreadsheet.referencialSupplierArray['name']]))
            else:
                Log.error('While updating supplier : ' +
                            str(Spreadsheet.referencialSupplierData[taxeNumber][0][Spreadsheet.referencialSupplierArray['name']]))

    # Commit and close database connection
    Database.conn.commit()
    Database.conn.close()