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
# @dev : Oussama Brich <oussama.brich@edissyum.com>

from flask import current_app
from ..import_classes import _Files
from ..import_controllers import pdf
from ..models import verifier


def handle_uploaded_file(files):
    result = _Files.save_uploaded_file(files, current_app.config['UPLOAD_FOLDER'])
    return result


def retrieve_invoices(args):
    _vars = pdf.init()
    _config = _vars[1]

    if 'where' not in args:
        args['where'] = []
    if 'data' not in args:
        args['data'] = []
    if 'select' not in args:
        args['select'] = []

    args['select'].append("DISTINCT(invoices.id) as invoice_id")
    args['select'].append("to_char(register_date, 'DD-MM-YYY à HH24:MI:SS') as date")
    args['select'].append("*")

    if 'time' in args:
        if args['time'] in ['today', 'yesterday']:
            args['where'].append("to_char(register_date, 'YYYY-MM-DD') = to_char(TIMESTAMP '" + args['time'] + "', 'YYYY-MM-DD')")
        else:
            args['where'].append("to_char(register_date, 'YYYY-MM-DD') < to_char(TIMESTAMP 'yesterday', 'YYYY-MM-DD')")

    if 'status' in args:
        args['where'].append('status = %s')
        args['data'].append(args['status'])

    total_invoices = verifier.get_invoices({'select': ['count(DISTINCT(invoices.id)) as total'], 'where': args['where'], 'data': args['data']})
    if total_invoices != 0:
        invoices_list = verifier.get_invoices(args)
        response = {
            "total": total_invoices[0]['total'],
            "invoices": invoices_list
        }
        return response, 200
