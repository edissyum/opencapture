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

definitions = {
    "Accounts": {
        "type": "object",
        "properties": {
            "address1": {"type": "string"},
            "address2": {"type": "string"},
            "city": {"type": "string"},
            "country": {"type": "string"},
            "creation_date": {"type": "string", "format": "date-time"},
            "id": {"type": "integer"},
            "postal_code": {"type": "string"}
        }
    }
}
