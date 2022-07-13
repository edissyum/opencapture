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

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import os
import sys
import argparse
import tempfile
import datetime
from src.backend import app, retrieve_config_from_custom_id
from src.backend.import_classes import _Log, _Mail, _Config
from src.backend.main_splitter import launch as launch_splitter
from src.backend.main import launch as launch_verifier, create_classes_from_custom_id


def str2bool(value):
    """
    Function to convert string to boolean

    :return: Boolean
    """
    return value.lower() in "true"


def check_folders(folder_crawl, folder_dest=False):
    """
    Check if IMAP folder exist

    :param folder_crawl: IMAP source folder
    :param folder_dest: IMAP destination folder (if action is made to move or delete)
    :return: Boolean
    """
    if not Mail.check_if_folder_exist(folder_crawl):
        print('The folder to crawl "' + folder_to_crawl + '" doesnt exist')
        return False
    else:
        if folder_dest is not False:
            if not Mail.check_if_folder_exist(folder_dest):
                print('The destination folder "' + str(folder_dest) + '" doesnt exist')
                return False
        return True


# construct the argument parse and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-c", "--custom_id", required=True, help="Identifier of the custom")
ap.add_argument("-cm", "--config_mail", required=True, help="path to mail.ini")
ap.add_argument('-p', "--process", required=True, default='MAIL_1')
args = vars(ap.parse_args())

if not retrieve_config_from_custom_id(args['custom_id']):
    sys.exit('Custom config file couldn\'t be found')

process = args['process']
print('Start process : ' + process)

database, config, regex, files, ocr, log, _, spreadsheet, smtp, docservers, configurations = create_classes_from_custom_id(args['custom_id'])

config_mail = _Config(args['config_mail'])
cfg = config_mail.cfg[process]

if config_mail.cfg.get(process) is None:
    sys.exit('Process ' + process + ' is not set into ' + args['config_mail'] + ' file')

global_log = _Log(config.cfg['GLOBAL']['logfile'], smtp)

now = datetime.datetime.now()
path = config_mail.cfg['GLOBAL']['batchpath'] + '/' + process + '/' + str('%02d' % now.year) + str('%02d' % now.month) + str('%02d' % now.day) + '/'
path_without_time = config_mail.cfg['GLOBAL']['batchpath']

Mail = _Mail(
    config_mail.cfg[process]['host'],
    config_mail.cfg[process]['port'],
    config_mail.cfg[process]['login'],
    config_mail.cfg[process]['password']
)

secured_connection = str2bool(cfg['securedconnection'])
folder_trash = cfg['foldertrash']
action = cfg['actionafterprocess']
folder_to_crawl = cfg['foldertocrawl']
folder_destination = cfg['folderdestination']
isSplitter = str2bool(cfg['issplitter'])
splitterInputId = cfg['splittertechnicalinputid']
verifierFormId = cfg['verifierformid']
verifierCustomerId = cfg['verifiercustomerid']

Mail.test_connection(secured_connection)

if action == 'delete':
    if folder_trash != '':
        check = check_folders(folder_to_crawl, folder_trash)
    else:
        check = check_folders(folder_to_crawl)
elif action == 'move':
    check = check_folders(folder_to_crawl, folder_destination)
else:
    check = check_folders(folder_to_crawl)

if check:
    Mail.select_folder(folder_to_crawl)
    emails = Mail.retrieve_message()
    if len(emails) > 0:
        now = datetime.datetime.now()
        if not os.path.exists(path):
            os.makedirs(path)

        year, month, day = [str('%02d' % now.year), str('%02d' % now.month), str('%02d' % now.day)]
        hour, minute, second, microsecond = [str('%02d' % now.hour), str('%02d' % now.minute), str('%02d' % now.second), str('%02d' % now.microsecond)]

        date_batch = year + month + day + '_' + hour + minute + second + microsecond
        batch_path = tempfile.mkdtemp(dir=path, prefix='BATCH_' + date_batch + '_')

        print('Batch name : bin/data/MailCollect' + batch_path.split('/MailCollect')[1].replace('//', '/'))
        print('Batch error name : bin/data/MailCollect/_ERROR/' + batch_path.split('/MailCollect')[1].replace('//', '/'))

        Log = _Log(batch_path + '/' + date_batch + '.log', smtp)
        Log.info('Start following batch : ' + os.path.basename(os.path.normpath(batch_path)))
        Log.info('Action after processing e-mail is : ' + action)
        Log.info('Number of e-mail to process : ' + str(len(emails)))

        cpt_mail = 1
        for msg in emails:
            # Backup all the e-mail into batch path
            Mail.backup_email(msg, batch_path)
            ret = Mail.construct_dict(msg, batch_path)
            Log.info('Start to process only attachments')
            Log.info('Process e-mail n°' + str(cpt_mail) + '/' + str(len(emails)))
            if len(ret['attachments']) > 0:
                Log.info('Found ' + str(len(ret['attachments'])) + ' attachments')
                cpt = 1
                for attachment in ret['attachments']:
                    if attachment['format'].lower() == 'pdf':
                        if not isSplitter:
                            with app.app_context():
                                launch_verifier({
                                    'cpt': str(cpt),
                                    'isMail': True,
                                    'process': process,
                                    'config': args['config'],
                                    'batch_path': batch_path,
                                    'form_id': verifierFormId,
                                    'file': attachment['file'],
                                    'customer_id': verifierCustomerId,
                                    'config_mail': args['config_mail'],
                                    'log': batch_path + '/' + date_batch + '.log',
                                    'nb_of_attachments': str(len(ret['attachments'])),
                                    'error_path': path_without_time + '/_ERROR/' + process + '/' + year + month + day,
                                    'msg': {
                                        'uid': msg.uid,
                                        'subject': msg.subject,
                                        'date': msg.date.strftime('%d/%m/%Y %H:%M:%S')
                                    },
                                })
                        else:
                            launch_splitter({
                                'isMail': True,
                                'cpt': str(cpt),
                                'process': process,
                                'batch_path': batch_path,
                                'config': args['config'],
                                'file': attachment['file'],
                                'input_id': splitterInputId,
                                'config_mail': args['config_mail'],
                                'log': batch_path + '/' + date_batch + '.log',
                                'nb_of_attachments': str(len(ret['attachments'])),
                                'error_path': path_without_time + '/_ERROR/' + process + '/' + year + month + day,
                                'msg': {
                                    'uid': msg.uid,
                                    'subject': msg.subject,
                                    'date': msg.date.strftime('%d/%m/%Y %H:%M:%S')
                                },
                            })
                    else:
                        Log.info('Attachment n°' + str(cpt) + ' is not a PDF file')
                    cpt = cpt + 1
            else:
                Log.info('No attachments found')

            if action not in ['move', 'delete', 'none']:
                action = 'none'

            if action == 'move':
                Log.info('Move mail into archive folder : ' + folder_destination)
                Mail.move_to_destination_folder(msg, folder_destination, Log)

            elif action == 'delete':
                Log.info('Move mail to trash')
                Mail.delete_mail(msg, folder_trash, Log)
            cpt_mail = cpt_mail + 1
    else:
        sys.exit('Folder do not contain any e-mail. Exit...')
else:
    sys.exit(0)
