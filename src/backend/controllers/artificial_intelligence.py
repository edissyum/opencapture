# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# See LICENCE file at the root folder for more details.

# @dev : Tristan Coulange <tristan.coulange@free.fr>
# @dev : Oussama Brich <oussama.brich@edissyum.com>

import os
import json
import time
import pandas as pd
from pathlib import Path
from flask_babel import gettext
from flask import request, g as current_context
from src.backend.models import artificial_intelligence, history
from src.backend import create_classes_from_custom_id, retrieve_custom_from_url
from sklearn import feature_extraction, model_selection, naive_bayes, pipeline, metrics


def splitter_retrieve_documents():
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]
    data = []
    for file_name in os.listdir(docservers.get('SPLITTER_TRAIN_PATH_FILES')):
        if not file_name.lower().endswith(".csv") and not file_name.lower().endswith(".gitkeep"):
            data.append(file_name)
    return data


def verifier_retrieve_documents():
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]
    data = []
    for file_name in os.listdir(docservers.get('VERIFIER_TRAIN_PATH_FILES')):
        if not file_name.lower().endswith(".csv") and not file_name.lower().endswith(".gitkeep"):
            data.append(file_name)
    return data


def get_models(module):
    _models = artificial_intelligence.get_models({'where': ["status <> %s", "module = %s"], 'data': ['DEL', module]})
    response = {
        "models": _models
    }
    return response, 200


