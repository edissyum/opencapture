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
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/>.

# @dev : Oussama BRICH <oussama.brich@edissyum.com>

import json
import requests
from operator import itemgetter
from requests.auth import HTTPBasicAuth


def load_entities(args):
    """
    :param args: arguments to use (log, database, config, form_id, method_id, docservers)
    :return: N/A
    """
    """
        Get entities list from MEM
    """
    r = requests.get(url=args['method_data']['wsUrl'], auth=HTTPBasicAuth(args['method_data']['user'],
                                                                           args['method_data']['password']))
    data = r.json()
    options = []
    for entity in data['entities']:
        options.append({
            "id": str(entity['serialId']),
            "label": entity['entity_label'].replace('\'', '\u2019')
        })
    options = sorted(options, key=itemgetter('label'))
    """
        Update options in custom field
    """
    cursor = args['database'].conn.cursor()
    query = "UPDATE custom_fields SET settings = jsonb_set(settings, '{options}', '" + json.dumps(options) + "')" \
            "WHERE label_short='entity' AND enabled='true' AND status='OK' AND module='splitter'"

    cursor.execute(query)
    args['database'].conn.commit()

    """
        Update options in form fields
    """
    form_models_fields = args['database'].select({
        'select': ['*'],
        'table': ['form_models_field'],
        'where': ['form_id = %s'],
        'data': [args['method_data']['formId']]
    })

    for form_models_field in form_models_fields:
        for field in form_models_field['fields']['document_metadata']:
            if 'settings' in field:
                field['settings']['options'] = options
        query = "UPDATE form_models_field SET fields = jsonb_set(fields, '{document_metadata}', '" + \
                json.dumps(form_models_field['fields']['document_metadata']) + "') " + \
                "WHERE form_id = " + str(args['method_data']['formId'])
        cursor.execute(query)
        args['database'].conn.commit()
