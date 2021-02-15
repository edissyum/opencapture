from flask_babel import gettext
from webApp.auth import admin_login_required
from flask import Blueprint, render_template, request
from flask_paginate import Pagination, get_page_args
from webApp import forms

from .functions import get_custom_id, check_python_customized_files

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])
if 'pdf' not in custom_array:
    from . import pdf
else:
    pdf = getattr(__import__(custom_array['pdf']['path'], fromlist=[custom_array['pdf']['module']]), custom_array['pdf']['module'])

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'pdf' not in custom_array:
    from . import pdf
else:
    pdf = getattr(__import__(custom_array['pdf']['path'], fromlist=[custom_array['pdf']['module']]), custom_array['pdf']['module'])

bp = Blueprint('supplier', __name__, url_prefix='/supplier')


@bp.route('/list')
@admin_login_required
def supplier_list():
    _vars = pdf.init()
    _db = _vars[0]
    data = request.args

    page, per_page, offset = get_page_args(page_parameter='page',
                                           per_page_parameter='per_page')
    query_where = ['status= ?']
    query_data = ['ACTIVE']

    search = data.get('search')
    if search is not None:
        query_where.append('UPPER(name) LIKE ?')
        query_data.append('%' + search.upper() + '%')

    total = _db.select({
        'select': ['count(*) as total'],
        'table': ['suppliers'],
        'where': query_where,
        'data': query_data,
    })[0]['total']

    list_supplier = _db.select({
        'select': ['*'],
        'table': ['suppliers'],
        'where': query_where,
        'data': query_data,
        'limit': str(per_page),
        'offset': str(offset)
    })

    # Generate form using WTFORM
    supplier_form = forms.SupplierForm(request.form)

    result = [dict(supplier) for supplier in list_supplier]

    msg = gettext('SHOW') + ' <span id="count">' + str(offset + 1) + '</span> - <span>' + str(offset + len(list_supplier)) + '</span> ' + gettext('OF') + ' ' + str(total)

    pagination = Pagination(per_page=per_page,
                            page=page,
                            total=total,
                            display_msg=msg)

    return render_template('templates/suppliers/suppliers_list.html',
                           suppliers=result,
                           supplier_form=supplier_form,
                           page=page,
                           per_page=per_page,
                           pagination=pagination)
