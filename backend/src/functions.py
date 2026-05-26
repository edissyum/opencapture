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

import os
import glob
import json
import uuid
import magic
import pypdf
import shutil
import urllib.parse
from PIL import Image
from pathlib import Path
from flask_babel import gettext
from pytesseract import pytesseract
from pdf2image import convert_from_path
from pillow_heif import register_heif_opener

from . import shared
from .classes.Config import Config as _Config
from werkzeug.datastructures.file_storage import FileStorage
from .classes.ArtificialIntelligence import ArtificialIntelligence

def _get_custom_ini_file():
    custom_directory = str(Path(__file__).parents[1]) + '/custom/'

    if not os.path.isdir(custom_directory):
        return None

    if not os.path.isfile(custom_directory + 'custom.ini'):
        return None

    return custom_directory + 'custom.ini'


def rest_validator(data, required_fields, only_data=False):
    mandatory_number = 0
    for field in required_fields:
        if field['mandatory']:
            mandatory_number += 1

    if not data and mandatory_number > 1:
        return False, gettext('NO_DATA_OR_DATA_MISSING')

    if not only_data:
        try:
            if isinstance(data, bytes):
                data = json.loads(data.decode('utf-8'))
            if isinstance(data, str):
                data = json.loads(data)
        except json.decoder.JSONDecodeError:
            return False, gettext('JSON_ERROR')

    types = {
        str: gettext('STRING'),
        int: gettext('INTEGER'),
        bool: gettext('BOOLEAN'),
        dict: gettext('DICT'),
        list: gettext('LIST')
    }

    for field in required_fields:
        error_message = (gettext('NO_DATA_OR_DATA_MISSING') + " : '" + field['id'] + "' " + gettext('IS_NOT') + " <strong>"
                         + types[field['type']] + "</strong>")
        if field['mandatory']:
            if field['id'] not in data or (field['type'] != bool and not data[field['id']]):
                return False, gettext('NO_DATA_OR_DATA_MISSING') + " : '" + field['id'] + "'"

            if not isinstance(data[field['id']], field['type']):
                if field['type'] == int:
                    try:
                        int(data[field['id']])
                        continue
                    except (TypeError, ValueError):
                        return False, error_message

                if field['type'] == bool:
                    if data[field['id']] in ['true', 'True', 'false', 'False']:
                        continue

                if field['type'] == dict:
                    try:
                        json.loads(data[field['id']])
                        continue
                    except (TypeError, ValueError):
                        return False, error_message
                return False, error_message
        else:
            if field['id'] in data and data[field['id']] and not isinstance(data[field['id']], field['type']):
                if field['type'] == int:
                    try:
                        int(data[field['id']])
                        continue
                    except (TypeError, ValueError):
                        return False, error_message

                if field['type'] == bool:
                    if data[field['id']] in ['true', 'True', 'false', 'False']:
                        continue
                    return False, error_message

                if field['type'] == dict:
                    try:
                        json.loads(data[field['id']])
                        continue
                    except (TypeError, ValueError):
                        return False, error_message
                return False, error_message
    return True, ''


def check_extensions_mime(files, custom_id, document_type='document'):
    config_path = str(get_custom_path(custom_id)) + '/config'
    if not config_path or not os.path.isdir(config_path):
        response = {
            "errors": gettext("UPLOAD_ERRROR"),
            "message": gettext("CUSTOM_CONFIG_FOLDER_NOT_FOUND")
        }
        return response, 400

    formats_file = config_path + '/extensions.json'
    if document_type == 'attachments':
        formats_file = config_path + '/attachment_extensions.json'

    if os.path.isfile(formats_file):
        with open(formats_file) as json_file:
            formats = json.load(json_file)
    else:
        response = {
            "errors": gettext("UPLOAD_ERRROR"),
            "message": gettext("FORMATS_FILE_NOT_FOUND")
        }
        return response, 400

    mime = magic.Magic(mime=True)
    for file in files:
        if isinstance(file, dict):
            _f = FileStorage(stream=open(file['file'], 'rb'), filename=file['filename'])
        elif isinstance(file, FileStorage):
            _f = file
        else:
            _f = files[file]

        ext = _f.filename.split('.')[-1].lower()
        allowed_extensions = [_format['extension'].lower() for _format in formats]
        if ext not in allowed_extensions:
            response = {
                "errors": gettext("UPLOAD_ERRROR"),
                "message": gettext("FILE_EXTENSION_NOT_ALLOWED") + ' : <b>' + ext + '</b>'
            }
            return response, 400

        allowed_mime = [_format['mime'].lower() for _format in formats if _format['extension'].lower() == ext]
        mime_type = mime.from_buffer(_f.read())

        if mime_type not in allowed_mime:
            response = {
                "errors": gettext("UPLOAD_ERRROR"),
                "message": gettext("FILE_MIME_NOT_ALLOWED") + ' : ' + '<b>' + ext + '</b>' +
                           ' / <b>' + mime_type + '</b>'
            }
            return response, 400
        _f.seek(0)
    return '', 200


