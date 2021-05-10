from flask import Blueprint, request, jsonify, make_response
from ..controllers.auth import token_required
from ..import_controllers import pdf, config

bp = Blueprint('config', __name__,  url_prefix='/ws/')


@bp.route('config/readConfig', methods=['GET'])
@token_required
def read_config():
    if request.method == 'GET':
        _vars = pdf.init()
        return make_response(jsonify({'config': _vars[1].cfg})), 200


@bp.route('config/gitInfo', methods=['GET'])
@token_required
def get_git_info():
    _vars = pdf.init()
    return make_response({
        'git_current': config.get_current_git_version(_vars[1].cfg),
        'git_latest': config.get_last_git_version()
    }), 200
