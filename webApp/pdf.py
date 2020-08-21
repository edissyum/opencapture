from flask_babel import gettext
from flask_paginate import Pagination, get_page_args
from flask import current_app, Blueprint, flash, redirect, render_template, request, url_for, session, Response

import os
import pandas as pd
from datetime import datetime
from datetime import timedelta

from webApp.db import get_db
from webApp.auth import login_required
from webApp.functions import get_custom_id, check_python_customized_files

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'Config' not in custom_array: from bin.src.classes.Config import Config as _Config
else: _Config = getattr(__import__(custom_array['Config']['path'] + '.' + custom_array['Config']['module'], fromlist=[custom_array['Config']['module']]), custom_array['Config']['module'])

if 'Log' not in custom_array: from bin.src.classes.Log import Log as _Log
else: _Log = getattr(__import__(custom_array['Log']['path'] + '.' + custom_array['Log']['module'], fromlist=[custom_array['Log']['module']]), custom_array['Log']['module'])

if 'Files' not in custom_array: from bin.src.classes.Files import Files as _Files
else: _Files = getattr(__import__(custom_array['Files']['path'] + '.' + custom_array['Files']['module'], fromlist=[custom_array['Files']['module']]), custom_array['Files']['module'])

if 'Xml' not in custom_array: from bin.src.classes.Xml import Xml as _Xml
else: _Xml = getattr(__import__(custom_array['Xml']['path'] + '.' + custom_array['Xml']['module'], fromlist=[custom_array['Xml']['module']]), custom_array['Xml']['module'])

if 'WebServices' not in custom_array: from bin.src.classes.WebServices import WebServices as _WebServices
else: _WebServices = getattr(__import__(custom_array['WebServices']['path'] + '.' + custom_array['WebServices']['module'], fromlist=[custom_array['WebServices']['module']]), custom_array['WebServices']['module'])

if 'Locale' not in custom_array: from bin.src.classes.Locale import Locale as _Locale
else: _Locale = getattr(__import__(custom_array['Locale']['path'] + '.' + custom_array['Locale']['module'], fromlist=[custom_array['Locale']['module']]), custom_array['Locale']['module'])

if 'PyTesseract' not in custom_array: from bin.src.classes.PyTesseract import PyTesseract as _PyTesseract
else: _PyTesseract = getattr(__import__(custom_array['PyTesseract']['path'] + '.' + custom_array['PyTesseract']['module'], fromlist=[custom_array['PyTesseract']['module']]), custom_array['PyTesseract']['module'])

if 'Database' not in custom_array: from bin.src.classes.Database import Database as _Database
else: _Database = getattr(__import__(custom_array['Database']['path'] + '.' + custom_array['Database']['module'], fromlist=[custom_array['Database']['module']]), custom_array['Database']['module'])

if 'Spreadsheet' not in custom_array: from bin.src.classes.Spreadsheet import Spreadsheet as _Spreadsheet
else: _Spreadsheet = getattr(__import__(custom_array['Spreadsheet']['path'] + '.' + custom_array['Spreadsheet']['module'], fromlist=[custom_array['Spreadsheet']['module']]), custom_array['Spreadsheet']['module'])

if 'Splitter' not in custom_array: from bin.src.classes.Splitter import Splitter as _Splitter
else: _Splitter = getattr(__import__(custom_array['Splitter']['path'] + '.' + custom_array['Splitter']['module'], fromlist=[custom_array['Splitter']['module']]), custom_array['Splitter']['module'])

bp = Blueprint('pdf', __name__)

def init():
    configName  = _Config(current_app.config['CONFIG_FILE'])
    Cfg         = _Config(current_app.config['CONFIG_FOLDER'] + '/config_' + configName.cfg['PROFILE']['id'] + '.ini')
    Log         = _Log(Cfg.cfg['GLOBAL']['logfile'])
    dbType      = Cfg.cfg['DATABASE']['databasetype']
    db          = _Database(Log, dbType, conn=get_db().conn)
    Xml         = _Xml(Cfg, db)
    fileName    = Cfg.cfg['GLOBAL']['tmppath'] + 'tmp'
    Files       = _Files(
        fileName,
        int(Cfg.cfg['GLOBAL']['resolution']),
        int(Cfg.cfg['GLOBAL']['compressionquality']),
        Xml,
        Log,
        Cfg.cfg['GLOBAL']['convertpdftotiff']
    )
    Locale      = _Locale(Cfg)
    Ocr         = _PyTesseract(Locale.localeOCR, Log, Cfg)
    splitter    = _Splitter(Cfg, db, Locale)
    ws          = ''

    if Cfg.cfg['GED']['enabled'] == 'True':
        ws      = _WebServices(
            Cfg.cfg['GED']['host'],
            Cfg.cfg['GED']['user'],
            Cfg.cfg['GED']['password'],
            Log,
            Cfg
        )

    return db, Cfg, Locale, ws, Xml, Files, Ocr, splitter

