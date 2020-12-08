import os
from datetime import datetime
from datetime import timedelta

from flask_babel import gettext
from flask_paginate import Pagination, get_page_args
from flask import current_app, Blueprint, flash, render_template, url_for, redirect, request

from webApp.auth import login_required

from .functions import get_custom_id, check_python_customized_files

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'pdf' not in custom_array:
    from . import pdf
else:
    pdf = getattr(__import__(custom_array['pdf']['path'], fromlist=[custom_array['pdf']['module']]), custom_array['pdf']['module'])

bp = Blueprint('splitter', __name__)


@bp.route('/splitter/list/', defaults={'status': None, 'time': None})
@bp.route('/splitter/list/lot/', defaults={'status': None, 'time': None})
@bp.route('/splitter/list/lot/<string:time>/', defaults={'status': None})
@bp.route('/splitter/list/lot/<string:time>/<string:status>')
@login_required
def splitter_list(status, time):
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
            where.append("splitter_batches.status = '" + status + "'")
        else:
            where.append("splitter_batches.status <> 'DEL'")

        if 'search' in request.args:
            where.append("(LOWER(dir_name) LIKE '%%" + request.args['search'].lower() + "%%')")

        total = _db.select({
            'select': ['count(DISTINCT(splitter_batches.id)) as total'],
            'table': ['splitter_batches', 'status'],
            'left_join': ['splitter_batches.status = status.id'],
            'where': where,
            'data': [day]
        })[0]['total']

        pdf_list = _db.select({
            'select': [
                "DISTINCT(splitter_batches.id) as invoice_id",
                "status.id as status_id",
                "strftime('%d-%m-%Y à %H:%M:%S', creation_date) as date",
                "*"
            ],
            'table': ['splitter_batches', 'status'],
            'left_join': ['splitter_batches.status = status.id'],
            'where': where,
            'data': [day],
            'limit': str(per_page),
            'offset': str(offset),
            'order_by': ['date DESC']
        })
    else:
        total = _db.select({
            'select': ['count(DISTINCT(splitter_batches.id)) as total'],
            'table': ['splitter_batches'],
            'where': ["status NOT IN ('END', 'DEL')", "strftime('%Y-%m-%d', creation_date) = ?"],
            'data': [datetime.today().strftime('%Y-%m-%d')],
        })[0]['total']

        pdf_list = _db.select({
            'select': [
                "DISTINCT(splitter_batches.id) as invoice_id",
                "status.id as status_id",
                "strftime('%d-%m-%Y à %H:%M:%S', creation_date) as date",
                "*"
            ],
            'table': ['splitter_batches', 'status'],
            'left_join': ['splitter_batches.status = status.id'],
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

    return render_template('templates/splitter/list.html',
                           batch_list=result,
                           page=page,
                           status_list=status_list,
                           per_page=per_page,
                           pagination=pagination,
                           cfg=_cfg)


@bp.route('/splitter/view/', methods=('GET', 'POST'))
@bp.route('/splitter/view/<batch_dir_name>', methods=('GET', 'POST'))
@login_required
def splitter_view(batch_dir_name):
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
    return render_template('templates/splitter/view.html', invoices=images_invoices_path)
