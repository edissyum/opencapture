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

import json
import argparse

from custom.release.bin.scripts.splitter_metadata.load_referential_standard import load_referential as load_referential_standart
from custom.release.bin.scripts.splitter_metadata.load_referential import load_referential
from src.backend.main import create_classes_from_custom_id

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Reload metadata for Splitter.')
    parser.add_argument("-m", '--methods', help='Config JSON for matadata methods')
    parser.add_argument("-c", '--custom-id', help='Custom id')
    args = parser.parse_args()
    database, config, _, _, _, log, _, _, _, docservers, _, _, _ = create_classes_from_custom_id(args.custom_id)

    with open(args.methods) as split_methods:
        split_methods = split_methods.read()
        split_methods = json.loads(split_methods)
        cursor = database.conn.cursor()
        cursor.execute("TRUNCATE TABLE metadata", {})

        for method in split_methods['methods']:
            method['referentialMode'] = 0
            if method['id'] in ["alfresco_referential_stadart"]:
                log.info(f"Reload metadata for {method['id']}....")
                _args = {
                    'log': log,
                    'config': config,
                    'database': database,
                    'method_data': method,
                    'docservers': docservers,
                    'form_id': method['form_id']
                }
                load_referential_standart(_args)
                log.info(f"{method['id']} metadata reload with success.")
            elif method['id'] in ["alfresco_referential"]:
                log.info(f"Reload metadata for {method['id']}....")
                _args = {
                    'log': log,
                    'config': config,
                    'database': database,
                    'method_data': method,
                    'docservers': docservers,
                    'form_id': method['form_id']
                }
                load_referential(_args)
                log.info(f"{method['id']} metadata reload with success.")

    # Commit and close database connection
    database.conn.commit()
    database.conn.close()