@bp.route('/')
@login_required
def home():
    return render_template('templates/home.html')

@bp.route('/list/',  defaults={'status': None, 'time': None, 'search': None})
@bp.route('/list/lot/', defaults={'status': None, 'search': None, 'time': None})
@bp.route('/list/lot/<string:time>/', defaults={'status': None, 'search': None})
@bp.route('/list/lot/<string:time>/<string:status>', defaults={'search': None})
@bp.route('/list/lot/<string:time>/<string:status>?search=<path:search>')
@login_required
def index(status, time, search):
    _vars       = init()
    _db         = _vars[0]
    _cfg        = _vars[1].cfg

    page, per_page, offset = get_page_args(page_parameter='page', per_page_parameter='per_page')
    status_list = _db.select({
        'select' : ['*'],
        'table'  : ['status']
    })

    # Unlock all pdf locked by connected user
    _db.update({
        'table' : ['invoices'],
        'set'   : {
            'locked': 0,
            'locked_by': ''
        },
        'where' : ['locked_by = ?'],
        'data'  : [session['user_name']]
    })
    where = []
    if time:
        if time == 'TODAY':
            where.append("strftime('%Y-%m-%d', register_date) = ?")
            day     = datetime.today().strftime('%Y-%m-%d')

        elif time == 'YESTERDAY':
            where.append("strftime('%Y-%m-%d', register_date) = ?")
            day     = (datetime.today() - timedelta(days=1)).strftime('%Y-%m-%d')

        else : # OLDER
            where.append("strftime('%Y-%m-%d', register_date) < ?")
            day     = (datetime.today() - timedelta(days=1)).strftime('%Y-%m-%d')

        if status and status != '*':
            where.append("invoices.status = '" + status + "'")
        else:
            where.append("invoices.status <> 'DEL'")

        if search:
            where.append("(invoices.invoiceNumber LIKE '%" + search + "%'" \
                     " OR suppliers.name LIKE '%" + search + "%')")

        total = _db.select({
            'select'    : ['count(DISTINCT(invoices.id)) as total'],
            'table'     : ['invoices', 'status', 'suppliers'],
            'left_join' : ['invoices.status = status.id', 'invoices.vat_number = suppliers.vat_number'],
            'where'     : where,
            'data'      : [day]
        })[0]['total']

        pdf_list = _db.select({
            'select'    : [
                "DISTINCT(invoices.id) as invoice_id",
                "status.id as status_id",
                "strftime('%d-%m-%Y à %H:%M', register_date) as date",
                "*"
            ],
            'table'     : ['invoices', 'status', 'suppliers'],
            'left_join' : ['invoices.status = status.id', 'invoices.vat_number = suppliers.vat_number'],
            'where'     : where,
            'data'      : [day],
            'limit'     : str(per_page),
            'offset'    : str(offset),
            'order_by'  : ['date DESC']
        })

    else:
        total = _db.select({
            'select': ['count(DISTINCT(invoices.id)) as total'],
            'table' : ['invoices'],
            'where' : ["status NOT IN ('END', 'DEL')", "strftime('%Y-%m-%d',register_date) = ?"],
            'data'  : [datetime.today().strftime('%Y-%m-%d')],
        })[0]['total']

        pdf_list = _db.select({
            'select'    : [
                "DISTINCT(invoices.id) as invoice_id",
                "status.id as status_id",
                "strftime('%d-%m-%Y à %H:%M', register_date) as date",
                "*"
            ],
            'table'     : ['invoices', 'status'],
            'left_join' : ['invoices.status = status.id'],
            'where'     : ["status NOT IN ('END', 'DEL')", "strftime('%Y-%m-%d',register_date) = ?"],
            'data'      : [datetime.today().strftime('%Y-%m-%d')],
            'limit'     : str(offset) + ',' + str(per_page),
            'order_by'  : ['date DESC']
        })

    result      = [dict(pdf) for pdf in pdf_list]
    returnPdf   = []

    for pdf in result:
        supplier = _db.select({
            'select'    : ['*'],
            'table'     : ['suppliers'],
            'where'     : ['vat_number = ?'],
            'data'      : [pdf['vat_number']]
        })

        if supplier:
            pdf['supplier_name'] = supplier[0]['name']

        returnPdf.append(pdf)

    nb_of_pdf = len(pdf_list) if pdf_list else 0
    if total == 0:
        msg = gettext('NO_RESULTS')
    else:
        msg = gettext('SHOW') + ' <span id="count">' + str(offset + 1)+'</span> - <span>' + str(offset + nb_of_pdf) + '</span> ' + gettext('OF') + ' ' +  str(total)

    pagination = Pagination(per_page=per_page,
                            page=page,
                            total=total,
                            display_msg=msg)

    return render_template('templates/pdf/list.html',
                           pdfs=returnPdf,
                           status_list=status_list,
                           page=page,
                           per_page=per_page,
                           pagination=pagination,
                           cfg=_cfg)

