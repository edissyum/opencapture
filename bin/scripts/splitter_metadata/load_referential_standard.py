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
from datetime import datetime
from requests.auth import HTTPBasicAuth


def load_referential(args):
    """
    :param args: arguments to use (log, database, config, form_id, method_id, docservers)
    :return: N/A
    """
    next_demand_number = args['database'].get_sequence_value(args['method_data']['databaseSequence'])
    params = {
        'num_requete': next_demand_number,
        'type_referentiel': args['method_data']['referentialMode']
    }

    r = requests.get(url=args['method_data']['wsUrl'], params=params, auth=HTTPBasicAuth(args['method_data']['user'],
                                                                                         args['method_data']['password']),
                     verify=False)
    try:
        data = r.json()
    except:
        args['log'].info("Alfresco returned empty response")
        return

    if 'referentiel' not in data or 'error' in data:
        args['log'].error(f"Alfresco response : {str(data)}")
        return

    for referential in data['referentiel']:
        if args['method_data']['externalId'] not in referential:
            args['log'].info("ID not found " + str(referential.encode('utf-8')))
            continue

        external_id = referential[args['method_data']['externalId']]
        metadata = args['database'].select({
            'select': ['*'],
            'table': ['metadata'],
            'where': ['external_id = %s', 'type = %s', 'form_id = %s'],
            'data': [str(external_id), 'referential', args['form_id']]
        })
        if not metadata:
            args['database'].insert({
                'table': 'metadata',
                'columns': {
                    'type': "referential",
                    'form_id': args['form_id'],
                    'external_id': str(external_id),
                    'data': json.dumps(referential)
                }
            })
            args['log'].info(f"Inserted metadata external_id : {str(external_id)}")
        else:
            args['database'].update({
                'table': ['metadata'],
                'set': {
                    'last_edit': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'data': json.dumps(referential)
                },
                'where': ['external_id = %s', 'type = %s', 'form_id = %s'],
                'data': [str(external_id), 'referential', args['form_id']]
            })
            args['log'].info(f"Upated metadata external_id : {str(external_id)}")

    args['database'].set_sequence_value(args['method_data']['databaseSequence'], next_demand_number + 1)
