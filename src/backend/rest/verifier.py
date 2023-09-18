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

import json
import base64
import re

import pandas as pd
from flask_babel import gettext
from flask import Blueprint, make_response, request, jsonify
from src.backend.import_controllers import auth, config, verifier, privileges

bp = Blueprint('verifier', __name__, url_prefix='/ws/')


@bp.route('verifier/checkFileBeforeUpload', methods=['POST'])
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

    if 'workflowId' in request.form:
        workflow_id = request.form['workflowId']
    else:
        return jsonify({'errors': gettext('VERIFIER_UPLOAD_ERROR'),
                        'message': gettext('WORKFLOW_ID_IS_MANDATORY')}), 400

    supplier = {}
    if 'siret' in request.form:
        supplier = {'column': 'siret', 'value': request.form['siret']}
    elif 'siren' in request.form:
        supplier = {'column': 'siren', 'value': request.form['siren']}
    elif 'vat_number' in request.form:
        supplier = {'column': 'vat_number', 'value': request.form['vat_number']}

    files = request.files
    res = verifier.handle_uploaded_file(files, workflow_id, supplier)

    if res and res[0] is not False:
        for file in res[0]:
            if 'returnUniqueUrl' in request.form and request.form['returnUniqueUrl']:
                token = auth.generate_unique_url_token(file['token'], workflow_id, 'verifier')
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


@bp.route('verifier/documents/list', methods=['POST'])
@auth.token_required
def documents_list():
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier | statistics']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/verifier/documents/list'}), 403

    data = request.json
    res = verifier.retrieve_documents(data)
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
    if 'token' in request.json and request.json['token']:
        res = verifier.get_document_id_and_status_by_token(request.json['token'])
        return make_response(res[0], res[1])
    else:
        return jsonify({'errors': gettext('TOKEN_IS_MANDATORY'), 'message': ''}), 400


