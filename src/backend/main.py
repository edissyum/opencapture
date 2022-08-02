# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import sys
from .functions import get_custom_array, retrieve_config_from_custom_id
from .import_classes import _Database, _PyTesseract, _Files, _Log, _Config, _Spreadsheet, _SMTP


def create_classes_from_custom_id(custom_id):
    config_file = retrieve_config_from_custom_id(custom_id)
    if config_file is False:
        return False
    config = _Config(config_file)
    config_mail = _Config(config.cfg['GLOBAL']['configmail'])
    smtp = _SMTP(
        config_mail.cfg['GLOBAL']['smtp_notif_on_error'],
        config_mail.cfg['GLOBAL']['smtp_host'],
        config_mail.cfg['GLOBAL']['smtp_port'],
        config_mail.cfg['GLOBAL']['smtp_login'],
        config_mail.cfg['GLOBAL']['smtp_pwd'],
        config_mail.cfg['GLOBAL']['smtp_ssl'],
        config_mail.cfg['GLOBAL']['smtp_starttls'],
        config_mail.cfg['GLOBAL']['smtp_dest_admin_mail'],
        config_mail.cfg['GLOBAL']['smtp_delay'],
        config_mail.cfg['GLOBAL']['smtp_auth'],
        config_mail.cfg['GLOBAL']['smtp_from_mail'],
    )
    log = _Log(config.cfg['GLOBAL']['logfile'], smtp)
    db_user = config.cfg['DATABASE']['postgresuser']
    db_pwd = config.cfg['DATABASE']['postgrespassword']
    db_name = config.cfg['DATABASE']['postgresdatabase']
    db_host = config.cfg['DATABASE']['postgreshost']
    db_port = config.cfg['DATABASE']['postgresport']
    database = _Database(log, db_name, db_user, db_pwd, db_host, db_port)

    regex = {}
    docservers = {}
    configurations = {}

    _ds = database.select({
        'select': ['*'],
        'table': ['docservers'],
    })
    for _d in _ds:
        docservers[_d['docserver_id']] = _d['path']

    _config = database.select({
        'select': ['*'],
        'table': ['configurations'],
    })

    for _c in _config:
        configurations[_c['label']] = _c['data']['value']

    _regex = database.select({
        'select': ['regex_id', 'content'],
        'table': ['regex'],
        'where': ["lang in ('global', %s)"],
        'data': [configurations['locale']],
    })

    for _r in _regex:
        regex[_r['regex_id']] = _r['content']

    _lang = database.select({
        'select': ['*'],
        'table': ['languages'],
    })
    languages = {}
    for _l in _lang:
        languages[_l['language_id']] = {}
        languages[_l['language_id']].update({
            'label': _l['label'],
            'lang_code': _l['lang_code'],
            'moment_lang_code': _l['moment_lang_code'],
            'date_format': _l['date_format']
        })

    spreadsheet = _Spreadsheet(log, docservers, config)
    filename = docservers['TMP_PATH']
    files = _Files(filename, log, docservers, configurations, regex, languages)
    ocr = _PyTesseract(configurations['locale'], log, config, docservers)

    return database, config, regex, files, ocr, log, config_file, spreadsheet, smtp, docservers, configurations, languages


def check_file(files, path, log, docservers):
    if not files.check_file_integrity(path, docservers):
        log.error('The integrity of file could\'nt be verified : ' + str(path))
        return False
    return True


def timer(start_time, end_time):
    hours, rem = divmod(end_time - start_time, 3600)
    minutes, seconds = divmod(rem, 60)
    return "{:0>2}:{:0>2}:{:05.2f}".format(int(hours), int(minutes), seconds)


def str2bool(value):
    """
    Function to convert string to boolean

    :return: Boolean
    """
    return value.lower() in "true"


def launch(args):
    if not retrieve_config_from_custom_id(args['custom_id']):
        sys.exit('Custom config file couldn\'t be found')

    path = retrieve_config_from_custom_id(args['custom_id']).replace('/config/config.ini', '')
    custom_array = get_custom_array([args['custom_id'], path])
    if 'process_queue' not in custom_array or not custom_array['process_queue'] and not custom_array['process_queue']['path']:
        import src.backend.process_queue as process_queue
    else:
        custom_array['process_queue']['path'] = 'custom' + custom_array['process_queue']['path'].split('custom')[1]
        process_queue = getattr(__import__(custom_array['process_queue']['path'],
                                           fromlist=[custom_array['process_queue']['module']]),
                                custom_array['process_queue']['module'])
    process_queue.launch(args)
