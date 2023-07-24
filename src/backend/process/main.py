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

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import os
import sys
import uuid
import json
import datetime
import importlib
import traceback
from flask_babel import gettext
from src.backend import verifier_exports
from src.backend.scripting_functions import check_code
from src.backend.import_classes import _PyTesseract, _Files
from src.backend.import_controllers import artificial_intelligence, verifier, accounts
from src.backend.functions import delete_documents, rotate_document, find_form_with_ia
from src.backend.import_process import FindDate, FindDueDate, FindFooter, FindInvoiceNumber, FindSupplier, FindCustom, \
    FindDeliveryNumber, FindFooterRaw, FindQuotationNumber


def launch_script(workflow_settings, docservers, step, log, file, database, args, config, datas=None):
    if 'script' in workflow_settings[step] and workflow_settings[step]['script']:
        script = workflow_settings[step]['script']
        check_res, message = check_code(script, config['GLOBAL']['applicationpath'], docservers['DOCSERVERS_PATH'],
                                        workflow_settings['input']['input_folder'])

        change_workflow = False
        if not check_res:
            log.error('[' + step.upper() + '_SCRIPT ERROR] ' + gettext('SCRIPT_CONTAINS_NOT_ALLOWED_CODE') +
                      '&nbsp;<strong>(' + message.strip() + ')</strong>')
            return False
        else:
            change_workflow = 'send_to_workflow({' in script

        rand = str(uuid.uuid4())
        tmp_file = docservers['TMP_PATH'] + '/' + step + '_scripting_' + rand + '.py'

        # try:
        with open(tmp_file, 'w', encoding='UTF-8') as python_script:
            python_script.write(script)

        if os.path.isfile(tmp_file):
            script_name = tmp_file.replace(config['GLOBAL']['applicationpath'], '').replace('/', '.').replace('.py', '')
            script_name = script_name.replace('..', '.')
            try:
                tmp_script_name = script_name.replace('custom.', '')
                scripting = importlib.import_module(tmp_script_name, 'custom')
                script_name = tmp_script_name
            except ModuleNotFoundError:
                scripting = importlib.import_module(script_name, 'custom')

            data = {
                'log': log,
                'file': file,
                'custom_id': args['custom_id'],
                'opencapture_path': config['GLOBAL']['applicationpath']
            }

            if step == 'input':
                data['ip'] = args['ip']
                data['database'] = database
                data['user_info'] = args['user_info']
            elif step in 'process' 'output':
                if 'document_id' in args:
                    data['document_id'] = args['document_id']

                if datas:
                    data['datas'] = datas

                if step == 'output' and 'outputs' in args:
                    data['outputs'] = args['outputs']

            scripting.main(data)
            return change_workflow
        # except Exception:
        #     log.error('Error during ' + step + ' scripting : ' + str(traceback.format_exc()))
        # os.remove(tmp_file)


def execute_outputs(output_info, log, regex, document_data, database, current_lang):
    data = output_info['data']
    ocrise = output_info['ocrise']
    compress_type = output_info['compress_type']
    path = None

    if output_info['output_type_id'] == 'export_xml':
        path, _ = verifier_exports.export_xml(data, log, regex, document_data, database)
    elif output_info['output_type_id'] == 'export_mem':
        verifier_exports.export_mem(output_info['data'], document_data, log, regex, database)
    elif output_info['output_type_id'] == 'export_pdf':
        path, _ = verifier_exports.export_pdf(data, log, regex, document_data, current_lang, compress_type, ocrise)
    elif output_info['output_type_id'] == 'export_facturx':
        path, _ = verifier_exports.export_facturx(data, log, regex, document_data)

    output_info['file_path'] = path
    return output_info


