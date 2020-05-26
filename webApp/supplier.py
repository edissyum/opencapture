import datetime
from flask import (
    current_app, Blueprint, flash, g, redirect, render_template, request, url_for
)

from flask_babel import gettext
from flask_paginate import Pagination, get_page_args
from werkzeug.security import check_password_hash, generate_password_hash

from webApp.db import get_db
from webApp.auth import login_required, register
from bin.src.classes.Log import Log as lg
from bin.src.classes.Database import Database
from bin.src.classes.Config import Config as cfg

bp = Blueprint('supplier', __name__, url_prefix='/supplier')

def init():
    configName  = cfg(current_app.config['CONFIG_FILE'])
    Config      = cfg(current_app.config['CONFIG_FOLDER'] + '/config_' + configName.cfg['PROFILE']['id'] + '.ini')
    Log         = lg(Config.cfg['GLOBAL']['logfile'])
    db          = Database(Log, None, get_db())

    return db, Config

@bp.route('/list')
@login_required
def supplier_list():
    _vars = init()
    _db = _vars[0]

    page, per_page, offset = get_page_args(page_parameter='page',
                                           per_page_parameter='per_page')

    total = _db.select({
        'select': ['count(*) as total'],
        'table' : ['suppliers'],
    })[0]['total']

    list_supplier = _db.select({
        'select': ['*'],
        'table': ['suppliers'],
        'limit': str(offset) + ',' + str(per_page),
    })

    result = [dict(supplier) for supplier in list_supplier]

    msg = gettext('SHOW') + ' <span id="count">' + str(offset + 1) + '</span> - <span>' + str(offset + len(list_supplier)) + '</span> ' + gettext('OF') + ' ' + str(total)

    pagination = Pagination(per_page=per_page,
                            page=page,
                            total=total,
                            display_msg=msg)

    return render_template('suppliers/suppliers_list.html',
                           suppliers=result,
                           page=page,
                           per_page=per_page,
                           pagination=pagination)