@bp.route('/list/view/<int:id>', methods=('GET', 'POST'))
@login_required
def view(id):
    _vars           = init()
    _db             = _vars[0]
    _cfg            = _vars[1]

    if _cfg.cfg['GED']['enabled'] == 'True':
        _ws         = _vars[3]
        check       = _ws.check_connection()
        if check:
            ged_users   = _ws.retrieve_users()
            if not ged_users:
                ged_users = {'users': []}
        else:
            ged_users   = {'users' : {}}
    else:
        ged_users       = {'users': []}

    positionDict = {}

    pdf_info = _db.select({
        'select': ['id, *'],
        'table' : ['invoices'],
        'where' : ['status <> ?', 'id = ?'],
        'data'  : ['DEL', id],
        'limit' : '1'
    })[0]

    # Retrieve supplier info if vatNumber is found
    supplier_info   = _db.select({
        'select': ['*'],
        'table' : ['suppliers'],
        'where' : ['vat_number = ?'],
        'data'  : [pdf_info['vat_number']],
        'limit' : '1'
    })

    # Converting str position to original type (tuple for exemple)
    for key in dict(pdf_info):
        if '_position' in key:
            if pdf_info[key]:
                positionDict[key] = eval(pdf_info[key])
            else:
                positionDict[key] = (('',''),('',''))

    original_width  = eval(pdf_info['img_width'])

    if supplier_info:
        supplier_info = supplier_info[0]

    arrayOfFinancial = get_financial()

    # Update invoice to add lock
    _db.update({
        'table' : ['invoices'],
        'set'   : {
            'locked' : 1,
            'locked_by': session['user_name']
        },
        'where' : ['id = ?'],
        'data'  : [id]
    })

    return render_template("templates/pdf/view.html",
                           pdf=pdf_info,
                           position=positionDict,
                           width=original_width,
                           supplier=supplier_info,
                           arrayOfFinancial=arrayOfFinancial,
                           list_users=ged_users['users'],
    )

@bp.route('/upload')
@bp.route('/upload?splitter=<string:issep>')
@login_required
def upload(issep):
    return render_template("templates/pdf/upload.html")

