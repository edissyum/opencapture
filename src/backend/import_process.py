from .functions import get_custom_array

custom_array = get_custom_array()

if 'FindDate' not in custom_array:
    from src.backend.process.FindDate import FindDate
else:
    FindDate = getattr(__import__(custom_array['FindDate']['path'] + '.' + custom_array['FindDate']['module'],
                                  fromlist=[custom_array['FindDate']['module']]), custom_array['FindDate']['module'])

if 'FindFooter' not in custom_array:
    from src.backend.process.FindFooter import FindFooter
else:
    FindFooter = getattr(__import__(custom_array['FindFooter']['path'] + '.' + custom_array['FindFooter']['module'],
                                    fromlist=[custom_array['FindFooter']['module']]), custom_array['FindFooter']['module'])

if 'FindSupplier' not in custom_array:
    from src.backend.process.FindSupplier import FindSupplier
else:
    FindSupplier = getattr(__import__(custom_array['FindSupplier']['path'] + '.' +
                                      custom_array['FindSupplier']['module'],
                                      fromlist=[custom_array['FindSupplier']['module']]), custom_array['FindSupplier']['module'])

if 'FindCustom' not in custom_array:
    from src.backend.process.FindCustom import FindCustom
else:
    FindSupplier = getattr(__import__(custom_array['FindCustom']['path'] + '.' + custom_array['FindCustom']['module'],
                                      fromlist=[custom_array['FindCustom']['module']]), custom_array['FindCustom']['module'])

if 'FindInvoiceNumber' not in custom_array:
    from src.backend.process.FindInvoiceNumber import FindInvoiceNumber
else:
    FindInvoiceNumber = getattr(__import__(custom_array['FindInvoiceNumber']['path'] + '.' +
                                           custom_array['FindInvoiceNumber']['module'],
                                           fromlist=[custom_array['FindInvoiceNumber']['module']]), custom_array['FindInvoiceNumber']['module'])

if 'OCForInvoices_splitter' not in custom_array:
    from src.backend.process import OCForInvoices_splitter
else:
    OCForInvoices_splitter = getattr(__import__(custom_array['OCForInvoices_splitter']['path'],
                                                fromlist=[custom_array['OCForInvoices_splitter']['module']]), custom_array['OCForInvoices_splitter']['module'])

if 'FindDeliveryNumber' not in custom_array:
    from src.backend.process.FindDeliveryNumber import FindDeliveryNumber
else:
    FindDeliveryNumber = getattr(__import__(custom_array['FindDeliveryNumber']['path'] + '.' + custom_array['FindDeliveryNumber']['module'], fromlist=[custom_array['FindDeliveryNumber']['module']]),
                                 custom_array['FindDeliveryNumber']['module'])

if 'FindOrderNumber' not in custom_array:
    from src.backend.process.FindOrderNumber import FindOrderNumber
else:
    FindOrderNumber = getattr(__import__(custom_array['FindOrderNumber']['path'] + '.' + custom_array['FindOrderNumber']['module'], fromlist=[custom_array['FindOrderNumber']['module']]),
                              custom_array['FindOrderNumber']['module'])

if 'FindFooterRaw' not in custom_array:
    from src.backend.process.FindFooterRaw import FindFooterRaw
else:
    FindFooterRaw = getattr(__import__(custom_array['FindFooterRaw']['path'] + '.' + custom_array['FindFooterRaw']['module'], fromlist=[custom_array['FindFooterRaw']['module']]),
                              custom_array['FindFooterRaw']['module'])