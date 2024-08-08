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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

import os
import json
import glob
import uuid
import magic
import pypdf
import pyheif
import shutil
from PIL import Image
from pathlib import Path
from flask_babel import gettext
from pytesseract import pytesseract
from pdf2image import convert_from_path
from .classes.Config import Config as _Config
from .classes.ArtificialIntelligence import ArtificialIntelligence


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

    for field in required_fields:
        error_message = (gettext('NO_DATA_OR_DATA_MISSING') + " : '" + field['id'] + "' " + gettext('IS_NOT') + " '"
                         + str(field['type'])) + "'"

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


def check_extensions_mime(files, document_type='document'):
    formats_file = str(Path(__file__).parents[2]) + '/instance/config/formats.json'
    if document_type == 'attachments':
        formats_file = str(Path(__file__).parents[2]) + '/instance/config/attachments_formats.json'

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
        _f = files[file]
        ext = _f.filename.split('.')[-1].lower()
        allowed_extensions = [_f['extension'].lower() for _f in formats]
        if ext not in allowed_extensions:
            response = {
                "errors": gettext("UPLOAD_ERRROR"),
                "message": gettext("FILE_EXTENSION_NOT_ALLOWED") + ' : <b>' + ext + '</b>'
            }
            return response, 400

        allowed_mime = [_f['mime'].lower() for _f in formats if _f['extension'].lower() == ext]
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
    custom_directory = str(Path(__file__).parents[2]) + '/custom/'
    custom_ini_file = str(Path(__file__).parents[2]) + '/custom/custom.ini'
    if os.path.isdir(custom_directory) and os.path.isfile(custom_ini_file):
        customs_config = _Config(custom_ini_file)
        for custom_name in customs_config.cfg:
            if custom_id == custom_name:
                found_custom = True
    return found_custom


def retrieve_custom_from_url(request):
    custom_id = ''
    url = request.environ['SCRIPT_NAME'] + request.environ['PATH_INFO'] if 'RAW_URI' not in request.environ \
        else request.environ['RAW_URI']
    splitted_request = url.replace('/backend_oc', '').split('ws/')

    if splitted_request[0] != '/':
        custom_id = splitted_request[0].replace('/', '')

    if not custom_id or not retrieve_config_from_custom_id(custom_id):
        custom_id = request.environ['SERVER_NAME'].replace('/', '')
        if not retrieve_config_from_custom_id(custom_id):
            custom_id = request.environ['HTTP_REFERER'].replace('http://', '').replace('https://', '')
    return custom_id.replace('/', '')


def get_custom_path(custom_id):
    custom_directory = str(Path(__file__).parents[2]) + '/custom/'
    custom_ini_file = str(Path(__file__).parents[2]) + '/custom/custom.ini'
    path = False
    if os.path.isdir(custom_directory) and os.path.isfile(custom_ini_file):
        customs_config = _Config(custom_ini_file)
        for custom_name, custom_param in customs_config.cfg.items():
            if custom_id == custom_name and os.path.isdir(custom_param['path']):
                path = custom_param['path']
    return path


def retrieve_config_from_custom_id(custom_id):
    res = False
    found_custom = False
    default_config_file = str(Path(__file__).parents[2]) + '/instance/config/config.ini'
    custom_directory = str(Path(__file__).parents[2]) + '/custom/'
    custom_ini_file = str(Path(__file__).parents[2]) + '/custom/custom.ini'
    if os.path.isdir(custom_directory) and os.path.isfile(custom_ini_file):
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
    custom_directory = str(Path(__file__).parents[2]) + '/custom/'
    custom_ini_file = str(Path(__file__).parents[2]) + '/custom/custom.ini'
    path = None
    if os.path.isdir(custom_directory) and os.path.isfile(custom_ini_file):
        customs_config = _Config(custom_ini_file)
        for custom_name, custom_param in customs_config.cfg.items():
            if custom_id == custom_name:
                path = custom_param['path']
    return path


def get_custom_array(custom_id=False):
    if not custom_id:
        custom_id = get_custom_id()
    custom_array = {}
    if custom_id:
        custom_array = check_python_customized_files(custom_id[1])
    return custom_array


def get_custom_id():
    custom_ini_file = str(Path(__file__).parents[2]) + '/custom/custom.ini'
    if os.path.isfile(custom_ini_file):
        customs_config = _Config(custom_ini_file)
        for custom_name, custom_param in customs_config.cfg.items():
            if custom_param['isdefault'] == 'True':
                path = custom_param['path']
                if os.path.isdir(path):
                    return [custom_name, path]


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
            nb_pages = files.get_pages(docservers, file)
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
                    files.pdf_to_jpg(file, int(data['page']) - i, False, False, False, False, True)
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

    positions = positions_mask[0]['positions'][index] if index in positions_mask[0]['positions'] else None
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


