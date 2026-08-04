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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

from flask_babel import gettext
from ..controllers import user
from ..models import status, verifier, splitter


def get_status(args, module):
    _status, error = status.get_status(module)
    if 'totals' in args and args['totals']:
        for stat in _status:
            if 'allowedCustomers' in args and args['allowedCustomers'] is not None:
                allowed_customers = args['allowedCustomers']
            else:
                allowed_customers, _ = user.get_customers_by_user_id(args['user_id'])
                if 0 not in allowed_customers:
                    allowed_customers.append(0)  # Update allowed customers to add Unspecified customers

            if module == 'verifier':
                total = verifier.get_totals_by_status({
                    'status': stat['id'],
                    'user_id': args['user_id'],
                    'time': args['time'] if 'time' in args else None,
                    'search': args['search'] if 'search' in args else None,
                    'form_id': args['form_id'] if 'form_id' in args else None,
                    'allowedCustomers': allowed_customers,
                    'allowedSuppliers': args['allowedSuppliers'] if 'allowedSuppliers' in args else None
                })[0]
            else:
                total = splitter.get_totals_by_status({
                    'status': stat['id'],
                    'user_id': args['user_id'],
                    'allowedCustomers': allowed_customers,
                    'time': args['time'] if 'time' in args else None,
                    'search': args['search'] if 'search' in args else None,
                    'form_id': args['form_id'] if 'form_id' in args else None
                })[0]
            stat['total'] = total['total']

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
