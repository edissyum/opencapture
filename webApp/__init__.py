import os
import jinja2
from flask_cors import CORS
from flask_babel import Babel
from flask import redirect, url_for, request, session
from flask_multistatic import MultiStaticFlask

from .functions import get_custom_id, check_python_customized_files
custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'db' not in custom_array: from . import db
else: db = getattr(__import__(custom_array['db']['path'], fromlist=[custom_array['db']['module']]), custom_array['db']['module'])

if 'ws' not in custom_array: from . import ws
else: ws = getattr(__import__(custom_array['ws']['path'], fromlist=[custom_array['ws']['module']]), custom_array['ws']['module'])

if 'pdf' not in custom_array: from . import pdf
else: pdf = getattr(__import__(custom_array['pdf']['path'], fromlist=[custom_array['pdf']['module']]), custom_array['pdf']['module'])

if 'auth' not in custom_array: from . import auth
else: auth = getattr(__import__(custom_array['auth']['path'], fromlist=[custom_array['auth']['module']]), custom_array['auth']['module'])

if 'user' not in custom_array: from . import user
else: user = getattr(__import__(custom_array['user']['path'], fromlist=[custom_array['user']['module']]), custom_array['user']['module'])

if 'supplier' not in custom_array: from . import supplier
else: supplier = getattr(__import__(custom_array['supplier']['path'], fromlist=[custom_array['supplier']['module']]), custom_array['supplier']['module'])

if 'dashboard' not in custom_array: from . import dashboard
else: dashboard = getattr(__import__(custom_array['dashboard']['path'], fromlist=[custom_array['dashboard']['module']]), custom_array['dashboard']['module'])

if 'ws_splitter' not in custom_array: from . import ws_splitter
else: ws_splitter = getattr(__import__(custom_array['ws_splitter']['path'], fromlist=[custom_array['ws_splitter']['module']]), custom_array['ws_splitter']['module'])

def create_app(test_config=None):
    # create and configure the app
    app     = MultiStaticFlask(__name__, instance_relative_config=True)
    babel   = Babel(app)
    CORS(app, supports_credentials=True)

    # Add custom static location
    if custom_id:
        app.static_folder = [
            os.path.join(app.root_path.replace('webApp', ''), 'custom/' + custom_id[0] + '/webApp/static/'),
            os.path.join(app.root_path, 'static')
        ]
    else:
        app.static_folder = [
            os.path.join(app.root_path, 'static'),
            os.path.join(app.root_path, 'static')
        ]

    app.config.from_mapping(
        SECRET_KEY                      = '',
        CONFIG_FILE                     = os.path.join(app.instance_path, 'config.ini'),
        CONFIG_FOLDER                   = os.path.join(app.instance_path, 'config/'),
        UPLOAD_FOLDER                   = os.path.join(app.instance_path, 'upload/'),
        PER_PAGE                        = 16,
        BABEL_TRANSLATION_DIRECTORIES   = os.path.join(app.static_folder[0], 'babel/translations/') if os.path.isdir(app.static_folder[0] + 'babel/translations') else os.path.join(app.static_folder[1], 'babel/translations/'),
        # array key is the babel language code
        # index 0 is the label
        # index 1 is the locale language code in the config.ini
        # index 2 is the localeocr language code in the config.ini (tesseract)
        LANGUAGES       = {
            'fr': ['Français', 'fr_FR', 'fra'],
            'en': ['English', 'en_EN', 'eng']
        },
    )

    app.register_blueprint(ws.bp)
    app.register_blueprint(pdf.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(user.bp)
    app.register_blueprint(supplier.bp)
    app.register_blueprint(dashboard.bp)
    app.register_blueprint(ws_splitter.bp)
    app.add_url_rule('/', endpoint='index')

    # Add custom templates location
    if custom_id:
        array_location = [
            'custom/' + custom_id[0] + '/webApp',
            'webApp'
        ]
    else:
        array_location = [
            'webApp'
        ]

    templates_locations = jinja2.ChoiceLoader([
        app.jinja_loader,
        jinja2.FileSystemLoader(array_location),
    ])
    app.jinja_loader = templates_locations

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