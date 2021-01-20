from webApp.functions import get_custom_id, check_python_customized_files

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'config' not in custom_array:
    from src.backend.classes.Config import Config as _Config
else:
    _Config = getattr(__import__(custom_array['Config']['path'] + '.' + custom_array['coConfigConfigig']['module'],
                                 fromlist=[custom_array['Config']['module']]), custom_array['Config']['module'])

if 'log' not in custom_array:
    from src.backend.classes.Log import Log as _Log
else:
    _Log = getattr(__import__(custom_array['Log']['path'] + '.' + custom_array['Log']['module'],
                              fromlist=[custom_array['Log']['module']]), custom_array['Log']['module'])

if 'files' not in custom_array:
    from src.backend.classes.Files import Files as _Files
else:
    _Files = getattr(__import__(custom_array['Files']['path'] + '.' + custom_array['Files']['module'],
                                fromlist=[custom_array['Files']['module']]), custom_array['Files']['module'])

if 'xml' not in custom_array:
    from src.backend.classes.Xml import Xml as _Xml
else:
    _Xml = getattr(__import__(custom_array['Xml']['path'] + '.' + custom_array['Xml']['module'],
                              fromlist=[custom_array['Xml']['module']]), custom_array['Xml']['module'])

if 'webservices' not in custom_array:
    from src.backend.classes.WebServices import WebServices as _WebServices
else:
    _WebServices = getattr(__import__(custom_array['WebServices']['path'] + '.' + custom_array['WebServices']['module'],
                                      fromlist=[custom_array['WebServices']['module']]),
                           custom_array['WebServices']['module'])

if 'locale' not in custom_array:
    from src.backend.classes.Locale import Locale as _Locale
else:
    _Locale = getattr(__import__(custom_array['Locale']['path'] + '.' + custom_array['Locale']['module'],
                                 fromlist=[custom_array['Locale']['module']]), custom_array['Locale']['module'])

if 'PyTesseract' not in custom_array:
    from src.backend.classes.PyTesseract import PyTesseract as _PyTesseract
else:
    _PyTesseract = getattr(__import__(custom_array['PyTesseract']['path'] + '.' + custom_array['PyTesseract']['module'],
                                      fromlist=[custom_array['PyTesseract']['module']]),
                           custom_array['PyTesseract']['module'])

if 'database' not in custom_array:
    from src.backend.classes.Database import Database as _Database
else:
    _Database = getattr(__import__(custom_array['Database']['path'] + '.' + custom_array['Database']['module'],
                                   fromlist=[custom_array['Database']['module']]), custom_array['Database']['module'])

if 'invoice_classification' not in custom_array:
    from src.backend.invoice_classification import invoice_classification
else:
    invoice_classification = getattr(__import__(custom_array['invoice_classification']['path'],
                                                fromlist=[custom_array['invoice_classification']['module']]),
                                     custom_array['invoice_classification']['module'])

if 'Splitter' not in custom_array:
    from src.backend.classes.Splitter import Splitter as _Splitter
else:
    _Splitter = getattr(__import__(custom_array['Splitter']['path'] + '.' + custom_array['Splitter']['module'],
                                   fromlist=[custom_array['Splitter']['module']]), custom_array['Splitter']['module'])

if 'Spreadsheet' not in custom_array:
    from src.backend.classes.Spreadsheet import Spreadsheet as _Spreadsheet
else:
    _Spreadsheet = getattr(__import__(custom_array['Spreadsheet']['path'] + '.' + custom_array['Spreadsheet']['module'],
                                      fromlist=[custom_array['Spreadsheet']['module']]),
                           custom_array['Spreadsheet']['module'])
