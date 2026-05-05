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

# @dev : Oussama Brich <oussama.brich@edissyum.com>

import json
from flask_babel import gettext
from ..controllers import auth, splitter, forms, privileges
from flask import Blueprint, make_response, jsonify, request
from ..functions import rest_validator, check_extensions_mime, retrieve_custom_from_url

bp = Blueprint('splitter', __name__, url_prefix='/ws/')


@bp.route('splitter/upload', methods=['POST'])
@auth.token_required
def upload():
    if not privileges.has_privileges(request.environ['user_id'], ['upload']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/upload'}), 403

    workflow_id = None
    if 'workflowId' in request.form:
        workflow_id = request.form['workflowId']

    user_id = None
    if 'userId' in request.form:
        user_id = request.form['userId']

    files = request.files

    custom_id = retrieve_custom_from_url(request)
    message, code = check_extensions_mime(files, custom_id)
    if code != 200:
        return make_response(message, code)

    res = splitter.handle_uploaded_file(files, workflow_id, user_id)
    if res:
        return make_response('', 200)
    else:
        return make_response(gettext('UNKNOW_ERROR'), 400)


@bp.route('splitter/batches/list', methods=['POST'])
@auth.token_required
def retrieve_splitter_batches():
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/batches/list'}), 403

    res = splitter.retrieve_batches(request.json)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/batches/filters/totals', methods=['POST'])
@auth.token_required
def get_totals_splitter():
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/splitter/batches/filters/totals'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'time', 'type': str, 'mandatory': False},
        {'id': 'status', 'type': str, 'mandatory': False},
        {'id': 'search', 'type': str, 'mandatory': False},
        {'id': 'user_id', 'type': int, 'mandatory': True},
        {'id': 'form_id', 'type': int, 'mandatory': False},
        {'id': 'allowedCustomers', 'type': list, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    totals = splitter.get_totals(request.json['status'], request.json['user_id'], request.json['form_id'],
                                 request.json['allowedCustomers'], request.json['time'], request.json['search'])
    return make_response({'totals': totals[0]}, totals[1])


@bp.route('splitter/moveDocumentsToAttachments/<int:batch_id>', methods=['POST'])
@auth.token_required
def move_documents_to_attachment(batch_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify(
            {'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/splitter/moveDocumentsToAttachments/{batch_id}'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'documents', 'type': list, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    response, status = splitter.move_documents_to_attachment(request.json['documents'], batch_id)
    return make_response(jsonify(response)), status


@bp.route('splitter/batch/<int:batch_id>/file', methods=['GET'])
@auth.token_required
def download_original_file(batch_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/splitter/batch/{batch_id}/file'}), 403

    response, status = splitter.download_original_file(batch_id)
    return make_response(jsonify(response)), status


@bp.route('splitter/loadReferential/<int:form_id>', methods=['GET'])
@auth.token_required
def retrieve_referential(form_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/splitter/loadReferential/{form_id}'}), 403

    res = splitter.retrieve_referential(form_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/status', methods=['PUT'])
@auth.token_required
def update_status():
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter | update_status_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/status'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'ids', 'type': list, 'mandatory': True},
        {'id': 'status', 'type': str, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = splitter.update_status({'ids': request.json['ids'], 'status': request.json['status']})
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/<int:batch_id>/updateCustomer', methods=['PUT'])
@auth.token_required
def update_custom(batch_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/customer'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'customer_id', 'type': int, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = splitter.update_customer({'batch_id': batch_id, 'customer_id': request.json['customer_id']})
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/deleteBatches', methods=['PUT'])
@auth.token_required
def delete_batches():
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter | update_status_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/status'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'ids', 'type': list, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = splitter.delete_batches(request.json)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/documents/<int:batch_id>', methods=['GET'])
@auth.token_required
def retrieve_batch_documents(batch_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/splitter/documents/{batch_id}'}), 403

    res = splitter.retrieve_documents(batch_id)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/addDocument', methods=['POST'])
@auth.token_required
def create_document():
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/addDocument'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'userId', 'type': int, 'mandatory': True},
        {'id': 'batchId', 'type': int, 'mandatory': True},
        {'id': 'workflowId', 'type': int, 'mandatory': True},
        {'id': 'splitIndex', 'type': int, 'mandatory': True},
        {'id': 'displayOrder', 'type': int, 'mandatory': True},
        {'id': 'updatedDocuments', 'type': list, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    res = splitter.create_document(request.json)
    return make_response(jsonify(res[0])), res[1]


@bp.route('splitter/changeForm', methods=['POST'])
@auth.token_required
def change_form():
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/changeForm'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'formId', 'type': int, 'mandatory': True},
        {'id': 'batchId', 'type': int, 'mandatory': True}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    response, status = splitter.change_form(request.json)
    return make_response(jsonify(response)), status


@bp.route('splitter/lockBatch', methods=['POST'])
@auth.token_required
def lock_batch():
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/lockBatch'}), 403

    data = json.loads(request.data)
    response, status = splitter.lock_batch({'batch_id': data['batchId'], 'user_id': data['lockedBy']})
    return make_response(jsonify(response)), status


@bp.route('splitter/removeLockByUserId/<string:user_id>', methods=['PUT'])
@auth.token_required
def remove_lock_by_user_id(user_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/splitter/removeLockByUserId/{user_id}'}), 403

    res = splitter.remove_lock_by_user_id(user_id)
    return make_response(res[0], res[1])


@bp.route('splitter/removeLockByBatchId', methods=['PUT'])
@auth.token_required
def remove_lock_by_batch_id():
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': '/splitter/removeLockByBatchId'}), 403
    data = json.loads(request.data)
    res = splitter.remove_lock_by_batch_id(data['batch_id'])
    return make_response(res[0], res[1])


@bp.route('splitter/pages/<int:page_id>/fullThumbnail', methods=['GET'])
@auth.token_required
def get_page_full_thumbnail(page_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/splitter/pages/{page_id}/fullThumbnail'}), 403

    response, status = splitter.get_page_full_thumbnail(page_id)
    return make_response(jsonify(response)), status


@bp.route('splitter/batches/<int:batch_id>/getThumb', methods=['GET'])
@auth.token_required
def get_batch_thumbnail(batch_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/splitter/batches/{batch_id}/getThumb'}), 403

    response, status = splitter.get_batch_thumbnail(batch_id)
    return make_response(jsonify(response)), status


@bp.route('splitter/saveModifications', methods=['POST'])
@auth.token_required
def save_modifications():
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/saveModifications'}), 403

    check, message = rest_validator(request.json, [
        {'id': 'batchId', 'type': int, 'mandatory': True},
        {'id': 'documents', 'type': list, 'mandatory': True},
        {'id': 'batchMetadata', 'type': dict, 'mandatory': False},
        {'id': 'deletedPagesIds', 'type': list, 'mandatory': False},
        {'id': 'deletedDocumentsIds', 'type': list, 'mandatory': False}
    ])

    if not check:
        return make_response({
            "errors": gettext('BAD_REQUEST'),
            "message": message
        }, 400)

    response, status = splitter.save_modifications(request.json)
    return make_response(jsonify(response)), status


@bp.route('splitter/export', methods=['POST'])
@auth.token_required
def export():
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/export'}), 403

    response, status = splitter.export_batch(request.json)
    return make_response(jsonify(response)), status


@bp.route('splitter/splitMethods', methods=['GET'])
@auth.token_required
def get_split_methods():
    if not privileges.has_privileges(request.environ['user_id'],
                                     ['settings', 'add_workflow_splitter | update_workflow_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/lockBatch'}), 403

    split_methods, status = splitter.get_split_methods()
    response = {
        'splitMethods': split_methods
    }
    return make_response(jsonify(response)), status


@bp.route('splitter/metadataMethods', methods=['GET'])
@bp.route('splitter/metadataMethods/<int:form_id>', methods=['GET'])
@auth.token_required
def get_metadata_methods(form_id=False):
    if not form_id:
        if not privileges.has_privileges(request.environ['user_id'], ['settings', 'add_form_splitter']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/metadataMethods'}), 403
    else:
        if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/splitter/metadataMethods/{form_id}'}), 403

    if form_id:
        form_infos = forms.get_form_by_id(form_id)
        split_methods, status = splitter.get_metadata_methods(form_infos[0]['settings']['metadata_method'])
    else:
        split_methods, status = splitter.get_metadata_methods()
    response = {
        'metadataMethods': split_methods
    }

    return make_response(jsonify(response)), status


@bp.route('splitter/merge/<int:parent_id>', methods=['POST'])
@auth.token_required
def merge_batches(parent_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/splitter/merge/{parent_id}'}), 403

    data = json.loads(request.data)['batches']
    splitter.merge_batches(parent_id, data)
    return make_response(jsonify('')), 200


@bp.route('splitter/batches/user/<int:user_id>/totals', defaults={'status': None}, methods=['GET'])
@bp.route('splitter/batches/user/<int:user_id>/totals/<string:status>', methods=['GET'])
@auth.token_required
def get_totals(status, user_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/splitter/batches/user/{user_id}/totals/{status}'}), 403

    totals = splitter.get_totals(status, user_id)
    return make_response({'totals': totals[0]}, totals[1])


@bp.route('splitter/cmis/testConnection', methods=['POST'])
@auth.token_required
def test_cmis_connection():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_output_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/cmis/testConnection'}), 403

    response, status = splitter.test_cmis_connection(request.json)
    return make_response(jsonify(response)), status


@bp.route('splitter/getUnseen/user/<int:user_id>', methods=['GET'])
@auth.token_required
def splitter_get_unseen(user_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/splitter/getUnseen/user/{user_id}'}), 403

    res = splitter.get_unseen(user_id)
    return make_response({'unseen': res[0]}, res[1])


@bp.route('splitter/openads/testConnection', methods=['POST'])
@auth.token_required
def test_openads_connection():
    if not privileges.has_privileges(request.environ['user_id'], ['settings', 'update_output_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/splitter/openads/testConnection'}), 403

    response, status = splitter.test_openads_connection(request.json)
    return make_response({'status': response}), status


@bp.route('splitter/batch/<int:batch_id>/outputs', methods=['GET'])
@auth.token_required
def get_batch_outputs(batch_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_splitter']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': f'/splitter/batch/{batch_id}/outputs'}), 403

    outputs, status = splitter.get_batch_outputs(batch_id)
    return make_response(jsonify(outputs)), status
