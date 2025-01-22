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

# @dev : Oussama Brich <oussama.brich@edissyum.com>
# @dev : Nathan CHEVAL <nathan.cheval@edissyum.com>

import json
import uuid
import pypdf
import base64
import shutil
import secrets
import os.path
import datetime
from flask_babel import gettext
from werkzeug.datastructures import FileStorage

from src.backend import splitter_exports
from src.backend.classes.CMIS import CMIS
from src.backend.classes.Files import Files
from src.backend.main_splitter import launch
from src.backend.classes.OpenADS import OpenADS
from src.backend.classes.Splitter import Splitter
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id
from flask import current_app, request, g as current_context
from src.backend.controllers import user, monitoring, attachments as attachments_controller
from src.backend.models import splitter, doctypes, accounts, history, workflow, outputs, forms, attachments


def handle_uploaded_file(files, workflow_id, user_id):
    custom_id = retrieve_custom_from_url(request)
    path = current_app.config['UPLOAD_FOLDER_SPLITTER']
    tokens = []

    for file in files:
        _f = files[file]
        filename = Files.save_uploaded_file(_f, path, False)

        now = datetime.datetime.now()
        year, month, day = [str('%02d' % now.year), str('%02d' % now.month), str('%02d' % now.day)]
        hour, minute, second, microsecond = [str('%02d' % now.hour), str('%02d' % now.minute), str('%02d' % now.second), str('%02d' % now.microsecond)]
        date_batch = year + month + day + '_' + hour + minute + second + microsecond
        token = date_batch + '_' + secrets.token_hex(32) + '_' + str(uuid.uuid4())
        tokens.append({'filename': os.path.basename(filename), 'token': token})

        task_id_monitor = monitoring.create_process({
            'token': token,
            'status': 'wait',
            'module': 'splitter',
            'source': 'interface',
            'filename': os.path.basename(_f.filename),
            'workflow_id': workflow_id if workflow_id else None
        })

        if task_id_monitor:
            launch({
                'file': filename,
                'user_id': user_id,
                'custom_id': custom_id,
                'workflow_id': workflow_id,
                'ip': request.remote_addr,
                'user_info': request.environ['user_info'],
                'task_id_monitor': task_id_monitor[0]['process']
            })
        else:
            return False, 500
    return tokens, 200


def launch_referential_update(form_data):
    if 'database' in current_context and 'log' in current_context and 'config' in current_context and 'docservers' in current_context:
        log = current_context.log
        config = current_context.config
        database = current_context.database
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        log = _vars[5]
        config = _vars[1]
        database = _vars[0]
        docservers = _vars[9]

    available_methods = docservers['SPLITTER_METADATA_PATH'] + "/metadata_methods.json"
    call_on_splitter_view = False
    try:
        with open(available_methods, encoding='utf-8') as json_file:
            available_methods = json.load(json_file)
            for method in available_methods['methods']:
                if method['id'] == form_data['metadata_method']:
                    call_on_splitter_view = method['callOnSplitterView']
                    args = {
                        'log': log,
                        'config': config,
                        'database': database,
                        'method_data': method,
                        'docservers': docservers,
                        'form_id': form_data['form_id']
                    }
                    metadata_load = Splitter.import_method_from_script(docservers['SPLITTER_METADATA_PATH'],
                                                                        method['script'], method['method'])
                    metadata_load(args)
    except (Exception,) as e:
        response = {
            'status': False,
            "errors": gettext('LOAD_METADATA_ERROR'),
            "message": str(e)
        }
        return response, 500
    return {'OK': True, 'callOnSplitterView': call_on_splitter_view}, 200


def retrieve_referential(form_id):
    form, _ = forms.get_form_by_id({'form_id': form_id})
    if form['settings']['metadata_method']:
        res = launch_referential_update({
            'form_id': form['id'],
            'metadata_method': form['settings']['metadata_method']
        })
        if res[1] != 200:
            return res

    metadata, _ = splitter.retrieve_metadata({
        'type': 'referential',
        'form_id': form['id']
    })

    response = {
        "metadata": metadata
    }
    return response, 200


