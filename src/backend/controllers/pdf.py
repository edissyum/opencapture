from flask_babel import gettext
from flask_paginate import Pagination, get_page_args
from flask import current_app, Blueprint, flash, redirect, render_template, request, url_for, session, Response

import os
import pandas as pd
from datetime import datetime
from datetime import timedelta

from .db import get_db
from ..import_classes import _Config, _Log, _Files, _Xml, _WebServices, _Locale, _PyTesseract, _Database, _Spreadsheet, \
    _Splitter, _SeparatorQR

bp = Blueprint('pdf', __name__)


def init():
    config_name = _Config(current_app.config['CONFIG_FILE'])
    config = _Config(current_app.config['CONFIG_FOLDER'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini')
    log = _Log(config.cfg['GLOBAL']['logfile'])
    db = _Database(log, conn=get_db().conn)
    xml = _Xml(config, db)
    file_name = config.cfg['GLOBAL']['tmppath'] + 'tmp'
    files = _Files(
        file_name,
        int(config.cfg['GLOBAL']['resolution']),
        int(config.cfg['GLOBAL']['compressionquality']),
        xml,
        log,
        config.cfg['GLOBAL']['convertpdftotiff']
    )
    locale = _Locale(config)
    ocr = _PyTesseract(locale.localeOCR, log, config)
    separator_qr = _SeparatorQR(log, config)
    splitter = _Splitter(config, db, locale, separator_qr)
    ws = ''

    if config.cfg['GED']['enabled'] == 'True':
        ws = _WebServices(
            config.cfg['GED']['host'],
            config.cfg['GED']['user'],
            config.cfg['GED']['password'],
            log,
            config
        )

    return db, config, locale, ws, xml, files, ocr, splitter

@bp.route('/list/', defaults={'status': None, 'time': None})
@bp.route('/list/lot/', defaults={'status': None, 'time': None})
@bp.route('/list/lot/<string:time>/', defaults={'status': None})
@bp.route('/list/lot/<string:time>/<string:status>')
def index(status, time):
    _vars = init()
    _db = _vars[0]
    _cfg = _vars[1].cfg

    page, per_page, offset = get_page_args(page_parameter='page', per_page_parameter='per_page')
    status_list = _db.select({
        'select': ['*'],
        'table': ['status']
    })

    # Unlock all pdf locked by connected user
    _db.update({
        'table': ['invoices'],
        'set': {
            'locked': 0,
            'locked_by': ''
        },
        'where': ['locked_by = ?'],
        'data': [session['user_name']]
    })
    where = []
    if time:
        if time == 'TODAY':
            where.append("strftime('%Y-%m-%d', register_date) = ?")
            day = datetime.today().strftime('%Y-%m-%d')

        elif time == 'YESTERDAY':
            where.append("strftime('%Y-%m-%d', register_date) = ?")
            day = (datetime.today() - timedelta(days=1)).strftime('%Y-%m-%d')

        else:  # OLDER
            where.append("strftime('%Y-%m-%d', register_date) < ?")
            day = (datetime.today() - timedelta(days=1)).strftime('%Y-%m-%d')

        if status and status != '*':
            where.append("invoices.status = '" + status + "'")
        else:
            where.append("invoices.status <> 'DEL'")

        if 'search' in request.args:
            where.append("(LOWER(invoices.invoice_number) LIKE '%%" + request.args['search'].lower() + "%%' OR LOWER(suppliers.name) LIKE '%%" + request.args['search'].lower() + "%%')")

        total = _db.select({
            'select': ['count(DISTINCT(invoices.id)) as total'],
            'table': ['invoices', 'status', 'suppliers'],
            'left_join': ['invoices.status = status.id', 'invoices.vat_number = suppliers.vat_number'],
            'where': where,
            'data': [day]
        })[0]['total']

        pdf_list = _db.select({
            'select': [
                "DISTINCT(invoices.id) as invoice_id",
                "status.id as status_id",
                "strftime('%d-%m-%Y à %H:%M:%S', register_date) as date",
                "*"
            ],
            'table': ['invoices', 'status', 'suppliers'],
            'left_join': ['invoices.status = status.id', 'invoices.vat_number = suppliers.vat_number'],
            'where': where,
            'data': [day],
            'limit': str(per_page),
            'offset': str(offset),
            'order_by': ['date DESC']
        })

    else:
        total = _db.select({
            'select': ['count(DISTINCT(invoices.id)) as total'],
            'table': ['invoices'],
            'where': ["status NOT IN ('END', 'DEL')", "strftime('%Y-%m-%d',register_date) = ?"],
            'data': [datetime.today().strftime('%Y-%m-%d')],
        })[0]['total']

        pdf_list = _db.select({
            'select': [
                "DISTINCT(invoices.id) as invoice_id",
                "status.id as status_id",
                "strftime('%d-%m-%Y à %H:%M:%S', register_date) as date",
                "*"
            ],
            'table': ['invoices', 'status'],
            'left_join': ['invoices.status = status.id'],
            'where': ["status NOT IN ('END', 'DEL')", "strftime('%Y-%m-%d',register_date) = ?"],
            'data': [datetime.today().strftime('%Y-%m-%d')],
            'limit': str(per_page),
            'offset': str(offset),
            'order_by': ['date DESC']
        })

    result = [dict(pdf) for pdf in pdf_list]
    return_pdf = []

    for pdf in result:
        supplier = _db.select({
            'select': ['*'],
            'table': ['suppliers'],
            'where': ['vat_number = ?'],
            'data': [pdf['vat_number']]
        })

        if supplier:
            pdf['supplier_name'] = supplier[0]['name']

        return_pdf.append(pdf)

    nb_of_pdf = len(pdf_list) if pdf_list else 0
    if total == 0:
        msg = gettext('NO_RESULTS')
    else:
        msg = gettext('SHOW') + ' <span id="count">' + str(offset + 1) + '</span> - <span>' + str(offset + nb_of_pdf) + '</span> ' + gettext('OF') + ' ' + str(total)

    pagination = Pagination(per_page=per_page,
                            page=page,
                            total=total,
                            display_msg=msg)

    return render_template('templates/pdf/list.html',
                           pdfs=return_pdf,
                           status_list=status_list,
                           page=page,
                           per_page=per_page,
                           pagination=pagination,
                           cfg=_cfg)


@bp.route('/list/view/<int:pdf_id>', methods=('GET', 'POST'))
def view(pdf_id):
    _vars = init()
    _db = _vars[0]
    _cfg = _vars[1]

    if _cfg.cfg['GED']['enabled'] == 'True':
        _ws = _vars[3]
        check = _ws.check_connection()
        if check:
            ged_users = _ws.retrieve_users()
            if not ged_users:
                ged_users = {'users': []}
        else:
            ged_users = {'users': {}}
    else:
        ged_users = {'users': []}

    position_dict = {}

    pdf_info = _db.select({
        'select': ['id, *'],
        'table': ['invoices'],
        'where': ['status <> ?', 'id = ?'],
        'data': ['DEL', pdf_id],
        'limit': '1'
    })[0]

    # Retrieve supplier info if vatNumber is found
    supplier_info = _db.select({
        'select': ['*'],
        'table': ['suppliers'],
        'where': ['vat_number = ?'],
        'data': [pdf_info['vat_number']],
        'limit': '1'
    })

    # Converting str position to original type (tuple for exemple)
    for key in dict(pdf_info):
        if '_position' in key:
            if pdf_info[key]:
                position_dict[key] = eval(pdf_info[key])
            else:
                position_dict[key] = (('', ''), ('', ''))

    original_width = eval(pdf_info['img_width'])

    if supplier_info:
        supplier_info = supplier_info[0]

    array_financial = get_financial()

    # Update invoice to add lock
    _db.update({
        'table': ['invoices'],
        'set': {
            'locked': 1,
            'locked_by': session['user_name']
        },
        'where': ['id = ?'],
        'data': [pdf_id]
    })

    return render_template("templates/pdf/view.html",
                           pdf=pdf_info,
                           position=position_dict,
                           width=original_width,
                           supplier=supplier_info,
                           arrayOfFinancial=array_financial,
                           list_users=ged_users['users'],
                           )


@bp.route('/upload')
@bp.route('/upload?splitter=<string:issep>')
def upload(issep=False):
    _vars = init()
    _cfg = _vars[1].cfg

    return render_template("templates/pdf/upload.html", cfg=_cfg)


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
