# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# See LICENCE file at the root folder for more details.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
# @dev : Oussama Brich <nathan.cheval@outlook.fr>

import os
import sys
import jwt
import psycopg
from pathlib import Path
from psycopg.rows import dict_row
from datetime import datetime, timezone, timedelta

CUSTOM_ID = 'test'
BACKEND_PATH = str(Path(__file__).resolve().parents[2])
PROJECT_PATH = './'

if BACKEND_PATH not in sys.path:
    sys.path.insert(0, BACKEND_PATH)

def get_db():
    conn = psycopg.connect(dbname=os.environ['POSTGRES_DB'],
                           user=os.environ['POSTGRES_USER'],
                           password=os.environ['POSTGRES_PASSWORD'],
                           host=os.environ['POSTGRES_HOST'],
                           port=os.environ['POSTGRES_PORT'],
                           row_factory=dict_row)
    cursor = conn.cursor()
    conn.autocommit = True
    return cursor


def get_token(user_id):
    with open(f'{PROJECT_PATH}/custom/{CUSTOM_ID}/config/secret_key', encoding='utf-8') as secret_key_file:
        secret_key = secret_key_file.read().replace('\n', '')

    try:
        payload = {
            'exp': datetime.now(timezone.utc) + timedelta(minutes=1440, seconds=0),
            'iat': datetime.now(timezone.utc),
            'sub': str(user_id)
        }
        return jwt.encode(
            payload,
            secret_key,
            algorithm='HS512'
        )
    except (Exception,) as _e:
        return str(_e)