def delete_documents(docservers, path, filename, full_jpg_filename):
    pdf_file = path + '/' + filename
    thumb_filename = docservers['VERIFIER_THUMB'] + '/' + full_jpg_filename.replace('%03d.jpg', '001.jpg')
    full_jpg_filename = docservers['VERIFIER_IMAGE_FULL'] + '/' + full_jpg_filename.replace('%03d.jpg', '*')
    jpg_filelist = glob.glob(full_jpg_filename)
    for jpg in jpg_filelist:
        if os.path.isfile(jpg):
            os.remove(jpg)

    if os.path.isfile(pdf_file):
        os.remove(pdf_file)

    if os.path.isfile(thumb_filename):
        os.remove(thumb_filename)


def rotate_document(pdf_file, angle):
    writer = pypdf.PdfWriter()
    with open(pdf_file, 'rb') as input_file:
        pdf = pypdf.PdfReader(input_file)
        for page in pdf.pages:
            page.rotate(angle)
            writer.add_page(page)

    with open(pdf_file, 'wb') as output_file:
        writer.write(output_file)


def is_custom_exists(custom_id):
    found_custom = False
    custom_ini_file = _get_custom_ini_file()

    if custom_ini_file:
        customs_config = _Config(custom_ini_file)
        for custom_name in customs_config.cfg:
            if custom_id == custom_name:
                found_custom = True
    return found_custom


def retrieve_custom_from_url(request):
    domain_name = ''

    if 'HTTP_REFERER' in request.environ:
        domain_name = urllib.parse.urlparse(request.environ['HTTP_REFERER']).hostname
    elif 'HTTP_HOST' in request.environ:
        # HTTP_HOST est "host" ou "host:port", sans schéma.
        # urlparse('site1.edissyum.com').hostname -> None.
        domain_name = request.environ['HTTP_HOST'].split(':', 1)[0]

    backend_url = request.environ['SCRIPT_NAME'] + request.environ['PATH_INFO'] if 'RAW_URI' not in request.environ \
        else request.environ['RAW_URI']

    if domain_name != 'localhost' and shared.custom_id and backend_url.startswith('/' + shared.custom_id + '/'):
        return shared.custom_id

    if domain_name != 'localhost':
        if is_custom_exists_from_url(domain_name):
            custom_id = retrieve_custom_id_from_url(domain_name)
            if custom_id:
                return custom_id

    custom_id = ''
    splitted_request = backend_url.split('ws/')
    if splitted_request[0] != '/':
        custom_id = splitted_request[0].replace('/', '')

    if not custom_id or not retrieve_config_from_custom_id(custom_id):
        custom_id = request.environ['SERVER_NAME'].replace('/', '')
        if not retrieve_config_from_custom_id(custom_id):
            raise Exception('Custom config file couldn\'t be found')
    return custom_id.replace('/', '')


def get_custom_path(custom_id):
    custom_ini_file = _get_custom_ini_file()
    path = False
    if custom_ini_file:
        customs_config = _Config(custom_ini_file)
        for custom_name, custom_param in customs_config.cfg.items():
            if custom_id == custom_name and os.path.isdir(custom_param['path']):
                path = custom_param['path']
    return str(path)


def retrieve_config_from_custom_id(custom_id):
    res = False
    found_custom = False
    default_config_file = str(Path(__file__).parents[1]) + '/instance/config/config.ini'
    custom_ini_file = _get_custom_ini_file()
    if custom_ini_file:
        customs_config = _Config(custom_ini_file)
        for custom_name, custom_param in customs_config.cfg.items():
            if custom_id == custom_name:
                found_custom = True
                if os.path.isdir(custom_param['path']):
                    if os.path.isfile(custom_param['path'] + '/config/config.ini'):
                        res = custom_param['path'] + '/config/config.ini'
    if res is False and os.path.isfile(default_config_file) and (found_custom or not custom_id):
        res = default_config_file
    elif not found_custom and custom_id:
        res = False
    return res


def retrieve_custom_path(custom_id):
    custom_ini_file = _get_custom_ini_file()
    path = None
    if custom_ini_file:
        customs_config = _Config(custom_ini_file)
        for custom_name, custom_param in customs_config.cfg.items():
            if custom_id == custom_name:
                path = custom_param['path']
    return path


