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

from src.backend.main import create_classes_from_custom_id
from src.backend.functions import retrieve_config_from_custom_id
from src.backend.import_controllers import auth
from src.backend.import_models import user

import sys
import argparse

if __name__ == '__main__':
    # Connexion à la base de données PostgreSQL
    parser = argparse.ArgumentParser(description='Load users from CSV file into database.')
    parser.add_argument("-c", '--custom-id', help='Custom id')
    args = parser.parse_args()

    if args.custom_id is None:
        sys.exit("Please provide custom id. "
                 "\n ex : python3 user_creation_notif.py --custom-id edissyum")

    if not retrieve_config_from_custom_id(args.custom_id):
        sys.exit('Custom config file couldn\'t be found')

    database, config, _, _, _, log, _, _, smtp, _, _, _ = create_classes_from_custom_id(args.custom_id, load_smtp=True)

    try:
        users_res = database.select({
            'select': ['id', 'username', 'lastname', 'firstname', 'email'],
            'table': ['users'],
            'where': ['password = %s'],
            'data': ['NOT_SET']
        })

        for _user in users_res:
            log.info("Default password found for user : " + _user['username'])
            if smtp and smtp.is_up:
                reset_token = auth.generate_reset_token(_user['id'])
                user = database.update({
                    'table': ['users'],
                    'set': {'reset_token': reset_token},
                    'where': ['id = %s'],
                    'data': [_user['id']]
                })

            smtp.send_forgot_password_email(_user['email'], "http://localhost/opencapture/dev_latest/dist/", reset_token)

    except Exception as e:
        print(e)
        log.error(e)
        sys.exit(1)