def insert(args, files, database, datas, full_jpg_filename, file, original_file, supplier, status, nb_pages, docservers,
           workflow_settings, log, regex, supplier_lang_different, current_lang, allow_auto):
    try:
        filename = os.path.splitext(files.custom_file_name)
        improved_img = filename[0] + '_improved' + filename[1]
        os.remove(files.custom_file_name)
        os.remove(improved_img)
    except FileNotFoundError:
        pass

    now = datetime.datetime.now()
    year_and_month = now.strftime('%Y') + '/' + now.strftime('%m')
    path = docservers['VERIFIER_IMAGE_FULL'] + '/' + year_and_month + '/' + full_jpg_filename + '-001.jpg'

    document_data = {
        'filename': os.path.basename(file),
        'path': os.path.dirname(file),
        'img_width': str(files.get_width(path)),
        'full_jpg_filename': full_jpg_filename + '-001.jpg',
        'original_filename': original_file,
        'positions': json.dumps(datas['positions']),
        'datas': json.dumps(datas['datas']),
        'pages': json.dumps(datas['pages']),
        'form_id': datas['form_id'],
        'nb_pages': nb_pages,
        'status': status,
        'customer_id': 0
    }

    if supplier:
        document_data.update({
            'supplier_id': supplier[2]['supplier_id'],
        })

    if args.get('isMail') is None or args.get('isMail') is False:
        if 'workflow_id' in args and args['workflow_id'] and workflow_settings:
            if 'customer_id' in workflow_settings['input'] and workflow_settings['input']['customer_id']:
                document_data.update({
                    'customer_id': workflow_settings['input']['customer_id']
                })
    else:
        if 'customer_id' in args and args['customer_id']:
            document_data.update({
                'customer_id': args['customer_id']
            })

    insert_document = True
    args['outputs'] = []
    if status == 'END' and 'form_id' in document_data and document_data['form_id']:
        outputs = database.select({
            'select': ['outputs'],
            'table': ['form_models'],
            'where': ['id = %s'],
            'data': [document_data['form_id']],
        })

        if outputs:
            args['outputs'] = []
            for output_id in outputs[0]['outputs']:
                output_info = database.select({
                    'select': ['output_type_id', 'data', 'compress_type', 'ocrise'],
                    'table': ['outputs'],
                    'where': ['id = %s'],
                    'data': [output_id]
                })
                if output_info and supplier_lang_different:
                    _regex = database.select({
                        'select': ['regex_id', 'content'],
                        'table': ['regex'],
                        'where': ["lang in ('global', %s)"],
                        'data': [current_lang],
                    })

                    for _r in _regex:
                        regex[_r['regex_id']] = _r['content']
                args['outputs'].append(execute_outputs(output_info[0], log, regex, document_data, database,
                                                       current_lang))
    elif workflow_settings and (
            not workflow_settings['process']['use_interface'] or not workflow_settings['input']['apply_process']):
        if 'output' in workflow_settings and workflow_settings['output']:
            insert_document = False
            args['outputs'] = []
            for output_id in workflow_settings['output']['outputs_id']:
                output_info = database.select({
                    'select': ['output_type_id', 'data', 'compress_type', 'ocrise'],
                    'table': ['outputs'],
                    'where': ['id = %s'],
                    'data': [output_id]
                })
                if output_info:
                    args['outputs'].append(execute_outputs(output_info[0], log, regex, document_data, database,
                                                           current_lang))

    if workflow_settings:
        document_data['workflow_id'] = workflow_settings['id']
        if workflow_settings['input']['apply_process'] and allow_auto:
            if workflow_settings['process']['delete_documents']:
                insert_document = False
                delete_documents(docservers, document_data['path'], document_data['filename'], full_jpg_filename)

    if insert_document:
        document_data['datas'] = json.dumps(datas['datas'])
        document_id = database.insert({
            'table': 'documents',
            'columns': document_data
        })
        return document_id

    log.info('Document not inserted in database based on workflow settings')
    return None


