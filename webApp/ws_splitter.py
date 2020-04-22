from flask_babel import gettext
from flask import (
    current_app, Blueprint, flash
)
import os
import shutil
import json
import worker_splitter_from_python
from flask import render_template, url_for, redirect, request
from werkzeug.utils import secure_filename
from bin.src.classes.WebServices import WebServices
from webApp.db import get_db
from webApp.auth import login_required
from bin.src.classes.Xml import Xml as xml
from bin.src.classes.Log import Log as lg
from bin.src.classes.Files import Files as file
from bin.src.classes.Database import Database
from bin.src.classes.Locale import Locale as lc
from bin.src.classes.Config import Config as cfg
from bin.src.classes.PyTesseract import PyTesseract
from bin.src.classes.Splitter import Splitter
from flask_paginate import Pagination, get_page_args

bp = Blueprint('ws_splitter', __name__)

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
    splitter    = Splitter(Config, db, Locale)
    if Config.cfg['GED']['enabled'] == 'True':
        ws      = WebServices(
            Config.cfg['GED']['host'],
            Config.cfg['GED']['user'],
            Config.cfg['GED']['password'],
            Log,
            Config
        )
    return db, Config, Locale, splitter, ws, Xml, Files, Ocr


@bp.route('/splitter/upload', methods=['GET', 'POST'])
def upload_file():
    vars = init()
    _db = vars[0]
    _cfg = vars[1]
    _Files = vars[5]
    _Splitter = vars[3]
    if request.method == 'POST':
        for file in request.files:
            f                   = request.files[file]
            # The next 2 lines lower the extensions because an UPPER extension will throw silent error
            filename, file_ext  = os.path.splitext(f.filename)
            file                = filename.replace(' ', '_') + file_ext.lower()
            f.save(os.path.join(_cfg.cfg['SPLITTER']['pdforiginpath'],  secure_filename(file)))

            worker_splitter_from_python.main({
                'file': _cfg.cfg['SPLITTER']['pdforiginpath'] + file,
                'config': current_app.config['CONFIG_FILE']
            })
    flash(gettext('FILE_UPLOAD_SUCCESS'))
    return url_for('pdf.upload', splitter='True')

# Splitter manager web services
@bp.route('/splitterManager', methods=('GET', 'POST'))
def splitter_manager():
    vars = init()
    _db = vars[0]
    _cfg = vars[1]
    page, per_page, offset = get_page_args(page_parameter='page',
                                           per_page_parameter='per_page')
    if request.method == 'POST':
        if 'search' in request.args:
            search_str = request.args.get('search')
            where = 'dir_name LIKE \'%' + search_str + '%\''
            list_batch = _db.select({
                'select': ['*'],
                'table': ['invoices_batch_'],
                'where': [where],
                'limit': str(offset) + ',' + str(per_page),
            })
    else:
        list_batch = _db.select({
            'select': ['*'],
            'table': ['invoices_batch_'],
            'where': ['status not in (?, ?)'],
            'data' : ['END', 'DEL'],
            'limit'     : str(offset) + ',' + str(per_page),
        })

    total = _db.select({
        'select': ['count(*) as total'],
        'table' : ['invoices_batch_'],
        'where': ['status not in (?, ?)'],
        'data': ['END', 'DEL'],
    })[0]['total']

    if total == 0:
        msg = gettext('NO_RESULTS')
    else:
        msg = gettext('SHOW') + ' <span id="count">' + str(offset + 1) + '</span> - <span>' + str(
            offset + total) + '</span> ' + gettext('OF') + ' ' + str(total)

    pagination = Pagination(per_page=per_page,
                            page=page,
                            total=total,
                            display_msg=msg)
    files_path = []
    for index_directory, directoryname in enumerate(os.listdir(_cfg.cfg['SPLITTER']['pdfoutputpath'])):
        files_path.append(index_directory)

    return render_template('splitter/splitter_manager.html',
                            batch_list=list_batch,
                            page = page,
                            per_page = per_page,
                            pagination=pagination,
                            cfg = _cfg)


