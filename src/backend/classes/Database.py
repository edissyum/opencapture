# This file is part of Open-Capture.

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import psycopg
from psycopg.rows import dict_row


class Database:
    def __init__(self, log, db_name=None, user=None, pwd=None, host=None, port=None, conn=None):
        self.log = log
        self.pwd = pwd
        self.host = host
        self.port = port
        self.user = user
        self.conn = conn
        self.db_name = db_name

        self.connect()

    def connect(self):
        if self.conn is None:
            try:
                self.conn = psycopg.connect(
                    dbname=self.db_name,
                    user=self.user,
                    password=self.pwd,
                    host=self.host,
                    port=self.port,
                    row_factory=dict_row)
                self.conn.autocommit = True
            except (psycopg.OperationalError, psycopg.ProgrammingError) as pgsql_error:
                self.log.error('PGSQL connection error : ' + str(pgsql_error), False)
                self.conn = False

    def select(self, args):
        if 'table' not in args or 'select' not in args:
            self.log.error('One or more required args are empty', False)
        elif not isinstance(args['table'], list):
            self.log.error('Table argument must be a list', False)
        else:
            tmp_table = args['table']
            args['table'] = args['table'][0]
            if 'left_join' in args:
                if (len(tmp_table) - 1) != len(args['left_join']):
                    self.log.error("Number of tables doesn't match with number of joins", False)
                    self.log.error(str(args), False)
                else:
                    cpt = 1
                    for joins in args['left_join']:
                        args['table'] += " LEFT JOIN " + tmp_table[cpt] + " ON " + joins + " "
                        cpt = cpt + 1

            select = ', '.join(args['select'])

            if 'where' not in args or args['where'] in ['', []]:
                where = ''
            else:
                where = ' WHERE ' + ' AND '.join(args['where']) + ' '

            if 'order_by' not in args or args['order_by'] in ['', []]:
                order_by = ''
            else:
                order_by = ' ORDER BY ' + ', '.join(args['order_by']) + ' '

            if 'limit' not in args or args['limit'] in ['', []]:
                limit = ''
            else:
                limit = ' LIMIT ' + str(args['limit'])

            if 'offset' not in args or args['offset'] in ['', []]:
                offset = ''
            else:
                offset = ' OFFSET ' + str(args['offset'])

            if 'group_by' not in args or args['group_by'] in ['', []]:
                group_by = ''
            else:
                group_by = ' GROUP BY ' + ', '.join(args['group_by']) + ' '

            if 'data' not in args or args['data'] in ['', []]:
                args['data'] = []

            query = "SELECT " + select + " FROM " + args['table'] + where + group_by + order_by + limit + offset
            try:
                with self.conn.cursor() as cursor:
                    cursor.execute(query, args['data'])
                    res = cursor.fetchall()
                return res
            except psycopg.OperationalError as pgsql_error:
                self.log.error('Error while querying SELECT : ' + str(pgsql_error), False)
                return False

    def insert(self, args):
        if 'table' not in args:
            self.log.error('One or more required args are empty', False)
        else:
            data = []
            values = ''
            columns = ''
            for column in args['columns']:
                if args['columns'][column] is not None:
                    values += "%s, "
                    columns += column + ", "
                    data.append(str(args['columns'][column]).replace('\x0c', ''))

            values = values.rstrip(', ')
            columns = columns.rstrip(', ')

            query = "INSERT INTO " + args['table'] + " (" + columns + ") VALUES (" + values + ") RETURNING id"
            try:
                with self.conn.cursor() as cursor:
                    cursor.execute(query, data)
                    new_row_id = cursor.fetchone()['id']
                return new_row_id
            except psycopg.OperationalError as pgsql_error:
                self.log.error('Error while querying INSERT : ' + str(pgsql_error), False)
                return False

    def update(self, args):
        if args['table'] == [] or args['set'] == []:
            self.log.error('One or more required args are empty', False)
        elif not isinstance(args['table'], list):
            self.log.error('Table argument must be a list', False)
        else:
            data = []
            query_set = ''
            for column in args['set']:
                if args['set'][column] is not None and (type(args['set'][column]) not in (bool, int)
                                                        and 'jsonb_set' in args['set'][column]):
                    query_set += column + " = " + args['set'][column] + ", "
                else:
                    query_set += column + " = %s, "
                    data.append(args['set'][column])

            query_set = query_set.rstrip(', ')
            args['data'] = data + args['data']
            where = ' AND '.join(args['where'])

            query = "UPDATE " + args['table'][0] + " SET " + query_set + " WHERE " + where
            try:
                with self.conn.cursor() as cursor:
                    cursor.execute(query, args['data'])
                return True, ''
            except (psycopg.OperationalError, psycopg.errors.InvalidTextRepresentation) as pgsql_error:
                self.log.error('Error while querying UPDATE : ' + str(pgsql_error), False)
                return False, pgsql_error

    def get_sequence_value(self, name):
        query = f"SELECT last_value FROM {name};"
        try:
            with self.conn.cursor() as cursor:
                cursor.execute(query)
                last_value = cursor.fetchone()
            return last_value['last_value']
        except psycopg.OperationalError as pgsql_error:
            self.log.error('Error while querying SELECT : ' + str(pgsql_error), False)
            return False

    def set_sequence_value(self, name, value):
        query = f"SELECT setval('{name}', {value});"
        try:
            self.conn.cursor().execute(query, {})
            return self.conn.cursor().fetchall()
        except psycopg.OperationalError as pgsql_error:
            self.log.error('Error while querying SELECT : ' + str(pgsql_error), False)
            return False