def convert(file, files, ocr, nb_pages, custom_pages=False):
    if custom_pages:
        try:
            filename = os.path.splitext(files.custom_file_name)
            improved_img = filename[0] + '_improved' + filename[1]
            os.remove(files.custom_file_name)
            os.remove(improved_img)
        except FileNotFoundError:
            pass
        files.pdf_to_jpg(file, nb_pages, open_img=False, is_custom=True)
    else:
        files.pdf_to_jpg(file, 1, True, True, 'header')
        ocr.header_text = ocr.line_box_builder(files.img)
        files.pdf_to_jpg(file, 1, True, True, 'footer')
        ocr.footer_text = ocr.line_box_builder(files.img)
        files.pdf_to_jpg(file, 1)
        ocr.text = ocr.line_box_builder(files.img)
        if nb_pages > 1:
            files.pdf_to_jpg(file, nb_pages, True, True, 'header', True)
            ocr.header_last_text = ocr.line_box_builder(files.img)
            files.pdf_to_jpg(file, nb_pages, True, True, 'footer', True)
            ocr.footer_last_text = ocr.line_box_builder(files.img)
            files.pdf_to_jpg(file, nb_pages, last_image=True)
            ocr.last_text = ocr.line_box_builder(files.img)


def found_data_recursively(data_name, ocr, file, nb_pages, text_by_pages, data_class, _res, files, configurations):
    data = data_class.run()
    if not data:
        improved_image = files.improve_image_detection(files.jpg_name, remove_lines=False)
        image = files.open_image_return(improved_image)
        text = ocr.line_box_builder(image)
        data_class.text = text
        data = data_class.run()
        if not data:
            data_class.text = ocr.last_text
            data_class.header_text = ocr.header_last_text
            data_class.footer_text = ocr.footer_last_text
            data_class.nb_page = nb_pages
            data_class.custom_page = True
            data = data_class.run()
        if data:
            data.append(nb_pages)

    i = 0
    tmp_nb_pages = nb_pages
    while not data:
        tmp_nb_pages = tmp_nb_pages - 1
        if 'verifierMaxPageSearch' in configurations and int(configurations['verifierMaxPageSearch']) > 0:
            if i == int(configurations['verifierMaxPageSearch']) or int(tmp_nb_pages) - 1 == 0 or nb_pages == 1:
                break
        else:
            if int(tmp_nb_pages) - 1 == 0 or nb_pages == 1:
                break

        convert(file, files, ocr, tmp_nb_pages, True)
        _file = files.custom_file_name
        image = files.open_image_return(_file)

        if tmp_nb_pages not in text_by_pages:
            text_by_pages[tmp_nb_pages] = ocr.line_box_builder(image)

        data_class.text = text_by_pages[tmp_nb_pages]
        files.pdf_to_jpg(file, tmp_nb_pages, True, True, 'header')
        data_class.header_text = ocr.line_box_builder(files.img)
        files.pdf_to_jpg(file, tmp_nb_pages, True, True, 'footer')
        data_class.footer_text = ocr.line_box_builder(files.img)
        data_class.nb_page = tmp_nb_pages
        data_class.custom_page = True

        data = data_class.run()
        i += 1

    if data:
        _res['datas'].update({data_name: data[0]})
        if data[1]:
            _res['positions'].update({data_name: files.reformat_positions(data[1])})
        if data[2]:
            _res['pages'].update({data_name: data[2]})
    return _res


