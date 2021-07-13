# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
from flask_babel import gettext

from ..import_controllers import db


def get_invoice_by_id(args):
    _db = db.get_db()
    error = None
    user = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['invoices'],
        'where': ['id = %s'],
        'data': [args['invoice_id']]
    })

    if not user:
        error = gettext('GET_INVOICE_BY_ID_ERROR')
    else:
        user = user[0]

    return user, error


def get_invoices(args):
    _db = db.get_db()

    invoices = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['invoices'] if 'table' not in args else args['table'],
        'left_join': [] if 'left_join' not in args else args['left_join'],
        'where': ['1 = %s'] if 'where' not in args else args['where'],
        'data': ['1'] if 'data' not in args else args['data'],
        'order_by': [] if 'order_by' not in args else args['order_by'],
        'limit': str(args['limit']) if 'limit' in args else [],
        'offset': str(args['offset']) if 'offset' in args else [],
    })

    return invoices
