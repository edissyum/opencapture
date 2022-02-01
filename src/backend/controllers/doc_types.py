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
# @dev : Oussama Brich <oussama.brich@edissyum.com>

from src.backend.import_models import doc_types


def add_doc_type(args):
    res, error = doc_types.add_doc_type(args)
    if res:
        response = {
            "id": res
        }
        return response, 200
    else:
        response = {
            "errors": "DOC_TYPE_ERROR",
            "message": error
        }
        return response, 401


def retrieve_doc_types(args):
    doc_types_res, error = doc_types.retrieve_doc_types(args)

    if error is None:
        response = {
            "docTypes": doc_types_res
        }
        return response, 200

    response = {
        "errors": "DOC_TYPE_ERROR",
        "message": error
    }
    return response, 401


def update(args):
    res, error = doc_types.update(args)
    if res:
        response = {
            "res": res
        }
        return response, 200
    else:
        response = {
            "errors": "DOC_TYPE_ERROR",
            "message": error
        }
        return response, 401
