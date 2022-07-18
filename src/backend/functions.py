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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

import os
import json
from .classes.Config import Config as _Config


def get_custom_array():
    custom_id = get_custom_id()
    custom_array = {}
    if custom_id:
        custom_array = check_python_customized_files(custom_id[1])
    return custom_array


def get_custom_id():
    custom_file = 'custom/custom.ini'
    if os.path.isfile(custom_file):
        config = _Config(custom_file)
        for custom in config.cfg:
            if config.cfg[custom]['selected'] == 'True':
                path = config.cfg[custom]['path']
                if os.path.isdir(path):
                    return [custom, path]


def check_python_customized_files(path):
    array_of_import = {}
    for root, _, files in os.walk(path):
        for file in files:
            if file.endswith(".py"):
                module = os.path.splitext(file)[0]
                path = os.path.join(root).replace('/', '.')
                array_of_import.update({
                    module: {
                        'module': module,
                        'path': path
                    }
                })
    return array_of_import


def search_custom_positions(data, ocr, files, regex, file, docservers):
    target = data['target'].lower()
    try:
        position = json.loads(data['position'])
    except TypeError:
        position = data['position']

    target_file = ''
    if position:
        if 'page' not in data or ('page' in data and str(data['page']) in ['1', '', None]):
            if target == 'footer':
                target_file = files.jpg_name_footer
            elif target == 'header':
                target_file = files.jpg_name_header
            else:
                target_file = files.jpg_name
        elif str(data['page']) != '1':
            position.update({"page": data['page']})
            nb_pages = files.get_pages(docservers, file)
            if str(nb_pages) == str(data['page']):
                if target == 'footer':
                    target_file = files.jpg_name_last_footer
                elif target == 'header':
                    target_file = files.jpg_name_last_header
                else:
                    target_file = files.jpg_name_last
            else:
                files.pdf_to_jpg(file + '[' + str(int(data['page']) - 1) + ']', False, False, False, False, True)
                target_file = files.custom_file_name
        if data['regex']:
            data['regex'] = regex[data['regex']]

        return search(position, data['regex'], files, ocr, target_file)


def search_by_positions(supplier, index, ocr, files, database):
    positions_mask = database.select({
        'select': ['*'],
        'table': ['positions_masks'],
        'where': ['supplier_id = %s'],
        'data': [supplier[2]['supplier_id']]
    })
    if not positions_mask:
        return False, (('', ''), ('', ''))

    positions = positions_mask[0]['positions'][index] if index in positions_mask[0]['positions'] else None
    pages = positions_mask[0]['pages'][index] if index in positions_mask[0]['pages'] else False
    regex = positions_mask[0]['regex'][index] if index in positions_mask[0]['regex'] else False
    file = files.jpg_name

    if positions:
        positions['ocr_from_user'] = True
        data = search(positions, regex, files, ocr, file)
        if pages:
            data.append(pages)
        return data


def search(position, regex, files, ocr, target_file):
    data = files.ocr_on_fly(target_file, position, ocr, None, regex)
    if not data:
        target_file_improved = files.improve_image_detection(target_file)
        data = files.ocr_on_fly(target_file_improved, position, ocr, None, regex)
        if data:
            return [data.replace('\n', ' '), json.dumps(position)]
        else:
            data = files.ocr_on_fly(target_file_improved, position, ocr, None, regex, True)
            if data:
                return [data.replace('\n', ' '), json.dumps(position)]
            return [False, (('', ''), ('', ''))]
    else:
        return [data.replace('\n', ' '), json.dumps(position)]


def recursive_delete(folder, log):
    for file in os.listdir(folder):
        try:
            os.remove(folder + '/' + file)
        except FileNotFoundError as err:
            log.error('Unable to delete ' + folder + '/' + file + ' on temp folder : ' + str(err), False)
    try:
        os.rmdir(folder)
    except FileNotFoundError as err:
        log.error('Unable to delete ' + folder + ' on temp folder : ' + str(err), False)
