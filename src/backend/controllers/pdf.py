from flask_babel import gettext
from flask import current_app, Blueprint, flash, redirect, request, url_for, session, Response

import os
import pandas as pd

from .db import get_db
from ..import_classes import _Config, _Log, _Files, _Xml, _Locale, _PyTesseract, _Database, _Spreadsheet

bp = Blueprint('pdf', __name__)


def init():
    config_name = _Config(current_app.config['CONFIG_FILE'])
    config = _Config(current_app.config['CONFIG_FOLDER'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini')
    log = _Log(config.cfg['GLOBAL']['logfile'])
    db = _Database(log, conn=get_db().conn)
    xml = _Xml(config, db)
    file_name = config.cfg['GLOBAL']['tmppath'] + 'tmp'
    locale = _Locale(config)
    files = _Files(
        file_name,
        int(config.cfg['GLOBAL']['resolution']),
        int(config.cfg['GLOBAL']['compressionquality']),
        xml,
        log,
        config.cfg['GLOBAL']['convertpdftotiff'],
        locale,
        config
    )
    locale = _Locale(config)
    ocr = _PyTesseract(locale.localeOCR, log, config)
    ws = ''

    return db, config, locale, ws, xml, files, ocr, log


@bp.route('/validate', methods=['POST'])
def validate_form():
    _vars = init()
    _db = _vars[0]
    _cfg = _vars[1]
    _ws = _vars[3]
    _files = _vars[5]

    parent = {}
    ged = {}
    contact = {}
    pdf_id = request.args['id']
    res = True
    footer_page = 1
    invoice_number_page = 1
    invoice_date_page = 1
    vat_number = False

    if request.method == 'POST':
        # Create an array containing the parent element, used to structure the XML
        for field in request.form:
            parent_xml_name = field.split('_')[0]
            parent[parent_xml_name] = []

        # If GED is set up, send the document to the GED application (Maarch by default)
        if _cfg.cfg['GED']['enabled'] == 'True':
            default_process = _cfg.cfg['GED']['defaultprocess']
            # If it's an invoice about a regular subscription, send it to the GED application using a CLOSED status
            if 'facturationInfo_isSubscription' in request.form:
                ged['status'] = _cfg.cfg[default_process]['statusend']
            else:
                ged['status'] = _cfg.cfg[default_process]['status']
            # Create the data list of arguments
            ged['fileContent'] = open(request.form['fileInfo_path'], 'rb').read()
            ged['creationDate'] = request.form['pdfCreationDate']
            ged['date'] = request.form['facturationInfo_invoice_date']
            ged['dest_user'] = request.form['ged_users'].split('#')[0]
            ged['vatNumber'] = request.form['supplierInfo_vat_number']
            ged[_cfg.cfg[default_process]['customvatnumber']] = request.form['supplierInfo_vat_number']
            ged[_cfg.cfg[default_process]['customht']] = request.form['facturationInfo_totalHT']
            ged[_cfg.cfg[default_process]['customttc']] = request.form['facturationInfo_totalTTC']
            ged[_cfg.cfg[default_process]['custominvoicenumber']] = request.form['facturationInfo_invoice_number']
            ged[_cfg.cfg[default_process]['custombudget']] = request.form['analyticsInfo_budgetSelection_1']
            ged[_cfg.cfg[default_process]['customoutcome']] = request.form['analyticsInfo_structureSelection_1']
            ged['subject'] = 'Facture N°' + request.form['facturationInfo_invoice_number']
            ged['destination'] = request.form['ged_users'].split('#')[1] if request.form['ged_users'] else _cfg.cfg[default_process]['defaultdestination']

            if 'facturationInfo_NumberOfDeliveryNumber' in request.form:
                number_of_delivery_number = int(request.form['facturationInfo_NumberOfDeliveryNumber'])
                if number_of_delivery_number and number_of_delivery_number == 1:
                    ged[_cfg.cfg[default_process]['customdeliverynumber']] = request.form['facturationInfo_deliveryNumber_1']
                elif number_of_delivery_number > 1:
                    tmp_delivery = ''
                    for i in range(1, number_of_delivery_number + 1):
                        tmp_delivery += request.form['facturationInfo_deliveryNumber_' + str(i)] + ';'
                    ged[_cfg.cfg[default_process]['customdeliverynumber']] = tmp_delivery[:-1]

            if 'facturationInfo_NumberOfOrderNumber' in request.form:
                number_of_order_number = int(request.form['facturationInfo_NumberOfOrderNumber'])
                if number_of_order_number and number_of_order_number == 1:
                    ged[_cfg.cfg[default_process]['customordernumber']] = request.form['facturationInfo_orderNumber_1']
                elif number_of_order_number > 1:
                    tmp_order = ''
                    for i in range(1, number_of_order_number + 1):
                        tmp_order += request.form['facturationInfo_orderNumber_' + str(i)] + ';'
                    ged[_cfg.cfg[default_process]['customordernumber']] = tmp_order[:-1]

            # Looking for an existing user in the GED, using VAT number as primary key
            ged['contact'] = _ws.retrieve_contact_by_vat_number(ged['vatNumber'])

            # If no contact found, create it
            if not ged['contact']:
                contact['isCorporatePerson'] = 'Y'
                contact['function'] = ''
                contact['lastname'] = ''
                contact['firstname'] = ''
                contact['contactType'] = _cfg.cfg[default_process]['contacttype']
                contact['contactPurposeId'] = _cfg.cfg[default_process]['contactpurposeid']
                contact['society'] = request.form['supplierInfo_name']
                contact['addressTown'] = request.form['supplierInfo_city']
                contact['societyShort'] = request.form['supplierInfo_name']
                contact['addressStreet'] = request.form['supplierInfo_address']
                contact['otherData'] = request.form['supplierInfo_vat_number']
                contact['addressZip'] = request.form['supplierInfo_postal_code']
                contact['email'] = 'À renseigner ' + request.form['supplierInfo_name'] + ' - ' + contact['otherData']

                contact = _ws.create_contact(contact)
                if contact is not False:
                    ged['contact'] = {'id': contact['addressId'], 'contact_id': contact['contactId']}

            res = _ws.insert_with_args(ged, _cfg)

        # Fill the parent array with all the child infos
        for value in parent:
            for field in request.form:
                if any(x in field for x in ['facturationInfo_no_taxes', 'facturationInfo_vat_']):
                    if '_page' in field:
                        footer_page = request.form[field]
                if field == 'facturationInfo_invoice_number_page':
                    invoice_number_page = request.form['facturationInfo_invoice_number_page']
                if field == 'facturationInfo_invoice_date_page':
                    invoice_date_page = request.form['facturationInfo_date_number_page']

                if field.split('_')[0] == value:
                    vat_number = request.form['supplierInfo_vat_number']

                    # If a position is associated
                    if field + '_position' in request.form:
                        parent[value].append({
                            field: {'field': request.form[field], 'position': request.form[field + '_position']}
                        })
                    else:
                        parent[value].append({
                            field: {'field': request.form[field], 'position': None}
                        })

        _db.update({
            'table': ['invoices'],
            'set': {
                'invoice_number': request.form['facturationInfo_invoice_number'],
                'invoice_number_position': request.form['facturationInfo_invoice_number_position'] if 'facturationInfo_invoice_number_position' in request.form else '',
                'ht_amount1': request.form['facturationInfo_no_taxes_1'],
                'ht_amount1_position': request.form['facturationInfo_no_taxes_1_position'] if 'facturationInfo_no_taxes_1_position' in request.form else '',
                'vat_rate1': request.form['facturationInfo_vat_1'],
                'vat_rate1_position': request.form['facturationInfo_vat_1_position'] if 'facturationInfo_vat_1_position' in request.form else '',
                'invoice_date': request.form['facturationInfo_invoice_date'],
                'invoice_date_position': request.form['facturationInfo_invoice_date_position'] if 'facturationInfo_invoice_date_position' in request.form else '',
            },
            'where': ['id = ?'],
            'data': [pdf_id]
        })

        if vat_number:
            _db.update({
                'table': ['suppliers'],
                'set': {
                    'footer_page': footer_page,
                    'invoice_number_page': invoice_number_page,
                    'invoice_date_page': invoice_date_page
                },
                'where': ['vat_number = ?'],
                'data': [vat_number]
            })
            _files.export_xml(_cfg, request.form['facturationInfo_invoice_number'], parent, True, _db, vat_number)

        # Unlock pdf and makes it processed
        _db.update({
            'table': ['invoices'],
            'set': {
                'locked': 0,
                'locked_by': 'NULL',
                'processed': 1
            },
            'where': ['locked_by = ?, id = ?'],
            'data': [session['user_name'], pdf_id]
        })

        if res:
            flash(gettext('END_LONG'))
        else:
            flash(gettext('ERROR_WHILE_INSERTING_IN_GED'))
            change_status(pdf_id, 'ERR_GED')

        return redirect(url_for('pdf.index', time="TODAY", status='NEW'))


@bp.route('/files/<string:type_of_file>/<path:filename>', methods=['GET', 'POST'])
def static(type_of_file, filename):
    _vars = init()
    _cfg = _vars[1].cfg

    if type_of_file == 'splitter':
        docservers = _cfg['SPLITTER']['tmpbatchpath']
        mimetype = 'image/jpeg'
    elif type_of_file == 'originFile':
        docservers = _cfg['SPLITTER']['pdforiginpath']
        mimetype = 'application/pdf'
    elif type_of_file == 'full':
        docservers = _cfg['GLOBAL']['fullpath']
        mimetype = 'image/jpeg'
    else:
        docservers = _cfg['GLOBAL']['fullpath']
        mimetype = 'image/jpeg'

    path = docservers + '/' + filename
    try:
        content = open(path, 'rb').read()
    except FileNotFoundError:
        if mimetype == 'image/jpeg':
            content = open(current_app.instance_path + '/document_not_found.jpg', 'rb').read()
        else:
            content = open(current_app.instance_path + '/document_not_found.pdf', 'rb').read()

    return Response(content, mimetype=mimetype)


def change_status(rowid, status):
    _vars = init()
    _db = _vars[0]
    _cfg = _vars[1].cfg

    res = _db.update({
        'table': ['invoices'],
        'set': {
            'status': status,
        },
        'where': ['id = ?'],
        'data': [rowid],
    })

    return res


def get_financial():
    _vars = init()
    _db = _vars[0]
    _cfg = _vars[1].cfg
    array = {}

    content = pd.DataFrame(_Spreadsheet.read_excel_sheet(_cfg['REFERENCIAL']['referencialfinancial']))
    for line in content.to_dict(orient='records'):
        if len(str(line['ID'])) >= 3:
            array[str(line['ID']).rstrip()] = line['LABEL']

    return array


def ocr_on_the_fly(file_name, selection, thumb_size):
    _vars = init()
    _cfg = _vars[1].cfg
    _files = _vars[5]
    _Ocr = _vars[6]

    if _files.isTiff == 'True':
        path = _cfg['GLOBAL']['tiffpath'] + (os.path.splitext(file_name)[0]).replace('full_', 'tiff_') + '.tiff'
        if not os.path.isfile(path):
            path = _cfg['GLOBAL']['fullpath'] + file_name
    else:
        path = _cfg['GLOBAL']['fullpath'] + file_name

    text = _files.ocr_on_fly(path, selection, _Ocr, thumb_size)
    if text:
        return text
    else:
        _files.improve_image_detection(path)
        text = _files.ocr_on_fly(path, selection, _Ocr, thumb_size)
        return text
