import json
import os
import jinja2
from flask_cors import CORS
from flask_babel import Babel
from flask import redirect, url_for, request, session
from flask_multistatic import MultiStaticFlask

from import_controllers import db
from import_rest import auth, locale, config, user

from .functions import get_custom_id
custom_id = get_custom_id()


def create_app(test_config=None):
    # create and configure the app
    app = MultiStaticFlask(__name__, instance_relative_config=True)
    babel = Babel(app)
    CORS(app, supports_credentials=True)

    # Add custom static location
    if custom_id:
        app.static_folder = [
            os.path.join(app.root_path.replace('backend', ''), 'custom/' + custom_id[0] + '/backend/static/'),
            os.path.join(app.root_path, 'static'),
            os.path.join(app.root_path.replace('backend', ''), 'dist'),
        ]
    else:
        app.static_folder = [
            os.path.join(app.root_path, 'static'),
            os.path.join(app.root_path, 'static'),
            os.path.join(app.root_path.replace('backend', ''), 'dist'),
        ]

    app.config.from_mapping(
        SECRET_KEY='§§SECRET§§',
        CONFIG_FILE=os.path.join(app.instance_path, 'config.ini'),
        CONFIG_FOLDER=os.path.join(app.instance_path, 'config/'),
        LANG_FILE=os.path.join(app.instance_path, 'lang.json'),
        UPLOAD_FOLDER=os.path.join(app.instance_path, 'upload/'),
        PER_PAGE=16,
        BABEL_TRANSLATION_DIRECTORIES=os.path.join(app.static_folder[0], 'babel/translations/')
        if os.path.isdir(app.static_folder[0] + 'babel/translations') else os.path.join(app.static_folder[1],
                                                                                        'babel/translations/'),
    )

    langs = json.loads(open(app.config['LANG_FILE']).read())
    app.config['LANGUAGES'] = langs

    app.register_blueprint(auth.bp)
    app.register_blueprint(user.bp)
    app.register_blueprint(locale.bp)
    app.register_blueprint(config.bp)
    app.add_url_rule('/', endpoint='index')

    # Add custom templates location
    if custom_id:
        array_location = [
            'custom/' + custom_id[0] + '/backend',
            'backend',
            'dist/'
        ]
    else:
        array_location = [
            'backend',
            'dist/'
        ]

    templates_locations = jinja2.ChoiceLoader([
        app.jinja_loader,
        jinja2.FileSystemLoader(array_location),
    ])
    app.jinja_loader = templates_locations

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
