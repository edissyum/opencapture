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
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
# @dev : Oussama Brich <oussama.brich@edissyum.com>

from flask import current_app
from ..import_classes import _Files
from ..import_models import splitter
from ..main import create_classes_from_current_config

import base64


def handle_uploaded_file(files):
    result = _Files.save_uploaded_file(files, current_app.config['UPLOAD_FOLDER'])
    return result


def retrieve_batches():
    _vars = create_classes_from_current_config()
    _config = _vars[1]

    args = {}
    batches, error = splitter.retrieve_batches(args)
    if batches:
        for index, batch in enumerate(batches):
            try:
                # TODO
                # with open(_config.cfg['SPLITTER']['tmpbatchpath'] + batches[index]['first_page'], "rb") as image_file:
                with open(batches[index]['first_page'], "rb") as image_file:
                    encoded_string = base64.b64encode(image_file.read())
                    batches[index]['image_url'] = encoded_string
            except IOError:
                continue

        response = {
            "batches": batches
        }
        return response, 200
    else:
        response = {
            "errors": "ERROR",
            "message": error
        }
        return response, 401


def change_status(args):
    res = splitter.change_status(args)

    if res:
        return res, 200
    else:
        return res, 401


def retrieve_pages(page_id):
    _vars = create_classes_from_current_config()
    _cfg = _vars[1]
    page_lists = []
    is_document_added = False

    args = {
        'id': page_id
    }
    pages, error = splitter.get_batch_pages(args)

    if pages:
        for page_index, page in enumerate(pages):
            # TODO
            # with open(_cfg.cfg['SPLITTER']['tmpbatchpath'] + pages[page_index]['image_path'], "rb") as image_file:
            with open(pages[page_index]['image_path'], "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read())
                pages[page_index]['image_url'] = encoded_string

                for list_index, split_list in enumerate(page_lists):
                    existed_document = list(filter(lambda page_splitted:
                                                   page_splitted['split_document'] == pages[page_index][
                                                       'split_document'],
                                                   split_list))

                    if existed_document:
                        page_lists[list_index].append(pages[page_index])
                        is_document_added = True
                        break

                if not is_document_added:
                    page_lists.append([pages[page_index]])

    response = {"page_lists": page_lists}

    return response, 200
