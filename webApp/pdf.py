from flask_babel import gettext
from flask_paginate import Pagination, get_page_args
from flask import current_app, Blueprint, flash, redirect, render_template, request, url_for, session, Response

import os
import pandas as pd
from datetime import datetime
from datetime import timedelta

from webApp import forms
from webApp.db import get_db
from webApp.auth import login_required
from webApp.functions import get_custom_id, check_python_customized_files

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'Config' not in custom_array:
    from bin.src.classes.Config import Config as _Config
else:
    _Config = getattr(__import__(custom_array['Config']['path'] + '.' + custom_array['Config']['module'], fromlist=[custom_array['Config']['module']]), custom_array['Config']['module'])

if 'Log' not in custom_array:
    from bin.src.classes.Log import Log as _Log
else:
    _Log = getattr(__import__(custom_array['Log']['path'] + '.' + custom_array['Log']['module'], fromlist=[custom_array['Log']['module']]), custom_array['Log']['module'])

if 'Files' not in custom_array:
    from bin.src.classes.Files import Files as _Files
else:
    _Files = getattr(__import__(custom_array['Files']['path'] + '.' + custom_array['Files']['module'], fromlist=[custom_array['Files']['module']]), custom_array['Files']['module'])

if 'Xml' not in custom_array:
    from bin.src.classes.Xml import Xml as _Xml
else:
    _Xml = getattr(__import__(custom_array['Xml']['path'] + '.' + custom_array['Xml']['module'], fromlist=[custom_array['Xml']['module']]), custom_array['Xml']['module'])

if 'WebServices' not in custom_array:
    from bin.src.classes.WebServices import WebServices as _WebServices
else:
    _WebServices = getattr(__import__(custom_array['WebServices']['path'] + '.' + custom_array['WebServices']['module'], fromlist=[custom_array['WebServices']['module']]),
                           custom_array['WebServices']['module'])

if 'Locale' not in custom_array:
    from bin.src.classes.Locale import Locale as _Locale
else:
    _Locale = getattr(__import__(custom_array['Locale']['path'] + '.' + custom_array['Locale']['module'], fromlist=[custom_array['Locale']['module']]), custom_array['Locale']['module'])

if 'PyTesseract' not in custom_array:
    from bin.src.classes.PyTesseract import PyTesseract as _PyTesseract
else:
    _PyTesseract = getattr(__import__(custom_array['PyTesseract']['path'] + '.' + custom_array['PyTesseract']['module'], fromlist=[custom_array['PyTesseract']['module']]),
                           custom_array['PyTesseract']['module'])

if 'Database' not in custom_array:
    from bin.src.classes.Database import Database as _Database
else:
    _Database = getattr(__import__(custom_array['Database']['path'] + '.' + custom_array['Database']['module'], fromlist=[custom_array['Database']['module']]), custom_array['Database']['module'])

if 'Spreadsheet' not in custom_array:
    from bin.src.classes.Spreadsheet import Spreadsheet as _Spreadsheet
else:
    _Spreadsheet = getattr(__import__(custom_array['Spreadsheet']['path'] + '.' + custom_array['Spreadsheet']['module'], fromlist=[custom_array['Spreadsheet']['module']]),
                           custom_array['Spreadsheet']['module'])

if 'Splitter' not in custom_array:
    from bin.src.classes.Splitter import Splitter as _Splitter
else:
    _Splitter = getattr(__import__(custom_array['Splitter']['path'] + '.' + custom_array['Splitter']['module'], fromlist=[custom_array['Splitter']['module']]), custom_array['Splitter']['module'])


bp = Blueprint('pdf', __name__)


