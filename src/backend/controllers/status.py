# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# See LICENCE file at the root folder for more details.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

from flask_babel import gettext
from src.backend.controllers import user
from src.backend.models import status, verifier


def get_status(args, module):
    _status, error = status.get_status(module)

    if 'totals' in args and args['totals']:
        for stat in _status:
            allowed_customers, _ = user.get_customers_by_user_id(args['user_id'])
            allowed_customers.append(0)  # Update allowed customers to add Unspecified customers
            total = verifier.get_totals({
                'time': args['time'],
                'status': stat['id'],
                'form_id': args['form_id'],
                'allowedCustomers': allowed_customers
            })[0]
            stat['total'] = total

    if _status:
        response = {
            "status": _status
        }
        return response, 200
    else:
        response = {
            "errors": gettext("RETRIEVES_STATUS_ERROR"),
            "message": gettext(error)
        }
        return response, 400
