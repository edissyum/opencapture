# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
import os
import sys
import time
import queue
import tempfile

# useful to use the worker and avoid ModuleNotFoundError
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from kuyruk import Kuyruk
from kuyruk_manager import Manager
from webApp.functions import get_custom_id, check_python_customized_files

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'Config' not in custom_array: from bin.src.classes.Config import Config as _Config
else: _Config = getattr(__import__(custom_array['Config']['path'] + '.' + custom_array['Config']['module'], fromlist=[custom_array['Config']['module']]), custom_array['Config']['module'])

if 'Log' not in custom_array: from bin.src.classes.Log import Log as _Log
else: _Log = getattr(__import__(custom_array['Log']['path'] + '.' + custom_array['Log']['module'], fromlist=[custom_array['Log']['module']]), custom_array['Log']['module'])

if 'Files' not in custom_array: from bin.src.classes.Files import Files as _Files
else: _Files = getattr(__import__(custom_array['Files']['path'] + '.' + custom_array['Files']['module'], fromlist=[custom_array['Files']['module']]), custom_array['Files']['module'])

if 'Xml' not in custom_array: from bin.src.classes.Xml import Xml as _Xml
else: _Xml = getattr(__import__(custom_array['Xml']['path'] + '.' + custom_array['Xml']['module'], fromlist=[custom_array['Xml']['module']]), custom_array['Xml']['module'])

if 'WebServices' not in custom_array: from bin.src.classes.WebServices import WebServices as _WebServices
else: _WebServices = getattr(__import__(custom_array['WebServices']['path'] + '.' + custom_array['WebServices']['module'], fromlist=[custom_array['WebServices']['module']]), custom_array['WebServices']['module'])

if 'Locale' not in custom_array: from bin.src.classes.Locale import Locale as _Locale
else: _Locale = getattr(__import__(custom_array['Locale']['path'] + '.' + custom_array['Locale']['module'], fromlist=[custom_array['Locale']['module']]), custom_array['Locale']['module'])

if 'PyTesseract' not in custom_array: from bin.src.classes.PyTesseract import PyTesseract as _PyTesseract
else: _PyTesseract = getattr(__import__(custom_array['PyTesseract']['path'] + '.' + custom_array['PyTesseract']['module'], fromlist=[custom_array['PyTesseract']['module']]), custom_array['PyTesseract']['module'])

if 'Database' not in custom_array: from bin.src.classes.Database import Database as _Database
else: _Database = getattr(__import__(custom_array['Database']['path'] + '.' + custom_array['Database']['module'], fromlist=[custom_array['Database']['module']]), custom_array['Database']['module'])

if 'SeparatorQR' not in custom_array: from bin.src.classes.SeparatorQR import SeparatorQR as _SeparatorQR
else: _SeparatorQR = getattr(__import__(custom_array['SeparatorQR']['path'] + '.' + custom_array['SeparatorQR']['module'], fromlist=[custom_array['SeparatorQR']['module']]), custom_array['SeparatorQR']['module'])

if 'OCForInvoices' not in custom_array: from bin.src.process import OCForInvoices as OCForInvoices_process
else: OCForInvoices_process = getattr(__import__(custom_array['OCForInvoices']['path'] , fromlist=[custom_array['OCForInvoices']['module']]), custom_array['OCForInvoices']['module'])

OCforInvoices_worker = Kuyruk()

OCforInvoices_worker.config.MANAGER_HOST         = "127.0.0.1"
OCforInvoices_worker.config.MANAGER_PORT         = 16501
OCforInvoices_worker.config.MANAGER_HTTP_PORT    = 16500

m = Manager(OCforInvoices_worker)

def check_file(Files, path, Config, Log):
    if not Files.check_file_integrity(path, Config):
        Log.error('The integrity of file could\'nt be verified : ' + str(path))
        return False

def timer(startTime, endTime):
    hours, rem = divmod(endTime - startTime, 3600)
    minutes, seconds = divmod(rem, 60)
    return "{:0>2}:{:0>2}:{:05.2f}".format(int(hours), int(minutes), seconds)

def recursive_delete(folder, Log):
    for file in os.listdir(folder):
        try:
            os.remove(folder + '/' + file)
        except FileNotFoundError as e:
            Log.error('Unable to delete ' + folder + '/' + file + ' on temp folder: ' + str(e))
    try:
        os.rmdir(folder)
    except FileNotFoundError as e:
        Log.error('Unable to delete ' + folder + ' on temp folder: ' + str(e))

# If needed just run "kuyruk --app bin.src.main.OCforInvoices manager" to have web dashboard of current running worker
@OCforInvoices_worker.task(queue='invoices')
def launch(args):
    start = time.time()

    # Init all the necessary classes
    configName  = _Config(args['config'])
    cfgName     = configName.cfg['PROFILE']['cfgpath'] + '/config_' + configName.cfg['PROFILE']['id'] + '.ini'

    if not os.path.exists(cfgName):
        sys.exit('Config file couldn\'t be found')

    Config      = _Config(configName.cfg['PROFILE']['cfgpath'] + '/config_' + configName.cfg['PROFILE']['id'] + '.ini')
    Locale      = _Locale(Config)
    Log         = _Log(Config.cfg['GLOBAL']['logfile'])
    Ocr         = _PyTesseract(Locale.localeOCR, Log, Config)
    Separator   = _SeparatorQR(Log, Config)
    Database    = _Database(Log, Config.cfg['DATABASE']['databasefile'])
    Xml         = _Xml(Config, Database)

    tmpFolder   = tempfile.mkdtemp(dir=Config.cfg['GLOBAL']['tmppath'])
    fileName    = tempfile.NamedTemporaryFile(dir=tmpFolder).name

    Files       = _Files(
        fileName,
        int(Config.cfg['GLOBAL']['resolution']),
        int(Config.cfg['GLOBAL']['compressionquality']),
        Xml,
        Log,
        Config.cfg['GLOBAL']['convertpdftotiff']
    )

    if Config.cfg['GED']['enabled'] != 'False':
        WebServices = _WebServices(
            Config.cfg['GED']['host'],
            Config.cfg['GED']['user'],
            Config.cfg['GED']['password'],
            Log,
            Config
        )
    else:
        WebServices = False

    # Connect to database
    Database.connect()

    # Start process
    if args['path'] is not None:
        path = args['path']
        for file in os.listdir(path):
            if check_file(Files, path + file, Config, Log) is not False:
                # Create the Queue to store files
                q = queue.Queue()

                # Find file in the wanted folder (default or exported pdf after qrcode separation)
                q = OCForInvoices_process.process(args, path + file, Log, Separator, Config, Files, Ocr, Locale, Database, WebServices, q)

                if not q:
                    continue

    elif args['file'] is not None:
        path = args['file']
        if check_file(Files, path, Config, Log) is not False:
            # Process the file and send it to Maarch
            OCForInvoices_process.process(args, path, Log, Separator, Config, Files, Ocr, Locale, Database, WebServices)

    # Empty the tmp dir to avoid residual file
    recursive_delete(tmpFolder, Log)
    # Close database
    Database.conn.close()

    end = time.time()
    Log.info('Process end after ' + timer(start,end) + '')
