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

from flask import flash, g, redirect, render_template, request, url_for

from flask_babel import gettext
from ..import_controllers import pdf
from ..import_models import status


def get_status():
    _vars = pdf.init()
    _config = _vars[1]

    _status, error = status.get_status()
    if _status:
        response = {
            "status": _status
        }
        return response, 200
    else:
        response = {
            "errors": gettext("RETRIEVES_STATUS_ERROR"),
            "message": error
        }
        return response, 401
