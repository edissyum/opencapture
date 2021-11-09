from .functions import get_custom_array

custom_array = get_custom_array()

if 'config' or 'classes' not in custom_array['Config']['path']:
    from .classes.Config import Config as _Config
elif 'classes' in custom_array['Config']['path']:
    _Config = getattr(__import__(custom_array['Config']['path'] + '.' + custom_array['coConfigConfigig']['module'],
                                 fromlist=[custom_array['Config']['module']]), custom_array['Config']['module'])

if 'log' or 'classes' not in custom_array['Log']['path']:
    from .classes.Log import Log as _Log
elif 'classes' in custom_array['Log']['path']:
    _Log = getattr(__import__(custom_array['Log']['path'] + '.' + custom_array['Log']['module'],
                              fromlist=[custom_array['Log']['module']]), custom_array['Log']['module'])


if 'mail' or 'classes' not in custom_array['Mail']['path']:
    from .classes.Mail import Mail as _Mail
elif 'classes' in custom_array['Mail']['path']:
    _Mail = getattr(__import__(custom_array['Mail']['path'] + '.' + custom_array['Mail']['module'],
                              fromlist=[custom_array['Mail']['module']]), custom_array['Mail']['module'])

if 'files' or 'classes' not in custom_array['Files']['path']:
    from .classes.Files import Files as _Files
elif 'classes' in custom_array['Files']['path']:
    _Files = getattr(__import__(custom_array['Files']['path'] + '.' + custom_array['Files']['module'],
                                fromlist=[custom_array['Files']['module']]), custom_array['Files']['module'])

if 'MaarchWebServices' or 'classes' not in custom_array['MaarchWebServices']['path']:
    from .classes.MaarchWebServices import MaarchWebServices as _MaarchWebServices
elif 'classes' in custom_array['MaarchWebServices']['path']:
    _MaarchWebServices = getattr(__import__(custom_array['MaarchWebServices']['path'] + '.' + custom_array['MaarchWebServices']['module'],
                                      fromlist=[custom_array['MaarchWebServices']['module']]),
                           custom_array['MaarchWebServices']['module'])

if 'locale' or 'classes' not in custom_array['Locale']['path']:
    from .classes.Locale import Locale as _Locale
elif 'classes' in custom_array['Locale']['path']:
    _Locale = getattr(__import__(custom_array['Locale']['path'] + '.' + custom_array['Locale']['module'],
                                 fromlist=[custom_array['Locale']['module']]), custom_array['Locale']['module'])

if 'PyTesseract' or 'classes' not in custom_array['PyTesseract']['path']:
    from .classes.PyTesseract import PyTesseract as _PyTesseract
elif 'classes' in custom_array['PyTesseract']['path']:
    _PyTesseract = getattr(__import__(custom_array['PyTesseract']['path'] + '.' + custom_array['PyTesseract']['module'],
                                      fromlist=[custom_array['PyTesseract']['module']]),
                           custom_array['PyTesseract']['module'])

if 'database' or 'classes' not in custom_array['Database']['path']:
    from .classes.Database import Database as _Database
elif 'classes' in custom_array['Database']['path']:
    _Database = getattr(__import__(custom_array['Database']['path'] + '.' + custom_array['Database']['module'],
                                   fromlist=[custom_array['Database']['module']]), custom_array['Database']['module'])

# if 'invoice_classification' or 'classes' not in custom_array['invoice_classification']['path']:
#     from .invoice_classification import invoice_classification
# elif 'classes' in custom_array['invoice_classification']['path']:
#     invoice_classification = getattr(__import__(custom_array['invoice_classification']['path'],
#                                                 fromlist=[custom_array['invoice_classification']['module']]),
#                                      custom_array['invoice_classification']['module'])

if 'Splitter' or 'classes' not in custom_array['Splitter']['path']:
    from .classes.Splitter import Splitter as _Splitter
elif 'classes' in custom_array['Splitter']['path']:
    _Splitter = getattr(__import__(custom_array['Splitter']['path'] + '.' + custom_array['Splitter']['module'],
                                   fromlist=[custom_array['Splitter']['module']]), custom_array['Splitter']['module'])

if 'CMIS' not in custom_array or 'CMIS' not in custom_array['SeparatorQR']['path']:
    from src.backend.classes.CMIS import CMIS as _CMIS
else:
    _CMIS = getattr(__import__(custom_array['CMIS']['path'] + '.' + custom_array['CMIS']['module'],
                                   fromlist=[custom_array['CMIS']['module']]), custom_array['CMIS']['module'])

if 'SeparatorQR' or 'classes' not in custom_array['SeparatorQR']['path']:
    from .classes.SeparatorQR import SeparatorQR as _SeparatorQR
elif 'classes' in custom_array['SeparatorQR']['path']:
    SeparatorQR = getattr(__import__(custom_array['SeparatorQR']['path'] + '.' + custom_array['SeparatorQR']['module'],
                                   fromlist=[custom_array['SeparatorQR']['module']]), custom_array['SeparatorQR']['module'])

if 'Spreadsheet' or 'classes' not in custom_array['Spreadsheet']['path']:
    from .classes.Spreadsheet import Spreadsheet as _Spreadsheet
elif 'classes' in custom_array['Spreadsheet']['path']:
    _Spreadsheet = getattr(__import__(custom_array['Spreadsheet']['path'] + '.' + custom_array['Spreadsheet']['module'],
                                      fromlist=[custom_array['Spreadsheet']['module']]), custom_array['Spreadsheet']['module'])

if 'SMTP' or 'classes' not in custom_array['SMTP']['path']:
    from .classes.SMTP import SMTP as _SMTP
elif 'classes' in custom_array['SMTP']['path']:
    _SMTP = getattr(__import__(custom_array['SMTP']['path'] + '.' + custom_array['SMTP']['module'],
                                      fromlist=[custom_array['SMTP']['module']]), custom_array['SMTP']['module'])
