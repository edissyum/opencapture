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

from flask import Blueprint, request, make_response
from src.backend.import_controllers import auth


bp = Blueprint('auth', __name__, url_prefix='/ws/')


@bp.route('auth/login', methods=['POST'])
def login():
    data = request.json
    res = auth.login(data['username'], data['password'], data['lang'])
    return make_response(res[0], res[1])