def process(args, file, log, config, files, ocr, regex, database, docservers, configurations, languages):
    filename = os.path.basename(file)
    log.info('Processing file using workflow&nbsp;<strong>' + args['workflow_id'] + '</strong>&nbsp;: ' + filename)
    datas = {
        'datas': {},
        'pages': {},
        'positions': {}
    }
    nb_pages = files.get_pages(docservers, file)
    splitted_file = os.path.basename(file).split('_')
    if splitted_file[0] == 'SPLITTER':
        original_file = os.path.basename(file).split('_')
        original_file = original_file[1] + '_' + original_file[2] + '.pdf'
    else:
        original_file = os.path.basename(file)

    workflow_settings = None

    if 'workflow_id' in args:
        workflow_settings = database.select({
            'select': ['*'],
            'table': ['workflows'],
            'where': ['workflow_id = %s', 'module = %s'],
            'data': [args['workflow_id'], 'verifier']
        })
        if workflow_settings:
            workflow_settings = workflow_settings[0]
            if workflow_settings['input']['apply_process'] and workflow_settings['process']['rotation']:
                if workflow_settings['process']['rotation'] != 'no_rotation':
                    rotate_document(file, workflow_settings['process']['rotation'])
                    log.info('Document rotated by ' + str(workflow_settings['process']['rotation']) +
                             '° based on workflow settings')

    # Convert files to JPG
    convert(file, files, ocr, nb_pages)

    form_id_found_with_ai = False
    system_fields_to_find = []
    custom_fields_to_find = []

    change_workflow = False
    if workflow_settings:
        if workflow_settings['input']['apply_process']:
            for field in workflow_settings['process']['system_fields']:
                system_fields_to_find.append(field)
            if 'custom_fields' in workflow_settings['process'] and workflow_settings['process']['custom_fields']:
                for field in workflow_settings['process']['custom_fields']:
                    custom_fields_to_find.append(field)
        else:
            custom_fields_to_find = False

        if 'ai_model_id' in workflow_settings['input'] and workflow_settings['input']['ai_model_id']:
            ai_model_id = workflow_settings['input']['ai_model_id']
            res = find_form_with_ia(file, ai_model_id, database, docservers, _Files, artificial_intelligence, ocr, log,
                                    'verifier')
            if res:
                form_id_found_with_ai = True
                datas.update({'form_id': res})

        # Launch input scripting if present
        change_workflow = launch_script(workflow_settings, docservers, 'input', log, file, database, args, config)

    if not change_workflow:
        supplier = None
        supplier_lang_different = False

        if 'supplier' in args and args['supplier']:
            if 'column' in args['supplier'] and args['supplier']['column']:
                if 'value' in args['supplier'] and args['supplier']['value']:
                    column = args['supplier']['column']
                    value = args['supplier']['value']

                    find_supplier = database.select({
                        'select': ['accounts_supplier.id as supplier_id', '*'],
                        'table': ['accounts_supplier', 'addresses'],
                        'left_join': ['accounts_supplier.address_id = addresses.id'],
                        'where': [column + ' = %s', 'accounts_supplier.status <> %s'],
                        'data': [value, 'DEL']
                    })

                    if find_supplier:
                        supplier = [find_supplier[0]['vat_number'], (('', ''), ('', '')), find_supplier[0], False, column]
                        log.info('Supplier found using given informations in upload : ' + supplier[2]['name'] + ' using ' +
                                 column.upper() + ' : ' + value)
                    else:
                        if column in ['siret', 'siren', 'vat_number']:
                            token_insee, _ = verifier.get_token_insee()
                            if token_insee or column == 'vat_number':
                                status = 400
                                address_args = {}
                                supplier_args = {}
                                if column == 'vat_number':
                                    res, status = verifier.verify_vat_number(value, full=True)
                                    if status == 200:
                                        address = res['address'].split('\n')
                                        postal_code = address[1].split(' ')[0]
                                        city = address[1].split(' ')[1]
                                        address_args = {
                                            'address1': address[0],
                                            'postal_code': postal_code,
                                            'city': city
                                        }
                                        supplier_args = {
                                            'name': res['name'],
                                            'siren': value[4:13],
                                            'siret': '',
                                            'vat_number': value,
                                        }
                                if column == 'siren':
                                    res, status = verifier.verify_siren(token_insee, value, full=True)
                                    if status == 200:
                                        if res['uniteLegale'] and len(res['uniteLegale']['periodesUniteLegale']) >= 1:
                                            vat_number_key = (12 + (3 * (int(value) % 97)) % 97) % 97
                                            supplier_args = {
                                                'name': res['uniteLegale']['periodesUniteLegale'][0]['denominationUniteLegale'],
                                                'siret': '',
                                                'siren': value,
                                                'vat_number': 'FR' + str(vat_number_key) + value
                                            }
                                if column == 'siret':
                                    res, status = verifier.verify_siret(token_insee, value, full=True)
                                    if status == 200:
                                        insee = res['etablissement']
                                        address_args = {
                                            'address1': str(insee['adresseEtablissement']['numeroVoieEtablissement']) + ' ' +
                                                        str(insee['adresseEtablissement']['typeVoieEtablissement']) + ' ' +
                                                        str(insee['adresseEtablissement']['libelleVoieEtablissement']),
                                            'postal_code': insee['adresseEtablissement']['codePostalEtablissement'],
                                            'city': insee['adresseEtablissement']['libelleCommuneEtablissement']
                                        }
                                        vat_number_key = (12 + (3 * (int(insee['siren']) % 97)) % 97) % 97
                                        supplier_args = {
                                            'name': insee['uniteLegale']['denominationUniteLegale'],
                                            'siret': insee['siret'],
                                            'siren': insee['siren'],
                                            'vat_number': 'FR' + str(vat_number_key) + insee['siren']
                                        }

                                if status == 200:
                                    if address_args:
                                        address_id, status = accounts.create_address(address_args)
                                        supplier_args['address_id'] = address_id['id']

                                    res, status = accounts.create_supplier(supplier_args)
                                    if status == 200:
                                        data = {
                                            'supplier_id': res['id'],
                                            'vat_number': supplier_args['vat_number'],
                                            'siren': supplier_args['siren'],
                                            'siret': supplier_args['siret'],
                                            'duns': '',
                                            'bic': '',
                                            'name': supplier_args['name'],
                                            'city': address_args['city'] if address_args else None,
                                            'country': '',
                                            'postal_code': address_args['postal_code'] if address_args else None,
                                            'address1': address_args['address1'] if address_args else None,
                                            'address2': '',
                                            'get_only_raw_footer': False,
                                            'skip_auto_validate': False,
                                            'document_lang': ''
                                        }
                                        supplier = [data['vat_number'], (('', ''), ('', '')), data, False, column]
                                        log.info('Supplier created using INSEE database : ' + supplier[2]['name'] + ' with '
                                                 + column.upper() + ' : ' + value)

        if 'name' in system_fields_to_find or not workflow_settings['input']['apply_process']:
            # Find supplier in document if not send using upload rest
            if not supplier or not supplier[0] or not supplier[2]:
                supplier = FindSupplier(ocr, log, regex, database, files, nb_pages, 1, False).run()

                i = 0
                tmp_nb_pages = nb_pages
                while not supplier:
                    tmp_nb_pages = tmp_nb_pages - 1
                    if 'verifierMaxPageSearch' in configurations and int(configurations['verifierMaxPageSearch']) > 0:
                        if i == int(configurations['verifierMaxPageSearch']) or int(tmp_nb_pages) - 1 == 0 or nb_pages == 1:
                            break
                    else:
                        if int(tmp_nb_pages) - 1 == 0 or nb_pages == 1:
                            break

                    convert(file, files, ocr, tmp_nb_pages, True)
                    supplier = FindSupplier(ocr, log, regex, database, files, nb_pages, tmp_nb_pages, True).run()
                    i += 1

            if supplier and supplier[2]:
                datas['datas'].update({
                    'name': supplier[2]['name'],
                    'vat_number': supplier[2]['vat_number'],
                    'siret': supplier[2]['siret'],
                    'siren': supplier[2]['siren'],
                    'duns': supplier[2]['duns'],
                    'bic': supplier[2]['bic'],
                    'address1': supplier[2]['address1'],
                    'address2': supplier[2]['address2'],
                    'postal_code': supplier[2]['postal_code'],
                    'city': supplier[2]['city'],
                    'country': supplier[2]['country'],
                })
                if supplier[1]:
                    datas['positions'].update({
                        supplier[4]: files.reformat_positions(supplier[1])
                    })
                if supplier[3]:
                    datas['pages'].update({
                        supplier[4]: supplier[3]
                    })

                if 'document_lang' in supplier[2] and supplier[2]['document_lang'] and \
                        configurations['locale'] != supplier[2]['document_lang']:
                    supplier_lang_different = True
                    regex = {}
                    _regex = database.select({
                        'select': ['regex_id', 'content'],
                        'table': ['regex'],
                        'where': ['lang = %s'],
                        'data': [supplier[2]['document_lang']]
                    })

                    for _r in _regex:
                        regex[_r['regex_id']] = _r['content']
                    ocr = _PyTesseract(supplier[2]['document_lang'], log, config, docservers)
                    convert(file, files, ocr, nb_pages)

        if workflow_settings:
            if 'override_supplier_form' in workflow_settings['process'] and \
                    workflow_settings['process']['override_supplier_form'] or \
                    not supplier or ('form_id' not in supplier[2] or not supplier[2]['form_id']):
                if not form_id_found_with_ai:
                    datas.update({'form_id': workflow_settings['process']['form_id']})
            elif ('override_supplier_form' not in workflow_settings['process'] or
                  not workflow_settings['process']['override_supplier_form']) and supplier and supplier[2]['form_id']:
                datas.update({'form_id': supplier[2]['form_id']})

        if 'form_id' not in datas or not datas['form_id']:
            datas.update({'form_id': 0})

        # Find custom informations using mask
        if custom_fields_to_find or not workflow_settings['input']['apply_process']:
            custom_fields = FindCustom(log, regex, config, ocr, files, supplier, file, database, docservers,
                                       datas['form_id'], custom_fields_to_find, False).run_using_positions_mask()
            if custom_fields:
                for field in custom_fields:
                    datas['datas'].update({field: custom_fields[field][0]})
                    if custom_fields[field][1]:
                        datas['positions'].update({field: files.reformat_positions(custom_fields[field][1])})
                    if custom_fields[field][2]:
                        datas['pages'].update({field: custom_fields[field][2]})

        text_by_pages = [None] * nb_pages

        custom_fields_regex = database.select({
            'select': ['id', 'label', "settings #>> '{regex}'as regex_settings"],
            'table': ['custom_fields'],
            'where': ['module = %s', "settings #>> '{regex}' is not null", "enabled = %s"],
            'data': ['verifier', True]
        })

        for custom_field in custom_fields_regex:
            if (not custom_fields_to_find or custom_field['id'] in custom_fields_to_find) \
                    or not workflow_settings['input']['apply_process']:
                custom_field_class = FindCustom(log, regex, config, ocr, files, supplier, file, database, docservers,
                                                datas['form_id'], custom_fields_to_find, custom_field)
                custom_field = 'custom_' + str(custom_field['id'])
                datas = found_data_recursively(custom_field, ocr, file, nb_pages, text_by_pages, custom_field_class,
                                               datas, files, configurations)

        if 'invoice_number' in system_fields_to_find or not workflow_settings['input']['apply_process']:
            invoice_number_class = FindInvoiceNumber(ocr, files, log, regex, config, database, supplier, file, docservers,
                                                     configurations, languages, datas['form_id'])
            datas = found_data_recursively('invoice_number', ocr, file, nb_pages, text_by_pages, invoice_number_class,
                                           datas, files, configurations)

        if 'document_date' in system_fields_to_find or not workflow_settings['input']['apply_process']:
            date_class = FindDate(ocr, log, regex, configurations, files, supplier, database, file, docservers, languages,
                                  datas['form_id'])
            datas = found_data_recursively('document_date', ocr, file, nb_pages, text_by_pages, date_class, datas, files,
                                           configurations)

        if 'document_due_date' in system_fields_to_find or not workflow_settings['input']['apply_process']:
            due_date_class = FindDueDate(ocr, log, regex, configurations, files, supplier, database, file, docservers,
                                         languages, datas['form_id'])
            datas = found_data_recursively('document_due_date', ocr, file, nb_pages, text_by_pages, due_date_class,
                                           datas, files, configurations)

        if 'quotation_number' in system_fields_to_find or not workflow_settings['input']['apply_process']:
            quotation_number_class = FindQuotationNumber(ocr, files, log, regex, config, database, supplier, file,
                                                         docservers, configurations, datas['form_id'], languages)
            datas = found_data_recursively('quotation_number', ocr, file, nb_pages, text_by_pages, quotation_number_class,
                                           datas, files, configurations)

        if 'delivery_number' in system_fields_to_find or not workflow_settings['input']['apply_process']:
            delivery_number_class = FindDeliveryNumber(ocr, files, log, regex, config, database, supplier, file, docservers,
                                                       configurations, datas['form_id'])
            datas = found_data_recursively('delivery_number', ocr, file, nb_pages, text_by_pages, delivery_number_class,
                                           datas, files, configurations)

        footer = None
        if 'footer' in system_fields_to_find or not workflow_settings['input']['apply_process']:
            footer_class = FindFooter(ocr, log, regex, config, files, database, supplier, file, ocr.footer_text, docservers,
                                      datas['form_id'])
            if supplier and supplier[2]['get_only_raw_footer'] in [True, 'True']:
                footer_class = FindFooterRaw(ocr, log, regex, config, files, database, supplier, file, ocr.footer_text,
                                             docservers, datas['form_id'])

            footer = footer_class.run()
            if not footer and nb_pages > 1:
                footer_class.target = 'full'
                footer_class.text = ocr.last_text
                footer_class.nb_pages = nb_pages
                footer_class.is_last_page = True
                footer_class.rerun = False
                footer_class.rerun_as_text = False
                footer = footer_class.run()
                if footer:
                    if len(footer) == 4:
                        footer[3] = nb_pages
                    else:
                        footer.append(nb_pages)
                i = 0
                tmp_nb_pages = nb_pages
                while not footer:
                    tmp_nb_pages = tmp_nb_pages - 1
                    if i == 3 or int(tmp_nb_pages) == 1 or nb_pages == 1:
                        break
                    convert(file, files, ocr, tmp_nb_pages, True)
                    _file = files.custom_file_name
                    image = files.open_image_return(_file)
                    text = ocr.line_box_builder(image)

                    footer_class.text = text
                    footer_class.target = 'full'
                    footer_class.nb_pages = tmp_nb_pages
                    footer = footer_class.run()
                    if not footer:
                        improved_image = files.improve_image_detection(_file)
                        image = files.open_image_return(improved_image)
                        text = ocr.line_box_builder(image)
                        footer_class.text = text
                        footer = footer_class.run()
                    i += 1

            if footer:
                if footer[0]:
                    datas['datas'].update({'no_rate_amount': footer[0][0]})
                    datas['datas'].update({'total_ht': footer[0][0]})
                    if len(footer[0]) > 1:
                        datas['positions'].update({'no_rate_amount': files.reformat_positions(footer[0][1])})
                        datas['positions'].update({'total_ht': files.reformat_positions(footer[0][1])})
                        if 'page' in footer[0][1]:
                            try:
                                datas['pages'].update({'no_rate_amount': footer[0][1]['page']})
                                datas['pages'].update({'total_ht': footer[0][1]['page']})
                            except (TypeError, json.decoder.JSONDecodeError):
                                if footer[3]:
                                    datas['pages'].update({'no_rate_amount': footer[3]})
                                    datas['pages'].update({'total_ht': footer[3]})
                        elif footer[3]:
                            datas['pages'].update({'no_rate_amount': footer[3]})
                            datas['pages'].update({'total_ht': footer[3]})
                    datas['datas'].update({'taxes_count': 1})
                    datas['datas'].update({'lines_count': 0})
                if footer[1]:
                    datas['datas'].update({'total_ttc': footer[1][0]})
                    if len(footer[1]) > 1:
                        datas['positions'].update({'total_ttc': files.reformat_positions(footer[1][1])})
                        if 'page' in footer[1][1]:
                            try:
                                datas['pages'].update({'total_ttc': footer[1][1]['page']})
                            except (TypeError, json.decoder.JSONDecodeError):
                                if footer[3]:
                                    datas['pages'].update({'total_ttc': footer[3]})
                        elif footer[3]:
                            datas['pages'].update({'total_ttc': footer[3]})
                if footer[2]:
                    datas['datas'].update({'vat_rate': footer[2][0]})
                    if len(footer[2]) > 1:
                        datas['positions'].update({'vat_rate': files.reformat_positions(footer[2][1])})
                        if 'page' in footer[2][1]:
                            try:
                                datas['pages'].update({'vat_rate': footer[2][1]['page']})
                            except (TypeError, json.decoder.JSONDecodeError):
                                if footer[3]:
                                    datas['pages'].update({'vat_rate': footer[3]})
                        elif footer[3]:
                            datas['pages'].update({'vat_rate': footer[3]})
                if footer[4]:
                    datas['datas'].update({'vat_amount': footer[4][0]})
                    datas['datas'].update({'total_vat': footer[4][0]})
                    if len(footer[4]) > 1:
                        datas['positions'].update({'vat_amount': files.reformat_positions(footer[4][1])})
                        datas['positions'].update({'total_vat': files.reformat_positions(footer[4][1])})
                        if 'page' in footer[4][1]:
                            try:
                                datas['pages'].update({'vat_amount': footer[4][1]['page']})
                                datas['pages'].update({'total_vat': footer[4][1]['page']})
                            except (TypeError, json.decoder.JSONDecodeError):
                                if footer[3]:
                                    datas['pages'].update({'vat_amount': footer[3]})
                                    datas['pages'].update({'total_vat': footer[3]})
                        elif footer[3]:
                            datas['pages'].update({'vat_amount': footer[3]})
                            datas['pages'].update({'total_vat': footer[3]})

        full_jpg_filename = str(uuid.uuid4())
        file = files.move_to_docservers(docservers, file)

        # Convert all the pages to JPG (used to full web interface)
        files.save_img_with_pdf2image(file, docservers['VERIFIER_IMAGE_FULL'] + '/' + full_jpg_filename, docservers=True)
        files.save_img_with_pdf2image_min(file, docservers['VERIFIER_THUMB'] + '/' + full_jpg_filename)

        allow_auto = False
        if workflow_settings and workflow_settings['input']['apply_process']:
            if workflow_settings['process']['use_interface'] and workflow_settings['process']['allow_automatic_validation']:
                allow_auto = True
                for field in workflow_settings['process']['system_fields']:
                    if field == 'footer' and footer:
                        continue
                    if field in datas and datas[field]:
                        continue
                    allow_auto = False
                    break

        if supplier and not supplier[2]['skip_auto_validate'] and allow_auto:
            status = 'END'
            log.info('All the usefull informations are found. Execute outputs action and end process')
            document_id = insert(args, files, database, datas, full_jpg_filename, file, original_file, supplier, status,
                                 nb_pages, docservers, workflow_settings, log, regex, supplier_lang_different,
                                 configurations['locale'], allow_auto)
        else:
            status = 'NEW'
            document_id = insert(args, files, database, datas, full_jpg_filename, file, original_file, supplier, status,
                                 nb_pages, docservers, workflow_settings, log, regex, supplier_lang_different,
                                 configurations['locale'], allow_auto)

            if supplier and supplier[2]['skip_auto_validate'] == 'True':
                log.info('Skip automatic validation for this supplier this time')
                database.update({
                    'table': ['accounts_suppliers'],
                    'set': {
                        'skip_auto_validate': 'False'
                    },
                    'where': ['vat_number = %s', 'status <> %s'],
                    'data': [supplier[2]['vat_number'], 'DEL']
                })

        args['document_id'] = document_id

        # Launch process scripting if present
        launch_script(workflow_settings, docservers, 'process', log, file, database, args, config, datas)

        if (status == 'END') or (workflow_settings and (not workflow_settings['process']['use_interface'] or
                                                        not workflow_settings['input']['apply_process'])):
            # Launch outputs scripting if present
            launch_script(workflow_settings, docservers, 'output', log, file, database, args, config)
        return document_id
    else:
        return None