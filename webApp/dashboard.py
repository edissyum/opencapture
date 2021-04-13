import subprocess

import git
import json
import configparser
from os import listdir, path

from webApp.db import get_db
from webApp.auth import admin_login_required
from flask import current_app, Blueprint, render_template

from webApp.functions import get_custom_id, check_python_customized_files

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'Config' not in custom_array:
    from bin.src.classes.Config import Config as _Config
else:
    _Config = getattr(__import__(custom_array['Config']['path'] + '.' + custom_array['Config']['module'], fromlist=[custom_array['Config']['module']]), custom_array['Config']['module'])

if 'Log' not in custom_array:
    from bin.src.classes.Log import Log as _Log
else:
    _Log = getattr(__import__(custom_array['Log']['path'] + '.' + custom_array['Log']['module'], fromlist=[custom_array['Log']['module']]), custom_array['Log']['module'])

if 'Locale' not in custom_array:
    from bin.src.classes.Locale import Locale as _Locale
else:
    _Locale = getattr(__import__(custom_array['Locale']['path'] + '.' + custom_array['Locale']['module'], fromlist=[custom_array['Locale']['module']]), custom_array['Locale']['module'])

if 'Database' not in custom_array:
    from bin.src.classes.Database import Database as _Database
else:
    _Database = getattr(__import__(custom_array['Database']['path'] + '.' + custom_array['Database']['module'], fromlist=[custom_array['Database']['module']]), custom_array['Database']['module'])

bp = Blueprint('dashboard', __name__)


def init():
    config_name = _Config(current_app.config['CONFIG_FILE'])
    config = _Config(current_app.config['CONFIG_FOLDER'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini')
    log = _Log(config.cfg['GLOBAL']['logfile'])
    db = _Database(log, None, get_db())
    locale = _Locale(config)
    config_file = current_app.config['CONFIG_FOLDER'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini'

    return db, config, locale, config_name, config_file


@bp.route('/dashboard')
@admin_login_required
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
    separate_by_document_enabled = data.get('SEPARATE-BY-DOCUMENT_enabled')
    separator_qrexport_pdfa = data.get('SEPARATORQR_exportpdfa')
    allow_duplicate = data.get('GLOBAL_allowduplicate')
    allow_automatic_validation = data.get('GLOBAL_allowautomaticvalidation')
    convert_pdf_to_tiff = data.get('GLOBAL_convertpdftotiff')
    allow_bypass_supplier = data.get('GLOBAL_allowbypasssuppliebanverif')
    ged_enabled = data.get('GED_enabled')
    ai_enabled = data.get('AI-CLASSIFICATION_enabled')
    remove_blank_page_enabled = data.get('REMOVE-BLANK-PAGES_enabled')
    enable_auto_save = data.get('GLOBAL_enableautosave')
    enable_visual = data.get('GLOBAL_enablevisualifpositionsfound')

    if separator_qrenabled is not None:
        parser.set('SEPARATORQR', 'enabled', 'True')
    else:
        parser.set('SEPARATORQR', 'enabled', 'False')

    if separate_by_document_enabled is not None:
        parser.set('SEPARATE-BY-DOCUMENT', 'enabled', 'True')
    else:
        parser.set('SEPARATE-BY-DOCUMENT', 'enabled', 'False')

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

    if enable_auto_save is not None:
        parser.set('GLOBAL', 'enableautosave', 'True')
    else:
        parser.set('GLOBAL', 'enableautosave', 'False')

    if enable_visual is not None:
        parser.set('GLOBAL', 'enablevisualifpositionsfound', 'True')
    else:
        parser.set('GLOBAL', 'enablevisualifpositionsfound', 'False')

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

        # Don't process REGEX param here, because it's another file
        if 'REGEX' not in section:
            if field not in ['exportpdfa', 'enabled', 'allowduplicate', 'allowautomaticvalidation', 'convertpdftotiff', 'allowbypasssuppliebanverif', 'enableautosave', 'enablevisualifpositionsfound']:
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
    language = current_app.config['LANGUAGES'][lang]
    parser = configparser.ConfigParser()

    parser.read(config_file)
    parser.set('LOCALE', 'locale', language[1])
    parser.set('LOCALE', 'localeocr', language[2])
    try:
        with open(config_file, 'w') as configfile:
            parser.write(configfile)
        return True
    except configparser.Error:
        return False


def get_current_git_version(cfg):
    repo = git.Repo(cfg['GLOBAL']['projectpath'])
    current_tag = next((tag for tag in repo.tags if tag.commit == repo.head.commit), None)
    return current_tag


def get_last_git_version():
    latest_git_version = subprocess.Popen("git ls-remote --tags --sort='v:refname' https://github.com/edissyum/opencaptureforinvoices.git | tail -n1 |  sed 's/.*\///; s/\^{}//'", shell=True,
                                          stdout=subprocess.PIPE).stdout.read()
    return latest_git_version.decode('utf-8').strip()
