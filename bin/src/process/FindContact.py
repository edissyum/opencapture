# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import re
from threading import Thread

class FindContact(Thread):
    def __init__(self, text, Log, Config, WebService):
        Thread.__init__(self, name='contactThread')
        self.text       = text
        self.Log        = Log
        self.Config     = Config
        self.WebService = WebService
        self.contact    = ''

    def run(self):
        foundContact = False
        for mail in re.finditer(r"[^@\s<>[]+@[^@\s]+\.[^@\s\]>]+", self.text):
            self.Log.info('Find E-MAIL : ' + mail.group())
            # Now sanitize email to delete potential OCR error
            sanitized_mail  = re.sub(r"[" + self.Config.cfg['GLOBAL']['sanitizestr'] + "]", "", mail.group())
            self.Log.info('Sanitized E-MAIL : ' + sanitized_mail)
            contact         = self.WebService.retrieve_contact_by_mail(sanitized_mail)
            if contact:
                foundContact = True
                self.contact = contact
                self.Log.info('Find E-MAIL in Maarch, get it : ' + sanitized_mail)
                break
        # If no contact were found, search for URL
        if not foundContact:
            for url in re.finditer(
                    r"((http|https)://)?(www\.)?[a-zA-Z0-9+_.\-]+\.(" + self.Config.cfg['REGEX']['urlpattern'] + ")",
                    self.text
            ):
                self.Log.info('Find URL : ' + url.group())
                contact = self.WebService.retrieve_contact_by_url(url.group())
                if contact:
                    self.contact = contact
                    self.Log.info('Find URL in Maarch, get it : ' + url.group())
                    break