def recursive_delete(folder, log, docservers):
    folder_name = os.path.basename(folder)
    exported_pdf_folder = docservers['SEPARATOR_OUTPUT_PDF'] + folder_name
    exported_pdfa_folder = docservers['SEPARATOR_OUTPUT_PDFA'] + folder_name

    for folder_name in [folder, exported_pdf_folder, exported_pdfa_folder]:
        for file in os.listdir(folder_name):
            try:
                os.remove(folder_name + '/' + file)
            except FileNotFoundError as err:
                log.error('Unable to delete tmp folder ' + folder_name + '/' + file + ' : ' + str(err), False)

        try:
            os.rmdir(folder_name)
        except FileNotFoundError as err:
            log.error('Unable to delete tmp folder ' + folder_name + ' : ' + str(err), False)


def generate_searchable_pdf(document, tmp_filename):
    """
    Start from standard PDF, with no OCR, and create a searchable PDF, with OCR.

    :param document: Path to original document (not searchable, without OCR)
    :param tmp_filename: Path to store the final pdf, searchable with OCR
    """

    if document.lower().endswith('.pdf'):
        images = convert_from_path(document, dpi=400)
    elif document.lower().endswith(('.heic', '.heif')):
        heif_file = pyheif.read(document)
        heif_file = Image.frombytes(
            heif_file.mode,
            heif_file.size,
            heif_file.data,
            "raw",
            heif_file.mode,
            heif_file.stride,
        )
        images = [heif_file]
    else:
        images = [Image.open(document)]

    cpt = 1
    _uuid = str(uuid.uuid4())
    tmp_path = os.path.dirname(tmp_filename)

    for i in range(len(images)):
        output = tmp_path + '/to_merge_' + _uuid + '-' + str(cpt).zfill(3)
        images[i].save(output + '.jpg', 'JPEG')
        pdf_content = pytesseract.image_to_pdf_or_hocr(output + '.jpg', extension='pdf')

        try:
            os.remove(output + '.jpg')
        except FileNotFoundError:
            pass

        with open(output + '.pdf', 'w+b') as f:
            f.write(pdf_content)
        cpt = cpt + 1

    if cpt > 2:
        pdf_to_merge = []
        for file in sorted(os.listdir(tmp_path)):
            if file.lower().startswith('to_merge_'):
                if file.lower().endswith('.pdf'):
                    pdf_to_merge.append(tmp_path + '/' + file)

        merger = pypdf.PdfMerger()
        for _p in pdf_to_merge:
            merger.append(_p)
        merger.write(tmp_filename)
        merger.close()
    else:
        shutil.move(tmp_path + '/to_merge_' + _uuid + '-001.pdf', tmp_filename)


def find_workflow_with_ia(file, ai_model_id, database, docservers, files, ocr, log, module):
    ai_model = database.select({
        'select': ['*'],
        'table': ['ai_models'],
        'where': ['id = %s', 'module = %s'],
        'data': [ai_model_id, module]
    })
    if ai_model:
        if module == 'verifier':
            csv_file = docservers.get('VERIFIER_TRAIN_PATH_FILES') + '/data.csv'
        elif module == 'splitter':
            csv_file = docservers.get('SPLITTER_TRAIN_PATH_FILES') + '/data.csv'
        else:
            return False
        path = docservers.get('TMP_PATH') + files.get_random_string(15) + '.pdf'
        shutil.copy(file, path)

        if module == 'verifier':
            model_name = docservers.get('VERIFIER_AI_MODEL_PATH') + ai_model[0]['model_path']
        elif module == 'splitter':
            model_name = docservers.get('SPLITTER_AI_MODEL_PATH') + ai_model[0]['model_path']
        else:
            return False

        ai = ArtificialIntelligence(csv_file, model_name, files, ocr, docservers, log)
        ai.store_one_file_from_script(path)

        min_proba = ai_model[0]['min_proba']
        if os.path.isfile(csv_file) and os.path.isfile(model_name):
            ai.csv_file = csv_file
            (_, folder, prob), code = ai.model_testing(model_name)

            if code == 200 and prob >= min_proba:
                for doc in ai_model[0]['documents']:
                    if doc['folder'] == folder:
                        if module == 'verifier':
                            if doc['workflow_id']:
                                form = database.select({
                                    'select': ['*'],
                                    'table': ['workflows'],
                                    'where': ['workflow_id = %s', 'module = %s'],
                                    'data': [doc['workflow_id'], module],
                                })
                                if form:
                                    log.info('[IA] Document detected as&nbsp;<strong>' + folder +
                                             '</strong>&nbsp;and sended to workflow&nbsp;<strong>' +
                                             doc['workflow_id'] + '</strong>')
                                    return doc['workflow_id']
                        elif module == 'splitter':
                            log.info('[IA] Document doctype detected : ' + doc['doctype'])
                            return doc['doctype']
    return False