@bp.route('verifier/documents/<int:document_id>/updatePosition', methods=['PUT'])
@auth.token_required
def update_document_position(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/updatePosition'}), 403

    data = request.json['args']
    res = verifier.update_position_by_document_id(document_id, data)
    return make_response(res[0], res[1])


@bp.route('verifier/documents/<int:document_id>/updatePage', methods=['PUT'])
@auth.token_required
def update_document_page(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/updatePage'}), 403

    data = request.json['args']
    res = verifier.update_page_by_document_id(document_id, data)
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

    data = request.json['args']
    res = verifier.update_document_data_by_document_id(document_id, data)
    return make_response(res[0], res[1])


@bp.route('verifier/documents/<int:document_id>/export_xml', methods=['POST'])
@auth.token_required
def export_xml(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/export_xml'}), 403

    data = request.json['args']
    res = verifier.export_xml(document_id, data)
    return make_response(jsonify(res[0]), res[1])


@bp.route('verifier/documents/<int:document_id>/export_pdf', methods=['POST'])
@auth.token_required
def export_pdf(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/export_pdf'}), 403

    data = request.json['args']
    res = verifier.export_pdf(document_id, data)
    return make_response(jsonify(res[0]), res[1])


@bp.route('verifier/documents/<int:document_id>/export_facturx', methods=['POST'])
@auth.token_required
def export_facturx(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/export_facturx'}), 403

    data = request.json['args']
    res = verifier.export_facturx(document_id, data)
    return make_response(jsonify(res[0]), res[1])


@bp.route('verifier/documents/<int:document_id>/export_mem', methods=['POST'])
@auth.token_required
def export_mem(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/export_mem'}), 403

    data = request.json['args']
    res = verifier.export_mem(document_id, data)
    return make_response(jsonify(res[0]), res[1])


@bp.route('verifier/documents/<int:document_id>/outputScript', methods=['POST'])
@auth.token_required
def launch_output_script(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/outputScript'}), 403

    outputs = request.json['outputs']
    workflow = request.json['workflow']
    verifier.launch_output_script(document_id, workflow, outputs)
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

    args = request.json['args']
    res = '', 200
    if 'multiple' in args:
        fields = args['fields']
        for field in fields:
            res = verifier.delete_document_data_by_document_id(document_id, field)
    else:
        field_id = args
        res = verifier.delete_document_data_by_document_id(document_id, field_id)
    return make_response(res[0], res[1])


@bp.route('verifier/documents/<int:document_id>/deletePosition', methods=['PUT'])
@auth.token_required
def delete_document_position(document_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/verifier/documents/{document_id}/deletePosition'}), 403

    args = request.json['args']
    res = '', 200
    if 'multiple' in args:
        fields = args['fields']
        for field in fields:
            res = verifier.delete_document_position_by_document_id(document_id, field)
    else:
        field_id = args
        res = verifier.delete_document_position_by_document_id(document_id, field_id)
    return make_response(res[0], res[1])


@bp.route('verifier/documents/<int:document_id>/deletePage', methods=['PUT'])
@auth.token_required
def delete_document_page(document_id):
    if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                        'message': f'/verifier/documents/{document_id}/deletePage'}), 403

    args = request.json['args']
    res = '', 200
    if 'multiple' in args:
        fields = args['fields']
        for field in fields:
            res = verifier.delete_document_page_by_document_id(document_id, field)
    else:
        field_id = args
        res = verifier.delete_document_page_by_document_id(document_id, field_id)
    return make_response(res[0], res[1])


@bp.route('verifier/documents/<int:document_id>/update', methods=['PUT'])
@auth.token_required
def update_document(document_id):
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'),
                            'message': f'/verifier/documents/{document_id}/update'}), 403

    data = request.json['args']
    res = verifier.update_document(document_id, data)
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

    data = request.json
    positions_masks = False

    if 'registerDate' in data:
        register_date = pd.to_datetime(data['registerDate'])
        year = register_date.strftime('%Y')
        month = register_date.strftime('%m')
        year_and_month = year + '/' + month
        data['fileName'] = year_and_month + '/' + data['fileName']

    if 'positionsMasks' in data:
        positions_masks = data['positionsMasks']
    result = verifier.ocr_on_the_fly(data['fileName'], data['selection'], data['thumbSize'], positions_masks, data['lang'])
    return make_response({'result': result}, 200)


@bp.route('verifier/getThumb', methods=['POST'])
@auth.token_required
def get_thumb():
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier | update_position_mask']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/verifier/getThumb'}), 403

    data = request.json['args']
    year_and_month = False
    if 'registerDate' in data:
        register_date = pd.to_datetime(data['registerDate'])
        year = register_date.strftime('%Y')
        month = register_date.strftime('%m')
        year_and_month = year + '/' + month
    file_content = verifier.get_file_content(data['type'], data['filename'], 'image/jpeg',
                                             year_and_month=year_and_month, document_id=data['documentId'])
    return make_response({'file': str(base64.b64encode(file_content.get_data()).decode('UTF-8'))}), 200


@bp.route('verifier/getThumbByDocumentId', methods=['POST'])
@auth.token_required
def get_thumb_by_document_id():
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/verifier/getThumb'}), 403

    document_id = request.json['documentId']
    file_content = verifier.get_thumb_by_document_id(document_id)
    return make_response({'file': str(base64.b64encode(file_content.get_data()).decode('UTF-8'))}), 200


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

    token = request.json['token']
    siren = request.json['siren']
    status = verifier.verify_siren(token, siren)
    return make_response({'status': status[0]}, status[1])


@bp.route('verifier/verifySIRET', methods=['POST'])
@auth.token_required
def verify_siret():
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/verifier/verifySIRET'}), 403

    token = request.json['token']
    siret = request.json['siret']
    status = verifier.verify_siret(token, siret)
    return make_response({'status': status[0]}, status[1])


@bp.route('verifier/verifyVATNumber', methods=['POST'])
@auth.token_required
def verify_vat_number():
    if 'skip' not in request.environ or not request.environ['skip']:
        if not privileges.has_privileges(request.environ['user_id'], ['access_verifier']):
            return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/verifier/verifyVATNumber'}), 403

    vat_number = request.json['vat_number']
    status = verifier.verify_vat_number(vat_number)
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

    data = json.loads(request.data)
    args = {
        'ids': data['ids'],
        'status': data['status']
    }
    res = verifier.update_status(args)
    return make_response(jsonify(res[0])), res[1]


@bp.route('verifier/customersCount/<int:user_id>/<string:status>/<string:time>', methods=['GET'])
@auth.token_required
def get_customers_count(user_id, status, time):
    if not privileges.has_privileges(request.environ['user_id'], ['settings | access_verifier']):
        return jsonify({'errors': gettext('UNAUTHORIZED_ROUTE'), 'message': '/verifier/customerCount'}), 403

    res = verifier.get_customers_count(user_id, status, time)
    return make_response(jsonify(res[0])), res[1]