def init():
    config_name = _Config(current_app.config['CONFIG_FILE'])
    config = _Config(current_app.config['CONFIG_FOLDER'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini')
    log = _Log(config.cfg['GLOBAL']['logfile'])
    db_type = config.cfg['DATABASE']['databasetype']
    db = _Database(log, db_type, conn=get_db().conn)
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
    splitter = _Splitter(config, db, locale)
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


@bp.route('/')
@login_required
def home():
    return render_template('templates/home.html')


@bp.route('/list/', defaults={'status': None, 'time': None})
@bp.route('/list/lot/', defaults={'status': None, 'time': None})
@bp.route('/list/lot/<string:time>/', defaults={'status': None})
@bp.route('/list/lot/<string:time>/<string:status>')
@login_required
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
            'left_join': ['invoices.status = status.id', 'invoices.id_supplier = suppliers.id'],
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
            'left_join': ['invoices.status = status.id', 'invoices.id_supplier = suppliers.id'],
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
            'where': ['id = ?'],
            'data': [pdf['id_supplier']]
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
@login_required
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

    # Retrieve supplier info
    supplier_info = _db.select({
        'select': ['*'],
        'table': ['suppliers'],
        'where': ['id = ?'],
        'data': [pdf_info['id_supplier']],
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

    # Generate form using WTFORM
    supplier_form = forms.SupplierForm(request.form)
    supplier_form = populate_form(supplier_form, pdf_info, position_dict, _db)

    facturation_form = forms.FacturationForm(request.form)
    facturation_form = populate_form(facturation_form, pdf_info, position_dict, _db)

    analytics_form = forms.AnalyticsForm(request.form)
    analytics_form = populate_form(analytics_form, pdf_info, position_dict, _db)

    return render_template("templates/pdf/view.html",
                           supplier_form=supplier_form,
                           facturation_form=facturation_form,
                           analytics_form=analytics_form,
                           pdf=pdf_info,
                           position=position_dict,
                           width=original_width,
                           supplier=supplier_info,
                           arrayOfFinancial=array_financial,
                           list_users=ged_users['users'],
                           )


@bp.route('/upload')
@bp.route('/upload?splitter=<string:issep>')
@login_required
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

    ged = {}
    contact = {}
    pdf_id = request.args['id']
    res = True
    footer_page = 1
    invoice_number_page = 1
    invoice_date_page = 1

    if request.method == 'POST':
        supplier_form = forms.SupplierForm(request.form)
        facturation_form = forms.FacturationForm(request.form)
        analytics_form = forms.AnalyticsForm(request.form)

        _forms = [supplier_form, facturation_form, analytics_form]

        # Create an array containing the parent element, used to structure the XML
        parent = {
            'fileInfo': [],
            supplier_form.xml_index: [],
            facturation_form.xml_index: [],
            analytics_form.xml_index: []
        }

        # Fill the XML object with WWTFORM
        for form in _forms:
            for field in form:
                if field.render_kw and 'x1_original' in field.render_kw and field.name + '_position' in request.form:
                    parent[form.xml_index].append({
                        field.name: {'field': field.data, 'position': request.form[field.name + '_position']}
                    })
                else:
                    parent[form.xml_index].append({
                        field.name: {'field': field.data, 'position': None}
                    })

        vat_number = supplier_form.vat_number.data
        invoice_number = facturation_form.invoice_number.data
        invoice_date = facturation_form.invoice_date.data
        vat_1 = facturation_form.vat_1.data
        no_taxes_1 = facturation_form.no_taxes_1.data

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
            ged['creationDate'] = request.form['fileInfo_pdf_creation_date']
            ged['date'] = invoice_date
            ged['dest_user'] = request.form['ged_users'].split('#')[0]
            ged['vatNumber'] = vat_number
            ged[_cfg.cfg[default_process]['customvatnumber']] = vat_number
            ged[_cfg.cfg[default_process]['customht']] = request.form['total_ht']
            ged[_cfg.cfg[default_process]['customttc']] = request.form['total_ttc']
            ged[_cfg.cfg[default_process]['custominvoicenumber']] = invoice_number
            ged[_cfg.cfg[default_process]['custombudget']] = request.form['budget_selection_1']
            ged[_cfg.cfg[default_process]['customoutcome']] = request.form['structure_selection_1']
            ged['subject'] = 'Facture N°' + invoice_number
            ged['destination'] = request.form['ged_users'].split('#')[1] if request.form['ged_users'] else _cfg.cfg[default_process]['defaultdestination']

            if int(request.form['facturationInfo_number_of_delivery_number']) > 0:
                number_of_delivery_number = int(request.form['facturationInfo_number_of_delivery_number'])
                if number_of_delivery_number and number_of_delivery_number == 1:
                    ged[_cfg.cfg[default_process]['customdeliverynumber']] = facturation_form.delivery_number_1.data
                elif number_of_delivery_number > 1:
                    tmp_delivery = ''
                    for i in range(1, number_of_delivery_number + 1):
                        tmp_delivery += request.form['delivery_number_' + str(i)] + ';'
                    ged[_cfg.cfg[default_process]['customdeliverynumber']] = tmp_delivery[:-1]

            if int(request.form['facturationInfo_number_of_order_number']) > 0:
                number_of_order_number = int(request.form['facturationInfo_number_of_order_number'])
                if number_of_order_number and number_of_order_number == 1:
                    ged[_cfg.cfg[default_process]['customordernumber']] = facturation_form.order_number_1.data
                elif number_of_order_number > 1:
                    tmp_order = ''
                    for i in range(1, number_of_order_number + 1):
                        tmp_order += request.form['facturationInfo_order_number_' + str(i)] + ';'
                    ged[_cfg.cfg[default_process]['customordernumber']] = tmp_order[:-1]

            # Looking for an existing user in the GED, using VAT number as primary key
            ged['contact'] = _ws.retrieve_contact_by_vat_number(vat_number)

            # If no contact found, create it
            if not ged['contact']:
                contact['isCorporatePerson'] = 'Y'
                contact['function'] = ''
                contact['lastname'] = ''
                contact['firstname'] = ''
                contact['contactType'] = _cfg.cfg[default_process]['contacttype']
                contact['contactPurposeId'] = _cfg.cfg[default_process]['contactpurposeid']
                contact['society'] = supplier_form.name.data
                contact['addressTown'] = supplier_form.city.data
                contact['societyShort'] = supplier_form.name.data
                contact['addressStreet'] = supplier_form.address.data
                contact['otherData'] = vat_number
                contact['addressZip'] = supplier_form.postal_code.data
                contact['email'] = 'À renseigner ' + supplier_form.name.data + ' - ' + vat_number

                contact = _ws.create_contact(contact)
                if contact is not False:
                    ged['contact'] = {'id': contact['addressId'], 'contact_id': contact['contactId']}

            res = _ws.insert_with_args(ged, _cfg)

        # Fill the parent array with all the child infos
        for value in parent:
            for field in request.form:
                if any(x in field for x in ['no_taxes', 'vat_']):
                    if '_page' in field:
                        footer_page = request.form[field]
                if field == 'invoice_number_page':
                    invoice_number_page = request.form['invoice_number_page']
                if field == 'invoice_date_page':
                    invoice_date_page = request.form['invoice_date_page']
                if field.split('_')[0] == value:
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
                'invoice_number': invoice_number,
                'invoice_number_position': request.form['invoice_number_position'] if 'invoice_number_position' in request.form else '',
                'no_taxes_1': no_taxes_1,
                'no_taxes_1_position': request.form['no_taxes_1_position'] if 'no_taxes_1_position' in request.form else '',
                'vat_1': vat_1,
                'vat_1_position': request.form['vat_1_position'] if 'vat_1_position' in request.form else '',
                'invoice_date': invoice_date,
                'invoice_date_position': request.form['invoice_date_position'] if 'invoice_date_position' in request.form else '',
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

            _files.export_xml(_cfg, invoice_number, parent, True, _db, vat_number)

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
    _array = [['', gettext('SELECT_LOAD_ACCOUNT'), True]]

    content = pd.DataFrame(_Spreadsheet.read_excel_sheet(_cfg['REFERENCIAL']['referencialfinancial']))

    for line in content.to_dict(orient='records'):
        if len(str(line['ID'])) >= 3:
            _array.append([str(line['ID']).rstrip(), line['LABEL'], False])
    return _array


def get_structure():
    _array = []
    for i in range(1, 41):
        _array.append(['village ' + str(i), 'Village ' + str(i), False])
    return _array


def get_outcome():
    _array = []
    for i in range(1, 3):
        _array.append(['budget ' + str(i), 'Budget ' + str(i), False])
    return _array


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
        if text.count('.'):
            text = text.replace('.', ',')
        return text
    else:
        _files.improve_image_detection(path)
        text = _files.ocr_on_fly(path, selection, _Ocr, thumb_size)
        if text.count('.'):
            text = text.replace('.', ',')
        return text


def populate_form(form, pdf_info, position_dict, _db):
    for field in form:
        select = table = where = data = False
        if field.table == 'suppliers':
            if pdf_info['id_supplier']:
                if field.column and field.table:
                    select = [field.column]
                    table = [field.table]
                    where = ['id = ?']
                    data = [pdf_info['id_supplier']]
        else:
            if field.column and field.table:
                select = [field.column]
                table = [field.table]
                where = ['vat_number = ? and id = ?']
                data = [pdf_info['vat_number'], pdf_info['id']]

        if select and table and where and data:
            res = _db.select({
                'select': select,
                'table': table,
                'where': where,
                'data': data,
            })[0]

            if res:
                field.data = res[field.column]

        if field.render_kw:
            if field.table == 'suppliers':
                field.render_kw['page'] = pdf_info['supplier_page']
            else:
                if field.is_footer:
                    field.render_kw['page'] = pdf_info['footer_page']
                elif field.column:
                    field.render_kw['page'] = pdf_info[field.column + '_page']

        if field.column and field.column + '_position' in position_dict and field.is_position:
            field.render_kw['x1_original'] = position_dict[field.column + '_position'][0][0]
            field.render_kw['y1_original'] = position_dict[field.column + '_position'][0][1]
            field.render_kw['x2_original'] = position_dict[field.column + '_position'][1][0]
            field.render_kw['y2_original'] = position_dict[field.column + '_position'][1][1]

        if field.type == 'CustomSelectField':
            field.choices = eval(field.choices[0] + '()')
    return form
