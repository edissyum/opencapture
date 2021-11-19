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

from flask_babel import gettext
from src.backend.main import create_classes_from_current_config


def get_status(module):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    forms = _db.select({
        'select': ['*'],
        'table': ['status'],
        'where': ['module = %s'],
        'data': [module]
    })

    if not forms:
        error = gettext('NO_STATUS')

    return forms, error