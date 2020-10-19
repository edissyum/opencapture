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

if 'Locale' not in custom_array: from bin.src.classes.Locale import Locale as _Locale
else: _Locale = getattr(__import__(custom_array['Locale']['path'] + '.' + custom_array['Locale']['module'], fromlist=[custom_array['Locale']['module']]), custom_array['Locale']['module'])

if 'PyTesseract' not in custom_array: from bin.src.classes.PyTesseract import PyTesseract as _PyTesseract
else: _PyTesseract = getattr(__import__(custom_array['PyTesseract']['path'] + '.' + custom_array['PyTesseract']['module'], fromlist=[custom_array['PyTesseract']['module']]), custom_array['PyTesseract']['module'])

if 'Database' not in custom_array: from bin.src.classes.Database import Database as _Database
else: _Database = getattr(__import__(custom_array['Database']['path'] + '.' + custom_array['Database']['module'], fromlist=[custom_array['Database']['module']]), custom_array['Database']['module'])

if 'Splitter' not in custom_array: from bin.src.classes.Splitter import Splitter as _Splitter
else: _Splitter = getattr(__import__(custom_array['Splitter']['path'] + '.' + custom_array['Splitter']['module'], fromlist=[custom_array['Splitter']['module']]), custom_array['Splitter']['module'])

if 'OCForInvoices_splitter' not in custom_array: from bin.src.process import OCForInvoices_splitter
else: OCForInvoices_splitter = getattr(__import__(custom_array['OCForInvoices_splitter']['path'] , fromlist=[custom_array['OCForInvoices_splitter']['module']]), custom_array['OCForInvoices_splitter']['module'])

OCforInvoices = Kuyruk()

OCforInvoices.config.MANAGER_HOST         = "127.0.0.1"
OCforInvoices.config.MANAGER_PORT         = 16502
OCforInvoices.config.MANAGER_HTTP_PORT    = 16503

m = Manager(OCforInvoices)

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

# If needed just run "kuyruk --app bin.src.main_splitter.OCforInvoices_Sep manager" to have web dashboard of current running worker
@OCforInvoices.task(queue='splitter')
def launch(args):
    start = time.time()

    # Init all the necessary classes
    configName  = _Config(args['config'])
    cfgName     = configName.cfg['PROFILE']['cfgpath'] + '/config_' + configName.cfg['PROFILE']['id'] + '.ini'

    if not os.path.exists(cfgName):
        sys.exit('Config file couldn\'t be found')

    Config      = _Config(configName.cfg['PROFILE']['cfgpath'] + '/config_' + configName.cfg['PROFILE']['id'] + '.ini')

    tmpFolder   = tempfile.mkdtemp(dir=Config.cfg['SPLITTER']['tmpbatchpath']) + '/'
    fileName    = tempfile.NamedTemporaryFile(dir=tmpFolder).name

    Locale      = _Locale(Config)
    Log         = _Log(Config.cfg['GLOBAL']['logfile'])
    Ocr         = _PyTesseract(Locale.localeOCR, Log, Config)
    dbType      = Config.cfg['DATABASE']['databasetype']
    dbUser      = Config.cfg['DATABASE']['postgresuser']
    dbPwd       = Config.cfg['DATABASE']['postgrespassword']
    dbName      = Config.cfg['DATABASE']['postgresdatabase']
    dbHost      = Config.cfg['DATABASE']['postgreshost']
    dbPort      = Config.cfg['DATABASE']['postgresport']
    Database    = _Database(Log, dbType, dbName, dbUser, dbPwd, dbHost, dbPort, Config.cfg['DATABASE']['databasefile'])
    Splitter    = _Splitter(Config, Database, Locale)
    Xml         = _Xml(Config, Database)
    Files       = _Files(
        fileName,
        int(Config.cfg['GLOBAL']['resolution']),
        int(Config.cfg['GLOBAL']['compressionquality']),
        Xml,
        Log,
        Config.cfg['GLOBAL']['convertpdftotiff']
    )

    # Connect to database
    Database.connect()

    # Start process
    if args['file'] is not None:
        path = args['file']
        if check_file(Files, path, Config, Log) is not False:
            # Process the file and send it to Maarch
            OCForInvoices_splitter.process(path, Log, Splitter, Files, Ocr, tmpFolder)

    # Empty the tmp dir to avoid residual file
    # recursive_delete(tmpFolder, Log)
    # Close database
    Database.conn.close()

    end = time.time()
    Log.info('Process end after ' + timer(start,end) + '')
