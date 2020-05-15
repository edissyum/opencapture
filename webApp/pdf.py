from flask import (
    current_app, Blueprint, flash, redirect, render_template, request, url_for, session, Response
)

import pandas as pd
from datetime import datetime
from datetime import timedelta

from webApp.db import get_db

from flask_paginate import Pagination, get_page_args
from flask_babel import gettext

from webApp.auth import login_required
from bin.src.classes.Xml import Xml as xml
from bin.src.classes.Log import Log as lg
from bin.src.classes.Files import Files as file
from bin.src.classes.Database import Database
from bin.src.classes.Locale import Locale as lc
from bin.src.classes.Config import Config as cfg
from bin.src.classes.WebServices import WebServices
from bin.src.classes.Spreadsheet import Spreadsheet
from bin.src.classes.PyTesseract import PyTesseract

bp = Blueprint('pdf', __name__)

def init():
    configName  = cfg(current_app.config['CONFIG_FILE'])
    Config      = cfg(current_app.config['CONFIG_FOLDER'] + '/config_' + configName.cfg['PROFILE']['id'] + '.ini')
    fileName    = Config.cfg['GLOBAL']['tmppath'] + 'tmp'
    Log         = lg(Config.cfg['GLOBAL']['logfile'])
    db          = Database(Log, None, get_db())
    Xml         = xml(Config, db)
    Files       = file(
        fileName,
        int(Config.cfg['GLOBAL']['resolution']),
        int(Config.cfg['GLOBAL']['compressionquality']),
        Xml
    )
    Locale      = lc(Config)
    Ocr         = PyTesseract(Locale.localeOCR, Log, Config)
    ws          = ''

    if Config.cfg['GED']['enabled'] == 'True':
        ws      = WebServices(
            Config.cfg['GED']['host'],
            Config.cfg['GED']['user'],
            Config.cfg['GED']['password'],
            Log,
            Config
        )

    return db, Config, Locale, ws, Xml, Files, Ocr

@bp.route('/')
@login_required
def home():
    return render_template('home.html')

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

    if time:
        if time == 'TODAY':
            where   = "strftime('%Y-%m-%d',registerDate) = ?"
            day     = datetime.today().strftime('%Y-%m-%d')

        elif time == 'YESTERDAY':
            where   = "strftime('%Y-%m-%d',registerDate) = ?"
            day     = (datetime.today() - timedelta(days=1)).strftime('%Y-%m-%d')

        else : # OLDER
            where   = "strftime('%Y-%m-%d',registerDate) < ?"
            day     = (datetime.today() - timedelta(days=1)).strftime('%Y-%m-%d')

        if status and status != '*':
            where += " AND invoices.status = '" + status + "'"
        else:
            where += " AND invoices.status <> 'DEL'"

        if search:
            where += " AND (invoices.invoiceNumber LIKE '%" + search + "%'" \
                     " OR suppliers.name LIKE '%" + search + "%')"

        total = _db.select({
            'select'    : ['count(DISTINCT(invoices.oid)) as total'],
            'table'     : ['invoices', 'status', 'suppliers'],
            'left_join' : ['invoices.status = status.id', 'invoices.vatNumber = suppliers.vatNumber'],
            'where'     : [where],
            'data'      : [day]
        })[0]['total']

        pdf_list = _db.select({
            'select'    : [
                "DISTINCT(invoices.oid)",
                "strftime('%d-%m-%Y à %H:%M', registerDate) as date",
                "*"
            ],
            'table'     : ['invoices', 'status', 'suppliers'],
            'left_join' : ['invoices.status = status.id', 'invoices.vatNumber = suppliers.vatNumber'],
            'where'     : [where],
            'data'      : [day],
            'limit'     : str(offset) + ',' + str(per_page),
            'order_by'  : ['date DESC']
        })

    else:
        total = _db.select({
            'select': ['count(DISTINCT(invoices.oid)) as total'],
            'table' : ['invoices'],
            'where' : ["status NOT IN ('END', 'DEL')", "strftime('%Y-%m-%d',registerDate) = ?"],
            'data'  : [datetime.today().strftime('%Y-%m-%d')],
        })[0]['total']

        pdf_list = _db.select({
            'select'    : [
                "DISTINCT(invoices.oid)",
                "strftime('%d-%m-%Y à %H:%M', registerDate) as date",
                "*"
            ],
            'table'     : ['invoices', 'status'],
            'left_join' : ['invoices.status = status.id'],
            'where'     : ["status NOT IN ('END', 'DEL')", "strftime('%Y-%m-%d',registerDate) = ?"],
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
            'where'     : ['vatNumber = ?'],
            'data'      : [pdf['vatNumber']]
        })

        if supplier:
            pdf['supplierName'] = supplier[0]['name']

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

    return render_template('pdf/list.html',
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
        'select': ['oid, *'],
        'table' : ['invoices'],
        'where' : ['status <> ?', 'rowid = ?'],
        'data'  : ['DEL', id],
        'limit' : '1'
    })[0]

    # Retrieve supplier info if vatNumber is found
    supplier_info   = _db.select({
        'select': ['*'],
        'table' : ['suppliers'],
        'where' : ['vatNumber = ?'],
        'data'  : [pdf_info['vatNumber']],
        'limit' : '1'
    })

    # Converting str position to original type (tuple for exemple)
    for key in dict(pdf_info):
        if '_position' in key:
            if pdf_info[key]:
                positionDict[key] = eval(pdf_info[key])
            else:
                positionDict[key] = (('',''),('',''))

    original_width  = eval(pdf_info['imgWidth'])

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
        'where' : ['rowid = ?'],
        'data'  : [id]
    })



    return render_template('pdf/view.html',
                           pdf=pdf_info,
                           position=positionDict,
                           width=original_width,
                           supplier=supplier_info,
                           arrayOfFinancial=arrayOfFinancial,
                           list_users=ged_users['users'],
    )


