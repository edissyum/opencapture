from src.backend.functions import get_custom_id, check_python_customized_files

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'FindDate' not in custom_array:
    from src.backend.process.FindDate import FindDate
else:
    FindDate = getattr(__import__(custom_array['FindDate']['path'] + '.' + custom_array['FindDate']['module'],
                                  fromlist=[custom_array['FindDate']['module']]), custom_array['FindDate']['module'])

if 'FindFooter' not in custom_array:
    from src.backend.process.FindFooter import FindFooter
else:
    FindFooter = getattr(__import__(custom_array['FindFooter']['path'] + '.' + custom_array['FindFooter']['module'],
                                    fromlist=[custom_array['FindFooter']['module']]),
                         custom_array['FindFooter']['module'])

if 'FindSupplier' not in custom_array:
    from src.backend.process.FindSupplier import FindSupplier
else:
    FindSupplier = getattr(__import__(custom_array['FindSupplier']['path'] + '.' +
                                      custom_array['FindSupplier']['module'],
                                      fromlist=[custom_array['FindSupplier']['module']]),
                           custom_array['FindSupplier']['module'])

if 'FindCustom' not in custom_array:
    from src.backend.process.FindCustom import FindCustom
else:
    FindSupplier = getattr(__import__(custom_array['FindCustom']['path'] + '.' + custom_array['FindCustom']['module'],
                                      fromlist=[custom_array['FindCustom']['module']]),
                           custom_array['FindCustom']['module'])

if 'FindInvoiceNumber' not in custom_array:
    from src.backend.process.FindInvoiceNumber import FindInvoiceNumber
else:
    FindInvoiceNumber = getattr(__import__(custom_array['FindInvoiceNumber']['path'] + '.' +
                                           custom_array['FindInvoiceNumber']['module'],
                                           fromlist=[custom_array['FindInvoiceNumber']['module']]),
                                custom_array['FindInvoiceNumber']['module'])

if 'OCForInvoices_splitter' not in custom_array:
    from src.backend.process import OCForInvoices_splitter
else:
    OCForInvoices_splitter = getattr(__import__(custom_array['OCForInvoices_splitter']['path'],
                                                fromlist=[custom_array['OCForInvoices_splitter']['module']]),
                                     custom_array['OCForInvoices_splitter']['module'])

if 'OCForInvoices' not in custom_array:
    from src.backend.process import OCForInvoices as OCForInvoices_process
else:
    OCForInvoices_process = getattr(__import__(custom_array['OCForInvoices']['path'],
                                               fromlist=[custom_array['OCForInvoices']['module']]),
                                    custom_array['OCForInvoices']['module'])

if 'Spreadsheet' not in custom_array:
    from src.backend.classes.Spreadsheet import Spreadsheet as _Spreadsheet
else:
    _Spreadsheet = getattr(__import__(custom_array['Spreadsheet']['path'] + '.' + custom_array['Spreadsheet']['module'],
                                      fromlist=[custom_array['Spreadsheet']['module']]),
                           custom_array['Spreadsheet']['module'])
