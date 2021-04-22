
from flask_babel import gettext
from flask import Blueprint, render_template
from flask_paginate import Pagination, get_page_args
from import_controllers import pdf

bp = Blueprint('supplier', __name__, url_prefix='/supplier')


@bp.route('/list')
def supplier_list():
    _vars = pdf.init()
    _db = _vars[0]

    page, per_page, offset = get_page_args(page_parameter='page',
                                           per_page_parameter='per_page')

    total = _db.select({
        'select': ['count(*) as total'],
        'table': ['suppliers'],
    })[0]['total']

    list_supplier = _db.select({
        'select': ['*'],
        'table': ['suppliers'],
        'limit': str(per_page),
        'offset': str(offset)
    })

    result = [dict(supplier) for supplier in list_supplier]

    msg = gettext('SHOW') + ' <span id="count">' + str(offset + 1) + '</span> - <span>' + str(offset + len(list_supplier)) + '</span> ' + gettext('OF') + ' ' + str(total)

    pagination = Pagination(per_page=per_page,
                            page=page,
                            total=total,
                            display_msg=msg)

    return render_template('templates/suppliers/suppliers_list.html',
                           suppliers=result,
                           page=page,
                           per_page=per_page,
                           pagination=pagination)