def retrieve_batches(data):
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]

    args = {
        'user_id': data['userId'],
        'size': data['size'] if 'size' in data else None,
        'page': data['page'] if 'page' in data else None,
        'time': data['time'] if 'time' in data else None,
        'status': data['status'] if 'status' in data else None,
        'search': data['search'] if 'search' in data else None,
        'order': data['order'] if 'order' in data else None,
        'filter': data['filter'] if 'filter' in data else None,
        'batch_id': data['batchId'] if 'batchId' in data else None
    }

    user_customers = user.get_customers_by_user_id(args['user_id'])

    if user_customers[1] != 200:
        return user_customers[0], user_customers[1]
    user_customers = user_customers[0]

    user_forms = user.get_forms_by_user_id(args['user_id'])
    if user_forms[1] != 200:
        return user_forms[0], user_forms[1]
    user_forms = user_forms[0]

    args['table'] = ['splitter_batches']
    args['select'] = ['splitter_batches.*', "to_char(splitter_batches.creation_date, 'DD-MM-YYYY " + gettext('AT') + " HH24:MI:SS') as batch_date"]
    args['where'] = ['customer_id = ANY(%s)', 'form_id = ANY(%s)']
    args['data'] = [user_customers, user_forms]

    if 'search' in args and args['search']:
        args['where'].append("splitter_batches.id = %s OR file_name like %s ")
        args['data'].append(args['search'])
        args['data'].append(f"%{args['search']}%")

    if 'status' in args and args['status'] is not None:
        args['where'].append("splitter_batches.status = %s")
        args['data'].append(args['status'])

    if 'time' in args and args['time'] is not None:
        if args['time'] in ['today', 'yesterday']:
            args['where'].append(
                "to_char(splitter_batches.creation_date, 'YYYY-MM-DD') = to_char(TIMESTAMP '" + args['time'] + "', 'YYYY-MM-DD')")
        else:
            args['where'].append("to_char(splitter_batches.creation_date, 'YYYY-MM-DD') < to_char(TIMESTAMP 'yesterday', 'YYYY-MM-DD')")

    if 'filter' in args and args['filter']:
        args['order_by'] = args['filter']
        if 'order' in args and args['order']:
            args['order_by'] = [args['filter'] + ' ' + args['order']]
        else:
            args['order_by'] = [args['filter'] + ' DESC']

    batches, error_batches = splitter.retrieve_batches(args)
    count, error_count = splitter.count_batches(args)
    if not error_batches and not error_count:
        for index, batch in enumerate(batches):
            form = forms.get_form_by_id({'form_id': batch['form_id']})
            batches[index]['form_label'] = form[0]['label'] if 'label' in form[0] else gettext('FORM_UNDEFINED')

            customer = accounts.get_customer_by_id({'customer_id': batch['customer_id']})
            batches[index]['customer_name'] = customer[0]['name'] if 'name' in customer[0] else gettext('CUSTOMER_UNDEFINED')

            attachments_count = attachments.get_attachments_by_batch_id(batch['id'])
            batches[index]['attachments_count'] = len(attachments_count) if attachments_count else 0
            try:
                thumbnail = f"{docservers['SPLITTER_THUMB']}/{batches[index]['batch_folder']}/{batches[index]['thumbnail']}"
                with open(thumbnail, 'rb') as image_file:
                    encoded_string = base64.b64encode(image_file.read())
                    batches[index]['thumbnail'] = encoded_string.decode("utf-8")
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
    return response, 400


def download_original_file(batch_id):
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]

    res = splitter.get_batch_by_id({'id': batch_id})
    if res[0]:
        try:
            batch = res[0]
            file_path = docservers['SPLITTER_ORIGINAL_DOC'] + "/" + batch['file_path']
            with open(file_path, 'rb') as pdf_file:
                encoded_file = base64.b64encode(pdf_file.read()).decode('utf-8')
            return {'encodedFile': encoded_file, 'filename': batch['file_name']}, 200
        except (Exception,) as e:
            response = {
                "errors": "ERROR",
                "message": str(e)
            }
            return response, 400

    response = {
        "errors": "ERROR",
        "message": res[1]
    }
    return response, 400


def delete_batches(args):
    for _id in args['ids']:
        batches = splitter.get_batch_by_id({'id': _id})
        if len(batches[0]) < 1:
            response = {
                "errors": gettext('BATCH_NOT_FOUND'),
                "message": gettext('BATCH_ID_NOT_FOUND', id=_id)
            }
            return response, 401

    args['status'] = 'DEL'
    res = splitter.update_status(args)

    if res:
        for batch_id in args['ids']:
            history.add_history({
                'module': 'splitter',
                'ip': request.remote_addr,
                'submodule': 'delete_batch',
                'user_info': request.environ['user_info'],
                'desc': gettext('DELETE_BATCH_SUCCESS', batch_id=batch_id)
            })
        return '', 200
    else:
        response = {
            "errors": gettext('UPDATE_STATUS_ERROR'),
            "message": ''
        }
        return response, 400


