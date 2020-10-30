import os
import json
import shutil
from datetime import datetime
from datetime import timedelta

from flask_babel import gettext
from flask_paginate import Pagination, get_page_args
from flask import current_app, Blueprint, flash, render_template, url_for, redirect, request

import worker_splitter_from_python
from webApp.auth import login_required
from werkzeug.utils import secure_filename

from .functions import get_custom_id, check_python_customized_files

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'pdf' not in custom_array:
    from . import pdf
else:
    pdf = getattr(__import__(custom_array['pdf']['path'], fromlist=[custom_array['pdf']['module']]), custom_array['pdf']['module'])

bp = Blueprint('ws_splitter', __name__)


@bp.route('/splitter/upload', methods=['GET', 'POST'])
def upload_file():
    _vars = pdf.init()
    _db = _vars[0]
    _cfg = _vars[1]
    _Files = _vars[5]
    _Splitter = _vars[7]
    if request.method == 'POST':
        for file in request.files:
            f = request.files[file]
            # The next 2 lines lower the extensions because an UPPER extension will throw silent error
            filename, file_ext = os.path.splitext(f.filename)
            file = filename.replace(' ', '_') + file_ext.lower()
            f.save(os.path.join(_cfg.cfg['SPLITTER']['pdforiginpath'], secure_filename(file)))

            worker_splitter_from_python.main({
                'file': _cfg.cfg['SPLITTER']['pdforiginpath'] + secure_filename(file),
                'config': current_app.config['CONFIG_FILE']
            })
    flash(gettext('FILE_UPLOAD_SUCCESS'))
    return url_for('pdf.upload', splitter='True')


@bp.route('/splitterManager/', defaults={'status': None, 'time': None})
@bp.route('/splitterManager/lot/', defaults={'status': None, 'time': None})
@bp.route('/splitterManager/lot/<string:time>/', defaults={'status': None})
@bp.route('/splitterManager/lot/<string:time>/<string:status>')
@login_required
def splitter_manager(status, time):
    _vars = pdf.init()
    _db = _vars[0]
    _cfg = _vars[1].cfg

    page, per_page, offset = get_page_args(page_parameter='page', per_page_parameter='per_page')
    status_list = _db.select({
        'select': ['*'],
        'table': ['status']
    })

    where = []
    if time:
        if time == 'TODAY':
            where.append("strftime('%Y-%m-%d', creation_date) = ?")
            day = datetime.today().strftime('%Y-%m-%d')

        elif time == 'YESTERDAY':
            where.append("strftime('%Y-%m-%d', creation_date) = ?")
            day = (datetime.today() - timedelta(days=1)).strftime('%Y-%m-%d')

        else:  # OLDER
            where.append("strftime('%Y-%m-%d', creation_date) < ?")
            day = (datetime.today() - timedelta(days=1)).strftime('%Y-%m-%d')

        if status and status != '*':
            where.append("invoices_batch_.status = '" + status + "'")
        else:
            where.append("invoices_batch_.status <> 'DEL'")

        if 'search' in request.args:
            where.append("(LOWER(dir_name) LIKE '%%" + request.args['search'].lower() + "%%')")

        total = _db.select({
            'select': ['count(DISTINCT(invoices_batch_.id)) as total'],
            'table': ['invoices_batch_', 'status'],
            'left_join': ['invoices_batch_.status = status.id'],
            'where': where,
            'data': [day]
        })[0]['total']

        pdf_list = _db.select({
            'select': [
                "DISTINCT(invoices_batch_.id) as invoice_id",
                "status.id as status_id",
                "strftime('%d-%m-%Y à %H:%M:%S', creation_date) as date",
                "*"
            ],
            'table': ['invoices_batch_', 'status'],
            'left_join': ['invoices_batch_.status = status.id'],
            'where': where,
            'data': [day],
            'limit': str(per_page),
            'offset': str(offset),
            'order_by': ['date DESC']
        })
    else:
        total = _db.select({
            'select': ['count(DISTINCT(invoices_batch_.id)) as total'],
            'table': ['invoices_batch_'],
            'where': ["status NOT IN ('END', 'DEL')", "strftime('%Y-%m-%d', creation_date) = ?"],
            'data': [datetime.today().strftime('%Y-%m-%d')],
        })[0]['total']

        pdf_list = _db.select({
            'select': [
                "DISTINCT(invoices_batch_.id) as invoice_id",
                "status.id as status_id",
                "strftime('%d-%m-%Y à %H:%M:%S', creation_date) as date",
                "*"
            ],
            'table': ['invoices_batch_', 'status'],
            'left_join': ['invoices_batch_.status = status.id'],
            'where': ["status NOT IN ('END', 'DEL')", "strftime('%Y-%m-%d', creation_date) = ?"],
            'data': [datetime.today().strftime('%Y-%m-%d')],
            'limit': str(per_page),
            'offset': str(offset),
            'order_by': ['date DESC']
        })

    result = [dict(_pdf) for _pdf in pdf_list]

    nb_of_pdf = len(pdf_list) if pdf_list else 0
    if total == 0:
        msg = gettext('NO_RESULTS')
    else:
        msg = gettext('SHOW') + ' <span id="count">' + str(offset + 1) + '</span> - <span>' + str(offset + nb_of_pdf) + '</span> ' + gettext('OF') + ' ' + str(total)

    pagination = Pagination(per_page=per_page,
                            page=page,
                            total=total,
                            display_msg=msg)

    return render_template('templates/splitter/splitter_manager.html',
                           batch_list=result,
                           page=page,
                           status_list=status_list,
                           per_page=per_page,
                           pagination=pagination,
                           cfg=_cfg)

