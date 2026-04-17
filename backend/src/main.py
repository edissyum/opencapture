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
import sys
import json
from .classes.Log import Log
from .classes.SMTP import SMTP
from .classes.Files import Files
from .classes.Config import Config
from .classes.Database import Database
from flask import g as current_context
from .classes.NFZ42020 import NFZ42020
from .classes.PyTesseract import PyTesseract
from .classes.Spreadsheet import Spreadsheet
from .classes.ArtificialIntelligence import ArtificialIntelligence
from .functions import get_custom_array, retrieve_config_from_custom_id, retrieve_custom_path


def create_classes_from_custom_id(custom_id, load_smtp=False):
    config_file = retrieve_config_from_custom_id(custom_id)
    if config_file is False:
        return False, 'missing_custom_or_file_doesnt_exists'

    config = Config(config_file)

    try:
        if 'config' not in current_context:
            current_context.config = config.cfg
    except RuntimeError:
        pass

    log = Log(config.cfg['GLOBAL']['logfile'], False, config.cfg['GLOBAL']['debugmode'])
    db_name = os.environ['POSTGRES_DB']

    database = Database(log, db_name)
    if not database.conn:
        return False, 'bad_or_missing_database_informations'

    smtp = None

    if load_smtp:
        mail_global = database.select({
            'select': ['*'],
            'table': ['configurations'],
            'where': ['label = %s'],
            'data': ['smtp']
        })

        if mail_global:
            mail_global = mail_global[0]['data']['value']
            smtp = SMTP(
                mail_global['smtpNotifOnError'],
                mail_global['smtpHost'],
                mail_global['smtpPort'],
                mail_global['smtpLogin'],
                mail_global['smtpPwd'],
                mail_global['smtpProtocoleSecure'],
                mail_global['smtpDestAdminMail'],
                mail_global['smtpDelay'],
                mail_global['smtpAuth'],
                mail_global['smtpFromMail']
            )
            log.smtp = smtp

    regex = {}
    languages = {}
    docservers = {}
    configurations = {}

    _ds = database.select({
        'select': ['*'],
        'table': ['docservers']
    })
    for _d in _ds:
        docservers[_d['docserver_id']] = _d['path']

    _config = database.select({
        'select': ['*'],
        'table': ['configurations']
    })

    for _c in _config:
        configurations[_c['label']] = _c['data']['value']

    _regex = database.select({
        'select': ['regex_id', 'content'],
        'table': ['regex'],
        'where': ["lang in ('global', %s)"],
        'data': [configurations['locale']]
    })

    for _r in _regex:
        regex[_r['regex_id']] = _r['content']

    _lang = database.select({
        'select': ['*'],
        'table': ['languages']
    })
    for _l in _lang:
        languages[_l['language_id']] = {}
        languages[_l['language_id']].update({
            'label': _l['label'],
            'lang_code': _l['lang_code'],
            'moment_lang_code': _l['moment_lang_code'],
            'date_format': _l['date_format']
        })

    spreadsheet = Spreadsheet(log, docservers, config)
    filename = docservers['TMP_PATH']
    files = Files(filename, log, docservers, configurations, regex, languages, database)
    ocr = PyTesseract(configurations['locale'], log, config)
    artificial_intelligence = ArtificialIntelligence('', '', files, ocr, docservers, log)

    nfz42020_path = os.path.join(retrieve_custom_path(custom_id), 'journal')
    nfz42020 = NFZ42020(log, nfz42020_path, False)
    nfz42020_config = nfz42020_path + '/config/config.json'
    if os.path.isfile(nfz42020_config):
        nfz42020_config = json.load(open(nfz42020_config))
        if not nfz42020_config:
            log.error('NF Z42-020 journal config file is empty or invalid, journal won\'t be initialized')
        else:
            nfz42020 = NFZ42020(log, nfz42020_path, nfz42020_config['enabled'])
            if nfz42020_config and 'enabled' in nfz42020_config and nfz42020_config['enabled']:
                provider = nfz42020_config['provider'] if 'provider' in nfz42020_config else False
                if not provider:
                    nfz42020.enabled = False
                    log.error('NF Z42-020 journal provider is unknown in config, journal won\'t be initialized')

                provider_config = nfz42020_config[provider] if provider in nfz42020_config else {}
                if not provider_config:
                    nfz42020.enabled = False
                    log.error(f"NF Z42-020 journal provider {provider} config is missing or empty, journal won't be initialized")

                if 'url' not in provider_config or not provider_config['url']:
                    nfz42020.enabled = False
                    log.error(f"NF Z42-020 journal provider {provider} URL is missing or empty, journal won't be initialized")

                if nfz42020.enabled:
                    nfz42020.init(provider, provider_config['url'], provider_config)

    try:
        if 'ocr' not in current_context:
            current_context.ocr = ocr
        if 'log' not in current_context:
            current_context.log = log
        if 'smtp' not in current_context:
            current_context.smtp = smtp
        if 'regex' not in current_context:
            current_context.regex = regex
        if 'files' not in current_context:
            current_context.files = files
        if 'nfz42020' not in current_context:
            current_context.nfz42020 = nfz42020
        if 'database' not in current_context:
            current_context.database = database
        if 'languages' not in current_context:
            current_context.languages = languages
        if 'docservers' not in current_context:
            current_context.docservers = docservers
        if 'spreadsheet' not in current_context:
            current_context.spreadsheet = spreadsheet
        if 'configurations' not in current_context:
            current_context.configurations = configurations
        if 'artificial_intelligence' not in current_context:
            current_context.artificial_intelligence = artificial_intelligence
    except RuntimeError:
        pass

    return database, config.cfg, regex, files, ocr, log, config_file, spreadsheet, smtp, docservers, configurations, \
        languages, artificial_intelligence, nfz42020


def check_file(files, path, log, custom_id):
    if not os.path.isfile(path):
        log.error('The file doesn\'t exists : ' + str(path))
        return False

    file_integrity, error_message = files.check_file_integrity(path, custom_id)
    if not file_integrity:
        log.error('The integrity of file could\'nt be verified : ' + str(path))
        log.error('Error informations : ' + str(error_message))
        return False
    return True


def timer(start_time, end_time):
    hours, rem = divmod(end_time - start_time, 3600)
    minutes, seconds = divmod(rem, 60)
    return f"{int(hours):02d}:{int(minutes):02d}:{seconds:05.2f}"


def str2bool(value):
    """
    Function to convert string to boolean

    :return: Boolean
    """
    return value.lower() in "true"


def launch(args):
    from . import app
    with app.app_context():
        config = retrieve_config_from_custom_id(args['custom_id'])
        if not config:
            sys.exit('Custom config file couldn\'t be found')

        path = config.replace('/config/config.ini', '')
        custom_array = get_custom_array([args['custom_id'], path])
        if 'process_queue_verifier' not in custom_array or not custom_array['process_queue_verifier'] and not \
                custom_array['process_queue_verifier']['path']:
            from . import process_queue_verifier
        else:
            custom_array['process_queue_verifier']['path'] = 'custom.' + \
                                                             custom_array['process_queue_verifier']['path'].split(
                                                                 'custom.')[1]
            process_queue_verifier = getattr(__import__(custom_array['process_queue_verifier']['path'],
                                                        fromlist=[custom_array['process_queue_verifier']['module']]),
                                             custom_array['process_queue_verifier']['module'])
        process_queue_verifier.launch(args)
