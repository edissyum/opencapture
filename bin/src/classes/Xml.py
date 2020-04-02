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

from lxml import etree

class Xml:
    def __init__(self, Config, Database):
        self.filename       = ''
        self.separator      = ''
        self.Config         = Config
        self.db             = Database

    def construct_filename(self, invoiceNumber):
        root        = etree.parse(self.Config.cfg['GLOBAL']['exportaccountingfileparser'])
        array       = []
        tmpFilename = {}
        cpt         = 0
        dateFilter  = {
            'year'      : '%Y',
            'month'     : '%m',
            'day'       : '%d',
            'full_date' : '%d%m%Y'
        }

        for elements in root.xpath('/ROOT/NAME/ELEMENT'):
            tmparray = {}
            for element in elements:
                tmparray[element.tag] = []
                tmparray[element.tag] = element.text

            array.append(tmparray)

        for element in root.xpath('/ROOT/SEPARATOR/value'):
            self.separator   = element.text

        for element in array:
            tmpFilename[cpt] = []
            if element['type'] == 'column':
                if element['filter'] is not None and element['filter'] in dateFilter:
                    field = "strftime('" + dateFilter[element['filter']] + "', registerDate) as date"
                else:
                    field = element['value']

                res = self.db.select({
                    'select'    : [field],
                    'table'     : ['suppliers', 'invoices'],
                    'left_join' : ['suppliers.vatNumber = invoices.vatNumber'],
                    'where'     : ['invoiceNumber = ?'],
                    'data'      : [invoiceNumber],
                    'limit'     : 1
                })

                tmpFilename[cpt] = res[0][0].replace(' ', '_')

            elif element['type'] == 'text':
                tmpFilename[cpt] = element['value']

            cpt += 1

        filename = ''
        for cpt in tmpFilename:
            if self.separator:
                filename += tmpFilename[cpt] + self.separator
            else:
                filename += tmpFilename[cpt]

        if self.separator:
            # remove last separator
            self.filename = filename[:-1] + '.xml'
        else:
            self.filename = filename + '.xml'