def update_status(args):
    for _id in args['ids']:
        batches = splitter.get_batch_by_id({'id': _id})
        if len(batches[0]) < 1:
            response = {
                "errors": gettext('BATCH_NOT_FOUND'),
                "message": gettext('BATCH_ID_NOT_FOUND', id=_id)
            }
            return response, 401

    res = splitter.update_status(args)
    if res:
        return '', 200
    else:
        response = {
            "errors": gettext('UPDATE_STATUS_ERROR'),
            "message": ''
        }
        return response, 400


def update_customer(args):
    batches = splitter.get_batch_by_id({'id': args['batch_id']})
    if len(batches[0]) < 1:
        response = {
            "errors": gettext('BATCH_NOT_FOUND'),
            "message": gettext('BATCH_ID_NOT_FOUND', id=args['batch_id'])
        }
        return response, 401

    res = splitter.update_customer(args)
    if res:
        return '', 200
    else:
        response = {
            "errors": gettext('UPDATE_CUSTOMER_ERROR'),
            "message": ''
        }
        return response, 400


def change_form(args):
    res = splitter.change_form(args)

    if res:
        return res, 200
    else:
        return res, 400


def lock_batch(args):
    res = splitter.lock_batch(args)

    if res:
        return res, 200
    else:
        return res, 400


