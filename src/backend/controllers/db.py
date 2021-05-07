from flask import current_app, g
from ..import_classes import _Config, _Database, _Log


def init():
    # Init all the necessary classes
    config_name = _Config(current_app.config['CONFIG_FILE'])
    config = _Config(config_name.cfg['PROFILE']['cfgpath'] + '/config_' + config_name.cfg['PROFILE']['id'] + '.ini')
    db_name = config.cfg['DATABASE']['postgresdatabase']
    db_user = config.cfg['DATABASE']['postgresuser']
    db_pwd = config.cfg['DATABASE']['postgrespassword']
    db_host = config.cfg['DATABASE']['postgreshost']
    db_port = config.cfg['DATABASE']['postgresport']

    log = _Log(config.cfg['GLOBAL']['logfile'])
    db = _Database(log, db_name, db_user, db_pwd, db_host, db_port)

    return {'db': db, 'log': log}


def get_db():
    if 'db' not in g:
        g.db = init()['db']
    return g.db


def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.conn.close()
