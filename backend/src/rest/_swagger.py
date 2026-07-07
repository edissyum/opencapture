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

parameters = {
    "order": {
        "name": "order",
        "in": "query",
        "type": "string",
        "required": False
    },
    "filter": {
        "name": "filter",
        "in": "query",
        "type": "string",
        "required": False
    },
    "search": {
        "name": "search",
        "in": "query",
        "type": "string",
        "required": False
    },
    "offset": {
        "name": "offset",
        "in": "query",
        "type": "integer",
        "required": False
    },
    "limit": {
        "name": "limit",
        "in": "query",
        "type": "integer",
        "required": False
    },
}

definitions = {
    "Supplier": {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "lastname": {"type": "string"},
            "firstname": {"type": "string"},
            "address_id": {"type": "string"},
            "vat_number": {"type": "string"},
            "bic": {"type": "string"},
            "civility": {"type": "integer"},
            "creation_date": {"type": "string", "format": "date-time"},
            "default_accounting_plan": {"type": "boolean"},
            "default_currency": {"type": "string"},
            "document_lang": {"type": "string"},
            "duns": {"type": "string"},
            "email": {"type": "string"},
            "form_id": {"type": "integer"},
            "function": {"type": "string"},
            "get_only_raw_footer": {"type": "boolean"},
            "iban": {"type": "string"},
            "informal_contact": {"type": "boolean"},
            "phone": {"type": "string"},
            "pages": {
                "type": "object",
                "properties": {
                    "form_id": {
                        "type": "object",
                        "properties": {
                            "field_id": {"type": "integer"}
                        }
                    }
                }
            },
            "positions": {
                "type": "object",
                "properties": {
                    "form_id": {
                        "type": "object",
                        "properties": {
                            "field_id": {
                                "type": "object",
                                "properties": {
                                    "x": {"type": "integer"},
                                    "y": {"type": "integer"},
                                    "width": {"type": "integer"},
                                    "height": {"type": "integer"},
                                    "ocr_from_user": {"type": "boolean"}
                                }
                            }
                        }
                    }
                }
            },
            "rccm": {"type": "string"},
            "siren": {"type": "string"},
            "siret": {"type": "string"},
            "skip_auto_validate": {"type": "boolean"},
            "status": {"type": "string"}
        }
    }
}
