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
from datetime import datetime
import json

import requests
from requests.auth import HTTPBasicAuth


def load_referential(args):
    """
    :param args: arguments to use (log, database, config, form_id, method_id, docservers)
    :return: N/A
    """
    next_demand_number = args['database'].get_sequence_value('splitter_referential_call_count')[0][0]
    params = {
        'num_requete': next_demand_number,
        'type_referentiel': args['method_data']['referentialMode']
    }

    r = requests.get(url=args['method_data']['wsUrl'], params=params, auth=HTTPBasicAuth(args['method_data']['user'],
                                                                                       args['method_data']['password']),
                     verify=False)
    data = r.json()

    if 'referentiel' not in data or 'code_erreur' not in data:
        args['log'].error(f"Alfresco returned response : {str(data)}")
        return

    if not data['referentiel'] and data['code_erreur'] == 0:
        return

    for referential in data['referentiel']:
        referential['date_naissance'] = referential['date_naissance'] if 'date_naissance' in referential else ''

        if 'demandes' in referential:
            for demand_index, demand in enumerate(referential['demandes']):
                external_id = '-'.join([str(referential['numero_dossier']), str(demand['numero_demande'])])
                referential['numero_demande'] = demand['numero_demande'] if 'numero_demande' in demand else ''
                referential['type_demande'] = demand['type_demande'] if 'type_demande' in demand else ''

                metadata = args['database'].select({
                    'select': ['*'],
                    'table': ['metadata'],
                    'where': ['external_id = %s', 'type = %s'],
                    'data': [external_id, 'referential'],
                })
                if not metadata:
                    args['database'].insert({
                        'table': 'metadata',
                        'columns': {
                            'type': "referential",
                            'form_id': args['form_id'],
                            'external_id': external_id,
                            'data': json.dumps(referential),
                        }
                    })
                    args['log'].info(f"Inserted metadata external_id : {external_id}")
                else:
                    args['database'].update({
                        'table': ['metadata'],
                        'set': {
                            'last_edit': datetime.now(),
                            'data': json.dumps(referential),
                        },
                        'where': ['external_id = %s', 'type = %s'],
                        'data': [external_id, 'referential']
                    })
                    args['log'].info(f"Upated metadata external_id : {external_id}")

                # Archive line with no demand if a new demand is added
                args['database'].update({
                    'table': ['metadata'],
                    'set': {
                        'last_edit': datetime.now(),
                        'type': 'referential-archive',
                    },
                    'where': ['external_id = %s', 'type = %s'],
                    'data': [str(referential['numero_dossier']), 'referential']
                })
        else:
            referential['numero_demande'] = ''
            referential['type_demande'] = ''
            args['database'].insert({
                'table': 'metadata',
                'columns': {
                    'type': "referential",
                    'form_id': args['form_id'],
                    'external_id': referential['numero_dossier'],
                    'data': json.dumps(referential),
                }
            })

        args['log'].info(f"Inserted metadata external_id : {referential['numero_dossier']}")

    args['database'].set_sequence_value('splitter_referential_call_count', next_demand_number + 1)
