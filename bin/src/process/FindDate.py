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
from datetime import datetime

class FindDate:
    def __init__(self, text, Log, Locale, Config):
        self.date       = ''
        self.text       = text
        self.Log        = Log
        self.Locale     = Locale
        self.Config     = Config

    def process(self, line, position):
        for _date in re.finditer(r"" + self.Locale.dateRegex + "", line):  # The re.sub is useful to fix space between numerics
            self.date = _date.group().replace('1er', '01')  # Replace some possible inconvenient char
            self.date = self.date.replace(',', ' ')  # Replace some possible inconvenient char
            self.date = self.date.replace('/', ' ')  # Replace some possible inconvenient char
            self.date = self.date.replace('-', ' ')  # Replace some possible inconvenient char
            self.date = self.date.replace('.', ' ')  # Replace some possible inconvenient char

            dateConvert = self.Locale.arrayDate
            for key in dateConvert:
                for month in dateConvert[key]:
                    if month.lower() in self.date.lower():
                        self.date = (self.date.lower().replace(month.lower(), key))
                        break

            try:
                # Fix to handle date with 2 digits year
                lengthOfYear = len(self.date.split(' ')[2])
                if lengthOfYear == 2:
                    regex = self.Locale.dateTimeFormat.replace('%Y', '%y')
                else:
                    regex = self.Locale.dateTimeFormat

                self.date = datetime.strptime(self.date, regex).strftime(self.Locale.formatDate)

                # Check if the date of the document isn't too old. 62 (default value) is equivalent of 2 months
                today = datetime.now()
                docDate = datetime.strptime(self.date, self.Locale.formatDate)
                timedelta = today - docDate

                if int(self.Config.cfg['GLOBAL']['timedelta']) != -1:
                    if timedelta.days > int(self.Config.cfg['GLOBAL']['timedelta']) or timedelta.days < 0:
                        self.Log.info("Date is older than " + str(self.Config.cfg['GLOBAL']['timedelta']) + " days or in the future : " + self.date)
                        self.date = ''
                        continue
                self.Log.info("Date found : " + self.date)
                return self.date, position
            except ValueError:
                self.Log.info("Date wasn't in a good format : " + self.date)
                self.date = ''
                continue
        return False

    def run(self):
        for line in self.text:
            res = self.process(re.sub(r'(\d)\s+(\d)', r'\1\2', line.content), line.position)
            if not res :
                res = self.process(line.content, line.position)
                if res:
                    return res[0], res[1]
            else:
                return res[0], res[1]