@bp.route('/list/delete/<int:id>', methods=['GET', 'POST'], defaults={'url': ''})
@bp.route('/list/delete/<int:id>/returnpath=<string:url>', methods=['GET', 'POST'])
@login_required
def delete(id, url):
    _vars   = init()
    _db     = _vars[0]
    url     = url.replace('%', '/')

    _db.update({
        'table' : ['invoices'],
        'set'   : {
            'status': 'DEL'
        },
        'where' : ['rowid = ?'],
        'data'  : [id]
    })

    return redirect(url)

@bp.route('/upload')
@bp.route('/upload?splitter=<string:issep>')
@login_required
def upload():
    return render_template('pdf/upload.html')

@bp.route('/validate', methods=['POST'])
def validate_form():
    _vars   = init()
    _db     = _vars[0]
    _cfg    = _vars[1]
    _ws     = _vars[3]
    _Xml    = _vars[4]
    _Files  = _vars[5]

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
            ged['creationDate']                                     = request.form['pdfCreationDate'].split('¤¤¤')[0]
            ged['date']                                             = request.form['facturationInfo_date'].split('¤¤¤')[0]
            ged['dest_user']                                        = request.form['ged_users'].split('#')[0]
            ged['vatNumber']                                        = request.form['supplierInfo_vatNumber'].split('¤¤¤')[0]
            ged[_cfg.cfg[defaultProcess]['customvatnumber']]        = request.form['supplierInfo_vatNumber'].split('¤¤¤')[0]
            ged[_cfg.cfg[defaultProcess]['customht']]               = request.form['facturationInfo_totalHT'].split('¤¤¤')[0]
            ged[_cfg.cfg[defaultProcess]['customttc']]              = request.form['facturationInfo_totalTTC'].split('¤¤¤')[0]
            ged[_cfg.cfg[defaultProcess]['custominvoicenumber']]    = request.form['facturationInfo_invoiceNumber'].split('¤¤¤')[0]
            ged[_cfg.cfg[defaultProcess]['custombudget']]           = request.form['analyticsInfo_budgetSelection_1']
            ged[_cfg.cfg[defaultProcess]['customoutcome']]          = request.form['analyticsInfo_structureSelection_1']
            ged['subject']                                          = 'Facture N°' + request.form['facturationInfo_invoiceNumber'].split('¤¤¤')[0]
            ged['destination']                                      = request.form['ged_users'].split('#')[1] if request.form['ged_users'] else _cfg.cfg[defaultProcess]['defaultdestination']

            if 'facturationInfo_NumberOfDeliveryNumber' in request.form:
                numberOfDeliveryNumber  = int(request.form['facturationInfo_NumberOfDeliveryNumber'])
                if numberOfDeliveryNumber == 1:
                    ged[_cfg.cfg[defaultProcess]['customdeliverynumber']] = request.form['facturationInfo_deliveryNumber_1'].split('¤¤¤')[0]
                elif numberOfDeliveryNumber > 1:
                    tmpDelivery = ''
                    for i in range(1, numberOfDeliveryNumber + 1):
                        tmpDelivery += request.form['facturationInfo_deliveryNumber_' + str(i)].split('¤¤¤')[0] + ';'
                    ged[_cfg.cfg[defaultProcess]['customdeliverynumber']] = tmpDelivery[:-1]

            if 'facturationInfo_NumberOfOrderNumber' in request.form:
                numberOfOrderNumber     = int(request.form['facturationInfo_NumberOfOrderNumber'].split('¤¤¤')[0])
                if numberOfOrderNumber and numberOfOrderNumber == 1:
                    ged[_cfg.cfg[defaultProcess]['customordernumber']] = request.form['facturationInfo_orderNumber_1'].split('¤¤¤')[0]
                elif numberOfOrderNumber > 1:
                    tmpOrder = ''
                    for i in range(1, numberOfOrderNumber + 1):
                        tmpOrder += request.form['facturationInfo_orderNumber_' + str(i)].split('¤¤¤')[0] + ';'
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
                contact['society']              = request.form['supplierInfo_name'].split('¤¤¤')[0]
                contact['addressTown']          = request.form['supplierInfo_city'].split('¤¤¤')[0]
                contact['societyShort']         = request.form['supplierInfo_name'].split('¤¤¤')[0]
                contact['addressStreet']        = request.form['supplierInfo_address'].split('¤¤¤')[0]
                contact['otherData']            = request.form['supplierInfo_vatNumber'].split('¤¤¤')[0]
                contact['addressZip']           = request.form['supplierInfo_postal_code'].split('¤¤¤')[0]
                contact['email']                = 'À renseigner ' + request.form['supplierInfo_name'].split('¤¤¤')[0] + ' - ' + contact['otherData']

                contact                         = _ws.create_contact(contact)
                if contact is not False:
                    ged['contact']           = {'id' : contact['addressId'], 'contact_id' : contact['contactId']}

            res = _ws.insert_with_args(ged, _cfg)


        # Fill the parent array with all the child infos
        for value in parent:
            for field in request.form:
                if field.split('_')[0] == value:
                    fieldInfo = request.form[field].split('¤¤¤')
                    vatNumber = request.form['supplierInfo_vatNumber'].split('¤¤¤')[0]

                    # If a position is associated
                    if len(fieldInfo) == 2:
                        parent[value].append({
                            field : {  'field' : request.form[field].split('¤¤¤')[0], 'position' : request.form[field].split('¤¤¤')[1] }
                        })
                    else:
                        parent[value].append({
                            field : { 'field' : request.form[field].split('¤¤¤')[0], 'position' : None }
                        })
        _db.update({
            'table' : ['invoices'],
            'set'   : {
                'invoiceNumber'         : request.form['facturationInfo_invoiceNumber'].split('¤¤¤')[0],
                'HTAmount1'             : request.form['facturationInfo_noTaxes_1'].split('¤¤¤')[0],
                'HTAmount1_position'    : request.form['facturationInfo_noTaxes_1'].split('¤¤¤')[1] if len(request.form['facturationInfo_noTaxes_1'].split('¤¤¤')) > 1 else '' ,
                'VATRate1'              : request.form['facturationInfo_VAT_1'].split('¤¤¤')[0],
                'VATRate1_position'     : request.form['facturationInfo_VAT_1'].split('¤¤¤')[1] if len(request.form['facturationInfo_VAT_1'].split('¤¤¤')) > 1 else '',
                'invoiceDate'           : request.form['facturationInfo_date'].split('¤¤¤')[0],
            },
            'where' : ['rowid = ?'],
            'data'  : [pdfId]
        })

        _Files.exportXml(_cfg, request.form['facturationInfo_invoiceNumber'].split('¤¤¤')[0], parent, True, _db, vatNumber)

        # Unlock pdf and makes it processed
        _db.update({
            'table': ['invoices'],
            'set': {
                'locked'    : 0,
                'locked_by' : 'NULL',
                'processed' : 1
            },
            'where': ['locked_by = ?, rowid = ?'],
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


def change_status(id, status):
    _vars   = init()
    _db     = _vars[0]
    _cfg    = _vars[1].cfg

    res     = _db.update({
        'table' : ['invoices'],
        'set'   : {
            'status'    :   status,
        },
        'where' : ['rowid = ?'],
        'data'  : [id],
    })

    return res

def get_financial():
    _vars = init()
    _db = _vars[0]
    _cfg = _vars[1].cfg
    array = {}

    content     = pd.DataFrame(Spreadsheet.read_excel_sheet(_cfg['REFERENCIAL']['referencialfinancial']))
    for line in content.to_dict(orient='records'):
        if len(str(line['ID'])) >= 3:
            array[str(line['ID']).rstrip()] = line['LABEL']

    return array

def ocr_on_the_fly(fileName, selection, thumbSize):
    _vars   = init()
    _cfg    = _vars[1].cfg
    _Files  = _vars[5]
    _Ocr    = _vars[6]

    text = _Files.ocr_on_fly(_cfg['GLOBAL']['fullpath'] + fileName, selection, _Ocr, thumbSize)

    return text

def retrieve_supplier(data):
    _vars   = init()
    _db     = _vars[0]

    # Retrieve supplier info
    supplier_info = _db.select({
        'select': ['*'],
        'table' : ['suppliers'],
        'where' : ["name LIKE ?"],
        'data'  : ['%' + data + '%'],
        'limit' : '10'
    })

    return supplier_info
