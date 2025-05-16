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
import argparse
import tempfile
import datetime
from src.backend import app
from flask_babel import gettext
from src.backend.classes.Log import Log
from src.backend.classes.Mail import Mail
from src.backend.main_splitter import launch as launch_splitter
from src.backend.functions import retrieve_config_from_custom_id
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
    if not mail.check_if_folder_exist(folder_crawl):
        print('The folder to crawl "' + folder_to_crawl + '" doesnt exist')
        return False
    else:
        if folder_dest is not False:
            if not mail.check_if_folder_exist(folder_dest):
                print('The destination folder "' + str(folder_dest) + '" doesnt exist')
                return False
        return True

def convert_to_dict(message):
    new_msg = {
        'uid': message.uid,
        'obj': message.obj,
        'subject': message.subject,
        'from': message.from_,
        'to': message.to,
        'cc': message.cc,
        'bcc': message.bcc,
        'reply_to': message.reply_to,
        'date': message.date,
        'headers': message.headers,
        'text': message.text,
        'html': message.html,
        'attachments': [],
        'from_values': message.from_values,
        'to_values': message.to_values,
        'cc_values': message.cc_values,
        'bcc_values': message.bcc_values,
        'reply_to_values': message.reply_to_values
    }

    for att in message.attachments:
        new_msg['attachments'].append({
            'filename': att.filename,
            'payload': att.payload,
            'content_id': att.content_id,
            'content_type': att.content_type,
            'size': att.size,
            'content_disposition': att.content_disposition,
            'part': att.part
        })

    return new_msg

# construct the argument parse and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-c", "--custom-id", required=True, help="Identifier of the custom")
args = vars(ap.parse_args())

if not retrieve_config_from_custom_id(args['custom_id']):
    sys.exit('Custom config file couldn\'t be found')

database, config, regex, files, ocr, log, _, spreadsheet, smtp, docservers, configurations, languages, _ = create_classes_from_custom_id(args['custom_id'])

processes = database.select({
    'select': ['*'],
    'table': ['mailcollect'],
    'where': ['status <> %s', 'enabled = %s'],
    'data': ['DEL', True]
})

if not processes:
    exit('No processes available')

docservers_mailcollect = database.select({
    'select': ['*'],
    'table': ['docservers'],
    'where': ['docserver_id = %s'],
    'data': ['MAILCOLLECT_BATCHES']
})

if not docservers_mailcollect:
    exit('Error with smtp settings in configurations table')

docservers_mailcollect = docservers_mailcollect[0]
config_mail = {}

