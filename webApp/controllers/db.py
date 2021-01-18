import click
from flask import current_app, g
from psycopg2 import ProgrammingError
from flask.cli import with_appcontext
from import_classes import _Config, _Database, _Log


def init():
    # Init all the necessary classes
    config_name = _Config(current_app.config['CONFIG_FILE'])
    config = _Config(config_name.cfg['PROFILE']['cfgpath'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini')
    db_type = config.cfg['DATABASE']['databasetype']
    db_name = config.cfg['DATABASE']['postgresdatabase']
    db_user = config.cfg['DATABASE']['postgresuser']
    db_pwd = config.cfg['DATABASE']['postgrespassword']
    db_host = config.cfg['DATABASE']['postgreshost']
    db_port = config.cfg['DATABASE']['postgresport']

    log = _Log(config.cfg['GLOBAL']['logfile'])
    db = _Database(log, db_type, db_name, db_user, db_pwd, db_host, db_port, config.cfg['DATABASE']['databasefile'])

    return {'db': db, 'type': db_type, 'log': log}


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
    log = info_db['log']
    if info_db['type'] != 'pgsql':
        with current_app.open_resource('schema.sql') as f:
            cursor = db.conn.cursor()
            cursor.executescript(f.read().decode('utf8'))
    else:
        with current_app.open_resource('schema.psql') as f:
            cursor = db.conn.cursor()
            try:
                cursor.execute(f.read().decode('utf-8'))
            except ProgrammingError as e:
                log.error('Error while inserting in database : ' + str(e))
                log.error(f.read().decode('utf-8'))


@click.command('init-db')
@with_appcontext
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo('Initialized the database')


def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