def remove_lock_by_user_id(user_id):
    _, error = splitter.remove_lock_by_user_id({
        'set': {
            'locked': False,
            'locked_by': None
        },
        'where': ['locked_by = %s'],
        'user_id': user_id
    })

    if error in [None, '']:
        return '', 200
    else:
        response = {
            "errors": gettext('REMOVE_LOCK_BY_USER_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def remove_lock_by_batch_id(batch_id):
    _, error = splitter.remove_lock_by_batch_id(batch_id)

    if error in [None, '']:
        return '', 200
    else:
        response = {
            "errors": gettext('REMOVE_LOCK_BY_USER_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def get_page_full_thumbnail(page_id):
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]

    res, error = splitter.get_page_by_id({'id': page_id})
    if not res:
        response = {
            "errors": "ERROR",
            "message": gettext(error)
        }
        return response, 400

    try:
        thumb_path = f"{docservers['SPLITTER_BATCHES']}/{res[0]['thumbnail']}"
        with open(thumb_path, 'rb') as image_file:
            encoded_string = base64.b64encode(image_file.read())
            full_thumbnail = encoded_string.decode("utf-8")
            return {'fullThumbnail': full_thumbnail}, 200
    except (Exception,) as e:
        response = {
            "errors": "ERROR",
            "message": str(e)
        }
        return response, 400


def retrieve_documents(batch_id):
    res_documents = []
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]

    documents, _ = splitter.get_batch_documents({'batch_id': batch_id})
    if documents:
        for document in documents:
            document_pages = []
            doctype_key = None
            doctype_label = None

            pages, _ = splitter.get_document_pages({'document_id': document['id']})
            if pages:
                for page_index, _ in enumerate(pages):
                    thumbnail = f"{docservers['SPLITTER_THUMB']}/{pages[page_index]['thumbnail']}"
                    with open(thumbnail, 'rb') as image_file:
                        encoded_string = base64.b64encode(image_file.read())
                        pages[page_index]['thumbnail'] = encoded_string.decode("utf-8")
                        document_pages.append(pages[page_index])

            dotypes = doctypes.retrieve_doctypes({
                'where': ['status = %s', 'key = %s'],
                'data': ['OK', document['doctype_key']]
            })[0]

            if dotypes and len(dotypes[0]) > 0:
                doctype_key = dotypes[0]['key'] if dotypes[0]['key'] else None
                doctype_label = dotypes[0]['label'] if dotypes[0]['label'] else None

            res_documents.append({
                'pages': document_pages,
                'doctype_key': doctype_key,
                'doctype_label': doctype_label,
                'id': document['id'],
                'data': document['data'],
                'status': document['status'],
                'split_index': document['split_index'],
                'display_order': document['display_order']
            })

    response = {"documents": res_documents}

    return response, 200


def create_document(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    res = splitter.create_document({
        'data': '{}',
        'status': 'NEW',
        'doctype_key': None,
        'batch_id': args['batchId'],
        'split_index': args['splitIndex'],
        'display_order': args['displayOrder']
    })

    if res:
        for update_data in args['updatedDocuments']:
            splitter.update_document({
                'id': update_data['id'],
                'display_order': update_data['displayOrder']
            })
        database.insert({
            'table': 'history',
            'columns': {
                'workflow_id': None,
                'history_module': 'splitter',
                'user_ip': request.remote_addr,
                'history_submodule': 'create_document',
                'user_info': request.environ['user_info'],
                'custom_fields': json.dumps({"splitter_document_id": res}),
                'user_id': args['user_id'] if 'user_id' in args and args['user_id'] else 0,
                'history_desc': f"{gettext('DOCUMENT')} n°<strong>{str(res)}</strong> {gettext('CREATED_ON_BATCH')} N°<strong>{str(args['batchId'])}</strong>"
            }
        })
    else:
        response = {
            "errors": gettext('ADD_DOCUMENT_ERROR'),
            "message": ''
        }
        return response, 400

    return {"newDocumentId": res}, 200


def get_output_parameters(parameters):
    data = {}
    for parameter in parameters:
        if type(parameter['value']) is dict and 'id' in parameter['value']:
            data[parameter['id']] = parameter['value']['id']
        else:
            data[parameter['id']] = parameter['value']
    return data


def save_modifications(data):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    res = splitter.update_batch({
        'batch_id': data['batch_id'],
        'batch_metadata': data['batch_metadata']
    })[0]
    if not res:
        response = {
            "errors": gettext('UPDATE_BATCH_ERROR'),
            "message": ''
        }
        return response, 400

    for document in data['documents']:
        page_display_order = 1
        if document['displayOrder']:
            res = splitter.update_document({
                'id': document['id'].split('-')[-1],
                'display_order': document['displayOrder']
            })[0]

            if not res:
                response = {
                    "errors": gettext('UPDATE_DOCUMENTS_ERROR'),
                    "message": ''
                }
                return response, 400

        document['id'] = document['id'].split('-')[-1]
        res = splitter.update_document({
            'id': document['id'].split('-')[-1],
            'doctype_key': document['doctypeKey'] if 'doctypeKey' in document else None,
            'document_metadata': document['metadata']
        })[0]
        if not res:
            response = {
                "errors": gettext('UPDATE_DOCUMENT_ERROR'),
                "message": ''
            }
            return response, 400

        """
            Save pages changes
        """
        for page in document['pages']:
            res = splitter.update_page({
                'page_id': page['id'],
                'document_id': document['id'],
                'rotation':  page['rotation'],
                'display_order': page_display_order
            })[0]
            page_display_order += 1
            if not res:
                response = {
                    "errors": gettext('UPDATE_PAGES_ERROR'),
                    "message": ''
                }
                return response, 400

    """
        Deleted documents
    """
    for deleted_documents_id in data['deleted_documents_ids']:
        res = splitter.update_document({
            'id': deleted_documents_id.split('-')[-1],
            'status': 'DEL'
        })[0]

        database.delete({
            'table': ["history"],
            'where': ["custom_fields ->> 'splitter_document_id' = %s"],
            'data': [deleted_documents_id.split('-')[-1]]
        })
        database.conn.commit()

    if not res:
        response = {
            "errors": gettext('UPDATE_PAGES_ERROR'),
            "message": ''
        }
        return response, 400

    """
        Deleted pages
    """
    for deleted_pages_id in data['deleted_pages_ids']:
        res = splitter.update_page({
            'page_id': deleted_pages_id,
            'status': 'DEL'
        })[0]
        if not res:
            response = {
                "errors": gettext('UPDATE_PAGES_ERROR'),
                "message": ''
            }
            return response, 400

    return True, 200


def test_cmis_connection(args):
    try:
        cmis = CMIS(args['cmis_ws'], args['login'], args['password'], args['folder'])
        if cmis.cmis_client.status_code != 200:
            response = {
                'status': False,
                "errors": gettext('CMIS_CONNECTION_ERROR'),
                "message": cmis.cmis_client.text
            }
            return response, 400
        elif cmis.root_folder != cmis.base_dir:
            response = {
                'status': False,
                "errors": gettext('CMIS_CONNECTION_ERROR'),
                "message": gettext('CMIS_FOLDER_ERROR_MESSAGE')
            }
            return response, 400
    except (Exception,) as e:
        response = {
            'status': False,
            "errors": gettext('CMIS_CONNECTION_ERROR'),
            "message": str(e)
        }
        return response, 400
    return {'status': True}, 200


def test_openads_connection(args):
    _openads = OpenADS(args['openads_api'], args['login'], args['password'])
    res = _openads.test_connection()
    if not res['status']:
        response = {
            'status': False,
            "errors": gettext('OPENADS_CONNECTION_ERROR'),
            "message": res['message'] if 'message' in res else ''
        }
        return response, 400
    return {'status': True}, 200


def export_batch(data):
    custom_id = retrieve_custom_from_url(request)
    if 'regex' in current_context and 'log' in current_context and 'docservers' in current_context:
        log = current_context.log
        regex = current_context.regex
        docservers = current_context.docservers
        config = current_context.config
        database = current_context.database
    else:
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
        config = _vars[1]
        regex = _vars[2]
        log = _vars[5]
        docservers = _vars[9]

    save_response = save_modifications({
        'batch_id': data['batchId'],
        'documents': data['documents'],
        'moved_pages': data['movedPages'],
        'batch_metadata': data['batchMetadata'],
        'deleted_pages_ids': data['deletedPagesIds'],
        'deleted_documents_ids': data['deletedDocumentsIds']
    })
    if save_response[1] != 200:
        return save_response

    export_res = splitter_exports.export_batch(data['batchId'], log, docservers, regex, config, database, custom_id)
    return export_res


def get_split_methods():
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]
    split_methods = Splitter.get_split_methods(docservers)
    if len(split_methods) > 0:
        return split_methods, 200
    return split_methods, 400


def get_metadata_methods(form_method=False):
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]
    metadata_methods = Splitter.get_metadata_methods(docservers, form_method)
    if len(metadata_methods) > 0:
        return metadata_methods, 200
    return metadata_methods, 400


def get_totals(status, user_id):
    totals = {}
    user_customers = user.get_customers_by_user_id(user_id)
    if user_customers[1] != 200:
        return user_customers[0], user_customers[1]
    user_customers = user_customers[0]

    user_forms = user.get_forms_by_user_id(user_id)
    if user_forms[1] != 200:
        return user_forms[0], user_forms[1]
    user_forms = user_forms[0]

    totals['today'], error = splitter.get_totals({
        'time': 'today',
        'status': status,
        'user_forms': user_forms,
        'user_customers': user_customers
    })
    totals['yesterday'], error = splitter.get_totals({
        'time': 'yesterday',
        'status': status,
        'user_forms': user_forms,
        'user_customers': user_customers
    })
    totals['older'], error = splitter.get_totals({
        'time': 'older',
        'status': status,
        'user_forms': user_forms,
        'user_customers': user_customers
    })

    if error is None:
        return totals, 200

    response = {
        "errors": gettext('GET_TOTALS_ERROR'),
        "message": gettext(error)
    }
    return response, 400


def merge_batches(parent_id, batches):
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]

    parent_info = splitter.get_batch_by_id({'id': parent_id})[0]
    parent_filename = docservers['SPLITTER_ORIGINAL_DOC'] + '/' + parent_info['file_path']
    parent_batch_documents = int(parent_info['documents_count'])
    parent_max_split_index = splitter.get_documents_max_split_index({'id': parent_id})[0][0]['split_index']
    parent_pdf = pypdf.PdfReader(parent_filename)
    parent_max_source_page = len(parent_pdf.pages)
    merged_pdf = pypdf.PdfWriter()
    for page in range(len(parent_pdf.pages)):
        merged_pdf.add_page(parent_pdf.pages[page])

    batches_info = []
    childs_attachments = []
    for batch_id in batches:
        batch_info = splitter.get_batch_by_id({'id': batch_id})[0]
        c_attachments = attachments.get_attachments_by_batch_id(batch_id)
        if c_attachments:
            for attachment in c_attachments:
                childs_attachments.append(attachment['id'])
        parent_batch_documents += batch_info['documents_count']
        batches_info.append(batch_info)
        pdf = pypdf.PdfReader(docservers['SPLITTER_ORIGINAL_DOC'] + '/' + batch_info['file_path'])
        for page in range(len(pdf.pages)):
            merged_pdf.add_page(pdf.pages[page])

        documents = splitter.get_documents({'id': batch_id})
        cpt = 0
        for doc in documents[0]:
            if doc:
                if cpt >= 1:
                    previous_split_index = documents[0][cpt - 1]['split_index']
                    if previous_split_index != doc['split_index']:
                        parent_max_split_index += 1

                document_id = splitter.create_document({
                    'batch_id': parent_id,
                    'doctype_key': doc['doctype_key'],
                    'data': json.dumps({'custom_fields': doc['data']}),
                    'status': 'NEW',
                    'split_index': parent_max_split_index + doc['split_index']
                })

                for page in splitter.get_document_pages({'document_id': doc['id']})[0]:
                    new_source_page = parent_max_source_page + page['source_page']
                    new_page = parent_info['batch_folder'] + '/' + 'page-' + str(doc['id']) + str(new_source_page).zfill(3) + '.jpg'
                    new_page_absolute = docservers['SPLITTER_BATCHES'] + '/' + new_page
                    if not os.path.isfile(new_page_absolute):
                        shutil.copy(docservers['SPLITTER_BATCHES'] + '/' + page['thumbnail'], new_page_absolute)

                    new_thumb_absolute = docservers['SPLITTER_THUMB'] + '/' + new_page
                    if not os.path.isfile(new_thumb_absolute):
                        shutil.copy(docservers['SPLITTER_THUMB'] + '/' + page['thumbnail'], new_thumb_absolute)

                    splitter.insert_page({
                        'document_id': document_id,
                        'path': new_page,
                        'source_page': new_source_page
                    })

                splitter.update_status({
                    'ids': [int(batch_id)],
                    'status': 'MERG'
                })

                cpt += 1
        parent_max_split_index += 1

    splitter.update_batch_documents_count({'id': parent_id, 'number': parent_batch_documents})
    with open(parent_filename, 'wb') as file:
        merged_pdf.write(file)

    for attachment_id in childs_attachments:
        attachments.update_attachment({
            'attachment_id': attachment_id,
            'set': {
                'batch_id': parent_id
            }
        })