@bp.route('/validate', methods=['POST'])
def validate_form():
    _vars   = init()
    _db     = _vars[0]
    _cfg    = _vars[1]
    _ws     = _vars[3]
    _files  = _vars[5]

    parent  = {}
    ged     = {}
    contact = {}
    pdfId   = request.args['id']
    res     = True

    if request.method == 'POST':
        # Create an array containing the parent element, used to structure the XML
        for field in request.form:
            parentXMLName = field.split('_')[0]
            parent[parentXMLName] = []

        # If GED is set up, send the document to the GED application (Maarch by default)
        if _cfg.cfg['GED']['enabled'] == 'True':
            defaultProcess      = _cfg.cfg['GED']['defaultprocess']
            # If it's an invoice about a regular subscription, send it to the GED application using a CLOSED status
            if 'facturationInfo_isSubscription' in request.form:
                ged['status']   = _cfg.cfg[defaultProcess]['statusend']
            else:
                ged['status']   = _cfg.cfg[defaultProcess]['status']
            # Create the data list of arguments
            ged['fileContent']                                      = open(request.form['fileInfo_path'], 'rb').read()
            ged['creationDate']                                     = request.form['pdfCreationDate']
            ged['date']                                             = request.form['facturationInfo_date']
            ged['dest_user']                                        = request.form['ged_users']
            ged['vatNumber']                                        = request.form['supplierInfo_vat_number']
            ged[_cfg.cfg[defaultProcess]['customvatnumber']]        = request.form['supplierInfo_vat_number']
            ged[_cfg.cfg[defaultProcess]['customht']]               = request.form['facturationInfo_totalHT']
            ged[_cfg.cfg[defaultProcess]['customttc']]              = request.form['facturationInfo_totalTTC']
            ged[_cfg.cfg[defaultProcess]['custominvoicenumber']]    = request.form['facturationInfo_invoice_number']
            ged[_cfg.cfg[defaultProcess]['custombudget']]           = request.form['analyticsInfo_budgetSelection_1']
            ged[_cfg.cfg[defaultProcess]['customoutcome']]          = request.form['analyticsInfo_structureSelection_1']
            ged['subject']                                          = 'Facture N°' + request.form['facturationInfo_invoice_number']
            ged['destination']                                      = request.form['ged_users'].split('#')[1] if request.form['ged_users'] else _cfg.cfg[defaultProcess]['defaultdestination']

            if 'facturationInfo_NumberOfDeliveryNumber' in request.form:
                numberOfDeliveryNumber  = int(request.form['facturationInfo_NumberOfDeliveryNumber'])
                if numberOfDeliveryNumber == 1:
                    ged[_cfg.cfg[defaultProcess]['customdeliverynumber']] = request.form['facturationInfo_deliveryNumber_1']
                elif numberOfDeliveryNumber > 1:
                    tmpDelivery = ''
                    for i in range(1, numberOfDeliveryNumber + 1):
                        tmpDelivery += request.form['facturationInfo_deliveryNumber_' + str(i)] + ';'
                    ged[_cfg.cfg[defaultProcess]['customdeliverynumber']] = tmpDelivery[:-1]

            if 'facturationInfo_NumberOfOrderNumber' in request.form:
                numberOfOrderNumber     = int(request.form['facturationInfo_NumberOfOrderNumber'])
                if numberOfOrderNumber and numberOfOrderNumber == 1:
                    ged[_cfg.cfg[defaultProcess]['customordernumber']] = request.form['facturationInfo_orderNumber_1']
                elif numberOfOrderNumber > 1:
                    tmpOrder = ''
                    for i in range(1, numberOfOrderNumber + 1):
                        tmpOrder += request.form['facturationInfo_orderNumber_' + str(i)] + ';'
                    ged[_cfg.cfg[defaultProcess]['customordernumber']] = tmpOrder[:-1]

            # Looking for an existing user in the GED, using VAT number as primary key
            ged['contact']      = _ws.retrieve_contact_by_VATNumber(ged['vatNumber'])

            # If no contact found, create it
            if not ged['contact']:
                contact['isCorporatePerson']    = 'Y'
                contact['function']             = ''
                contact['lastname']             = ''
                contact['firstname']            = ''
                contact['contactType']          = _cfg.cfg[defaultProcess]['contacttype']
                contact['contactPurposeId']     = _cfg.cfg[defaultProcess]['contactpurposeid']
                contact['society']              = request.form['supplierInfo_name']
                contact['addressTown']          = request.form['supplierInfo_city']
                contact['societyShort']         = request.form['supplierInfo_name']
                contact['addressStreet']        = request.form['supplierInfo_address']
                contact['otherData']            = request.form['supplierInfo_vatNumber']
                contact['addressZip']           = request.form['supplierInfo_postal_code']
                contact['email']                = 'À renseigner ' + request.form['supplierInfo_name'] + ' - ' + contact['otherData']

                contact                         = _ws.create_contact(contact)
                if contact is not False:
                    ged['contact']           = {'id' : contact['addressId'], 'contact_id' : contact['contactId']}

            res = _ws.insert_with_args(ged, _cfg)


        # Fill the parent array with all the child infos
        for value in parent:
            for field in request.form:
                if field.split('_')[0] == value:
                    vatNumber = request.form['supplierInfo_vat_number']

                    # If a position is associated
                    if field + '_position' in request.form:
                        parent[value].append({
                            field : {'field' : request.form[field], 'position' : request.form[field + '_position']}
                        })
                    else:
                        parent[value].append({
                            field : {'field' : request.form[field], 'position' : None}
                        })
        _db.update({
            'table' : ['invoices'],
            'set'   : {
                'invoice_number'         : request.form['facturationInfo_invoice_number'],
                'invoice_number_position': request.form['facturationInfo_invoice_number_position'] if 'facturationInfo_invoice_number_position' in request.form else '' ,
                'ht_amount1'             : request.form['facturationInfo_no_taxes_1'],
                'ht_amount1_position'    : request.form['facturationInfo_no_taxes_1_position'] if 'facturationInfo_no_taxes_1_position' in request.form else '' ,
                'vat_rate1'              : request.form['facturationInfo_vat_1'],
                'vat_rate1_position'     : request.form['facturationInfo_vat_1_position'] if 'facturationInfo_vat_1_position' in request.form else '',
                'invoice_date'           : request.form['facturationInfo_invoice_date'],
                'invoice_date_position'  : request.form['facturationInfo_invoice_date_position'] if 'facturationInfo_invoice_date_position' in request.form else '',
            },
            'where' : ['id = ?'],
            'data'  : [pdfId]
        })

        _files.exportXml(_cfg, request.form['facturationInfo_invoice_number'], parent, True, _db, vatNumber)

        # Unlock pdf and makes it processed
        _db.update({
            'table': ['invoices'],
            'set': {
                'locked'    : 0,
                'locked_by' : 'NULL',
                'processed' : 1
            },
            'where': ['locked_by = ?, id = ?'],
            'data': [session['user_name'], pdfId]
        })

        if res:
            flash(gettext('END_LONG'))
        else:
            flash(gettext('ERROR_WHILE_INSERTING_IN_GED'))
            change_status(pdfId, 'ERR_GED')

        return redirect(url_for('pdf.index', time="TODAY", status='NEW'))

