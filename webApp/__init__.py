import os
from . import db
from . import ws
from . import pdf
from . import auth
from . import user
from . import supplier
from . import dashboard
from . import ws_splitter
from flask_cors import CORS
from flask_babel import Babel
from flask import Flask, redirect, url_for, request, session

def create_app(test_config=None):
    # create and configure the app
    app     = Flask(__name__, instance_relative_config=True)
    babel   = Babel(app)
    CORS(app, supports_credentials=True)

    app.config.from_mapping(
        SECRET_KEY                      = '',
        DATABASE                        = os.path.join(app.instance_path, 'flaskr.sqlite'),
        CONFIG_FILE                     = os.path.join(app.instance_path, 'config.ini'),
        CONFIG_FOLDER                   = os.path.join(app.instance_path, 'config/'),
        UPLOAD_FOLDER                   = os.path.join(app.instance_path, 'upload/'),
        PER_PAGE                        = 16,
        BABEL_TRANSLATION_DIRECTORIES   = os.path.join(app.static_folder, 'babel/translations/'),
        # array key is the babel language code
        # index 0 is the label
        # index 1 is the locale language code in the config.ini
        # index 2 is the localeocr language code in the config.ini (tesseract)
        LANGUAGES       = {
            'fr': ['Français', 'fr_FR', 'fra'],
            'en': ['English', 'en_EN', 'eng']
        }
    )

    app.register_blueprint(ws.bp)
    app.register_blueprint(pdf.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(user.bp)
    app.register_blueprint(supplier.bp)
    app.register_blueprint(dashboard.bp)
    app.register_blueprint(ws_splitter.bp)
    app.add_url_rule('/', endpoint='index')

    db.init_app(app)

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route('/')
    def index():
        return redirect(url_for('pdf.index', time='TODAY', status='NEW'))

    @babel.localeselector
    def get_locale():
        if 'lang' not in session:
            session['lang'] = request.accept_languages.best_match(app.config['LANGUAGES'].keys())

        return session['lang']

    return app

appwsgi = create_app()