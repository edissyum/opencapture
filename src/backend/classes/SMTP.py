# This file is part of Open-Capture.

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import os
import pathlib
import smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


class SMTP:
    def __init__(self, enabled, host, port, login, pwd, ssl, starttls, dest_mail, delay, auth, from_mail):
        self.pwd = pwd
        self.conn = None
        self.port = port
        self.host = host
        self.is_up = False
        self.login = login
        self.delay = int(delay)
        self.ssl = ssl
        self.auth = auth
        self.dest_mail = dest_mail
        self.from_mail = from_mail
        self.enabled = enabled
        self.starttls = starttls

        if self.enabled:
            self.test_connection()

    def test_connection(self):
        """
        Test the connection to the SMTP server

        """
        error = False
        if self.ssl:
            try:
                self.conn = smtplib.SMTP_SSL(self.host, self.port, timeout=10)
                self.conn.ehlo()
                if self.starttls:
                    self.conn.starttls()
                    self.conn.ehlo()
            except (smtplib.SMTPException, OSError) as smtp_error:
                error = True
                print('SMTP Host ' + self.host + ' on port ' + self.port + ' is unreachable : ' + str(smtp_error))
        else:
            try:
                self.conn = smtplib.SMTP(self.host, self.port, timeout=10)
                self.conn.ehlo()
                if self.starttls:
                    self.conn.starttls()
                    self.conn.ehlo()
            except (smtplib.SMTPException, OSError) as smtp_error:
                error = True
                print('SMTP Host ' + self.host + ' on port ' + self.port + ' is unreachable : ' + str(smtp_error))
        try:
            if not error and self.auth:
                self.conn.login(self.login, self.pwd)
        except (smtplib.SMTPException, OSError) as smtp_error:
            error = True
            print('Error while trying to login to ' + self.host + ' using ' + self.login + '/' + self.pwd + ' as login/password : ' + str(smtp_error))
        self.is_up = not error

    def send_notification(self, error, file_name):
        """
        Send email with the error message coming from Open-Capture process

        :param error: Message to send
        :param file_name: Filename
        """
        file = 'last_notification.lock'
        diff_minutes = False

        if os.path.exists(file) and pathlib.Path(file).stat().st_size != 0:
            with open(file, 'r', encoding='UTF-8') as last_notif:
                last_mail_send = datetime.strptime(last_notif.read(), '%d/%m/%Y %H:%M')
            last_notif.close()

            now = datetime.strptime(datetime.now().strftime('%d/%m/%Y %H:%M'), '%d/%m/%Y %H:%M')
            diff = now - last_mail_send
            diff_minutes = (diff.days * 1440 + diff.seconds / 60)

        msg = MIMEMultipart()
        msg['To'] = self.dest_mail
        if self.from_mail:
            msg['From'] = self.from_mail
        else:
            msg['From'] = 'MailCollect@OpenCapture.com'

        msg['Subject'] = "[Open-Capture] Erreur lors du traitement d'une facture"
        message = 'Une erreur est arrivée lors du traitement du fichier ' + file_name + '\n\n'
        message += "Description de l'erreur : \n    " + error
        if self.delay != 0:
            message += '\n\n Attention, durant les ' + str(self.delay) +\
                       ' dernières minutes, d\'autres erreurs ont pu arriver sans notifications.'

        msg.attach(MIMEText(message))

        try:
            if diff_minutes is not False and self.delay != 0 and diff_minutes < self.delay:
                pass
            else:
                self.conn.sendmail(from_addr=msg['From'], to_addrs=msg['To'], msg=msg.as_string())
                with open(file, 'w', encoding='UTF-8') as last_notif:
                    last_notif.write(datetime.now().strftime('%d/%m/%Y %H:%M'))
                last_notif.close()
        except smtplib.SMTPException as smtp_error:
            print('Erreur lors de l\'envoi du mail : ' + str(smtp_error))

    def send_email(self, message, step):
        """
        Send email with the error message coming from MailCollect, IMAP connector

        :param message: Message to send
        :param step: str with the specified step where the error was throw
        """
        file = 'last_mail.lock'
        diff_minutes = False

        if os.path.exists(file) and pathlib.Path(file).stat().st_size != 0:
            with open(file, 'r', encoding='UTF-8') as last_notif:
                last_mail_send = datetime.strptime(last_notif.read(), '%d/%m/%Y %H:%M')
            last_notif.close()

            now = datetime.strptime(datetime.now().strftime('%d/%m/%Y %H:%M'), '%d/%m/%Y %H:%M')
            diff = now - last_mail_send
            diff_minutes = (diff.days * 1440 + diff.seconds / 60)

        msg = MIMEMultipart()
        msg['To'] = self.dest_mail
        if self.from_mail:
            msg['From'] = self.from_mail
        else:
            msg['From'] = 'MailCollect@OpenCapture.com'

        msg['Subject'] = '[MailCollect] Erreur lors de la capture IMAP'
        message = 'Une erreur est arrivée lors ' + step + ' : \n' + message
        if self.delay != 0:
            message += '\n\n Attention, durant les ' + str(self.delay) + \
                       ' dernières minutes, d\'autres erreurs ont pu arriver sans notifications.'

        msg.attach(MIMEText(message))

        try:
            if diff_minutes is not False and self.delay != 0 and diff_minutes < self.delay:
                pass
            else:
                self.conn.sendmail(from_addr=msg['From'], to_addrs=msg['To'], msg=msg.as_string())
                with open(file, 'w', encoding='UTF-8') as last_notif:
                    last_notif.write(datetime.now().strftime('%d/%m/%Y %H:%M'))
                last_notif.close()
        except smtplib.SMTPException as smtp_error:
            print('Erreur lors de l\'envoi du mail : ' + str(smtp_error))

    def send_user_quota_notifications(self, dest, custom_id):
        file = 'last_mail_quota.lock'
        diff_minutes = False
        if os.path.exists('custom/' + custom_id + '/' + file) and pathlib.Path('custom/' + custom_id + '/' + file).stat().st_size != 0:
            with open('custom/' + custom_id + '/' + file, 'r', encoding='UTF-8') as last_notif:
                last_mail_send = datetime.strptime(last_notif.read(), '%d/%m/%Y %H:%M')
            last_notif.close()

            now = datetime.strptime(datetime.now().strftime('%d/%m/%Y %H:%M'), '%d/%m/%Y %H:%M')
            diff = now - last_mail_send
            diff_minutes = (diff.days * 1440 + diff.seconds / 60)

        msg = MIMEMultipart()
        msg['To'] = dest
        if self.from_mail:
            msg['From'] = self.from_mail
        else:
            msg['From'] = 'MailCollect@OpenCapture.com'

        msg['Subject'] = '[OpenCapture - User Quota] Le quota utilisateur est dépassé'
        message = 'Le quota utilisateur de l\'instance ' + custom_id + ' vient de dépasser son quota d\'utilisateurs autorisés'
        if self.delay != 0:
            message += '\n\n Attention, durant les ' + str(self.delay) + \
                       ' dernières minutes, d\'autres erreurs ont pu arriver sans notifications.'

        msg.attach(MIMEText(message))

        try:
            if diff_minutes is not False and self.delay != 0 and diff_minutes < self.delay:
                pass
            else:
                self.conn.sendmail(from_addr=msg['From'], to_addrs=msg['To'], msg=msg.as_string())
                with open('custom/' + custom_id + '/' + file, 'w', encoding='UTF-8') as last_notif:
                    last_notif.write(datetime.now().strftime('%d/%m/%Y %H:%M'))
                last_notif.close()
        except smtplib.SMTPException as smtp_error:
            print('Erreur lors de l\'envoi du mail : ' + str(smtp_error))
