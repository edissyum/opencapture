# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
import json
import os
import sys
import time
import tempfile
from symbol import import_from

from kuyruk import Kuyruk
from src.backend.import_process import OCForInvoices_splitter
from src.backend.main import timer, check_file, create_classes
from src.backend.import_classes import _Files, _Config, _Splitter, _SeparatorQR, _Log, _Mail

OCforInvoices = Kuyruk()


@OCforInvoices.task(queue='splitter')
def launch(args):
    start = time.time()

    # Init all the necessary classes
    config_name = _Config(args['config'])
    config_file = config_name.cfg['PROFILE']['cfgpath'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini'

    if not os.path.exists(config_file):
        sys.exit('Config file couldn\'t be found')

    config, locale, log, ocr, database, spreadsheet, smtp = create_classes(config_file)
    tmp_folder = tempfile.mkdtemp(dir=config.cfg['SPLITTER']['batchpath']) + '/'
    filename = tempfile.NamedTemporaryFile(dir=tmp_folder).name
    files = _Files(filename, log, locale, config)
    separator_qr = _SeparatorQR(log, config, tmp_folder, 'splitter', files)
    splitter = _Splitter(config, database, locale, separator_qr, log)

    if args.get('isMail') is not None and args['isMail'] is True:
        log = _Log((args['log']), smtp)
        log.info('Process attachment n°' + args['cpt'] + '/' + args['nb_of_attachments'])

    database.connect()
    if args['file'] is not None:
        path = args['file']
        if check_file(files, path, config, log) is not False:
            splitter_method = database.select({
                'select': ['splitter_method_id'],
                'table': ['inputs'],
                'where': ['status <> %s and input_id = %s'],
                'data': ['DEL', args['input_id']]
            })[0]
            available_split_methods_path = "bin/scripts/splitter_methods/splitter_methods.json"
            if len(splitter_method) > 0 and os.path.isfile(available_split_methods_path):
                with open(available_split_methods_path) as json_file:
                    available_split_methods = json.load(json_file)
                    for available_split_method in available_split_methods['methods']:
                        if available_split_method['id'] == splitter_method['splitter_method_id']:
                            split_method = import_from(available_split_method['path'], available_split_method['method'])
                            log.info('Split using method : {}'.format(available_split_method['id']))
                            split_method(args, path, log, splitter, files, tmp_folder, config)
    database.conn.close()
    end = time.time()
    log.info('Process end after ' + timer(start, end) + '')


def import_from(path, method):
    """
    Import an attribute, function or class from a module.
    :param method: Method to call
    :param path: A path descriptor in the form of 'pkg.module.submodule:attribute'
    :type path: str
    """
    path = path.replace('/', '.').replace('.py', '')
    module = __import__(path, fromlist=method)
    return getattr(module, method)
