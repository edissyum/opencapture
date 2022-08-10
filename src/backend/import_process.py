from .functions import get_custom_array

custom_array = get_custom_array()

if 'FindDate' or 'process' not in custom_array['FindDate']['path']:
    from src.backend.process.FindDate import FindDate
elif 'process' in custom_array['FindDate']['path']:
    FindDate = getattr(__import__(custom_array['FindDate']['path'] + '.' + custom_array['FindDate']['module'],
                                  fromlist=[custom_array['FindDate']['module']]), custom_array['FindDate']['module'])

if 'FindFooter' or 'process' not in custom_array['FindFooter']['path']:
    from src.backend.process.FindFooter import FindFooter
elif 'process' in custom_array['FindFooter']['path']:
    FindFooter = getattr(__import__(custom_array['FindFooter']['path'] + '.' + custom_array['FindFooter']['module'],
                                    fromlist=[custom_array['FindFooter']['module']]), custom_array['FindFooter']['module'])

if 'FindSupplier' or 'process' not in custom_array['FindSupplier']['path']:
    from src.backend.process.FindSupplier import FindSupplier
elif 'process' in custom_array['FindSupplier']['path']:
    FindSupplier = getattr(__import__(custom_array['FindSupplier']['path'] + '.' +
                                      custom_array['FindSupplier']['module'],
                                      fromlist=[custom_array['FindSupplier']['module']]), custom_array['FindSupplier']['module'])

if 'FindCustom' or 'process' not in custom_array['FindCustom']['path']:
    from src.backend.process.FindCustom import FindCustom
elif 'process' in custom_array['FindCustom']['path']:
    FindSupplier = getattr(__import__(custom_array['FindCustom']['path'] + '.' + custom_array['FindCustom']['module'],
                                      fromlist=[custom_array['FindCustom']['module']]), custom_array['FindCustom']['module'])

if 'FindInvoiceNumber' or 'process' not in custom_array['FindInvoiceNumber']['path']:
    from src.backend.process.FindInvoiceNumber import FindInvoiceNumber
elif 'process' in custom_array['FindInvoiceNumber']['path']:
    FindInvoiceNumber = getattr(__import__(custom_array['FindInvoiceNumber']['path'] + '.' +
                                           custom_array['FindInvoiceNumber']['module'],
                                           fromlist=[custom_array['FindInvoiceNumber']['module']]), custom_array['FindInvoiceNumber']['module'])

if 'FindQuotationNumber' or 'process' not in custom_array['FindQuotationNumber']['path']:
    from src.backend.process.FindQuotationNumber import FindQuotationNumber
elif 'process' in custom_array['FindQuotationNumber']['path']:
    FindQuotationNumber = getattr(__import__(custom_array['FindQuotationNumber']['path'] + '.' +
                                           custom_array['FindQuotationNumber']['module'],
                                           fromlist=[custom_array['FindFindQuotationNumberFindQuotationNumbervoiceNumber']['module']]), custom_array['FindQuotationNumber']['module'])

if 'FindDeliveryNumber' or 'process' not in custom_array['FindDeliveryNumber']['path']:
    from src.backend.process.FindDeliveryNumber import FindDeliveryNumber
elif 'process' in custom_array['FindDeliveryNumber']['path']:
    FindDeliveryNumber = getattr(__import__(custom_array['FindDeliveryNumber']['path'] + '.' + custom_array['FindDeliveryNumber']['module'], fromlist=[custom_array['FindDeliveryNumber']['module']]),
                                 custom_array['FindDeliveryNumber']['module'])


if 'FindFooterRaw' or 'process' not in custom_array['FindFooterRaw']['path']:
    from src.backend.process.FindFooterRaw import FindFooterRaw
elif 'process' in custom_array['FindFooterRaw']['path']:
    FindFooterRaw = getattr(__import__(custom_array['FindFooterRaw']['path'] + '.' + custom_array['FindFooterRaw']['module'], fromlist=[custom_array['FindFooterRaw']['module']]),
                              custom_array['FindFooterRaw']['module'])