import click

from flask import current_app, g
from flask.cli import with_appcontext
from webApp.functions import get_custom_id, check_python_customized_files

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'Config' not in custom_array: from bin.src.classes.Config import Config as _Config
else: _Config = getattr(__import__(custom_array['Config']['path'] + '.' + custom_array['Config']['module'], fromlist=[custom_array['Config']['module']]), custom_array['Config']['module'])

if 'Database' not in custom_array: from bin.src.classes.Database import Database as _Database
else: _Database = getattr(__import__(custom_array['Database']['path'] + '.' + custom_array['Database']['module'], fromlist=[custom_array['Database']['module']]), custom_array['Database']['module'])

if 'Log' not in custom_array: from bin.src.classes.Log import Log as _Log
else: _Log = getattr(__import__(custom_array['Log']['path'] + '.' + custom_array['Log']['module'], fromlist=[custom_array['Log']['module']]), custom_array['Log']['module'])

def init():
    # Init all the necessary classes
    configName = _Config(current_app.config['CONFIG_FILE'])
    Config = _Config(configName.cfg['PROFILE']['cfgpath'] + '/config_' + configName.cfg['PROFILE']['id'] + '.ini')
    dbType = Config.cfg['DATABASE']['databasetype']
    dbName = Config.cfg['DATABASE']['postgresdatabase']
    dbUser = Config.cfg['DATABASE']['postgresuser']
    dbPwd  = Config.cfg['DATABASE']['postgrespassword']
    dbHost = Config.cfg['DATABASE']['postgreshost']
    dbPort = Config.cfg['DATABASE']['postgresport']

    Log = _Log(Config.cfg['GLOBAL']['logfile'])
    db = _Database(Log, dbType, dbName, dbUser, dbPwd, dbHost, dbPort, Config.cfg['DATABASE']['databasefile'])

    return {'db' : db, 'type': dbType}

def get_db():
    if 'db' not in g:
        g.db = init()['db']
    return g.db

def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.conn.close()

def init_db():
    info_db = init()
    db = info_db['db']
    if info_db['type'] != 'pgsql':
        with current_app.open_resource('schema.sql') as f:
            cursor = db.conn.cursor()
            cursor.executescript(f.read().decode('utf8'))
    else:
        with current_app.open_resource('schema.psql') as f:
            cursor = db.conn.cursor()
            cursor.execute(f.read().decode('utf-8'))

@click.command('init-db')
@with_appcontext
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo('Initialized the database')

def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)