# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import psycopg2
from flask_babel import gettext
from src.backend.import_classes import _Config
from src.backend.import_controllers import auth
from flask import Blueprint, request, make_response, current_app


bp = Blueprint('auth', __name__, url_prefix='/ws/')


@bp.route('auth/login', methods=['POST'])
def login():
    res = check_connection()
    if res is None:
        data = request.json
        res = auth.login(data['username'], data['password'], data['lang'])
    else:
        res = [{
                "errors": gettext('PGSQL_ERROR'),
                "message": res.replace('\n', '')
            }, 401]
    return make_response(res[0], res[1])


def check_connection():
    config_name = _Config(current_app.config['CONFIG_FILE'])
    config = _Config(current_app.config['CONFIG_FOLDER'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini')
    db_user = config.cfg['DATABASE']['postgresuser']
    db_host = config.cfg['DATABASE']['postgreshost']
    db_port = config.cfg['DATABASE']['postgresport']
    db_pwd = config.cfg['DATABASE']['postgrespassword']
    db_name = config.cfg['DATABASE']['postgresdatabase']
    try:
        psycopg2.connect(
            "dbname     =" + db_name +
            " user      =" + db_user +
            " password  =" + db_pwd +
            " host      =" + db_host +
            " port      =" + db_port)
    except (psycopg2.OperationalError, psycopg2.ProgrammingError) as _e:
        return str(_e).split('\n', maxsplit=1)[0]