@bp.route('/ws_splitter/delete', methods=('GET', 'POST'))
@login_required
def delete_batch():
    _vars = init()
    _db = _vars[0]
    _cfg = _vars[1].cfg
    batch_dir_name = request.args.get('batch_name')
    args = {
        'table': ['invoices_batch_'],
        'set' : {'status' :  'DEL'},
        'where': ["image_folder_name=?"],
        'data' : [str(batch_dir_name)]
    }
    _db.update(args)
    return redirect(url_for('ws_splitter.splitter_manager'))

@bp.route('/deletePage/<path:path>', methods=('GET', 'POST'))
def delete_page(path):
    os.remove(path)
    return redirect(url_for('separate'))

@bp.route('/deleteInvoice', methods=('GET', 'POST'))
def delete_invoice():
    _vars = init()
    _cfg = _vars[1].cfg
    data = request.get_json()
    shutil.rmtree(_cfg.cfg['SPLITTER']['invoicespath'] + '/invoice' + str(data['index']), ignore_errors=True)
    return redirect(url_for('separate'))

@bp.route('/submitSplit', methods=('GET', 'POST'))
def submitSplit():
    _vars = init()
    _db = _vars[0]
    _cfg = _vars[1]
    _Splitter = _vars[3]
    data = request.get_json()

    # Get origin file name from database to split files us it as a reference
    batch = _db.select({
        'select': ['*'],
        'table': ['invoices_batch_'],
        'where': ['image_folder_name = ?'],
        'data': [str(data['ids'][0][0]).split("/")[0]]
    })[0]


    # merging invoices pages by or creation_date
    _Splitter.get_page_order_after_user_change(data['ids'],
                                              str(batch['dir_name']),
                                               _cfg.cfg['SPLITTER']['pdfoutputpath'])

    # delete batch after validate
    args = {
        'table': ['invoices_batch_'],
        'set': {'status': 'DEL'},
        'where': ["image_folder_name=?"],
        'data': [batch['image_folder_name']]
    }
    _db.update(args)
    args = {
        'table': ['image_page_number'],
        'set': {'status': 'DEL'},
        'where': ["batch_name=?"],
        'data': [batch['image_folder_name']]
    }
    _db.update(args)

    shutil.rmtree(_cfg.cfg['SPLITTER']['tmpbatchpath'] + batch['image_folder_name'])

    return json.dumps({'text': 'res', 'code': 200, 'ok': 'true'})

# import only allowed files
def allowed_file(filename):
    _vars = init()
    _cfg = _vars[1]
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in _cfg.cfg['SPLITTER']['allowedextensions']


# Splitter web services
@bp.route('/ws_splitter', methods=('GET', 'POST'))
@bp.route('/ws_splitter/<batch_dir_name>', methods=('GET', 'POST'))
@login_required
def separate(batch_dir_name):
    _vars = init()
    _db = _vars[0]
    _cfg = _vars[1]
    _files = _vars[6]
    images_invoices_path = []
    # Add full path to batch name
    batch_dir_name = _cfg.cfg['SPLITTER']['tmpbatchpath'] + batch_dir_name
    batch_name = os.path.basename(os.path.normpath(batch_dir_name))
    for index_invoice, invoice in enumerate(sorted(os.listdir( batch_dir_name)), start=0):
        invoices_pages_folder = os.listdir(batch_dir_name + '/' + str(invoice))
        images_invoices_path.append([])

        for index_page, invoice_image in enumerate(sorted(invoices_pages_folder), 0):
            page_image_path = batch_name + '/invoice_' + str(index_invoice) + '/' + str(invoice_image)
            images_invoices_path[index_invoice].append(page_image_path)

    return render_template('splitter/splitter_process.html', invoices=images_invoices_path)