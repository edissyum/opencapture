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
# @dev : Oussama Brich <nathan.cheval@outlook.fr>

import jwt
import psycopg
from psycopg.rows import dict_row
from datetime import datetime, timezone, timedelta
from src.backend.import_classes import _Config

CUSTOM_ID = 'test'
PROJECT_PATH = '/var/www/html/opencapture/'


def get_db():
    config = _Config(f'{PROJECT_PATH}/custom/{CUSTOM_ID}/config/config.ini')
    conn = psycopg.connect(dbname=config.cfg['DATABASE']['postgresdatabase'],
                           user=config.cfg['DATABASE']['postgresuser'],
                           password=config.cfg['DATABASE']['postgrespassword'],
                           host=config.cfg['DATABASE']['postgreshost'],
                           port=config.cfg['DATABASE']['postgresport'],
                           row_factory=dict_row)
    cursor = conn.cursor()
    conn.autocommit = True
    return cursor


def get_token(user_id):
    with open(f'{PROJECT_PATH}/custom/{CUSTOM_ID}/config/secret_key', encoding='UTF-8') as secret_key_file:
        secret_key = secret_key_file.read().replace('\n', '')
    try:
        payload = {
            'exp': datetime.now(timezone.utc) + timedelta(minutes=1440, seconds=0),
            'iat': datetime.now(timezone.utc),
            'sub': user_id
        }
        return jwt.encode(
            payload,
            secret_key,
            algorithm='HS512'
        )
    except (Exception,) as _e:
        return str(_e)
