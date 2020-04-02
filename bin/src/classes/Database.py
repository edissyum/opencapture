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

import sqlite3

class Database:
    def __init__(self, Log, file=None, conn=None):
        self.file   = file
        self.conn   = conn
        self.Log    = Log

    def connect(self):
        try:
            self.conn = sqlite3.connect(self.file)
        except sqlite3.Error as e:
            self.Log.error('SQLITE connection : ' + str(e))

    def select(self, args):
        if 'table' not in args or 'select' not in args:
            self.Log.error('One or more required args are empty')
        else:
            tmpTable      = args['table']
            args['table'] = args['table'][0]
            if 'left_join' in args:
                if (len(tmpTable) - 1) != len(args['left_join']):
                    self.Log.error("Number of tables doesn't match with number of joins")
                else:
                    cpt = 1
                    for joins in args['left_join']:
                        args['table'] += " LEFT JOIN " + tmpTable[cpt] + " ON " + joins + " "
                        cpt = cpt + 1

            select = ', '.join(args['select'])

            if 'where' not in args:
                where = ''
            else:
                where = ' WHERE ' + ' AND '.join(args['where']) + ' '

            if 'order_by' not in args:
                order_by = ''
            else:
                order_by = ' ORDER BY ' + ', '.join(args['order_by']) + ' '

            if 'limit' not in args:
                limit = ''
            else:
                limit = ' LIMIT ' + str(args['limit'])

            if 'data' not in args:
                args['data'] = []

            query = "SELECT " + select + " FROM " + args['table'] + where + order_by + limit

            self.conn.row_factory = sqlite3.Row
            c = self.conn.cursor()
            try:
                c.execute(query, args['data'])
                return c.fetchall()
            except sqlite3.OperationalError as e:
                self.Log.error(e)
                return False


    def insert(self, args):
        if 'table' not in args:
            self.Log.error('One or more required args are empty')
        else:
            columnsList = []
            valuesList  = []
            for column in args['columns']:
                if args['columns'][column] is not None:
                    columnsList.append(column)
                    valuesList.append(args['columns'][column].replace("'","''"))

            columns = ", ".join(columnsList)
            values  = "'" + "', '".join(valuesList) + "'"

            query = "INSERT INTO " + args['table'] + " (" + columns + ") VALUES (" + values + ")"

            c = self.conn.cursor()
            try:
                c.execute(query)
                return True
            except sqlite3.OperationalError as e:
                self.Log.error(e)
                return False

    def update(self, args):
        if args['table'] == [] or args['set'] == []:
            self.Log.error('One or more required args are empty')
        else:
            queryList   = []
            data        = []
            for column in args['set']:
                if args['set'][column] is not None:
                    queryList.append(column + " = ?")
                    data.append(args['set'][column])

            args['data']    = data + args['data']
            set             = ", ".join(queryList)
            where           = ' AND '.join(args['where'][0].split(','))
            query           = "UPDATE " + args['table'][0] + " SET " + set + " WHERE " + where

            c = self.conn.cursor()
            try:
                c.execute(query, args['data'])
                self.conn.commit()
                return True, ''
            except sqlite3.OperationalError as e:
                self.Log.error(e)
                return False, e