with app.app_context():
    for process in processes:
        print('Start process : ' + process['name'])
        for _p in process:
            config_mail[_p] = process[_p]

        now = datetime.datetime.now()
        path = docservers_mailcollect['path'] + '/' + process['name'] + '/' + str('%02d' % now.year) + str('%02d' % now.month) + str('%02d' % now.day) + '/'
        path_without_time = docservers_mailcollect['path']

        mail = Mail(config_mail)

        secured_connection = config_mail['secured_connection']
        folder_trash = config_mail['folder_trash']
        action = config_mail['action_after_process']
        folder_to_crawl = config_mail['folder_to_crawl']
        folder_destination = config_mail['folder_destination']
        isSplitter = config_mail['is_splitter']
        splitterWorkflowId = config_mail['splitter_workflow_id'] if 'splitter_workflow_id' in config_mail else None
        verifierWorkflowId = config_mail['verifier_workflow_id'] if 'verifier_workflow_id' in config_mail else None
        verifierInsertBody = config_mail['verifier_insert_body_as_doc']
        splitterInsertBody = config_mail['splitter_insert_body_as_doc']

        mail.test_connection(secured_connection)

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
            mail.select_folder(folder_to_crawl)
            emails = mail.retrieve_message(folder_to_crawl)
            if len(emails) > 0:
                now = datetime.datetime.now()
                if not os.path.exists(path):
                    os.makedirs(path)

                year, month, day = [str('%02d' % now.year), str('%02d' % now.month), str('%02d' % now.day)]
                hour, minute, second, microsecond = [str('%02d' % now.hour), str('%02d' % now.minute), str('%02d' % now.second), str('%02d' % now.microsecond)]

                date_batch = year + month + day + '_' + hour + minute + second + microsecond
                batch_path = tempfile.mkdtemp(dir=path, prefix='BATCH_' + date_batch + '_')

                print('Batch name : ' + batch_path)
                print('Batch error name : ' + docservers_mailcollect['path'] + '/_ERROR/' + batch_path.split('/MailCollect/')[1])

                Log = Log(batch_path + '/' + date_batch + '.log', smtp)
                Log.info('Start following batch : ' + os.path.basename(os.path.normpath(batch_path)))
                Log.info('Action after processing e-mail is : ' + action)
                Log.info('Number of e-mail to process : ' + str(len(emails)))

                cpt_mail = 1
                for msg in emails:
                    if mail.method == 'graphql':
                        msg_id = str(msg['id'])
                    else:
                        msg = convert_to_dict(msg)
                        msg_id = str(msg['uid'])

                    mail.backup_email(msg, batch_path)

                    insert_doc = verifierInsertBody if not isSplitter else splitterInsertBody
                    ret = mail.construct_dict(msg, batch_path, configurations, insert_doc)
                    if insert_doc:
                        Log.info('Start to process e-mail body and attachments')
                    else:
                        Log.info('Start to process only attachments')

                    Log.info('Process e-mail n°' + str(cpt_mail) + '/' + str(len(emails)))
                    if mail.method == 'graphql':
                        document_date = datetime.datetime.strptime(msg['receivedDateTime'], '%Y-%m-%dT%H:%M:%SZ')
                    else:
                        document_date = msg['date']

                    if not insert_doc:
                        if len(ret['attachments']) > 0:
                            Log.info('Found ' + str(len(ret['attachments'])) + ' attachments')
                            cpt = 1
                            for attachment in ret['attachments']:
                                if attachment['format'].lower() == '.pdf' or attachment['format'].lower() == 'pdf':
                                    if not isSplitter:
                                        task_id_monitor = database.insert({
                                            'table': 'monitoring',
                                            'columns': {
                                                'status': 'wait',
                                                'module': 'verifier',
                                                'filename': os.path.basename(attachment['file']),
                                                'workflow_id': verifierWorkflowId,
                                                'source': 'cli'
                                            }
                                        })
                                        launch_verifier({
                                            'cpt': str(cpt),
                                            'isMail': True,
                                            'ip': '0.0.0.0',
                                            'source': 'email',
                                            'process': process,
                                            'batch_path': batch_path,
                                            'file': attachment['file'],
                                            'user_info': 'mailcollect',
                                            'custom_id': args['custom_id'],
                                            'process_name': process['name'],
                                            'workflow_id': verifierWorkflowId,
                                            'task_id_monitor': task_id_monitor,
                                            'log': batch_path + '/' + date_batch + '.log',
                                            'nb_of_attachments': str(len(ret['attachments'])),
                                            'original_filename': os.path.basename(attachment['file']),
                                            'error_path': path_without_time + '/_ERROR/' + process['name'] + '/' + year + month + day,
                                            'msg': {
                                                'uid': msg_id,
                                                'subject': msg['subject'],
                                                'date': document_date
                                            }
                                        })
                                    else:
                                        task_id_monitor = database.insert({
                                            'table': 'monitoring',
                                            'columns': {
                                                'status': 'wait',
                                                'module': 'splitter',
                                                'filename': os.path.basename(attachment['file']),
                                                'workflow_id': splitterWorkflowId,
                                                'source': 'cli'
                                            }
                                        })
                                        launch_splitter({
                                            'isMail': True,
                                            'cpt': str(cpt),
                                            'ip': '0.0.0.0',
                                            'batch_path': batch_path,
                                            'process': process['name'],
                                            'user_info': 'mailcollect',
                                            'file': attachment['file'],
                                            'custom_id': args['custom_id'],
                                            'workflow_id': splitterWorkflowId,
                                            'task_id_monitor': task_id_monitor,
                                            'log': batch_path + '/' + date_batch + '.log',
                                            'nb_of_attachments': str(len(ret['attachments'])),
                                            'error_path': path_without_time + '/_ERROR/' + process['name'] + '/' + year + month + day,
                                            'msg': {
                                                'uid': msg_id,
                                                'subject': msg['subject'] if msg['subject'] else gettext('NO_SUBJECT'),
                                                'date': document_date
                                            }
                                        })
                                else:
                                    Log.info('Attachment n°' + str(cpt) + ' is not a PDF file')
                                cpt = cpt + 1
                        else:
                            Log.info('No attachments found')
                    else:
                        if not isSplitter:
                            task_id_monitor = database.insert({
                                'table': 'monitoring',
                                'columns': {
                                    'status': 'wait',
                                    'module': 'verifier',
                                    'filename': ret['file']['filename'],
                                    'workflow_id': verifierWorkflowId,
                                    'source': 'cli'
                                }
                            })
                            launch_verifier({
                                'isMail': True,
                                'ip': '0.0.0.0',
                                'source': 'email',
                                'process': process,
                                'file': ret['file']['path'],
                                'batch_path': batch_path,
                                'user_info': 'mailcollect',
                                'custom_id': args['custom_id'],
                                'process_name': process['name'],
                                'attachments': ret['attachments'],
                                'workflow_id': verifierWorkflowId,
                                'task_id_monitor': task_id_monitor,
                                'log': batch_path + '/' + date_batch + '.log',
                                'original_filename': os.path.basename(ret['file']['path']),
                                'error_path': path_without_time + '/_ERROR/' + process['name'] + '/' + year + month + day,
                                'msg': {
                                    'uid': msg_id,
                                    'subject': msg['subject'],
                                    'date': document_date
                                }
                            })
                        else:
                            task_id_monitor = database.insert({
                                'table': 'monitoring',
                                'columns': {
                                    'status': 'wait',
                                    'module': 'splitter',
                                    'filename': ret['file']['filename'],
                                    'workflow_id': splitterWorkflowId,
                                    'source': 'cli'
                                }
                            })

                            launch_splitter({
                                'isMail': True,
                                'ip': '0.0.0.0',
                                'batch_path': batch_path,
                                'process': process['name'],
                                'user_info': 'mailcollect',
                                'file': ret['file']['path'],
                                'custom_id': args['custom_id'],
                                'attachments': ret['attachments'],
                                'workflow_id': splitterWorkflowId,
                                'task_id_monitor': task_id_monitor,
                                'log': batch_path + '/' + date_batch + '.log',
                                'error_path': path_without_time + '/_ERROR/' + process['name'] + '/' + year + month + day,
                                'msg': {
                                    'uid': msg_id,
                                    'subject': msg['subject'] if msg['subject'] else gettext('NO_SUBJECT') + ' - ' + document_date,
                                    'date': document_date
                                }
                            })
                    if action not in ['move', 'delete', 'none']:
                        action = 'none'

                    if action == 'move':
                        Log.info('Move mail into archive folder : ' + folder_destination)
                        mail.move_to_destination_folder(msg, folder_destination, Log)

                    elif action == 'delete':
                        Log.info('Move mail to trash')
                        mail.delete_mail(msg, folder_trash, Log)
                    cpt_mail = cpt_mail + 1
            else:
                print('Folder do not contain any e-mail...')
        else:
            sys.exit(0)