@bp.route('/files/<string:typeofFile>/<path:filename>', methods=['GET', 'POST'])
def static(typeofFile, filename):
    _vars       = init()
    _cfg        = _vars[1].cfg

    if typeofFile == 'splitter':
        docservers = _cfg['SPLITTER']['tmpbatchpath']
        mimetype = 'image/jpeg'
    elif typeofFile == 'originFile':
        docservers = _cfg['SPLITTER']['pdforiginpath']
        mimetype = 'application/pdf'
    elif typeofFile == 'full':
        docservers = _cfg['GLOBAL']['fullpath']
        mimetype   = 'image/jpeg'
    else:
        docservers = _cfg['GLOBAL']['fullpath']
        mimetype   = 'image/jpeg'

    path = docservers + '/' + filename
    content = open(path,'rb').read()

    return Response(content, mimetype=mimetype)


def change_status(rowid, status):
    _vars   = init()
    _db     = _vars[0]
    _cfg    = _vars[1].cfg

    res     = _db.update({
        'table' : ['invoices'],
        'set'   : {
            'status'    :   status,
        },
        'where' : ['id = ?'],
        'data'  : [rowid],
    })

    return res

def get_financial():
    _vars = init()
    _db = _vars[0]
    _cfg = _vars[1].cfg
    array = {}

    content     = pd.DataFrame(_Spreadsheet.read_excel_sheet(_cfg['REFERENCIAL']['referencialfinancial']))
    for line in content.to_dict(orient='records'):
        if len(str(line['ID'])) >= 3:
            array[str(line['ID']).rstrip()] = line['LABEL']

    return array

def ocr_on_the_fly(fileName, selection, thumbSize):
    _vars   = init()
    _cfg    = _vars[1].cfg
    _files  = _vars[5]
    _Ocr    = _vars[6]

    if _files.isTiff == 'True':
        path = _cfg['GLOBAL']['tiffpath'] + (os.path.splitext(fileName)[0]).replace('full_', 'tiff_') + '.tiff'
        if not os.path.isfile(path):
            path = _cfg['GLOBAL']['fullpath'] + fileName
    else:
        path = _cfg['GLOBAL']['fullpath'] + fileName

    text = _files.ocr_on_fly(path, selection, _Ocr, thumbSize)

    if text:
        return text
    else:
        _files.improve_image_detection(path)
        text = _files.ocr_on_fly(path, selection, _Ocr, thumbSize)
        return text