def is_custom_exists_from_url(url):
    found_custom = False
    custom_ini_file = _get_custom_ini_file()

    if custom_ini_file:
        customs_config = _Config(custom_ini_file)
        for custom_name in customs_config.cfg:
            if url == customs_config.cfg[custom_name].get('url', None):
                found_custom = True
                break
    return found_custom


def retrieve_custom_id_from_url(url):
    custom_ini_file = _get_custom_ini_file()
    custom_id = None
    if custom_ini_file:
        customs_config = _Config(custom_ini_file)
        for custom_name in customs_config.cfg:
            if url == customs_config.cfg[custom_name].get('url', None):
                custom_id = custom_name
                break
    return custom_id


def retrieve_custom_list():
    custom_ini_file = _get_custom_ini_file()
    custom_list = []
    if custom_ini_file:
        customs_config = _Config(custom_ini_file)
        for custom_name, custom_param in customs_config.cfg.items():
            custom_list.append(custom_name)
    return custom_list


def get_custom_array(custom_id):
    custom_array = {}
    if custom_id:
        custom_array = check_python_customized_files(custom_id[1])
    return custom_array


def check_python_customized_files(path):
    array_of_import = {}
    for root, _, files in os.walk(path):
        for file in files:
            if file.lower().endswith(".py"):
                module = os.path.splitext(file)[0]
                path = os.path.join(root).replace('/', '.')
                array_of_import.update({
                    module: {
                        'module': module,
                        'path': path
                    }
                })
    return array_of_import


def search_custom_positions(data, ocr, files, regex, file, docservers):
    extension = os.path.splitext(file)[1]
    if 'pdf' in extension.lower():
        if 'page' not in data or not data['page'] or data['page'] > files.get_pages(file):
            return ['', (('', ''), ('', ''))]
    else:
        if 'page' not in data or not data['page'] or data['page'] > 1:
            return ['', (('', ''), ('', ''))]

    target = data['target'].lower()
    try:
        position = json.loads(data['position'])
    except TypeError:
        position = data['position']

    target_file = ''
    if position:
        if 'page' not in data or ('page' in data and str(data['page']) in ['1', '', None]):
            if target == 'footer':
                target_file = files.jpg_name_footer
            elif target == 'header':
                target_file = files.jpg_name_header
            else:
                target_file = files.jpg_name
        elif str(data['page']) != '1':
            position.update({"page": data['page']})
            nb_pages = files.get_pages(file)
            if str(nb_pages) == str(data['page']):
                if target == 'footer':
                    target_file = files.jpg_name_last_footer
                elif target == 'header':
                    target_file = files.jpg_name_last_header
                else:
                    target_file = files.jpg_name_last
            else:
                custom_file_ok = False
                for i in range(1, int(data['page']) + 1):
                    files.pdf_to_jpg(file, int(data['page']), False, False, False, False, True)
                    target_file = files.custom_file_name
                    if os.path.isfile(target_file):
                        custom_file_ok = True
                        break

                if not custom_file_ok:
                    return ['', (('', ''), ('', ''))]

        if data['regex']:
            data['regex'] = regex[data['regex']]

        return search(position, data['regex'], files, ocr, target_file)


def search_by_positions(supplier, index, ocr, files, database, form_id, log):
    positions_mask = database.select({
        'select': ['*'],
        'table': ['positions_masks'],
        'where': ['supplier_id = %s', 'form_id = %s'],
        'data': [supplier[2]['supplier_id'], form_id]
    })

    if not positions_mask:
        return False, (('', ''), ('', ''))

    positions = positions_mask[0]['positions'][index] if index in positions_mask[0]['positions'] else {}
    pages = positions_mask[0]['pages'][index] if index in positions_mask[0]['pages'] else False
    regex = positions_mask[0]['regex'][index] if index in positions_mask[0]['regex'] else False
    file = files.jpg_name
    if positions:
        positions['ocr_from_user'] = True
        data = search(positions, regex, files, ocr, file)
        if pages and data[0]:
            log.info(index + ' found using position mask : ' + data[0])
            data.append(pages)
        return data
    return False, (('', ''), ('', ''))


def search(position, regex, files, ocr, target_file):
    data = files.ocr_on_fly(target_file, position, ocr, None, regex)

    if not data:
        target_file_improved = files.improve_image_detection(target_file)
        data = files.ocr_on_fly(target_file_improved, position, ocr, None, regex)
        if data:
            return [data.replace('\n', ' '), json.dumps(position)]
        else:
            data = files.ocr_on_fly(target_file_improved, position, ocr, None, regex, True)
            if data:
                return [data.replace('\n', ' '), json.dumps(position)]
            return [False, (('', ''), ('', ''))]
    else:
        return [data.replace('\n', ' '), json.dumps(position)]


