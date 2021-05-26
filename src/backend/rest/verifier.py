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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

from flask_babel import gettext
from ..controllers.auth import token_required
from ..controllers.verifier import handle_uploaded_file
from ..controllers import pdf
from flask import Blueprint, make_response, request

bp = Blueprint('verifier', __name__, url_prefix='/ws/')


@bp.route('verifier/upload', methods=['POST'])
@token_required
def upload():
    files = request.files
    res = handle_uploaded_file(files)
    if res:
        return make_response('', 200)
    else:
        return make_response(gettext('UNKNOW_ERROR'), 400)


@bp.route('verifier/list', defaults={'status': None, 'time': None})
@bp.route('verifier/list/<string:time>', defaults={'status': None})
@bp.route('verifier/list/<string:time>/<string:status>')
@token_required
def list(time, status):
    _vars = pdf.init()
    _db = _vars[0]
    _cfg = _vars[1].cfg

    return make_response('', 200)
