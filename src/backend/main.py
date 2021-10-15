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

import os
import sys
import time
import tempfile
from kuyruk import Kuyruk
from flask import current_app

from .functions import recursive_delete, get_custom_array
from .import_classes import _Database, _PyTesseract, _Locale, _Files, _Log, _Config, _SeparatorQR, _Spreadsheet,\
    _SMTP, _Mail

custom_array = get_custom_array()

if 'OCForInvoices' not in custom_array:
    from src.backend.process import OCForInvoices as OCForInvoices_process
else:
    OCForInvoices_process = getattr(__import__(custom_array['OCForInvoices']['path'],
                                               fromlist=[custom_array['OCForInvoices']['module']]),
                                    custom_array['OCForInvoices']['module'])


def create_classes_from_current_config():
    config_name = _Config(current_app.config['CONFIG_FILE'])
    config_file = current_app.config['CONFIG_FOLDER'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini'
    config = _Config(current_app.config['CONFIG_FOLDER'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini')
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
    spreadsheet = _Spreadsheet(log, config)
    db_user = config.cfg['DATABASE']['postgresuser']
    db_pwd = config.cfg['DATABASE']['postgrespassword']
    db_name = config.cfg['DATABASE']['postgresdatabase']
    db_host = config.cfg['DATABASE']['postgreshost']
    db_port = config.cfg['DATABASE']['postgresport']
    database = _Database(log, db_name, db_user, db_pwd, db_host, db_port)
    file_name = config.cfg['GLOBAL']['tmppath'] + 'tmp'
    locale = _Locale(config)
    files = _Files(
        file_name,
        int(config.cfg['GLOBAL']['resolution']),
        int(config.cfg['GLOBAL']['compressionquality']),
        log,
        locale,
        config
    )
    ocr = _PyTesseract(locale.localeOCR, log, config)
    return database, config, locale, files, ocr, log, config_file, spreadsheet, smtp


def create_classes(config_file):
    config = _Config(config_file)
    locale = _Locale(config)
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
    spreadsheet = _Spreadsheet(log, config)
    ocr = _PyTesseract(locale.localeOCR, log, config)
    db_user = config.cfg['DATABASE']['postgresuser']
    db_pwd = config.cfg['DATABASE']['postgrespassword']
    db_name = config.cfg['DATABASE']['postgresdatabase']
    db_host = config.cfg['DATABASE']['postgreshost']
    db_port = config.cfg['DATABASE']['postgresport']
    database = _Database(log, db_name, db_user, db_pwd, db_host, db_port)
    return config, locale, log, ocr, database, spreadsheet, smtp


def check_file(files, path, config, log):
    if not files.check_file_integrity(path, config):
        log.error('The integrity of file could\'nt be verified : ' + str(path))
        return False


def timer(start_time, end_time):
    hours, rem = divmod(end_time - start_time, 3600)
    minutes, seconds = divmod(rem, 60)
    return "{:0>2}:{:0>2}:{:05.2f}".format(int(hours), int(minutes), seconds)


# def get_typo(config, path, log):
#     invoice_classification.MODEL_PATH = config.cfg['AI-CLASSIFICATION']['modelpath']
#     invoice_classification.PREDICT_IMAGES_PATH = config.cfg['AI-CLASSIFICATION']['trainimagepath']
#     invoice_classification.TRAIN_IMAGES_PATH = config.cfg['AI-CLASSIFICATION']['predictimagepath']
#     typo, confidence = invoice_classification.predict_typo(path)
#
#     if typo:
#         if confidence >= config.cfg['AI-CLASSIFICATION']['confidencemin']:
#             log.info('Typology n°' + typo + ' found using AI with a confidence of ' + confidence + '%')
#             return typo
#         else:
#             log.info('Typology can\'t be found using AI, the confidence is too low :'
#                      ' Typo n°' + typo + ', confidence : ' + confidence + '%')
#             return False
#     else:
#         log.info('Typology can\'t be found using AI')
#         return False


def str2bool(value):
    """
    Function to convert string to boolean

    :return: Boolean
    """
    return value.lower() in "true"


OCforInvoices_worker = Kuyruk()


@OCforInvoices_worker.task(queue='invoices')
def launch(args):
    start = time.time()

    # Init all the necessary classes
    config_name = _Config(args['config'])
    config_file = config_name.cfg['PROFILE']['cfgpath'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini'

    if not os.path.exists(config_file):
        sys.exit('config file couldn\'t be found')

    config, locale, log, ocr, database, spreadsheet, smtp = create_classes(config_file)
    tmp_folder = tempfile.mkdtemp(dir=config.cfg['GLOBAL']['tmppath'])
    filename = tempfile.NamedTemporaryFile(dir=tmp_folder).name
    separator_qr = _SeparatorQR(log, config, tmp_folder, 'verifier')
    mail_class = None
    if args.get('isMail') is not None and args['isMail'] is True:
        config_mail = _Config(args['config_mail'])
        mail_class = _Mail(
            config_mail.cfg[args['process']]['host'],
            config_mail.cfg[args['process']]['port'],
            config_mail.cfg[args['process']]['login'],
            config_mail.cfg[args['process']]['password']
        )
        log = _Log((args['log']), smtp)
        log.info('Process attachment n°' + args['cpt'] + '/' + args['nb_of_attachments'])

    if args.get('isMail') is None or args.get('isMail') is False:
        separator_qr.enabled = str2bool(config.cfg['SEPARATORQR']['enabled'])

    files = _Files(
        filename,
        int(config.cfg['GLOBAL']['resolution']),
        int(config.cfg['GLOBAL']['compressionquality']),
        log,
        locale,
        config
    )

    # Connect to database
    database.connect()

    # Start process
    if 'file' in args and args['file'] is not None:
        path = args['file']
        log.filename = os.path.basename(path)
        typo = ''
        if separator_qr.enabled:
            if check_file(files, path, config, log) is not False:
                separator_qr.run(path)
            path = separator_qr.output_dir_pdfa if str2bool(separator_qr.convert_to_pdfa) is True else separator_qr.output_dir

            for file in os.listdir(path):
                # if config.cfg['AI-CLASSIFICATION']['enabled'] == 'True':
                #     typo = get_typo(config, path + file, log)

                if check_file(files, path + file, config, log) is not False:
                    # Process the file and send it to Maarch
                    res = OCForInvoices_process.process(args, path + file, log, config, files, ocr, locale, database, typo)
                    if args.get('isMail') is not None and args.get('isMail') is True:
                        if not res[0]:
                            mail_class.move_batch_to_error(args['batch_path'], args['error_path'], smtp, args['process'], args['msg'], config)
                            log.error('Error while processing e-mail : ' + str(res[1]), False)
        elif config.cfg['SEPARATE-BY-DOCUMENT']['enabled'] == 'True':
            list_of_files = separator_qr.split_document_every_two_pages(path)
            for file in list_of_files:
                # if config.cfg['AI-CLASSIFICATION']['enabled'] == 'True':
                #     typo = get_typo(config, file, log)

                if check_file(files, file, config, log) is not False:
                    # Process the file and send it to Maarch
                    res = OCForInvoices_process.process(args, file, log, config, files, ocr, locale, database, typo)
                    if not res[0]:
                        mail_class.move_batch_to_error(args['batch_path'], args['error_path'], smtp, args['process'], args['msg'], config)
                        log.error('Error while processing e-mail : ' + str(res[1]), False)
            os.remove(path)
        else:
            # if config.cfg['AI-CLASSIFICATION']['enabled'] == 'True':
            #     typo = get_typo(config, path, log)

            if check_file(files, path, config, log) is not False:
                # Process the file and send it to Maarch
                res = OCForInvoices_process.process(args, path, log, config, files, ocr, locale, database, typo)
                if not res:
                    mail_class.move_batch_to_error(args['batch_path'], args['error_path'], smtp, args['process'], args['msg'], config)
                    log.error('Error while processing e-mail', False)

    # Empty the tmp dir to avoid residual file
    recursive_delete(tmp_folder, log)

    # Close database
    database.conn.close()

    end = time.time()
    log.info('Process end after ' + timer(start, end) + '')
