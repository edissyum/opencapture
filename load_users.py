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

# @dev : Oussama BRICH <oussama.brich@edissyum.com>

import os
import sys
import csv
import json
import argparse

from src.backend.main import create_classes_from_custom_id
from src.backend.functions import retrieve_config_from_custom_id

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Load users from CSV file into database.')
    parser.add_argument("-f", '--file', help='CSV file')
    parser.add_argument("-c", '--custom-id', help='Custom id')
    parser.add_argument("-s", '--skip-header', help='Skip header row', action='store_true')
    parser.set_defaults(skip_header=False)
    args = parser.parse_args()

    if args.custom_id is None:
        sys.exit("Please provide custom id. "
                 "\n ex : python3 load_users.py --file users.csv --custom-id edissyum --skip-header")

    if not retrieve_config_from_custom_id(args.custom_id):
        sys.exit('Custom config file couldn\'t be found')

    database, config, _, _, _, log, _, _, _, _, _, _, _ = create_classes_from_custom_id(args.custom_id)

    if args.file is None and os.path.isfile(args.file):
        log.info("Please provide an existing the users CSV file. \n Ex : python3 load_users.py --file users.csv --custom-id edissyum")
        exit(1)

    with open(args.file, 'r') as f:
        reader = csv.reader(f)

        if args.skip_header:
            next(reader)

        for row in reader:
            log.info("User: " + row[0])
            user = {
                'username': row[0],
                'lastname': row[1],
                'firstname': row[2],
                'password': 'NOT_SET',
                'email': row[3],
                'customer_id': None,
                'role': row[4] if type(row[4]) == int else 3,
            }
            users_res = database.select({
                'select': ['id'],
                'table': ['users'],
                'where': ['username = %s'],
                'data': [user['username']]
            })
            if users_res:
                log.info(f"User {user['username']} already exists, Skipping.")
                continue

            user_id = database.insert({
                'table': 'users',
                'columns': {
                    'username': user['username'],
                    'lastname': user['lastname'],
                    'firstname': user['firstname'],
                    'password': user['password'],
                    'role': user['role'],
                    'email': user['email']
                }
            })

            if len(row) > 5:
                user['customer_name'] = row[5]
                user_customers = database.select({
                    'select': ['id'],
                    'table': ['accounts_customer'],
                    'where': ['name = %s'],
                    'data': [user['customer_name']]
                })
                if user_customers:
                    user['customer_id'] = user_customers[0]['id']
                else:
                    log.info(f"Customer {user['customer_name']} not found. creating customer {user['username']}.")
                    user['customer_id'] = database.insert({
                        'table': 'accounts_customer',
                        'columns': {
                            'name': user['customer_name'],
                            'module': 'splitter'
                        }
                    })

            _user_customers = [user['customer_id']] if user['customer_id'] else []
            database.insert({
                'table': 'users_customers',
                'columns': {
                    'user_id': user_id,
                    'customers_id': json.dumps({"data": str(_user_customers)})
                }
            })

            database.insert({
                'table': 'users_forms',
                'columns': {
                    'user_id': user_id,
                    'forms_id': json.dumps({"data": str([])})
                }
            })
            log.info(f"User {user['username']} created with id {user_id}.")

    # Commit and close database connection
    database.conn.commit()
    database.conn.close()
