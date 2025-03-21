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
import re
import sys
import html
import msal
import shutil
import base64
import locale
import mimetypes
from ssl import SSLError
from xhtml2pdf import pisa
from socket import gaierror
from imaplib import IMAP4_SSL
from flask_babel import gettext
from imap_tools import utils, MailBox, MailBoxUnencrypted


class Mail:
    def __init__(self, host, port, login, pwd, oauth, tenant_id, client_id, secret, scopes, authority):
        self.pwd = pwd
        self.conn = None
        self.port = port
        self.host = host
        self.login = login
        self.oauth = oauth
        self.secret = secret
        self.scopes = scopes
        self.authority = authority
        self.tenant_id = tenant_id
        self.client_id = client_id

    def test_connection(self, secured_connection):
        """
        Test the connection to the IMAP server

        """
        try:
            if secured_connection:
                self.conn = MailBox(host=self.host, port=self.port)
            else:
                self.conn = MailBoxUnencrypted(host=self.host, port=self.port)
        except (gaierror, SSLError) as mail_error:
            error = 'IMAP Host ' + self.host + ' on port ' + self.port + ' is unreachable : ' + str(mail_error)
            print(error)
            sys.exit()

        try:
            if self.oauth:
                result = self.generate_oauth_token()
                self.conn.client.authenticate("XOAUTH2",
                                              lambda x: self.generate_auth_string(result['access_token']).encode(
                                                  "utf-8"))
            else:
                self.conn.login(self.login, self.pwd)
        except IMAP4_SSL.error as err:
            error = 'Error while trying to login to ' + self.host + ' using ' + self.login + '/' + self.pwd + ' as login/password : ' + str(
                err)
            print(error)
            sys.exit()

    def generate_auth_string(self, token):
        return f"user={self.login}\x01auth=Bearer {token}\x01\x01"

    def generate_oauth_token(self):
        app = msal.ConfidentialClientApplication(self.client_id,
                                                 authority=self.authority + self.tenant_id,
                                                 client_credential=self.secret)

        result = app.acquire_token_silent([self.scopes], account=None)

        if not result:
            # No suitable token in cache.  Getting a new one.
            result = app.acquire_token_for_client(scopes=[self.scopes])

        if "access_token" in result:
            # Token generated with success.
            return result

        # Error while generated token.
        print(result.get("error"))
        print(result.get("error_description"))
        print(result.get("correlation_id"))
        sys.exit()

    def check_if_folder_exist(self, folder):
        """
        Check if a folder exist into the IMAP mailbox

        :param folder: Folder to check
        :return: Boolean
        """
        folders = self.conn.folder.list()
        for fold in folders:
            if folder == fold.name:
                return True
        return False

    def select_folder(self, folder):
        """
        Select a folder to find mail into

        :param folder: Folder to select
        """
        self.conn.folder.set(folder)

    def retrieve_message(self):
        """
        Retrieve all the messages into the selected mailbox

        :return: list of mails
        """
        emails = []
        for mail in self.conn.fetch():
            emails.append(mail)
        return emails

    def construct_dict(self, msg, backup_path, configurations, insert_body_as_doc=False):
        """
        Construct a dict with all the data of a mail (body and attachments)

        :param insert_body_as_doc: If True, insert the body of the mail as a PDF
        :param configurations: Configuration of the application
        :param msg: Mailbox object containing all the data of mail
        :param backup_path: Path to backup of the e-mail
        :return: dict of Args and file path
        """

        data = {
            'attachments': []
        }

        primary_mail_path = backup_path + '/mail_' + str(msg.uid) + '/mail_origin/'
        if not os.path.exists(primary_mail_path):
            os.makedirs(primary_mail_path)

        to_str, cc_str = ('', '')
        for to in msg.to_values:
            to_str += html.escape(to.full) + ';'

        for cc in msg.cc_values:
            cc_str += html.escape(cc.full) + ';'

        try:
            if 'locale' in configurations and configurations['locale'] == 'fra':
                locale.setlocale(locale.LC_ALL, 'fr_FR.UTF-8')
            else:
                locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
        except locale.Error:
            pass

        mail_data = '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' + "<br>"
        mail_data += gettext('FROM') + ': ' + html.escape(msg.from_values.full) + '<br>'
        mail_data += gettext('SEND') + ': ' + msg.date.strftime('%A %d %B %Y %H:%M:%S') + '<br>'
        mail_data += gettext('TO') + ': ' + to_str.rstrip(';') + '<br>'
        if cc_str:
            mail_data += gettext('COPIES') + ': ' + cc_str.rstrip(';') + '<br>'
        mail_data += gettext('SUBJECT') + ': ' + msg.subject + '<br><br>'

        if len(msg.html) == 0 and len(msg.text) >= 0:
            for line in msg.text.split('\n'):
                mail_data += line + "<br>"
        else:
            mail_data += msg.html

        html_body = mail_data

        attachments = self.retrieve_attachment(msg)
        attachments_path = backup_path + '/mail_' + str(msg.uid) + '/attachments/'
        for attachment in attachments:
            path = attachments_path + sanitize_filename(attachment['filename']) + attachment['format']
            if not os.path.isfile(path):
                attachment['format'] = '.txt'
                with open(path, 'w', encoding='utf-8') as file:
                    file.write('Erreur lors de la remontée de cette pièce jointe')
                file.close()

            attachment_content_id_in_html = re.search(r'src="cid:\s*' + re.escape(attachment['content_id']), html_body)
            if attachment_content_id_in_html:
                html_body = re.sub(r'src="cid:\s*' + re.escape(attachment['content_id']),
                                   f"src='data:image/{attachment['format'].replace('.', '')};"
                                   f"base64, {base64.b64encode(attachment['content']).decode('utf-8')}'",
                                   html_body)
            else:
                data['attachments'].append({
                    'file': path,
                    'format': attachment['format'],
                    'filename': sanitize_filename(attachment['filename']) + attachment['format']
                })

        if insert_body_as_doc:
            with open(primary_mail_path + 'body.pdf', 'w+b') as fp:
                pisa.CreatePDF(html_body, dest=fp)
            fp.close()

            data['file'] = {
                'filename': sanitize_filename('body' + msg.uid + '.pdf'),
                'format': 'pdf',
                'path': primary_mail_path + 'body.pdf'
            }

        return data

    def backup_email(self, msg, backup_path):
        """
        Backup e-mail into path

        :param msg: Mail data
        :param backup_path: Backup path
        :return: Boolean
        """
        # Backup mail
        primary_mail_path = backup_path + '/mail_' + str(msg.uid) + '/mail_origin/'
        os.makedirs(primary_mail_path)

        # Start with headers
        with open(primary_mail_path + 'header.txt', 'w', encoding='utf-8') as file:
            for header in msg.headers:
                try:
                    file.write(header + ' : ' + msg.headers[header][0] + '\n')
                except UnicodeEncodeError:
                    file.write(
                        header + ' : ' + msg.headers[header][0].encode('utf-8', 'surrogateescape').decode('utf-8',
                                                                                                          'replace') + '\n')
        file.close()

        # Then body
        if len(msg.html) == 0:
            with open(primary_mail_path + 'body.txt', 'w', encoding='utf-8') as body_file:
                if len(msg.text) != 0:
                    body_file.write(msg.text)
                else:
                    body_file.write(' ')
        else:
            with open(primary_mail_path + 'body.html', 'w', encoding='utf-8') as body_file:
                body_file.write(msg.html)
        body_file.close()

        # For safety, backup original stream retrieve from IMAP directly
        with open(primary_mail_path + 'orig.txt', 'w', encoding='utf-8') as orig_file:
            for payload in msg.obj.get_payload():
                try:
                    orig_file.write(str(payload))
                except KeyError:
                    break
        orig_file.close()

        # Backup attachments
        attachments = self.retrieve_attachment(msg)

        if len(attachments) > 0:
            attachment_path = backup_path + '/mail_' + str(msg.uid) + '/attachments/'
            os.mkdir(attachment_path)
            for file in attachments:
                file_path = os.path.join(attachment_path + sanitize_filename(file['filename']) + file['format'])
                if not os.path.isfile(file_path) and file['format'] and not os.path.isdir(file_path):
                    with open(file_path, 'wb') as attach:
                        attach.write(file['content'])
                    attach.close()
        return True

    def move_to_destination_folder(self, msg, destination, log):
        """
        Move e-mail to selected destination IMAP folder (if action is set to move)

        :param log: Log class instance
        :param msg: Mail data
        :param destination: IMAP folder destination
        :return: Boolean
        """
        try:
            self.conn.move(msg.uid, destination)
            return True
        except utils.UnexpectedCommandStatusError as mail_error:
            log.error('Error while moving mail to ' + destination + ' folder : ' + str(mail_error), False)

    def delete_mail(self, msg, trash_folder, log):
        """
        Move e-mail to trash IMAP folder (if action is set to delete) if specified. Else, delete it (can't be retrieved)

        :param log: Log class instance
        :param msg: Mail Data
        :param trash_folder: IMAP trash folder
        """
        try:
            if not self.check_if_folder_exist(trash_folder):
                log.info('Trash folder (' + trash_folder + ') doesnt exist, delete mail (couldn\'t be retrieve)')
                self.conn.delete(msg.uid)
            else:
                self.move_to_destination_folder(msg, trash_folder, log)
        except utils.UnexpectedCommandStatusError as mail_error:
            log.error('Error while deleting mail : ' + str(mail_error), False)

    @staticmethod
    def retrieve_attachment(msg):
        """
        Retrieve all attachments from a given mail

        :param msg: Mail Data
        :return: List of all the attachments for a mail
        """
        args = []
        for att in msg.attachments:
            file_format = os.path.splitext(att.filename)[1]
            if not att.filename and not file_format:
                continue
            elif not file_format or file_format in ['.']:
                file_format = mimetypes.guess_extension(att.content_type, strict=False)

            args.append({
                'filename': os.path.splitext(att.filename)[0].replace(' ', '_'),
                'format': file_format,
                'content': att.payload,
                'content_id': att.content_id,
                'mime_type': att.content_type
            })
        return args

    @staticmethod
    def move_batch_to_error(batch_path, error_path, smtp, process, msg):
        """
        If error in batch process, move the batch folder into error folder

        :param process: Process name
        :param msg: Contain the msg metadata
        :param smtp: instance of SMTP class
        :param batch_path: Path to the actual batch
        :param error_path: path to the error path
        """

        try:
            os.makedirs(error_path)
        except FileExistsError:
            pass

        try:
            shutil.move(batch_path, error_path)
            if smtp.enabled is not False:
                smtp.send_email(
                    message='    - Nom du batch : ' + os.path.basename(batch_path) + '/ \n' +
                            '    - Nom du process : ' + process + '\n' +
                            '    - Chemin vers le batch en erreur : ' + error_path + '/' + os.path.basename(
                        batch_path) + '/ \n' +
                            '    - Sujet du mail : ' + msg['subject'] + '\n' +
                            '    - Date du mail : ' + msg['date'] + '\n' +
                            '    - UID du mail : ' + msg['uid'] + '\n' +
                            '\n\n'
                            '    - Pour plus d\'informations sur l\'erreur, veuillez regarder le fichier d\'erreur.\n',
                    step='du traitement du mail suivant')
        except (FileNotFoundError, FileExistsError, shutil.Error):
            pass


def str2bool(value):
    """
    Function to convert string to boolean

    :return: Boolean
    """
    return value.lower() in "true"


def sanitize_filename(s):
    def safe_char(c):
        if c.isalnum():
            return c
        else:
            return "_"

    return "".join(safe_char(c) for c in s).rstrip("_")
