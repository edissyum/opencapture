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
    def __init__(self, config, database):
        self.filename = ''
        self.separator = ''
        self.Config = config
        self.db = database

    def construct_filename(self, invoice_number, vat_number):
        root = etree.parse(self.Config.cfg['GLOBAL']['exportaccountingfileparser'])
        array = []
        tmp_filename = {}
        cpt = 0
        date_filter = {
            'year': '%Y',
            'month': '%m',
            'day': '%d',
            'full_date': '%d%m%Y'
        }

        for elements in root.xpath('/ROOT/NAME/ELEMENT'):
            tmparray = {}
            for element in elements:
                tmparray[element.tag] = []
                tmparray[element.tag] = element.text

            array.append(tmparray)

        for element in root.xpath('/ROOT/SEPARATOR/value'):
            self.separator = element.text

        for element in array:
            tmp_filename[cpt] = []
            if element['type'] == 'column':
                if element['filter'] is not None and element['filter'] in date_filter:
                    field = "strftime('" + date_filter[element['filter']] + "', register_date) as date"
                    label_field = 'date'
                else:
                    field = element['value']
                    label_field = field

                table = element['table']
                where = ''
                data = ''
                if table == 'suppliers':
                    where = 'vat_number = ?'
                    data = vat_number
                elif table == 'invoices':
                    where = 'invoice_number = ?'
                    data = invoice_number

                res = self.db.select({
                    'select': [field],
                    'table': [table],
                    'where': [where],
                    'data': [data],
                    'limit': 1
                })
                if res:
                    tmp_filename[cpt] = res[0][label_field].replace(' ', '_')

            elif element['type'] == 'text':
                tmp_filename[cpt] = element['value']

            cpt += 1

        filename = ''
        for cpt in tmp_filename:
            if self.separator:
                filename += str(tmp_filename[cpt]) + self.separator
            else:
                filename += tmp_filename[cpt]

        if self.separator:
            # remove last separator
            self.filename = filename[:-1] + '.xml'
        else:
            self.filename = filename + '.xml'