def get_unseen(user_id):
    user_customers = user.get_customers_by_user_id(user_id)
    total_unseen = splitter.count_batches({
        'where': ['status = %s', 'customer_id = ANY(%s)'],
        'data': ['NEW', user_customers[0]]
    })[0]
    return total_unseen, 200


def get_batch_outputs(batch_id):
    _outputs = []

    batch, _ = splitter.get_batch_by_id({'id': batch_id})
    workflow_settings, error = workflow.get_workflow_by_id({'workflow_id': batch['workflow_id']})
    if error:
        response = {
            "errors": gettext('GET_BATCH_OUTPUTS_ERROR'),
            "message": gettext(error)
        }
        return response, 400

    if workflow_settings['process']['use_interface'] and batch['form_id']:
        form, error = forms.get_form_by_id({'form_id': batch['form_id']})
        if error:
            return error, 400
        outputs_id = form['outputs']
    else:
        outputs_id = workflow_settings['output']['outputs_id']

    for output_id in outputs_id:
        output, error = outputs.get_output_by_id({'output_id': output_id})
        if error:
            return error, 400
        _outputs.append({
            'id': output['id'],
            'type': output['output_type_id'],
            'label': output['output_label']
        })

    return {'outputs': _outputs}, 200

def move_documents_to_attachment(documents, batch_id):
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]

    for document in documents:
        document_id = document['id']
        pages, _ = splitter.get_document_pages({'document_id': document_id})
        batch_info, _ = splitter.get_batch_by_id({'id': batch_id})

        file_path = docservers['SPLITTER_ORIGINAL_DOC'] + '/' + batch_info['file_path']
        pdf_reader = pypdf.PdfReader(file_path, strict=False)
        pdf_writer = pypdf.PdfWriter()

        for page in pages:
            pdf_page = pdf_reader.pages[page['source_page'] - 1]
            if page['rotation'] != 0:
                pdf_page.rotate(page['rotation'])
            pdf_writer.add_page(pdf_page)

        tmp_filename = docservers['TMP_PATH'] + '/' + str(uuid.uuid4()) + '.pdf'
        pdf_writer.write(tmp_filename)

        attachments_controller.handle_uploaded_file({
            'files': FileStorage(stream=open(tmp_filename, 'rb'), filename=batch_info['file_name'])
        }, None, batch_id, 'splitter')

        if os.path.isfile(tmp_filename):
            os.remove(tmp_filename)

    return '', 200