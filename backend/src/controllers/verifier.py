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

import os
import uuid
import json
import magic
import secrets
import tempfile
import datetime
import traceback
import importlib
import pandas as pd
from PIL import Image

from .. import shared
from ..main import launch
from flask_babel import gettext
from .. import verifier_exports
from ..classes.Files import Files
from ..classes.Files import rotate_img
from ..helpers import get_context_var
from ..scripting_functions import check_code
from werkzeug.datastructures import FileStorage
from flask import current_app, Response, request
from ..models import verifier, accounts, forms, attachments
from ..controllers import auth, user, monitoring, history, status
from ..functions import retrieve_custom_from_url, delete_documents, check_order_by


def upload_documents(body):
    res = handle_uploaded_file(body['files'], body['workflowId'], None, body['datas'], body['splitter_batch_id'])
    if res and res[0] is not False:
        return res, 200

    response = {
        "errors": gettext('UPLOAD_DOCUMENTS_ERROR'),
        "message": ""
    }
    return response, 400

def retry_from_monitoring(process_id):
    process, _ = monitoring.get_process_by_id(process_id)
    if _ != 200:
        response = {
            "errors": gettext('RETRY_FROM_MONITORING_ERROR'),
            "message": gettext('PROCESS_NOT_FOUND')
        }
        return response, 400

    process = process['process'][0]

    error_path = shared.custom_path + '/data/error/'
    path = error_path + '/' + process['workflow_id'] + '/' + process['filename']

    if not os.path.isfile(path):
        response = {
            "errors": gettext('RETRY_FROM_MONITORING_ERROR'),
            "message": gettext('FILE_NOT_FOUND')
        }
        return response, 400

    file = FileStorage(stream=open(path, 'rb'), filename=process['filename'])
    res = handle_uploaded_file([file], process['workflow_id'], {})
    if res and res[0] is not False:
        return res
    else:
        return gettext('UNKNOW_ERROR'), 400

def handle_uploaded_file(files, workflow_id, supplier, datas=None, splitter_batch_id=False):
    custom_id = retrieve_custom_from_url(request)
    path = current_app.config['UPLOAD_FOLDER']
    tokens = []
    for file in files:
        if isinstance(file, FileStorage):
            _f = file
        else:
            _f = files[file]
        filename = Files.save_uploaded_file(_f, path)

        now = datetime.datetime.now()
        year, month, day = [str('%02d' % now.year), str('%02d' % now.month), str('%02d' % now.day)]
        hour, minute, second, microsecond = [str('%02d' % now.hour), str('%02d' % now.minute), str('%02d' % now.second), str('%02d' % now.microsecond)]
        date_batch = year + month + day + '_' + hour + minute + second + microsecond
        token = date_batch + '_' + secrets.token_hex(32) + '_' + str(uuid.uuid4())
        tokens.append({'filename': os.path.basename(filename), 'token': token})

        task_id_monitor = monitoring.create_process({
            'status': 'wait',
            'module': 'verifier',
            'source': 'interface',
            'filename': os.path.basename(_f.filename),
            'token': token,
            'workflow_id': workflow_id if workflow_id else None
        })

        if task_id_monitor:
            launch({
                'datas': datas,
                'file': filename,
                'supplier': supplier,
                'custom_id': custom_id,
                'ip': request.remote_addr,
                'workflow_id': workflow_id,
                'splitter_batch_id': splitter_batch_id,
                'user_id': request.environ['user_id'],
                'user_info': request.environ['user_info'],
                'task_id_monitor': task_id_monitor[0]['process'],
                'original_filename': os.path.basename(_f.filename)
            })
        else:
            return False, 500
    return tokens, 200