def get_model_by_id(model_id):
    output_info, error = artificial_intelligence.get_model_by_id({'model_id': model_id})

    if error is None:
        return output_info, 200
    else:
        response = {
            "errors": gettext('GET_IA_MODEL_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def create_model(data):
    _columns = {
        'model_path': data['model_path'],
        'type': data['type'],
        'status': data['status'],
        'module': data['module'],
        'model_label': data['model_label'],
        'documents': json.dumps(data['documents']) if 'documents' in data else "[]"
    }

    res, error = artificial_intelligence.create_model({'columns': _columns})

    if error is None:
        response = {
            "id": res
        }
        return response, 200
    else:
        response = {
            "errors": gettext('CREATE_IA_MODEL_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def delete_model(data, model_id, module):
    args = {
        'set': {},
        'model_id': model_id
    }

    if 'status' in data:
        args['set']['status'] = data['status']
    _, error = artificial_intelligence.update_models(args)

    if error is None:
        history.add_history({
            'module': module,
            'ip': request.remote_addr,
            'submodule': 'update_ai_model',
            'user_info': request.environ['user_info'],
            'desc': gettext('DELETE_AI_MODEL', model=model_id)
        })
        return '', 200


def delete_llm_model(model_llm_id):
    args = {
        'set': {
            'status': 'DEL'
        },
        'model_llm_id': model_llm_id
    }
    _, error = artificial_intelligence.update_llm_models(args)

    if error is None:
        history.add_history({
            'module': 'verifier',
            'ip': request.remote_addr,
            'submodule': 'update_llm_models',
            'user_info': request.environ['user_info'],
            'desc': gettext('DELETE_AI_MODEL', model=model_id)
        })
        return '', 200


def update_model(data, model_id, module, fill_history=False):
    args = {
        'set': {},
        'model_id': model_id
    }

    if 'status' in data:
        args['set']['status'] = data['status']
    if 'percentage' in data:
        args['set']['percentage'] = data['percentage']
    if 'model_label' in data:
        args['set']['model_label'] = data['model_label']
    if 'model_path' in data:
        args['set']['model_path'] = data['model_path']
    if 'min_proba' in data:
        args['set']['min_proba'] = data['min_proba']
    if 'documents' in data:
        if isinstance(data['documents'], list):
            data['documents'] = json.dumps(data['documents'])
        args['set']['documents'] = data['documents']
    if 'train_time' in data:
        args['set']['train_time'] = data['train_time']
    if 'accuracy_score' in data:
        args['set']['accuracy_score'] = data['accuracy_score']

    _, error = artificial_intelligence.update_models(args)

    if error is None:
        if fill_history:
            history.add_history({
                'module': module,
                'ip': request.remote_addr,
                'submodule': 'update_ai_model',
                'user_info': request.environ['user_info'],
                'desc': gettext('UPDATE_AI_MODEL', model=data['model_label'])
            })
        return '', 200

    response = {
        "errors": gettext('UPDATE_IA_MODEL_ERROR'),
        "message": gettext(error)
    }
    return response, 400


def launch_train(data, model_name, module):
    """
    Preparing the model training with data treatment and creation of a new row in the ai_models table
    :param module:
    :param data: The data gathered from the front, containing doctypes info and min_proba argument
    :param model_name: The name of model
    :return: N/A
    """
    if 'docservers' in current_context and 'log' in current_context:
        log = current_context.log
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]
        log = _vars[5]

    folders = []
    for element in data['docs']:
        folders.append(element['folder'])
    min_proba = data['min_proba']

    path = docservers.get('VERIFIER_TRAIN_PATH_FILES') if module == 'verifier' else docservers.get(
        'SPLITTER_TRAIN_PATH_FILES')
    csv_file = path + '/data.csv'
    model_name = docservers.get('VERIFIER_AI_MODEL_PATH') + model_name if module == 'verifier' \
        else docservers.get('SPLITTER_AI_MODEL_PATH') + model_name
    start_time = time.time()

    args = {
        'model_path': model_name.split("/")[-1],
        'type': 'doctype',
        'status': 'training',
        'module': module,
        'model_label': data['label'],
        'documents': data['docs'] if 'docs' in data and data['docs'] else []
    }
    model_id = create_model(args)[0].get('id')

    add_train_text_to_csv(path, csv_file, folders, model_id, module)
    log.info(f"--- ocr time: {(time.time() - start_time)} seconds ---")

    launch_train_model(model_name, csv_file, model_id, module)
    _t2 = round(time.time() - start_time, 0)

    args = {
        'train_time': int(_t2),
        'documents': json.dumps(data["docs"]),
        'min_proba': min_proba if min_proba is not None else "",
        'model_id': model_id
    }
    update_model(args, model_id, module)
    history.add_history({
        'module': module,
        'ip': request.remote_addr,
        'submodule': 'create_ai_model',
        'user_info': request.environ['user_info'],
        'desc': gettext('CREATE_AI_MODEL', model=data['label'])
    })


def launch_train_model(model_name, csv_file, model_id, module):
    """
    Model training using data in a csv file, shows accuracy of the model with tests
    :param model_id: model's id
    :param model_name: name of the model that will be saved, .sav format
    :param csv_file: the csv that contains image read text
    :param module: verifier or splitter
    :return: N/A
    """
    if 'artificial_intelligence' in current_context and 'log' in current_context:
        log = current_context.log
        _artificial_intelligence = current_context.artificial_intelligence
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        log = _vars[5]
        _artificial_intelligence = _vars[12]

    dataset = pd.read_csv(csv_file)

    # split dataset in two parts, training and testing
    dtf_train, dtf_test = model_selection.train_test_split(dataset, test_size=0.2, shuffle=True)
    y_train = dtf_train["Doctype"].values
    y_test = dtf_test["Doctype"].values

    # TfidfVectorizer, transform text to word frequency matrix
    vectorizer = feature_extraction.text.TfidfVectorizer(max_features=None, binary=True, ngram_range=(1, 2),
                                                         sublinear_tf=True, norm='l2', use_idf=True)
    corpus = dtf_train["Text"]
    vectorizer.fit(corpus)
    x_train = vectorizer.transform(corpus)  # the data which will be used to train the model

    classifier = naive_bayes.MultinomialNB(alpha=0.1)  # the prediction model

    # pipeline
    model = pipeline.Pipeline([("vectorizer", vectorizer), ("classifier", classifier)])
    model["classifier"].fit(x_train, y_train)

    # test the model on test values
    x_test = dtf_test["Text"].values
    predicted = model.predict(x_test)

    # accuracy of the model, based on test results
    accuracy = metrics.accuracy_score(y_test, predicted)
    log.info(f"Accuracy: {round(accuracy, 2)}")

    # saving model
    _artificial_intelligence.model_name = model_name
    _artificial_intelligence.save_model(model)

    args = {
        'accuracy_score': int(round(accuracy * 100, 0)),
        'status': 'OK',
        'model_id': model_id
    }
    update_model(args, model_id, module)


def add_train_text_to_csv(file_path, csv_file, chosen_files, model_id, module):
    if 'ocr' in current_context and 'files' in current_context and 'docservers' in current_context \
            and 'log' in current_context and 'artificial_intelligence' in current_context:
        ocr = current_context.ocr
        log = current_context.log
        files = current_context.files
        docservers = current_context.docservers
        _artificial_intelligence = current_context.artificial_intelligence
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        ocr = _vars[4]
        log = _vars[5]
        files = _vars[3]
        docservers = _vars[9]
        _artificial_intelligence = _vars[12]

    j = 0
    rows = []
    count = 0
    total_files = 0
    image_format = [".png", ".jpeg", ".jpg", ".jpe", ".webp", ".tiff", ".tif", ".bmp", ".pdf"]

    for dir_name in os.listdir(file_path):
        if dir_name in chosen_files:
            count += len([file_name for file_name in os.listdir(file_path + "/" + dir_name) if
                          file_name.lower().endswith(tuple(image_format))])
    percent = (100 / count)

    for dir_name in os.listdir(file_path):
        if dir_name in chosen_files:
            i = 0
            list_files = [file for file in os.listdir(file_path + "/" + dir_name + "/")
                          if file.lower().endswith(tuple(image_format))]
            fold_length = len(list_files)
            j += 1

            for file_name in os.listdir(file_path + "/" + dir_name):
                if file_name.lower().endswith(tuple(image_format)):
                    i += 1
                    total_files += 1
                    if file_name.lower().endswith('.pdf'):
                        files.jpg_name = docservers.get('TMP_PATH') + Path(files.normalize(file_name)).stem + '.jpg'
                        files.pdf_to_jpg(file_path + "/" + dir_name + "/" + file_name, 1, open_img=False)
                        filtered_image = files.adjust_image(files.jpg_name)
                    else:
                        filtered_image = files.adjust_image(file_path + "/" + dir_name + "/" + file_name)
                    text = ocr.text_builder(filtered_image).lower()
                    clean_words = _artificial_intelligence.word_cleaning(text)
                    text_stem = _artificial_intelligence.stemming(clean_words)
                    line = [file_name, text_stem, dir_name]
                    rows.append(line)
                    log.info(f"{file_name} : done ({str(i)} out of {str(fold_length)};"
                             f" folder {str(j)} / {str(len(chosen_files))})")

                    args = {
                        'percentage': str(round(total_files * percent, 1)) + " %"
                    }
                    update_model(args, model_id, module)

    _artificial_intelligence.csv_file = csv_file
    _artificial_intelligence.create_csv()
    _artificial_intelligence.add_to_csv(rows)


def predict_from_file_content(model_id, files_content):
    """
    Predict on a list of files
    :param files_content: list of files we want to predict on
    :param model_id: id of the model we want to use
    :return:
    """
    if 'artificial_intelligence' in current_context:
        _artificial_intelligence = current_context.artificial_intelligence
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        _artificial_intelligence = _vars[12]

    _artificial_intelligence.model_id = model_id
    ai_model = artificial_intelligence.get_model_by_id({'model_id': model_id})
    if ai_model:
        ai_model = ai_model[0]
        return _artificial_intelligence.predict_from_file_content(files_content, ai_model)

    response = {
        "errors": gettext('GET_IA_MODEL_BY_ID_ERROR'),
        "message": gettext('IA_MODEL_DOESNT_EXISTS')
    }
    return response, 400


def predict_from_file_path(model_id, file_path):
    """
    Launch prediction on a file
    :param file_path: path of the files we want to predict on
    :param model_id:  id of the model we want to use
    :return:
    """
    if 'artificial_intelligence' in current_context:
        _artificial_intelligence = current_context.artificial_intelligence
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        _artificial_intelligence = _vars[12]

    _artificial_intelligence.model_id = model_id
    result, status = _artificial_intelligence.predict_from_file_path(file_path)
    if status == 200:
        return result, status

    response = {
        "errors": gettext('GET_IA_MODEL_BY_ID_ERROR'),
        "message": gettext('IA_MODEL_DOESNT_EXISTS')
    }
    return response, 400


def rename_model(new_name, model_id, module):
    """
    Rename model .sav file when database name is updated from front
    :param new_name: New name for our model
    :param model_id: unique model's database id
    :param module: verifier or splitter
    :return: N/A
    """
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]

    args = {
        'select': ['model_path'],
        'where': ["id = " + str(model_id)]
    }
    data = artificial_intelligence.get_models(args)
    old_name = [row["model_path"] for row in data][0]
    if module == 'verifier':
        model_path = docservers.get('VERIFIER_AI_MODEL_PATH')
    else:
        model_path = docservers.get('SPLITTER_AI_MODEL_PATH')

    if os.path.exists(model_path + old_name):
        os.rename(model_path + old_name, model_path + new_name)
        return '', 200
    else:
        response = {
            "errors": gettext('RENAME_AI_MODEL_ERROR'),
            "message": gettext('FILE_DOESNT_EXISTS')
        }
        return response, 400

def list_llm_models(args):
    _llm_models = artificial_intelligence.get_llm_models({
        'select': ['*', 'count(*) OVER() as total'],
        'where': ["status <> %s"],
        'data': ['DEL'],
        'limit': str(args['limit']) if 'limit' in args else 'ALL',
        'offset': str(args['offset']) if 'offset' in args else 0,
        'order': args['order'] if 'order' in args else 'id DESC'
    })
    response = {
        "llm_models": _llm_models
    }
    return response, 200


def get_model_llm_by_id(model_id):
    output_info, error = artificial_intelligence.get_model_llm_by_id({'model_id': model_id})

    if error is None:
        return output_info, 200
    else:
        response = {
            "errors": gettext('GET_IA_MODEL_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def create_llm_model(data):
    _columns = {
        'name': data['name'],
        'provider': data['provider']
    }

    res, error = artificial_intelligence.create_llm_model({'columns': _columns})

    if error is None:
        history.add_history({
            'module': 'verifier',
            'ip': request.remote_addr,
            'submodule': 'create_llm_model',
            'user_info': request.environ['user_info'],
            'desc': gettext('CREATE_LLM_MODEL', llm_model=data['name'])
        })
        response = {
            "id": res
        }
        return response, 200
    else:
        response = {
            "errors": gettext('CREATE_AI_LLM_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def get_llm_model_by_id(model_llm_id):
    output_info, error = artificial_intelligence.get_llm_model_by_id({'model_llm_id': model_llm_id})

    if error is None:
        return output_info, 200
    else:
        response = {
            "errors": gettext('GET_LLM_MODEL_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def update_llm_model(model_llm_id, data):
    model_llm_info, error = artificial_intelligence.get_llm_model_by_id({'model_llm_id': model_llm_id})
    if error is None:
        _, error = artificial_intelligence.update_llm_models({
            'set': {
                'name': data['name'],
                'provider': data['provider'],
                'url': data['url'],
                'api_key': data['api_key'],
                'json_content': json.dumps(data['json_content']),
            },
            'model_llm_id': model_llm_id
        })

        if error is None:
            history.add_history({
                'module': 'verifier',
                'ip': request.remote_addr,
                'submodule': 'update_model_llm',
                'user_info': request.environ['user_info'],
                'desc': gettext('UPDATE_LLM', model_llm=model_llm_info['name'])
            })
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_LLM_MODEL_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('UPDATE_LLM_MODEL_ERROR'),
            "message": gettext(error)
        }
        return response, 400
