import git
import json
import subprocess
import configparser
from .db import get_db
from os import listdir, path
from flask_babel import gettext
from flask import current_app, Blueprint, render_template
from ..import_classes import _Config, _Log, _Locale, _Database

bp = Blueprint('dashboard', __name__)


def init():
    config_name = _Config(current_app.config['CONFIG_FILE'])
    config = _Config(current_app.config['CONFIG_FOLDER'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini')
    log = _Log(config.cfg['GLOBAL']['logfile'])
    db = _Database(log, conn=get_db().conn)
    locale = _Locale(config)
    config_file = current_app.config['CONFIG_FOLDER'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini'

    return db, config, locale, config_name, config_file


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