def get_document_by_id(document_id):
    document_info, error = verifier.get_document_by_id({'document_id': document_id})
    if error is None:
        return document_info, 200
    else:
        response = {
            "errors": gettext('GET_DOCUMENT_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def get_document_id_and_status_by_token(token):
    decoded_token, _status = auth.decode_unique_url_token(token)
    if _status == 500:
        return decoded_token, _status

    process, _ = monitoring.get_process_by_token(decoded_token['process_token'])

    if process['process'] and process['process'][0]:
        return process['process'][0], 200
    else:
        response = {
            "errors": gettext('GET_DOCUMENT_ID_AND_STATUS_BY_TOKEN_ERROR'),
            "message": gettext('GET_DOCUMENT_ID_AND_STATUS_BY_TOKEN_ERROR_MESSAGE')
        }
        return response, 400


def retrieve_documents(args):
    if 'where' not in args:
        args['where'] = []
    if 'data' not in args:
        args['data'] = []
    if 'select' not in args:
        args['select'] = []

    args['table'] = ['documents', 'form_models']
    args['left_join'] = ['documents.form_id = form_models.id']
    args['group_by'] = ['documents.id', 'documents.form_id', 'form_models.id']

    args['select'].append("documents.id as document_id")
    args['select'].append("to_char(register_date, 'DD-MM-YYYY " + gettext('AT') + " HH24:MI:SS') as date")
    args['select'].append('form_models.label as form_label')
    args['select'].append("documents.*")

    args['where'].append("datas -> 'api_only' is NULL")

    if 'time' in args and args['time']:
        if args['time'] in ['today', 'yesterday']:
            args['where'].append(
                "to_char(register_date, 'YYYY-MM-DD') = to_char(TIMESTAMP '" + args['time'] + "', 'YYYY-MM-DD')")
        else:
            args['where'].append("to_char(register_date, 'YYYY-MM-DD') < to_char(TIMESTAMP 'yesterday', 'YYYY-MM-DD')")

    if 'status' in args:
        args['where'].append('documents.status = %s')
        args['data'].append(args['status'])

    if 'form_id' in args and args['form_id']:
        if args['form_id'] == 'no_form':
            args['where'].append('documents.form_id is NULL')
        else:
            args['where'].append('documents.form_id = %s')
            args['data'].append(args['form_id'])

    if 'user_id' in args and args['user_id']:
        user_forms = user.get_forms_by_user_id(args['user_id'])
        if user_forms[1] == 200:
            user_forms = user_forms[0]
            args['where'].append('documents.form_id = ANY(%s)')
            args['data'].append(user_forms)

    if 'search' in args and args['search']:
        args['select'].append("documents.form_id as form_id")
        args['table'].append('accounts_supplier')
        args['left_join'].append('documents.supplier_id = accounts_supplier.id')
        args['group_by'].append('accounts_supplier.id')
        args['where'].append(
            "(documents.id::text = %s OR "
            "LOWER(unaccent(original_filename)) LIKE unaccent(%s) OR "
            "LOWER((datas -> 'invoice_number')::text) LIKE %s OR "
            "LOWER(unaccent(accounts_supplier.name)) LIKE unaccent(%s) OR "
            "LOWER(unaccent(accounts_supplier.lastname)) LIKE unaccent(%s))"
        )
        args['data'].append(args['search'].lower())
        args['data'].append("%%" + args['search'].lower() + "%%")
        args['data'].append("%%" + args['search'].lower() + "%%")
        args['data'].append("%%" + args['search'].lower() + "%%")
        args['data'].append("%%" + args['search'].lower() + "%%")

        args['offset'] = ''

    if 'allowedCustomers' in args and args['allowedCustomers']:
        args['where'].append('customer_id = ANY(%s)')
        args['data'].append([int(c) for c in args['allowedCustomers']])
    else:
        if 'user_id' in args and args['user_id']:
            allowed_customers, _ = user.get_customers_by_user_id(args['user_id'])
            allowed_customers.append(0)
            args['where'].append('customer_id = ANY(%s)')
            args['data'].append([int(c) for c in allowed_customers])

    if 'allowedSuppliers' in args and args['allowedSuppliers']:
        if not args['allowedSuppliers'][0]:
            args['where'].append('supplier_id is NULL')
        else:
            args['where'].append('supplier_id = ANY(%s)')
            args['data'].append([int(c) for c in args['allowedSuppliers']])

    if 'filter' in args and args['filter']:
        allowed_filters = ['id', 'register_date']
        check_order, error = check_order_by(args['filter'], args['order'], allowed_filters)
        if not check_order:
            response = {
                "errors": gettext('FILTERS_ERROR'),
                "message": error
            }
            return response, 400

        args['order_by'] = args['filter']
        if 'order' in args and args['order']:
            args['order_by'] = [args['filter'] + ' ' + args['order']]
        else:
            args['order_by'] = [args['filter'] + ' DESC']

    total_documents = verifier.get_total_documents({
        'select': ['count(documents.id) as total'],
        'where': args['where'],
        'data': args['data'],
        'table': args['table'],
        'left_join': args['left_join']
    })

    if total_documents not in [0, []]:
        documents_list = verifier.get_documents(args)
        for document in documents_list:
            if document['supplier_id']:
                supplier_info, error = accounts.get_supplier_by_id({'supplier_id': document['supplier_id']})
                if not error:
                    document['supplier_name'] = supplier_info['name']
                    if supplier_info['firstname'] and supplier_info['lastname'] and supplier_info['name']:
                        document['supplier_name'] = supplier_info['firstname'] + ' ' + supplier_info['lastname'] + ' (' + supplier_info['name'] + ')'

                    if not supplier_info['name']:
                        if supplier_info['firstname'] and supplier_info['lastname']:
                            document['supplier_name'] = supplier_info['firstname'] + ' ' + supplier_info['lastname']
                        elif 'lastname' in supplier_info:
                            document['supplier_name'] = supplier_info['lastname']

            attachments_counts = attachments.get_attachments_by_document_id(document['id'])
            document['attachments_count'] = len(attachments_counts) if attachments_counts else 0
        response = {
            "total": total_documents[0]['total'],
            "documents": documents_list
        }
        return response, 200
    return '', 200


def update_position_by_document_id(document_id, args):
    document_info, error = verifier.get_document_by_id({'document_id': document_id})
    if error is None:
        column = position = ''
        for _position in args:
            column = _position
            position = args[_position]

        document_positions = document_info['positions']
        document_positions.update({
            column: position
        })
        _, error = verifier.update_document({
            'set': {"positions": json.dumps(document_positions)},
            'document_id': document_id
        })
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_DOCUMENT_POSITIONS_ERROR'),
                "message": gettext(error)
            }
            return response, 400


def update_page_by_document_id(document_id, args):
    document_info, error = verifier.get_document_by_id({'document_id': document_id})
    if error is None:
        column = page = ''
        for _page in args:
            column = _page
            page = args[_page]

        document_pages = document_info['pages']
        document_pages.update({
            column: page
        })
        _, error = verifier.update_document({'set': {"pages": json.dumps(document_pages)}, 'document_id': document_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_DOCUMENT_PAGES_ERROR'),
                "message": gettext(error)
            }
            return response, 400


def update_document_data_by_document_id(document_id, args):
    document_info, error = verifier.get_document_by_id({'document_id': document_id})
    if error is None:
        _set = {}
        document_data = document_info['datas']
        for _data in args:
            column = _data
            value = args[_data]
            document_data.update({
                column: value
            })

        _, error = verifier.update_document({'set': {"datas": json.dumps(document_data)}, 'document_id': document_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_DOCUMENT_DATA_ERROR'),
                "message": gettext(error)
            }
            return response, 400


def delete_document_data_by_document_id(document_id, field_id):
    document_info, error = verifier.get_document_by_id({'document_id': document_id})
    if error is None:
        _set = {}
        document_data = document_info['datas']
        if field_id in document_data:
            del document_data[field_id]
        _, error = verifier.update_document({'set': {"datas": json.dumps(document_data)}, 'document_id': document_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_DOCUMENT_DATA_ERROR'),
                "message": gettext(error)
            }
            return response, 400


def delete_documents_by_document_id(document_id):
    docservers = get_context_var('docservers', 9)

    document, error = verifier.get_document_by_id({'document_id': document_id})
    if not error:
        delete_documents(docservers, document['path'], document['filename'], document['full_jpg_filename'])

    _, error = verifier.update_document({
        'set': {"status": 'DEL'},
        'document_id': document_id
    })
    return '', 200


def delete_document_position_by_document_id(document_id, field_id):
    document_info, error = verifier.get_document_by_id({'document_id': document_id})
    if error is None:
        _set = {}
        document_positions = document_info['positions']
        if field_id in document_positions:
            del document_positions[field_id]
        _, error = verifier.update_document(
            {'set': {"positions": json.dumps(document_positions)}, 'document_id': document_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_DOCUMENT_POSITIONS_ERROR'),
                "message": gettext(error)
            }
            return response, 400


def delete_document_page_by_document_id(document_id, field_id):
    document_info, error = verifier.get_document_by_id({'document_id': document_id})
    if error is None:
        _set = {}
        document_pages = document_info['pages']
        if field_id in document_pages:
            del document_pages[field_id]
        _, error = verifier.update_document({'set': {"pages": json.dumps(document_pages)}, 'document_id': document_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_DOCUMENT_PAGES_ERROR'),
                "message": gettext(error)
            }
            return response, 400


def delete_document(document_id):
    _, error = verifier.get_document_by_id({'document_id': document_id})
    if error is None:
        _, error = verifier.update_document({'set': {'status': 'DEL'}, 'document_id': document_id})
        if error is None:
            history.add_history({
                'module': 'verifier',
                'ip': request.remote_addr,
                'submodule': 'delete_document',
                'user_info': request.environ['user_info'],
                'desc': gettext('DELETE_DOCUMENT_SUCCESS', document_id=document_id)
            })
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_DOCUMENT_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DELETE_DOCUMENT_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def update_document(document_id, data):
    _, error = verifier.get_document_by_id({'document_id': document_id})
    if error is None:
        _, error = verifier.update_document({'set': data, 'document_id': document_id})

        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_DOCUMENT_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('UPDATE_DOCUMENT_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def remove_lock_by_user_id(user_id):
    _, error = verifier.update_documents({
        'set': {
            'locked': False,
            'locked_by': None
        },
        'where': ['locked_by = %s'],
        'data': [user_id]
    })

    if error is None:
        return '', 200
    else:
        response = {
            "errors": gettext('REMOVE_LOCK_BY_USER_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def export_mem(document_id, data):
    log = get_context_var('log', 5)
    regex = get_context_var('regex', 2)
    database = get_context_var('database', 9)

    log.database = database
    document_info, error = verifier.get_document_by_id({'document_id': document_id})
    if not error:
        return verifier_exports.export_mem(data['data'], document_info, log, regex, database)


def export_coog(document_id, data):
    log = get_context_var('log', 5)
    database = get_context_var('database', 0)

    log.database = database
    document_info, error = verifier.get_document_by_id({'document_id': document_id})
    if not error:
        return verifier_exports.export_coog(data['data'], document_info, log, database)
    return None


def export_opencrm(document_id, data):
    log = get_context_var('log', 5)
    database = get_context_var('database', 0)

    log.database = database
    document_info, error = verifier.get_document_by_id({'document_id': document_id})
    if not error:
        return verifier_exports.export_opencrm(data['data'], document_info, log, database)
    return None


def export_cmis(document_id, data):
    log = get_context_var('log', 5)
    database = get_context_var('database', 0)

    log.database = database
    document_info, error = verifier.get_document_by_id({'document_id': document_id})
    if not error:
        return verifier_exports.export_cmis(data['data'], document_info, log, database, data['compress_type'], data['ocrise'])
    return None


def export_xml(document_id, data):
    document_info, error = verifier.get_document_by_id({'document_id': document_id})

    if not error:
        log = get_context_var('log', 5)
        database = get_context_var('database', 0)

        log.database = database
        return verifier_exports.export_xml(data['data'], log, document_info, database)


def export_pdf(document_id, data):
    document_info, error = verifier.get_document_by_id({'document_id': document_id})
    if not error:
        log = get_context_var('log', 5)
        database = get_context_var('database', 0)

        log.database = database
        return verifier_exports.export_pdf(data['data'], log, document_info, data['compress_type'], data['ocrise'])


def export_facturx(document_id, data):
    document_info, error = verifier.get_document_by_id({'document_id': document_id})
    if not error:
        log = get_context_var('log', 5)
        database = get_context_var('database', 0)

        log.database = database
        return verifier_exports.export_facturx(data['data'], log, document_info)


def launch_output_script(document_id, workflow_settings, outputs):
    custom_id = retrieve_custom_from_url(request)

    log = get_context_var('log', 5)
    config = get_context_var('config', 1)
    database = get_context_var('database', 0)
    docservers = get_context_var('docservers', 9)

    if 'script' in workflow_settings['output'] and workflow_settings['output']['script']:
        script = workflow_settings['output']['script']
        check_res, message = check_code(script, docservers['VERIFIER_SHARE'],
                                        workflow_settings['input']['input_folder'])

        if not check_res:
            log.error('[OUTPUT_SCRIPT ERROR] ' + gettext('SCRIPT_CONTAINS_NOT_ALLOWED_CODE') +
                      '&nbsp;<strong>(' + message.strip() + ')</strong>')
            return False

        rand = str(uuid.uuid4())
        tmp_file = shared.tmp_path + '/output_scripting_' + rand + '.py'

        try:
            with open(tmp_file, 'w', encoding='utf-8') as python_script:
                python_script.write(script)

            if os.path.isfile(tmp_file):
                script_name = tmp_file.replace(config['GLOBAL']['applicationpath'], '')
                script_name = script_name.replace('/', '.').replace('.py', '')
                script_name = script_name.replace('..', '.')
                try:
                    tmp_script_name = script_name.replace('custom.', '')
                    scripting = importlib.import_module(tmp_script_name, 'custom')
                    script_name = tmp_script_name
                except ModuleNotFoundError:
                    scripting = importlib.import_module(script_name, 'custom')
                res = False

                if document_id:
                    document_info = database.select({
                        'select': ['datas', 'filename', 'path'],
                        'table': ['documents'],
                        'where': ['id = %s'],
                        'data': [document_id]
                    })
                    if document_info:
                        datas = document_info[0]
                        file = datas['path'] + '/' + datas['filename']
                        data = {
                            'log': log,
                            'file': file,
                            'outputs': outputs,
                            'custom_id': custom_id,
                            'datas': datas['datas'],
                            'document_id': document_id,
                            'opencapture_path': config['GLOBAL']['applicationpath']
                        }
                        res = scripting.main(data)

                os.remove(tmp_file)
                if not res:
                    return False
        except (Exception,) as _e:
            os.remove(tmp_file)
            log.error('Error during output scripting : ' + str(traceback.format_exc()))


def ocr_on_the_fly(file_name, selection, thumb_size, lang, remove_spaces=False):
    ocr = get_context_var('ocr', 4)
    files = get_context_var('files', 3)
    docservers = get_context_var('docservers', 9)

    path = docservers['VERIFIER_IMAGE_FULL'] + '/' + file_name
    if not os.path.isfile(path):
        return False

    text = files.ocr_on_fly(path, selection, ocr, thumb_size, lang=lang, remove_spaces=remove_spaces)
    if text:
        return text
    else:
        files.improve_image_detection(path)
        text = files.ocr_on_fly(path, selection, ocr, thumb_size, lang=lang, remove_spaces=remove_spaces)
        return text


def get_thumb_by_document_id(document_id):
    document_info, error = verifier.get_document_by_id({'document_id': document_id})
    if not error:
        register_date = pd.to_datetime(document_info['register_date'])
        year = register_date.strftime('%Y')
        month = register_date.strftime('%m')
        year_and_month = year + '/' + month
        return get_file_content('full', document_info['full_jpg_filename'], 'image/jpeg', year_and_month=year_and_month)
    else:
        return '', 404


def get_original_doc_by_document_id(document_id):
    document_info, error = verifier.get_document_by_id({'document_id': document_id})
    if not error:
        path = document_info['path'] + '/' + document_info['filename']
        mime = magic.Magic(mime=True)
        mime_type = mime.from_file(path)
        with open(path, 'rb') as file:
            content = file.read()

        if not content:
            return None, ''
        return content, mime_type
    else:
        return None, ''


def get_file_content(file_type, filename, mime_type, compress=False, year_and_month=False, document_id=False):
    files = get_context_var('files', 3)
    docservers = get_context_var('docservers', 9)

    content = False
    path = ''

    if file_type == 'full':
        path = docservers['VERIFIER_IMAGE_FULL']
        if year_and_month:
            path = path + '/' + str(year_and_month) + '/'
    elif file_type == 'positions_masks':
        path = docservers['VERIFIER_POSITIONS_MASKS']
    elif file_type == 'referential_supplier':
        path = docservers['REFERENTIALS_PATH']

    if path and filename:
        full_path = path + '/' + filename
        if os.path.isfile(full_path):
            if compress and mime_type == 'image/jpeg':
                thumb_path = docservers['VERIFIER_THUMB']
                if year_and_month:
                    thumb_path = thumb_path + '/' + str(year_and_month) + '/'
                if os.path.isfile(thumb_path + '/' + filename):
                    content = return_rotated_content(file_type, thumb_path + '/' + filename)
            else:
                content = return_rotated_content(file_type, full_path)
        else:
            if document_id:
                document = verifier.get_document_by_id({
                    'select': ['filename', 'full_jpg_filename'],
                    'document_id': document_id
                })
                if document:
                    document = document[0]
                    cpt = int(filename.split('-')[len(filename.split('-')) - 1].replace('.jpg', ''))
                    filename = docservers['VERIFIER_IMAGE_FULL'] + '/' + str(year_and_month) + '/' + filename
                    pdf_path = docservers['VERIFIER_ORIGINAL_DOC'] + '/' + str(year_and_month) + '/' + document['filename']
                    files.save_img_with_pdf2image(pdf_path, filename, cpt)
                    if os.path.isfile(filename):
                        content = return_rotated_content(file_type, filename)

    if not content:
        if mime_type == 'image/jpeg':
            with open('./src/assets/not_found/document_not_found.jpg', 'rb') as file:
                content = file.read()
        else:
            with open('./src/assets/not_found/document_not_found.pdf', 'rb') as file:
                content = file.read()
    return Response(content, mimetype=mime_type)


def return_rotated_content(file_type, image):
    if file_type == 'referential_supplier':
        with open(image, 'rb') as file:
            content = file.read()
    else:
        temp = Image.open(image)
        temp = temp.convert('RGB')
        with tempfile.NamedTemporaryFile() as tf:
            temp.save(tf.name + '.jpg', format="JPEG")
            rotate_img(tf.name + '.jpg')
            with open(tf.name + '.jpg', 'rb') as file:
                content = file.read()
            os.remove(tf.name + '.jpg')
    return content


def get_totals(selected_status, user_id, form_id, allowed_customers=None, allowed_suppliers=None, time=None):
    totals = {'times': {}, 'status': {}}
    if not allowed_customers:
        allowed_customers, _ = user.get_customers_by_user_id(user_id)
        allowed_customers.append(0)  # Update allowed customers to add Unspecified customers

    totals['times']['today'], error = verifier.get_totals({
        'time': 'today', 'status': selected_status, 'form_id': form_id, 'user_id': user_id, 'allowedCustomers': allowed_customers, 'allowedSuppliers': allowed_suppliers
    })
    totals['times']['yesterday'], error = verifier.get_totals({
        'time': 'yesterday', 'status': selected_status, 'form_id': form_id, 'user_id': user_id, 'allowedCustomers': allowed_customers, 'allowedSuppliers': allowed_suppliers
    })
    totals['times']['older'], error = verifier.get_totals({
        'time': 'older', 'status': selected_status, 'form_id': form_id, 'user_id': user_id, 'allowedCustomers': allowed_customers, 'allowedSuppliers': allowed_suppliers
    })

    status_list, _ = status.get_status({
        'time': time,
        'totals': True,
        'form_id': form_id,
        'user_id': user_id,
        'allowedCustomers': allowed_customers,
        'allowedSuppliers': allowed_suppliers
    }, 'verifier')

    if status_list:
        totals['status'] = status_list['status']

    if error is None:
        return totals, 200
    else:
        response = {
            "errors": gettext('GET_TOTALS_ERROR'),
            "message": gettext(error)
        }
        return response, 401


def update_status(args):
    for _id in args['ids']:
        document = verifier.get_document_by_id({'document_id': _id})
        if len(document[0]) < 1:
            response = {
                "errors": gettext('DOCUMENT_NOT_FOUND'),
                "message": gettext('DOCUMENT_ID_NOT_FOUND', id=_id)
            }
            return response, 400

    res = verifier.update_status(args)
    if res:
        return '', 200
    else:
        response = {
            "errors": gettext('UPDATE_STATUS_ERROR'),
            "message": gettext(res)
        }
        return response, 400

def get_customers_count(user_id, _status, time):
    user_customers = user.get_customers_by_user_id(user_id)
    user_customers[0].append(0)
    where_time = []
    if time in ['today', 'yesterday']:
        where_time.append(
            "to_char(register_date, 'YYYY-MM-DD') = to_char(TIMESTAMP '" + time + "', 'YYYY-MM-DD')")
    else:
        where_time.append("to_char(register_date, 'YYYY-MM-DD') < to_char(TIMESTAMP 'yesterday', 'YYYY-MM-DD')")

    customers_count = verifier.get_total_documents({
        'select': ['customer_id', 'count(documents.id) as total'],
        'where': ["status = %s", "customer_id = ANY(%s)", where_time[0], "datas -> 'api_only' is NULL"],
        'data': [_status, user_customers[0]],
        'group_by': ['customer_id']
    })
    for customer in customers_count:
        customer_info, error = accounts.get_customer_by_id({'customer_id': customer['customer_id']})
        _forms = verifier.get_total_documents({
            'select': ['form_id', 'count(documents.id) as total'],
            'where': ["status = %s", "customer_id = ANY(%s)", where_time[0]],
            'data': [_status, user_customers[0]],
            'group_by': ['form_id']
        })
        customer_suppliers = {
            gettext('NO_FORM'): verifier.get_total_documents({
                'select': ['supplier_id', 'count(documents.id) as total'],
                'where': ["status = %s", "customer_id = %s", "form_id is NULL", where_time[0]],
                'data': [_status, customer['customer_id']],
                'group_by': ['supplier_id']
            })
        }
        for form in _forms:
            if form['form_id'] is not None:
                form_info, error = forms.get_form_by_id({'form_id': form['form_id']})
                if error is not None:
                    form_label = gettext('FORM_NOT_FOUND')
                else:
                    form_label = form_info['label']

                where = ["status = %s", "customer_id = %s", "form_id = %s", where_time[0]]
                data = [_status, customer['customer_id'], form['form_id']]

                customer_suppliers[form_label] = verifier.get_total_documents({
                    'select': ['supplier_id', 'count(documents.id) as total'],
                    'where': where,
                    'data': data,
                    'group_by': ['supplier_id']
                })

                for supplier in customer_suppliers[form_label]:
                    supplier_info, error_supplier = accounts.get_supplier_by_id({'supplier_id': supplier['supplier_id']})
                    if error_supplier is None:
                        if supplier_info['firstname'] and supplier_info['lastname'] and supplier_info['name']:
                            supplier['name'] = supplier_info['firstname'] + ' ' + supplier_info['lastname'] + ' (' + supplier_info['name'] + ')'
                        elif supplier_info['firstname'] and supplier_info['lastname']:
                            supplier['name'] = supplier_info['firstname'] + ' ' + supplier_info['lastname']
                        elif supplier_info['lastname'] and supplier_info['name']:
                            supplier['name'] = supplier_info['lastname'] + ' (' + supplier_info['name'] + ')'
                        elif supplier_info['lastname']:
                            supplier['name'] = supplier_info['lastname']
                        else:
                            supplier['name'] = supplier_info['name']
                    supplier['form_id'] = form['form_id']
        customer['suppliers'] = customer_suppliers
        if error is None and customer['customer_id'] != 0:
            customer['name'] = customer_info['name']
    return customers_count, 200