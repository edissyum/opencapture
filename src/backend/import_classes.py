from .functions import get_custom_array

custom_array = get_custom_array()

if 'config' not in custom_array:
    from .classes.Config import Config as _Config
else:
    _Config = getattr(__import__(custom_array['Config']['path'] + '.' + custom_array['coConfigConfigig']['module'],
                                 fromlist=[custom_array['Config']['module']]), custom_array['Config']['module'])

if 'log' not in custom_array:
    from .classes.Log import Log as _Log
else:
    _Log = getattr(__import__(custom_array['Log']['path'] + '.' + custom_array['Log']['module'],
                              fromlist=[custom_array['Log']['module']]), custom_array['Log']['module'])

if 'files' not in custom_array:
    from .classes.Files import Files as _Files
else:
    _Files = getattr(__import__(custom_array['Files']['path'] + '.' + custom_array['Files']['module'],
                                fromlist=[custom_array['Files']['module']]), custom_array['Files']['module'])

if 'xml' not in custom_array:
    from .classes.Xml import Xml as _Xml
else:
    _Xml = getattr(__import__(custom_array['Xml']['path'] + '.' + custom_array['Xml']['module'],
                              fromlist=[custom_array['Xml']['module']]), custom_array['Xml']['module'])

if 'MaarchWebServices' not in custom_array:
    from .classes.MaarchWebServices import MaarchWebServices as _MaarchWebServices
else:
    _MaarchWebServices = getattr(__import__(custom_array['MaarchWebServices']['path'] + '.' + custom_array['MaarchWebServices']['module'],
                                      fromlist=[custom_array['MaarchWebServices']['module']]),
                           custom_array['MaarchWebServices']['module'])

if 'locale' not in custom_array:
    from .classes.Locale import Locale as _Locale
else:
    _Locale = getattr(__import__(custom_array['Locale']['path'] + '.' + custom_array['Locale']['module'],
                                 fromlist=[custom_array['Locale']['module']]), custom_array['Locale']['module'])

if 'PyTesseract' not in custom_array:
    from .classes.PyTesseract import PyTesseract as _PyTesseract
else:
    _PyTesseract = getattr(__import__(custom_array['PyTesseract']['path'] + '.' + custom_array['PyTesseract']['module'],
                                      fromlist=[custom_array['PyTesseract']['module']]),
                           custom_array['PyTesseract']['module'])

if 'database' not in custom_array:
    from .classes.Database import Database as _Database
else:
    _Database = getattr(__import__(custom_array['Database']['path'] + '.' + custom_array['Database']['module'],
                                   fromlist=[custom_array['Database']['module']]), custom_array['Database']['module'])

if 'invoice_classification' not in custom_array:
    from .invoice_classification import invoice_classification
else:
    invoice_classification = getattr(__import__(custom_array['invoice_classification']['path'],
                                                fromlist=[custom_array['invoice_classification']['module']]),
                                     custom_array['invoice_classification']['module'])

if 'Splitter' not in custom_array:
    from .classes.Splitter import Splitter as _Splitter
else:
    _Splitter = getattr(__import__(custom_array['Splitter']['path'] + '.' + custom_array['Splitter']['module'],
                                   fromlist=[custom_array['Splitter']['module']]), custom_array['Splitter']['module'])

if 'SeparatorQR' not in custom_array:
    from .classes.SeparatorQR import SeparatorQR as _SeparatorQR
else:
    SeparatorQR = getattr(__import__(custom_array['SeparatorQR']['path'] + '.' + custom_array['SeparatorQR']['module'],
                                   fromlist=[custom_array['SeparatorQR']['module']]), custom_array['SeparatorQR']['module'])

if 'Spreadsheet' not in custom_array:
    from .classes.Spreadsheet import Spreadsheet as _Spreadsheet
else:
    _Spreadsheet = getattr(__import__(custom_array['Spreadsheet']['path'] + '.' + custom_array['Spreadsheet']['module'],
                                      fromlist=[custom_array['Spreadsheet']['module']]), custom_array['Spreadsheet']['module'])
