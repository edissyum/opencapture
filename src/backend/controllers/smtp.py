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
from flask import request, g as current_context
from src.backend.main import create_classes_from_custom_id
from src.backend.functions import retrieve_custom_from_url


def check_smtp_status():
    if 'smtp' in current_context:
        smtp = current_context.smtp
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id, True)
        smtp = _vars[8]
    smtp.test_connection()
    return smtp.is_up


def test_send(email):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id, True)
    smtp = _vars[8]

    res = smtp.test_connection(return_error=True)
    if smtp.is_up:
        res, error = smtp.send_test_email(email)
        if res:
            return '', 200

        response = {
            "errors": gettext('SMTP_TEST_SEND_EMAIL_ERROR'),
            "message": str(error)
        }
        return response, 400
    else:
        response = {
            "errors": gettext('SMTP_TEST_CONNECTION_ERROR'),
            "message": str(res)
        }
        return response, 400