# Splitter manager web services
# @bp.route('/splitterManager', defaults={'status': 'NEW', 'time': 'TODAY', 'search': None})
# @bp.route('/splitterManager/lot/', defaults={'status': 'NEW', 'time': 'TODAY', 'search': None})
# @bp.route('/splitterManager/lot/<string:time>/', defaults={'status': 'NEW', 'search': None})
# @bp.route('/splitterManager/lot/<string:time>/<string:status>', defaults={'search': None})
# @bp.route('/splitterManager/lot/<string:time>/<string:status>?search=<path:search>')
# def splitter_manager(status, time, search):
#     _vars = pdf.init()
#     _db = _vars[0]
#     _cfg = _vars[1]
#     page, per_page, offset = get_page_args(page_parameter='page',
#                                            per_page_parameter='per_page')
#
#     where = []
#     if time:
#         if time == 'TODAY':
#             where.append("strftime('%Y-%m-%d', creation_date) = ?")
#             day = datetime.today().strftime('%Y-%m-%d')
#
#         elif time == 'YESTERDAY':
#             where.append("strftime('%Y-%m-%d', creation_date) = ?")
#             day = (datetime.today() - timedelta(days=1)).strftime('%Y-%m-%d')
#
#         else:  # OLDER
#             where.append("strftime('%Y-%m-%d', creation_date) < ?")
#             day = (datetime.today() - timedelta(days=1)).strftime('%Y-%m-%d')
#
#         if status and status != '*':
#             where.append("invoices_batch_.status = '" + status + "'")
#         else:
#             where.append("invoices_batch_.status <> 'DEL'")
#
#         if search:
#             where.append("(dir_name LIKE '%' + search + '%')")
#             print(where)
#             exit()
#         total = _db.select({
#             'select': ['count(DISTINCT(invoices_batch_.id)) as total'],
#             'table': ['invoices_batch_', 'status'],
#             'left_join': ['invoices_batch_.status = status.id'],
#             'where': where,
#             'data': [day]
#         })[0]['total']
#
#         list_batch = _db.select({
#             'select': [
#                 "DISTINCT(invoices_batch_.id) as invoice_id",
#                 "status.id as status_id",
#                 "strftime('%d-%m-%Y à %H:%M:%S', creation_date) as date",
#                 "*"
#             ],
#             'table': ['invoices_batch_', 'status'],
#             'left_join': ['invoices_batch_.status = status.id'],
#             'where': where,
#             'data': [day],
#             'limit': str(per_page),
#             'offset': str(offset),
#             'order_by': ['date DESC']
#         })
#     else:
#         total = _db.select({
#             'select': ['count(DISTINCT(invoices_batch_.id)) as total'],
#             'table': ['invoices_batch_'],
#             'where': ["status NOT IN ('END', 'DEL')", "strftime('%Y-%m-%d', creation_date) = ?"],
#             'data': [datetime.today().strftime('%Y-%m-%d')],
#         })[0]['total']
#
#         list_batch = _db.select({
#             'select': [
#                 "DISTINCT(invoices_batch_.id) as invoice_id",
#                 "status.id as status_id",
#                 "strftime('%d-%m-%Y à %H:%M', creation_date) as date",
#                 "*"
#             ],
#             'table': ['invoices_batch_', 'status'],
#             'left_join': ['invoices_batch_.status = status.id'],
#             'where': ["status NOT IN ('END', 'DEL')", "strftime('%Y-%m-%d', creation_date) = ?"],
#             'data': [datetime.today().strftime('%Y-%m-%d')],
#             'limit': str(per_page),
#             'offset': str(offset),
#             'order_by': ['date DESC']
#         })
#
#
#     # if request.method == 'POST':
#     #     if 'search' in request.args:
#     #         search_str = request.args.get('search')
#     #         where = 'dir_name LIKE \'%' + search_str + '%\''
#     #         list_batch = _db.select({
#     #             'select': ['*'],
#     #             'table': ['invoices_batch_'],
#     #             'where': [where],
#     #             'limit': str(per_page),
#     #             'offset': str(offset)
#     #         })
#     # else:
#     #     list_batch = _db.select({
#     #         'select': ['*'],
#     #         'table': ['invoices_batch_'],
#     #         'where': ['status not in (?, ?)'],
#     #         'data': ['END', 'DEL'],
#     #         'limit': str(per_page),
#     #         'offset': str(offset),
#     #     })
#     #
#     # total = _db.select({
#     #     'select': ['count(*) as total'],
#     #     'table': ['invoices_batch_'],
#     #     'where': ['status not in (?, ?)'],
#     #     'data': ['END', 'DEL'],
#     # })[0]['total']
#
#     if total == 0:
#         msg = gettext('NO_RESULTS')
#     else:
#         msg = gettext('SHOW') + ' <span id="count">' + str(offset + 1) + '</span> - <span>' + str(
#             offset + total) + '</span> ' + gettext('OF') + ' ' + str(total)
#
#     pagination = Pagination(per_page=per_page,
#                             page=page,
#                             total=total,
#                             display_msg=msg)
#     files_path = []
#     for index_directory, directoryname in enumerate(os.listdir(_cfg.cfg['SPLITTER']['pdfoutputpath'])):
#         files_path.append(index_directory)
#
#     result = [dict(_pdf) for _pdf in list_batch]
#
#     for line in result:
#         if _cfg.cfg['DATABASE']['databasetype'] == 'pgsql':
#             pattern = "%Y-%m-%d %H:%M:%S.%f"
#         else:
#             pattern = "%Y-%m-%d %H:%M:%S"
#
#         line['creation_date'] = datetime.strptime(str(line['creation_date']), pattern).strftime('%d-%m-%Y à %H:%M')
#
#     return render_template('templates/splitter/splitter_manager.html',
#                            batch_list=result,
#                            page=page,
#                            per_page=per_page,
#                            pagination=pagination,
#                            cfg=_cfg)



