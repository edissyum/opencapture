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

import worker_splitter_from_python
from ..import_classes import _Files
from ..import_models import splitter
from ..models import splitter
from ..main import create_classes_from_current_config
from ..import_classes import _Splitter, _CMIS
from ..import_controllers import forms, outputs

import base64
import requests
from requests.auth import HTTPBasicAuth


def handle_uploaded_file(files, input_id):
    _vars = create_classes_from_current_config()
    _config = _vars[1]
    path = _config.cfg['SPLITTER']['uploadpath']
    for file in files:
        f = files[file]
        filename = _Files.save_uploaded_file(f, path)
        worker_splitter_from_python.main({
            'file': filename,
            'config': current_app.config['CONFIG_FILE'],
            'input_id': input_id
        })

    return True


def retrieve_metadata():
    _vars = create_classes_from_current_config()
    _config = _vars[1]

    args = {}
    metadata, error = splitter.retrieve_metadata(args)

    if metadata:
        response = {
            "metadata": metadata
        }
        return response, 200

    response = {
        "errors": "ERROR",
        "message": error
    }
    return response, 401


def retrieve_batches(args):
    _vars = create_classes_from_current_config()
    _config = _vars[1]
    batches, error_batches = splitter.retrieve_batches(args)
    count, error_count = splitter.count_batches()
    if not error_batches and not error_count:
        for index, batch in enumerate(batches):
            try:
                with open(batches[index]['first_page'], "rb") as image_file:
                    encoded_string = base64.b64encode(image_file.read())
                    batches[index]['image_url'] = encoded_string.decode("utf-8")
            except IOError:
                continue

        response = {
            "batches": batches,
            "count": count
        }
        return response, 200

    response = {
        "errors": "ERROR",
        "message": error_batches
    }
    return response, 401


def change_status(args):
    res = splitter.change_status(args)

    if res:
        return res, 200
    else:
        return res, 401


def load_referential():
    _vars = create_classes_from_current_config()
    _cfg = _vars[1]

    demand = splitter.get_demand_number()
    demand_number = int(demand[0]['demand_number']) + 1

    url = _cfg.cfg['GED']['host'] + "alfresco/s/org/cd46/pmi/getReferentiel"
    params = {'num_requete': demand_number, 'type_referentiel': _cfg.cfg['GED']['referentialmode']}
    r = requests.get(url=url, params=params, auth=HTTPBasicAuth(_cfg.cfg['GED']['user'], _cfg.cfg['GED']['password']),
                     verify=False)
    try:
        data = r.json()
    except:
        return {}, 200

    if data:
        if 'referentiel' in data:
            splitter.insert_referential(data['referentiel'])
            splitter.set_demand_number(demand_number)
        else:
            data['referentiel'] = []
        return data, 200
    else:
        return data, 401


def retrieve_pages(page_id):
    _vars = create_classes_from_current_config()
    _cfg = _vars[1]
    page_lists = []
    previous_page = 0

    args = {
        'id': page_id
    }
    pages, error = splitter.get_batch_pages(args)
    if pages:
        for page_index, page in enumerate(pages):
            with open(pages[page_index]['image_path'], "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read())
                pages[page_index]['image_url'] = encoded_string.decode("utf-8")

                if page_index == 0:
                    page_lists.append([pages[page_index]])

                elif previous_page == pages[page_index]['split_document']:
                    page_lists[-1].append(pages[page_index])

                else:
                    page_lists.append([pages[page_index]])

                previous_page = pages[page_index]['split_document']

    response = {"page_lists": page_lists}

    return response, 200


def validate(documents, metadata):
    print(metadata)
    _vars = create_classes_from_current_config()
    _cfg = _vars[1]

    batch = splitter.retrieve_batches({
        'id': metadata['id'],
        'page': None,
        'size': None
    })[0]

    form = forms.get_form_by_id(batch[0]['form_id'])
    pages = _Splitter.get_split_pages(documents)
    documents = _Splitter.add_files_names(documents, metadata)

    if 'outputs' in form[0]:
        for output_id in form[0]['outputs']:
            print("output : " + str(output_id))
            output = outputs.get_output_by_id(output_id)
            if output:
                res_file = _Files.save_pdf_result_after_separate(pages, documents, _cfg.cfg['SPLITTER']['uploadpath']
                                                                + str(batch[0]['file_name']),
                                                                _cfg.cfg['SPLITTER']['pdfoutputpath'], 1)
                if res_file['OK'] and output[0]['output_type_id'] == 'export_xml':
                    res_xml = _Splitter.export_xml(documents, metadata, _cfg.cfg['SPLITTER']['pdfoutputpath'])
                    if res_xml['OK']:
                        splitter.change_status({
                            'id': metadata['id'],
                            'status': 'END'
                        })

    return {"OK": True}, 200
