from flask import (
    current_app, Blueprint, render_template,
)

from flask_babel import gettext
from flask_paginate import Pagination, get_page_args
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

if 'Database' not in custom_array: from bin.src.classes.Database import Database as _Database
else: _Database = getattr(__import__(custom_array['Database']['path'] + '.' + custom_array['Database']['module'], fromlist=[custom_array['Database']['module']]), custom_array['Database']['module'])

bp = Blueprint('supplier', __name__, url_prefix='/supplier')

def init():
    configName  = _Config(current_app.config['CONFIG_FILE'])
    Config      = _Config(current_app.config['CONFIG_FOLDER'] + '/config_' + configName.cfg['PROFILE']['id'] + '.ini')
    Log         = _Log(Config.cfg['GLOBAL']['logfile'])
    db          = _Database(Log, None, get_db())

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

    return render_template('templates/suppliers/suppliers_list.html',
                           suppliers=result,
                           page=page,
                           per_page=per_page,
                           pagination=pagination)