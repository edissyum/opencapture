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
    def __init__(self, log, db_type, db_name=None, user=None, pwd=None, host=None, port=None, file=None, conn=None):
        self.file = file
        self.conn = conn
        self.Log = log
        self.type = db_type
        self.host = host
        self.port = port
        self.user = user
        self.pwd = pwd
        self.dbName = db_name
        self.connect()

    def connect(self):
        if self.type == 'sqlite' and self.conn is None:
            try:
                self.conn = sqlite3.connect(self.file)
                self.conn.row_factory = sqlite3.Row
            except sqlite3.Error as e:
                self.Log.error('SQLITE connection error: ' + str(e))
                exit()

        elif self.type == 'pgsql' and self.conn is None:
            try:
                self.conn = psycopg2.connect(
                    "dbname     =" + self.dbName +
                    " user      =" + self.user +
                    " password  =" + self.pwd +
                    " host      =" + self.host +
                    " port      =" + self.port)
                self.conn.autocommit = True
            except (psycopg2.OperationalError, psycopg2.ProgrammingError) as e:
                self.Log.error('PGSQL connection error : ' + str(e))
                exit()

    def select(self, args):
        if 'table' not in args or 'select' not in args:
            self.Log.error('One or more required args are empty')
        else:
            tmp_table = args['table']
            args['table'] = args['table'][0]
            if 'left_join' in args:
                if (len(tmp_table) - 1) != len(args['left_join']):
                    self.Log.error("Number of tables doesn't match with number of joins")
                    self.Log.error(str(args))
                else:
                    cpt = 1
                    for joins in args['left_join']:
                        args['table'] += " LEFT JOIN " + tmp_table[cpt] + " ON " + joins + " "
                        cpt = cpt + 1

            if self.type != 'sqlite':
                if 'where' in args:
                    char_found = False
                    for cpt, value in enumerate(args['where']):
                        if 'strftime' in value:
                            column_name = value.split("'")[2].split(')')[0].replace(',', '').strip()
                            date_format = value.split("'")[1].replace('%Y', 'YYYY').replace('%m', 'mm').replace('%d', 'dd')
                            for char in re.finditer(r"[=<>]?", value):
                                if char.group():
                                    value = "to_char(" + column_name + ", '" + date_format + "') " + char.group() + " ?"
                                    char_found = True
                            if not char_found:
                                value = "to_char(" + column_name + ", '" + date_format + "') = ?"
                            args['where'][cpt] = value

                for cpt, value in enumerate(args['select']):
                    if 'strftime' in value:
                        column_name = value.split("'")[2].split(')')[0].replace(',', '').strip()
                        date_format = value.split("'")[1].replace('%Y', 'YYYY').replace('%m', 'mm').replace('%d', 'dd').replace('%H', 'HH24').replace('%M', 'MI').replace('%S', 'SS')
                        label = value.split("as")[1].strip()
                        value = "to_char(" + column_name + ", '" + date_format + "') as " + label

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

            if self.type == 'sqlite':
                c = self.conn.cursor()
            else:
                c = self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

            try:
                c.execute(query, args['data'])
                return c.fetchall()
            except sqlite3.OperationalError as e:
                self.Log.error('Error while querying SELECT : ' + str(e))
                return False

    def insert(self, args):
        if 'table' not in args:
            self.Log.error('One or more required args are empty')
        else:
            columns_list = []
            values_list = []
            for column in args['columns']:
                if args['columns'][column] is not None:
                    columns_list.append(column)
                    values_list.append(args['columns'][column].replace("'", "''").replace('\x0c', ''))

            columns = ", ".join(columns_list)
            values = "'" + "', '".join(values_list) + "'"

            query = "INSERT INTO " + args['table'] + " (" + columns + ") VALUES (" + values + ")"
            c = self.conn.cursor()
            try:
                c.execute(query)
                self.conn.commit()
                return True
            except sqlite3.OperationalError as e:
                self.Log.error('Error while querying INSERT : ' + str(e))
                return False

    def update(self, args):
        if args['table'] == [] or args['set'] == []:
            self.Log.error('One or more required args are empty')
        else:
            query_list = []
            data = []
            for column in args['set']:
                if args['set'][column] is not None:
                    query_list.append(column + " = ?")
                    data.append(args['set'][column])

            args['data'] = data + args['data']
            _set = ", ".join(query_list)
            where = ' AND '.join(args['where'][0].split(','))
            if self.type != 'sqlite':
                where = where.replace('?', '%s')
                _set = _set.replace('?', '%s')

            query = "UPDATE " + args['table'][0] + " SET " + _set + " WHERE " + where

            c = self.conn.cursor()
            try:
                c.execute(query, args['data'])
                self.conn.commit()
                return True, ''
            except sqlite3.OperationalError as e:
                self.Log.error('Error while querying UPDATE : ' + str(e))
                return False, e
