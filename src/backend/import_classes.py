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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>
# pylint: skip-file

from .functions import get_custom_array
custom_array = get_custom_array()

if 'config' or 'classes' not in custom_array['Config']['path']:
    from .classes.Config import Config as _Config
elif 'classes' in custom_array['Config']['path']:
    _Config = getattr(__import__(custom_array['Config']['path'] + '.' + custom_array['coConfigConfigig']['module'],
                                 fromlist=[custom_array['Config']['module']]), custom_array['Config']['module'])

if 'log' or 'classes' not in custom_array['Log']['path']:
    from .classes.Log import Log as _Log
elif 'classes' in custom_array['Log']['path']:
    _Log = getattr(__import__(custom_array['Log']['path'] + '.' + custom_array['Log']['module'],
                              fromlist=[custom_array['Log']['module']]), custom_array['Log']['module'])

if 'mail' or 'classes' not in custom_array['Mail']['path']:
    from .classes.Mail import Mail as _Mail
elif 'classes' in custom_array['Mail']['path']:
    _Mail = getattr(__import__(custom_array['Mail']['path'] + '.' + custom_array['Mail']['module'],
                              fromlist=[custom_array['Mail']['module']]), custom_array['Mail']['module'])

if 'files' or 'classes' not in custom_array['Files']['path']:
    from .classes.Files import Files as _Files
elif 'classes' in custom_array['Files']['path']:
    _Files = getattr(__import__(custom_array['Files']['path'] + '.' + custom_array['Files']['module'],
                                fromlist=[custom_array['Files']['module']]), custom_array['Files']['module'])

if 'MEMWebServices' or 'classes' not in custom_array['MEMWebServices']['path']:
    from .classes.MEMWebServices import MEMWebServices as _MEMWebServices
elif 'classes' in custom_array['MEMWebServices']['path']:
    _MEMWebServices = getattr(__import__(custom_array['MEMWebServices']['path'] + '.' + custom_array['MEMWebServices']['module'],
                                      fromlist=[custom_array['MEMWebServices']['module']]),
                           custom_array['MEMWebServices']['module'])

if 'PyTesseract' or 'classes' not in custom_array['PyTesseract']['path']:
    from .classes.PyTesseract import PyTesseract as _PyTesseract
elif 'classes' in custom_array['PyTesseract']['path']:
    _PyTesseract = getattr(__import__(custom_array['PyTesseract']['path'] + '.' + custom_array['PyTesseract']['module'],
                                      fromlist=[custom_array['PyTesseract']['module']]),
                           custom_array['PyTesseract']['module'])

if 'database' or 'classes' not in custom_array['Database']['path']:
    from .classes.Database import Database as _Database
elif 'classes' in custom_array['Database']['path']:
    _Database = getattr(__import__(custom_array['Database']['path'] + '.' + custom_array['Database']['module'],
                                   fromlist=[custom_array['Database']['module']]), custom_array['Database']['module'])

if 'Splitter' or 'classes' not in custom_array['Splitter']['path']:
    from .classes.Splitter import Splitter as _Splitter
elif 'classes' in custom_array['Splitter']['path']:
    _Splitter = getattr(__import__(custom_array['Splitter']['path'] + '.' + custom_array['Splitter']['module'],
                                   fromlist=[custom_array['Splitter']['module']]), custom_array['Splitter']['module'])

if 'CMIS' not in custom_array or 'CMIS' not in custom_array['CMIS']['path']:
    from src.backend.classes.CMIS import CMIS as _CMIS
else:
    _CMIS = getattr(__import__(custom_array['CMIS']['path'] + '.' + custom_array['CMIS']['module'],
                                   fromlist=[custom_array['CMIS']['module']]), custom_array['CMIS']['module'])

if 'OpenADS' not in custom_array or 'OpenADS' not in custom_array['OpenADS']['path']:
    from src.backend.classes.OpenADS import OpenADS as _OpenADS
else:
    _OpenADS = getattr(__import__(custom_array['OpenADS']['path'] + '.' + custom_array['OpenADS']['module'],
                               fromlist=[custom_array['OpenADS']['module']]), custom_array['OpenADS']['module'])

if 'SeparatorQR' or 'classes' not in custom_array['SeparatorQR']['path']:
    from .classes.SeparatorQR import SeparatorQR as _SeparatorQR
elif 'classes' in custom_array['SeparatorQR']['path']:
    _SeparatorQR = getattr(__import__(custom_array['SeparatorQR']['path'] + '.' + custom_array['SeparatorQR']['module'],
                                   fromlist=[custom_array['SeparatorQR']['module']]), custom_array['SeparatorQR']['module'])

if 'Spreadsheet' or 'classes' not in custom_array['Spreadsheet']['path']:
    from .classes.Spreadsheet import Spreadsheet as _Spreadsheet
elif 'classes' in custom_array['Spreadsheet']['path']:
    _Spreadsheet = getattr(__import__(custom_array['Spreadsheet']['path'] + '.' + custom_array['Spreadsheet']['module'],
                                      fromlist=[custom_array['Spreadsheet']['module']]), custom_array['Spreadsheet']['module'])

if 'SMTP' or 'classes' not in custom_array['SMTP']['path']:
    from .classes.SMTP import SMTP as _SMTP
elif 'classes' in custom_array['SMTP']['path']:
    _SMTP = getattr(__import__(custom_array['SMTP']['path'] + '.' + custom_array['SMTP']['module'],
                                      fromlist=[custom_array['SMTP']['module']]), custom_array['SMTP']['module'])

if 'ArtificialIntelligence' or 'classes' not in custom_array['ArtificialIntelligence']['path']:
    from .classes.ArtificialIntelligence import ArtificialIntelligence as _ArtificialIntelligence
elif 'classes' in custom_array['ArtificialIntelligence']['path']:
    _ArtificialIntelligence = getattr(__import__(custom_array['ArtificialIntelligence']['path'] + '.' +
                                                 custom_array['ArtificialIntelligence']['module'],
                                                 fromlist=[custom_array['ArtificialIntelligence']['module']]),
                                      custom_array['ArtificialIntelligence']['module'])