def recursive_delete(folder, log):
    folder_name = str(os.path.basename(folder))
    exported_pdf_folder = shared.data_path + '/exported_pdf/' + folder_name
    exported_pdfa_folder = shared.data_path + '/exported_pdfa/' + folder_name

    for target_folder in [folder, exported_pdf_folder, exported_pdfa_folder]:
        for file in os.listdir(target_folder):
            try:
                os.remove(target_folder + '/' + file)
            except FileNotFoundError as err:
                log.error('Unable to delete tmp folder ' + target_folder + '/' + file + ' : ' + str(err), False)

        try:
            os.rmdir(target_folder)
        except FileNotFoundError as err:
            log.error('Unable to delete tmp folder ' + target_folder + ' : ' + str(err), False)


def generate_searchable_pdf(document, tmp_filename):
    """
    Start from standard PDF, with no OCR, and create a searchable PDF, with OCR.

    :param document: Path to original document (not searchable, without OCR)
    :param tmp_filename: Path to store the final pdf, searchable with OCR
    """

    if document.lower().endswith('.pdf'):
        images = convert_from_path(document, dpi=400)
    elif document.lower().endswith(('.heic', '.heif')):
        register_heif_opener()
        images = [Image.open(document).convert('RGB')]
    else:
        images = [Image.open(document)]

    cpt = 1
    _uuid = str(uuid.uuid4())
    tmp_path = os.path.dirname(tmp_filename)
    pdf_to_merge = []

    for i in range(len(images)):
        output = tmp_path + '/to_merge_' + _uuid + '-' + str(cpt).zfill(3)
        images[i].save(output + '.jpg', 'JPEG')
        pdf_content = pytesseract.image_to_pdf_or_hocr(output + '.jpg', extension='pdf', config="--dpi 300")

        pdf_to_merge.append(output + '.pdf')
        try:
            os.remove(output + '.jpg')
        except FileNotFoundError:
            pass

        with open(output + '.pdf', 'w+b') as f:
            f.write(pdf_content)
        cpt = cpt + 1

    if cpt > 2:
        pdf_writer = pypdf.PdfWriter()
        for _p in pdf_to_merge:
            pdf_writer.append(_p)
        pdf_writer.write(tmp_filename)
        pdf_writer.close()

        for _p in pdf_to_merge:
            os.remove(_p)
    else:
        shutil.move(tmp_path + '/to_merge_' + _uuid + '-001.pdf', tmp_filename)


def find_workflow_with_ia(file, ai_model_id, database, docservers, files, ocr, log):
    ai_model = database.select({
        'select': ['*'],
        'table': ['ai_models'],
        'where': ['id = %s', 'module = %s'],
        'data': [ai_model_id, 'verifier']
    })
    if ai_model:
        csv_file = docservers.get('VERIFIER_TRAIN_PATH_FILES') + '/data.csv'

        path = shared.tmp_path + files.get_random_string(15) + '.pdf'
        shutil.copy(file, path)

        model_name = docservers.get('VERIFIER_AI_MODEL_PATH') + ai_model[0]['model_path']
        ai = ArtificialIntelligence(csv_file, model_name, files, ocr, docservers, log)
        ai.store_one_file_from_script(path)

        min_proba = ai_model[0]['min_proba']
        if os.path.isfile(csv_file) and os.path.isfile(model_name):
            ai.csv_file = csv_file
            (_, folder, prob), code = ai.model_testing(model_name)

            if code == 200 and prob >= min_proba:
                for doc in ai_model[0]['documents']:
                    if doc['folder'] == folder and doc['active']:
                        if doc['workflow_id']:
                            form = database.select({
                                'select': ['*'],
                                'table': ['workflows'],
                                'where': ['workflow_id = %s', 'module = %s'],
                                'data': [doc['workflow_id'], 'verifier']
                            })
                            if form:
                                log.info('[IA] Document detected as&nbsp;<strong>' + folder +
                                         '</strong>&nbsp;and sended to workflow&nbsp;<strong>' +
                                         doc['workflow_id'] + '</strong>')
                                return doc['workflow_id']
    return False


def check_order_by(_filter, _order, allowed_filters):
    allowed_orders = {"asc", "desc"}
    if _filter not in allowed_filters:
        return False, gettext('FILTER_NOT_ALLOWED') + ' : ' + _filter
    if _order not in allowed_orders:
        return False, gettext('ORDER_NOT_ALLOWED') + ' : ' + _order
    return True, ''
