# This file is part of Open-Capture.

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

from src.backend.import_models import monitoring


def get_processes(args):
    processses, _ = monitoring.get_processes(args)

    response = {
        "processses": processses
    }
    return response, 200


def get_process_by_id(process_id):
    process, _ = monitoring.get_process_by_id(process_id)

    response = {
        "process": process
    }
    return response, 200
