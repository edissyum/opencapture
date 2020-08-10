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
import sqlite3
import psycopg2
import psycopg2.extras

class Database:
    def __init__(self, Log, db_type, db_name = None, user = None, pwd = None, host = None, port = None, file=None, conn=None):
        self.file   = file
        self.conn   = conn
        self.Log    = Log
        self.type   = db_type
        self.host   = host
        self.port   = port
        self.user   = user
        self.pwd    = pwd
        self.dbName = db_name
        self.connect()

    def connect(self):
        if self.type == 'sqlite' and self.conn is None:
            try:
                self.conn = sqlite3.connect(self.file)
                self.conn.row_factory = sqlite3.Row
            except sqlite3.Error as e:
                self.Log.error('SQLITE connection error: ' + str(e))
        elif self.type == 'pgsql' and self.conn is None:
            try:
                self.conn = psycopg2.connect(
                    "dbname     =" + self.dbName    +
                    " user      =" + self.user      +
                    " password  =" + self.pwd       +
                    " host      =" + self.host      +
                    " port      =" + self.port)
                self.conn.autocommit = True
            except psycopg2.OperationalError as e:
                self.Log.error('PGSQL connection error: ' + str(e))


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

            if self.type != 'sqlite':
                if 'where' in args:
                    char_found = False
                    for cpt, value in enumerate(args['where']):
                        if 'strftime' in value:
                            columnName = value.split("'")[2].split(')')[0].replace(',', '').strip()
                            dateFormat = value.split("'")[1].replace('%Y', 'YYYY').replace('%m', 'mm').replace('%d', 'dd')
                            for char in re.finditer(r"(=|<|>)?", value):
                                if char.group():
                                    value = "to_char(" + columnName + ", '" + dateFormat + "') " + char.group() + " ?"
                                    char_found = True
                            if not char_found:
                                value = "to_char(" + columnName + ", '" + dateFormat + "') = ?"
                            args['where'][cpt] = value

                for cpt, value in enumerate(args['select']):
                    if 'strftime' in value:
                        columnName = value.split("'")[2].split(')')[0].replace(',', '').strip()
                        dateFormat = value.split("'")[1].replace('%Y', 'YYYY').replace('%m', 'mm').replace('%d', 'dd').replace('%H', 'HH').replace('%M', 'MI')
                        label      = value.split("as")[1].strip()
                        value = "to_char(" + columnName + ", '" + dateFormat + "') as " + label
                        args['select'][cpt] = value

            select = ', '.join(args['select'])

            if 'where' not in args:
                where = ''
            else:
                where = ' WHERE ' + ' AND '.join(args['where']) + ' '

            if self.type != 'sqlite':
                where = where.replace('?', '%s')

            if 'order_by' not in args:
                order_by = ''
            else:
                order_by = ' ORDER BY ' + ', '.join(args['order_by']) + ' '

            if 'limit' not in args:
                limit = ''
            else:
                limit = ' LIMIT ' + str(args['limit'])

            if 'offset' not in args:
                offset = ''
            else:
                offset = ' OFFSET ' + str(args['offset'])

            if 'group_by' not in args:
                group_by = ''
            else:
                group_by = ' GROUP BY ' + str(args['group_by'])

            if 'data' not in args:
                args['data'] = []

            query = "SELECT " + select + " FROM " + args['table'] + where + order_by + limit + offset + group_by
            print(query)
            if self.type == 'sqlite':
                c = self.conn.cursor()
            else:
                c = self.conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor)

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
            if self.type != 'sqlite':
                where = where.replace('?', '%s')
                set = set.replace('?', '%s')

            query           = "UPDATE " + args['table'][0] + " SET " + set + " WHERE " + where

            c = self.conn.cursor()
            try:
                c.execute(query, args['data'])
                self.conn.commit()
                return True, ''
            except sqlite3.OperationalError as e:
                self.Log.error(e)
                return False, e
