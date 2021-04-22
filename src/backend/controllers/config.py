import git
import json
import subprocess
import configparser
from .db import get_db
from os import listdir, path
from flask_babel import gettext
from flask import current_app, Blueprint, render_template
from import_classes import _Config, _Log, _Locale, _Database

bp = Blueprint('dashboard', __name__)


def init():
    config_name = _Config(current_app.config['CONFIG_FILE'])
    config = _Config(current_app.config['CONFIG_FOLDER'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini')
    log = _Log(config.cfg['GLOBAL']['logfile'])
    db = _Database(log, conn=get_db().conn)
    locale = _Locale(config)
    config_file = current_app.config['CONFIG_FOLDER'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini'

    return db, config, locale, config_name, config_file


@bp.route('/dashboard')
def index():
    _vars = init()
    _db = _vars[0]
    _cfg = _vars[1].cfg
    _cfg_name = _vars[3].cfg['PROFILE']['id']
    regex = _vars[2].get()
    available_cfg = list_available_profile()

    tmp_list = _cfg['GED']['availableprocess'].split(',')
    list_ged_process = []

    # Remove space into process name
    for process in tmp_list:
        process = process.replace(' ', '')
        list_ged_process.append(process)

    git_current_version = get_current_git_version(_cfg)
    git_last_version = get_last_git_version()

    return render_template('templates/dashboard/index.html',
                           configDashboard=_cfg,
                           configName=_cfg_name,
                           configList=available_cfg,
                           regex=regex,
                           processes=list_ged_process,
                           git_current=git_current_version,
                           git_last=git_last_version)


def list_available_profile():
    names = []
    for file in listdir(current_app.config['CONFIG_FOLDER']):
        if not file.endswith('.default') and file.startswith('config_'):
            file_name = path.splitext(file)[0]
            cfg_name = file_name.split('_')[1]
            names.append(cfg_name)

    return names


def modify_profile(profile):
    parser = configparser.ConfigParser()
    parser.read(current_app.config['CONFIG_FILE'])
    parser.set('PROFILE', 'id', profile)

    try:
        with open(current_app.config['CONFIG_FILE'], 'w') as configfile:
            parser.write(configfile)
        return True
    except configparser.Error:
        return False


def modify_config(data):
    _vars = init()
    config_file = _vars[4]
    localepath = _vars[2].date_path
    locale = _vars[2].locale
    json_tmp = {}

    parser = configparser.ConfigParser()
    parser.read(config_file)

    separator_qrenabled = data.get('SEPARATORQR_enabled')
    separator_qrexport_pdfa = data.get('SEPARATORQR_exportpdfa')
    allow_duplicate = data.get('GLOBAL_allowduplicate')
    allow_automatic_validation = data.get('GLOBAL_allowautomaticvalidation')
    convert_pdf_to_tiff = data.get('GLOBAL_convertpdftotiff')
    allow_bypass_supplier = data.get('GLOBAL_allowbypasssuppliebanverif')
    ged_enabled = data.get('GED_enabled')
    ai_enabled = data.get('AI-CLASSIFICATION_enabled')
    remove_blank_page_enabled = data.get('REMOVEBLANKPAGES_enabled')

    if separator_qrenabled is not None:
        parser.set('SEPARATORQR', 'enabled', 'True')
    else:
        parser.set('SEPARATORQR', 'enabled', 'False')

    if separator_qrexport_pdfa is not None:
        parser.set('SEPARATORQR', 'exportpdfa', 'True')
    else:
        parser.set('SEPARATORQR', 'exportpdfa', 'False')

    if allow_duplicate is not None:
        parser.set('GLOBAL', 'allowduplicate', 'True')
    else:
        parser.set('GLOBAL', 'allowduplicate', 'False')

    if allow_automatic_validation is not None:
        parser.set('GLOBAL', 'allowautomaticvalidation', 'True')
    else:
        parser.set('GLOBAL', 'allowautomaticvalidation', 'False')

    if convert_pdf_to_tiff is not None:
        parser.set('GLOBAL', 'convertpdftotiff', 'True')
    else:
        parser.set('GLOBAL', 'convertpdftotiff', 'False')

    if ged_enabled is not None:
        parser.set('GED', 'enabled', 'True')
    else:
        parser.set('GED', 'enabled', 'False')

    if ai_enabled is not None:
        parser.set('AI-CLASSIFICATION', 'enabled', 'True')
    else:
        parser.set('AI-CLASSIFICATION', 'enabled', 'False')

    if allow_bypass_supplier is not None:
        parser.set('GLOBAL', 'allowbypasssuppliebanverif', 'True')
    else:
        parser.set('GLOBAL', 'allowbypasssuppliebanverif', 'False')
        
    if remove_blank_page_enabled is not None:
        parser.set('REMOVE-BLANK-PAGES', 'enabled', 'True')
    else:
        parser.set('REMOVE-BLANK-PAGES', 'enabled', 'False')

    for info in data:
        splitted_info = info.split('_')
        section = splitted_info[0]
        field = splitted_info[1]

        # Don't process REGEX param here, because it's another file except for urlpattern
        if 'REGEX' not in section or 'REGEX' in section and 'urlpattern' in field:
            if field not in ['exportpdfa', 'enabled', 'allowduplicate', 'allowautomaticvalidation', 'convertpdftotiff', 'allowbypasssuppliebanverif']:
                parser.set(section, field, data[info])
        else:
            with open(localepath + locale + '.json', 'r') as file:
                json_data = json.load(file)
                json_tmp['dateConvert'] = json_data['dateConvert']
                for item in json_data:
                    if item == field:
                        json_tmp[item] = data[info]

    try:
        with open(localepath + locale + '.json', 'w') as file:
            json.dump(json_tmp, file, indent=4, ensure_ascii=False)

        with open(config_file, 'w') as cfgfile:
            parser.write(cfgfile)
        return True
    except configparser.Error:
        return False


def change_locale_in_config(lang):
    _vars = init()
    config_file = _vars[4]
    languages = current_app.config['LANGUAGES']
    parser = configparser.ConfigParser()

    language = {'label': 'Francais', 'lang_code' : 'fra'}
    for l in languages:
        if lang == languages[l]['lang_code']:
            language = languages[l]

    parser.read(config_file)
    parser.set('LOCALE', 'locale', language['lang_code'])
    parser.set('LOCALE', 'localeocr', language['lang_code'])
    try:
        with open(config_file, 'w') as configfile:
            parser.write(configfile)
        return {}, 200
    except configparser.Error as e:
        return {'errors': gettext("CHANGE_LOCALE_ERROR"), 'message': str(e)}, 500


def get_current_git_version(cfg):
    repo = git.Repo(cfg['GLOBAL']['projectpath'])
    current_tag = next((tag for tag in repo.tags if tag.commit == repo.head.commit), None)
    return current_tag


def get_last_git_version():
    latest_git_version = subprocess.Popen("git ls-remote --tags --sort='v:refname' https://github.com/edissyum/opencaptureforinvoices.git | tail -n1 |  sed 's/.*\///; s/\^{}//'", shell=True,
                                          stdout=subprocess.PIPE).stdout.read()
    return latest_git_version.decode('utf-8').strip()