@bp.route('/ws_splitter/delete', methods=('GET', 'POST'))
@login_required
def delete_batch():
    _vars = pdf.init()
    _db = _vars[0]
    _cfg = _vars[1].cfg
    batch_dir_name = request.args.get('batch_name')
    args = {
        'table': ['invoices_batch_'],
        'set': {'status': 'DEL'},
        'where': ["image_folder_name=?"],
        'data': [str(batch_dir_name)]
    }
    _db.update(args)
    return redirect(url_for('ws_splitter.splitter_manager'))


@bp.route('/deletePage/<path:path>', methods=('GET', 'POST'))
def delete_page(path):
    os.remove(path)
    return redirect(url_for('separate'))


@bp.route('/deleteInvoice', methods=('GET', 'POST'))
def delete_invoice():
    _vars = pdf.init()
    _cfg = _vars[1].cfg
    data = request.get_json()
    shutil.rmtree(_cfg.cfg['SPLITTER']['invoicespath'] + '/invoice' + str(data['index']), ignore_errors=True)
    return redirect(url_for('separate'))


@bp.route('/submitSplit', methods=('GET', 'POST'))
def submit_split():
    _vars = pdf.init()
    _db = _vars[0]
    _cfg = _vars[1]
    _Splitter = _vars[7]
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
    _vars = pdf.init()
    _cfg = _vars[1]
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in _cfg.cfg['SPLITTER']['allowedextensions']


# Splitter web services
@bp.route('/ws_splitter', methods=('GET', 'POST'))
@bp.route('/ws_splitter/<batch_dir_name>', methods=('GET', 'POST'))
@login_required
def separate(batch_dir_name):
    _vars = pdf.init()
    _db = _vars[0]
    _cfg = _vars[1]
    images_invoices_path = []
    # Add full path to batch name
    batch_dir_name = _cfg.cfg['SPLITTER']['tmpbatchpath'] + batch_dir_name
    batch_name = os.path.basename(os.path.normpath(batch_dir_name))
    for index_invoice, invoice in enumerate(sorted(os.listdir(batch_dir_name)), start=0):
        invoices_pages_folder = os.listdir(batch_dir_name + '/' + str(invoice))
        images_invoices_path.append([])

        for index_page, invoice_image in enumerate(sorted(invoices_pages_folder), 0):
            page_image_path = batch_name + '/invoice_' + str(index_invoice) + '/' + str(invoice_image)
            images_invoices_path[index_invoice].append(page_image_path)
    return render_template('templates/splitter/splitter_process.html', invoices=images_invoices_path)
