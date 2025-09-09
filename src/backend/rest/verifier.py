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

import re
import base64
import pandas as pd
from flask_babel import gettext
from flask import Blueprint, make_response, request, jsonify
from src.backend.controllers import auth, config, verifier, privileges
from src.backend.functions import rest_validator, check_extensions_mime

bp = Blueprint('verifier', __name__, url_prefix='/ws/')


@bp.route('checkFileBeforeUpload', methods=['POST'])
def check_file_before_upload():
    """
    Check if the file is valid before upload
    Usefull to check if file is accessible by the browser
    :return:
    """

    _ = request.files
    return '', 200


@bp.route('verifier/upload', methods=['POST'])
@auth.token_required
def upload():
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier', 'upload']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/verifier/upload'}), 403

    check, message = rest_validator(request.form, [
        {'id': 'siret', 'type': int, 'mandatory': False},
        {'id': 'siren', 'type': int, 'mandatory': False},
        {'id': 'userId', 'type': int, 'mandatory': False},
        {'id': 'workflowId', 'type': str, 'mandatory': True},
        {'id': 'vat_number', 'type': str, 'mandatory': False},
        {'id': 'returnUniqueUrl', 'type': bool, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    supplier = {}
    if 'siret' in request.form:
        supplier = {'column': 'siret', 'value': request.form['siret']}
    elif 'siren' in request.form:
        supplier = {'column': 'siren', 'value': request.form['siren']}
    elif 'vat_number' in request.form:
        supplier = {'column': 'vat_number', 'value': request.form['vat_number']}

    files = request.files

    message, code = check_extensions_mime(files)
    if code != 200:
        return make_response(message, code)

    res = verifier.handle_uploaded_file(files, request.form['workflowId'], supplier)

    if res and res[0] is not False:
        for file in res[0]:
            if 'returnUniqueUrl' in request.form and request.form['returnUniqueUrl']:
                token = auth.generate_unique_url_token(file['token'], request.form['workflowId'], 'verifier')
                if token:
                    cfg, _ = config.read_config()
                    application_url = cfg['GLOBAL']['applicationurl']

                    if not re.search(r'dist(/)+#', application_url):
                        application_url = application_url.replace('/dist', '/dist/#/')

                    if 'dist/#' not in application_url:
                        application_url = application_url + '/dist/#/'

                    file['uniqueUrl'] = f"{application_url}/verifier/viewer_token/{token}"
                    file['uniqueUrl'] = file['uniqueUrl'].replace('///', '//')
                    file['uniqueUrl'] = file['uniqueUrl'].replace('#//', '#/').replace('//#', '/#')
                    file['uniqueUrl'] = file['uniqueUrl'].replace('//dist', '/dist').replace('dist//', 'dist/')
                else:
                    res = [{
                        'errors': gettext('UNIQUE_URL_TOKEN_GENERATION_ERROR'),
                        'message': gettext('INTERFACE_IS_NOT_USED_OR_FORM_UNIQUE_URL_NOT_SET')
                    }, 403]
        return make_response(res[0], res[1])
    else:
        return make_response(gettext('UNKNOW_ERROR'), 400)


@bp.route('verifier/retryFromMonitoring/<int:process_id>', methods=['GET'])
@auth.token_required
def retry_from_monitoring(process_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/verifier/retryFromMonitoring/{process_id}'}), 403

    res = verifier.retry_from_monitoring(process_id)
    return make_response(res[0], res[1])


@bp.route('verifier/documents/list', methods=['POST'])
@auth.token_required
def documents_list():
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier | statistics']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/verifier/documents/list'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'time', 'type': str, 'mandatory': False},
        {'id': 'limit', 'type': int, 'mandatory': False},
        {'id': 'status', 'type': str, 'mandatory': True},
        {'id': 'order', 'type': str, 'mandatory': False},
        {'id': 'offset', 'type': int, 'mandatory': False},
        {'id': 'search', 'type': str, 'mandatory': False},
        {'id': 'filter', 'type': str, 'mandatory': False},
        {'id': 'user_id', 'type': int, 'mandatory': False},
        {'id': 'allowedCustomers', 'type': list, 'mandatory': False},
        {'id': 'allowedSuppliers', 'type': list, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = verifier.retrieve_documents(request.json)
    return make_response(res[0], res[1])


@bp.route('verifier/documents/<int:document_id>', methods=['GET'])
@auth.token_required
def document_info(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}'}), 403

    res = verifier.get_document_by_id(document_id)
    return make_response(res[0], res[1])


@bp.route('verifier/documents/getDocumentIdAndStatusByToken', methods=['POST'])
def get_document_informations_by_token():
    check, message = rest_validator(request.json, [
        {'id': 'token', 'type': str, 'mandatory': True},
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = verifier.get_document_id_and_status_by_token(request.json['token'])
    return make_response(res[0], res[1])


@bp.route('verifier/documents/<int:document_id>/updatePosition', methods=['PUT'])
@auth.token_required
def update_document_position(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/updatePosition'}), 403

    res = verifier.update_position_by_document_id(document_id, request.json['args'])
    return make_response(res[0], res[1])


@bp.route('verifier/documents/<int:document_id>/updatePage', methods=['PUT'])
@auth.token_required
def update_document_page(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/updatePage'}), 403

    res = verifier.update_page_by_document_id(document_id, request.json['args'])
    return make_response(res[0], res[1])


@bp.route('verifier/documents/delete/<int:document_id>', methods=['DELETE'])
@auth.token_required
def delete_document(document_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/verifier/documents/delete/{document_id}'}), 403

    res = verifier.delete_document(document_id)
    return make_response(res[0], res[1])


@bp.route('verifier/documents/<int:document_id>/updateData', methods=['PUT'])
@auth.token_required
def update_document_data(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/updateData'}), 403

    res = verifier.update_document_data_by_document_id(document_id, request.json['args'])
    return make_response(res[0], res[1])


@bp.route('verifier/documents/<int:document_id>/export_xml', methods=['POST'])
@auth.token_required
def export_xml(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/export_xml'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'data', 'type': dict, 'mandatory': True},
        {'id': 'module', 'type': str, 'mandatory': True},
        {'id': 'ocrise', 'type': bool, 'mandatory': False},
        {'id': 'compress_type', 'type': str, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = verifier.export_xml(document_id, request.json['args'])
    return make_response(jsonify(res[0]), res[1])


@bp.route('verifier/documents/<int:document_id>/export_pdf', methods=['POST'])
@auth.token_required
def export_pdf(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/export_pdf'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'data', 'type': dict, 'mandatory': True},
        {'id': 'module', 'type': str, 'mandatory': True},
        {'id': 'ocrise', 'type': bool, 'mandatory': False},
        {'id': 'compress_type', 'type': str, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = verifier.export_pdf(document_id, request.json['args'])
    return make_response(jsonify(res[0]), res[1])


@bp.route('verifier/documents/<int:document_id>/export_facturx', methods=['POST'])
@auth.token_required
def export_facturx(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/export_facturx'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'data', 'type': dict, 'mandatory': True},
        {'id': 'module', 'type': str, 'mandatory': True},
        {'id': 'ocrise', 'type': bool, 'mandatory': False},
        {'id': 'compress_type', 'type': str, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = verifier.export_facturx(document_id, request.json['args'])
    return make_response(jsonify(res[0]), res[1])


@bp.route('verifier/documents/<int:document_id>/export_mem', methods=['POST'])
@auth.token_required
def export_mem(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/export_mem'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'data', 'type': dict, 'mandatory': True},
        {'id': 'module', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = verifier.export_mem(document_id, request.json['args'])
    return make_response(jsonify(res[0]), res[1])


@bp.route('verifier/documents/<int:document_id>/export_coog', methods=['POST'])
@auth.token_required
def export_coog(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/export_coog'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'data', 'type': dict, 'mandatory': True},
        {'id': 'module', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)
    res = verifier.export_coog(document_id, request.json['args'])
    return make_response(jsonify(res[0]), res[1])


@bp.route('verifier/documents/<int:document_id>/export_opencrm', methods=['POST'])
@auth.token_required
def export_opencrm(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/export_opencrm'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'data', 'type': dict, 'mandatory': True},
        {'id': 'module', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)
    res = verifier.export_opencrm(document_id, request.json['args'])
    return make_response(jsonify(res[0]), res[1])


@bp.route('verifier/documents/<int:document_id>/export_cmis', methods=['POST'])
@auth.token_required
def export_cmis(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/export_cmis'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'data', 'type': dict, 'mandatory': True},
        {'id': 'module', 'type': str, 'mandatory': True},
        {'id': 'ocrise', 'type': bool, 'mandatory': False},
        {'id': 'compress_type', 'type': str, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)
    res = verifier.export_cmis(document_id, request.json['args'])
    return make_response(jsonify(res[0]), res[1])

@bp.route('verifier/documents/<int:document_id>/outputScript', methods=['POST'])
@auth.token_required
def launch_output_script(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/outputScript'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'outputs', 'type': list, 'mandatory': True},
        {'id': 'workflow', 'type': dict, 'mandatory': True},
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    verifier.launch_output_script(document_id, request.json['workflow'], request.json['outputs'])
    return make_response('', 200)


@bp.route('verifier/documents/<int:document_id>/deleteDocuments', methods=['GET'])
@auth.token_required
def delete_documents_by_document_id(document_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/verifier/documents/{document_id}/deleteDocuments'}), 403

    res = verifier.delete_documents_by_document_id(document_id)
    return make_response(res[0], res[1])


@bp.route('verifier/documents/<int:document_id>/deleteData', methods=['PUT'])
@auth.token_required
def delete_document_data(document_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/verifier/documents/{document_id}/deleteData'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'fields', 'type': list, 'mandatory': 'fields' in request.json['args']},
        {'id': 'multiple', 'type': bool, 'mandatory': 'fields' in request.json['args']}
    ], only_data='fields' not in request.json['args'])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = ['', 400]
    if 'multiple' in request.json['args']:
        fields = request.json['args']['fields']
        for field in fields:
            res = verifier.delete_document_data_by_document_id(document_id, field)
    else:
        field_id = request.json['args']
        res = verifier.delete_document_data_by_document_id(document_id, field_id)
    return make_response(res[0], res[1])


@bp.route('verifier/documents/<int:document_id>/deletePosition', methods=['PUT'])
@auth.token_required
def delete_document_position(document_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/verifier/documents/{document_id}/deletePosition'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'fields', 'type': list, 'mandatory': 'fields' in request.json['args']},
        {'id': 'multiple', 'type': bool, 'mandatory': 'fields' in request.json['args']}
    ], only_data='fields' not in request.json['args'])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = ['', 400]
    if 'multiple' in request.json['args']:
        fields = request.json['args']['fields']
        for field in fields:
            res = verifier.delete_document_position_by_document_id(document_id, field)
    else:
        field_id = request.json['args']
        res = verifier.delete_document_position_by_document_id(document_id, field_id)
    return make_response(res[0], res[1])


@bp.route('verifier/documents/<int:document_id>/deletePage', methods=['PUT'])
@auth.token_required
def delete_document_page(document_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/verifier/documents/{document_id}/deletePage'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'fields', 'type': list, 'mandatory': 'fields' in request.json['args']},
        {'id': 'multiple', 'type': bool, 'mandatory': 'fields' in request.json['args']}
    ], only_data='fields' not in request.json['args'])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = ['', 400]
    if 'multiple' in request.json['args']:
        fields = request.json['args']['fields']
        for field in fields:
            res = verifier.delete_document_page_by_document_id(document_id, field)
    else:
        field_id = request.json['args']
        res = verifier.delete_document_page_by_document_id(document_id, field_id)
    return make_response(res[0], res[1])


@bp.route('verifier/documents/<int:document_id>/update', methods=['PUT'])
@auth.token_required
def update_document(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/update'}), 403

    res = verifier.update_document(document_id, request.json['args'])
    return make_response(res[0], res[1])


@bp.route('verifier/documents/removeLockByUserId/<string:user_id>', methods=['PUT'])
@auth.token_required
def remove_lock_by_user_id(user_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/verifier/documents/removeLockByUserId/{user_id}'}), 403

    res = verifier.remove_lock_by_user_id(user_id)
    return make_response(res[0], res[1])


@bp.route('verifier/ocrOnFly', methods=['POST'])
@auth.token_required
def ocr_on_fly():
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/verifier/ocrOnFly'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'lang', 'type': str, 'mandatory': False},
        {'id': 'fileName', 'type': str, 'mandatory': True},
        {'id': 'thumbSize', 'type': dict, 'mandatory': True},
        {'id': 'selection', 'type': dict, 'mandatory': True},
        {'id': 'registerDate', 'type': str, 'mandatory': False},
        {'id': 'removeSpaces', 'type': bool, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    if 'registerDate' in request.json:
        register_date = pd.to_datetime(request.json['registerDate'])
        year = register_date.strftime('%Y')
        month = register_date.strftime('%m')
        year_and_month = year + '/' + month
        request.json['fileName'] = year_and_month + '/' + request.json['fileName']

    if 'removeSpaces' not in request.json:
        request.json['removeSpaces'] = False

    result = verifier.ocr_on_the_fly(request.json['fileName'], request.json['selection'], request.json['thumbSize'],
                                     request.json['lang'], request.json['removeSpaces'])
    return make_response({'result': result}, 200)


@bp.route('verifier/getThumb', methods=['POST'])
@auth.token_required
def get_thumb():
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier | update_position_mask']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/verifier/getThumb'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'type', 'type': str, 'mandatory': False},
        {'id': 'filename', 'type': str, 'mandatory': True},
        {'id': 'documentId', 'type': int, 'mandatory': False},
        {'id': 'registerDate', 'type': str, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    year_and_month = False
    if 'registerDate' in request.json['args']:
        register_date = pd.to_datetime(request.json['args']['registerDate'])
        year = register_date.strftime('%Y')
        month = register_date.strftime('%m')
        year_and_month = year + '/' + month

    if 'documentId' not in request.json['args']:
        request.json['args']['documentId'] = None

    file_content = verifier.get_file_content(request.json['args']['type'], request.json['args']['filename'],
                                             'image/jpeg', year_and_month=year_and_month,
                                             document_id=request.json['args']['documentId'])
    return make_response({'file': str(base64.b64encode(file_content.get_data()).decode('utf-8'))}), 200


@bp.route('verifier/getThumbByDocumentId', methods=['POST'])
@auth.token_required
def get_thumb_by_document_id():
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/verifier/getThumb'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'documentId', 'type': int, 'mandatory': True},
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    file_content = verifier.get_thumb_by_document_id(request.json['documentId'])
    return make_response({'file': str(base64.b64encode(file_content.get_data()).decode('utf-8'))}), 200


@bp.route('verifier/getOriginalFile/<int:document_id>', methods=['POST'])
@auth.token_required
def get_original_doc_by_document_id(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/getOriginalFile/{document_id}'}), 403

    file_content, mime = verifier.get_original_doc_by_document_id(document_id)
    if file_content is None:
        return make_response({'errors': gettext('DOWNLOAD_FILE'), 'message': gettext('FILE_NOT_FOUND')}, 404)
    return make_response({'file': str(base64.b64encode(file_content).decode('utf-8')), 'mime': mime}), 200


@bp.route('verifier/getTokenINSEE', methods=['GET'])
@auth.token_required
def get_token_insee():
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/verifier/getTokenINSEE'}), 403

    token = verifier.get_token_insee()
    return make_response({'token': token[0]}, token[1])


@bp.route('verifier/verifySIREN', methods=['POST'])
@auth.token_required
def verify_siren():
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/verifier/verifySIREN'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'siren', 'type': str, 'mandatory': True},
        {'id': 'token', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    status = verifier.verify_siren(request.json['token'], request.json['siren'])
    return make_response({'status': status[0]}, status[1])


@bp.route('verifier/verifySIRET', methods=['POST'])
@auth.token_required
def verify_siret():
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/verifier/verifySIRET'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'siret', 'type': str, 'mandatory': True},
        {'id': 'token', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    status = verifier.verify_siret(request.json['token'], request.json['siret'])
    return make_response({'status': status[0]}, status[1])


@bp.route('verifier/verifyVATNumber', methods=['POST'])
@auth.token_required
def verify_vat_number():
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/verifier/verifyVATNumber'}), 403

    check, message = rest_validator(request.json['args'], [
        {'id': 'vat_number', 'type': str, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    status = verifier.verify_vat_number(request.json['vat_number'])
    return make_response({'status': status[0]}, status[1])


@bp.route('verifier/getUnseen/user/<int:user_id>', methods=['GET'])
@auth.token_required
def verifier_get_unseen(user_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/verifier/getUnseen/user/{user_id}'}), 403

    res = verifier.get_unseen(user_id)
    return make_response({'unseen': res[0]}, res[1])


@bp.route('verifier/documents/totals', defaults={'status': None, 'user_id': None, 'form_id': ''}, methods=['GET'])
@bp.route('verifier/documents/totals/<string:status>/<int:user_id>', defaults={'form_id': ''}, methods=['GET'])
@bp.route('verifier/documents/totals/<string:status>/<int:user_id>/<string:form_id>', methods=['GET'])
@auth.token_required
def get_totals(status, user_id, form_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/verifier/documents/totals/{status}/{user_id}/{form_id}'}), 403

    totals = verifier.get_totals(status, user_id, form_id)
    return make_response({'totals': totals[0]}, totals[1])


@bp.route('verifier/status', methods=['PUT'])
@auth.token_required
def update_status():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_status']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/verifier/status'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'ids', 'type': list, 'mandatory': True},
        {'id': 'status', 'type': str, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = verifier.update_status({'ids': request.json['ids'], 'status': request.json['status']})
    return make_response(jsonify(res[0])), res[1]


@bp.route('verifier/customersCount/<int:user_id>/<string:status>/<string:time>', methods=['GET'])
@auth.token_required
def get_customers_count(user_id, status, time):
    if not privileges.has_privileges(request.environ['user_id'], ['settings | access_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/verifier/customerCount'}), 403

    res = verifier.get_customers_count(user_id, status, time)
    return make_response(jsonify(res[0])), res[1]
