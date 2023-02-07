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

# @dev : Tristan Coulange <tristan.coulange@free.fr>

import os
import csv
import json
import time
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from flask import request
from nltk import word_tokenize
from flask_babel import gettext
from nltk.corpus import stopwords
from nltk.stem import SnowballStemmer
from src.backend.import_models import artificial_intelligence
from src.backend import create_classes_from_custom_id, retrieve_custom_from_url
from sklearn import feature_extraction, model_selection, naive_bayes, pipeline, metrics


def splitter_retrieve_documents():
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _docservers = _vars[9]
    data = []
    for file_name in os.listdir(_docservers.get('SPLITTER_TRAIN_PATH_FILES')):
        if not file_name.endswith(".csv") and not file_name.endswith(".gitkeep"):
            data.append(file_name)
    return data


def verifier_retrieve_documents():
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _docservers = _vars[9]
    data = []
    for file_name in os.listdir(_docservers.get('VERIFIER_TRAIN_PATH_FILES')):
        if not file_name.endswith(".csv") and not file_name.endswith(".gitkeep"):
            data.append(file_name)
    return data


def get_models(module):
    _models = artificial_intelligence.get_models({'where': ["status = %s", "module = %s"], 'data': ['OK', module]})

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
            "message": error
        }
        return response, 401


def create_model(data):
    _columns = {
        'model_path': data['model_path'],
        'type': data['type'],
        'status': data['status'],
        'module': data['module'],
        'model_label': data['model_label'],
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
            "message": error
        }
        return response, 401


def update_model(args):
    res, error = artificial_intelligence.update_models(args)
    if error is None:
        return '', 200
    response = {
        "errors": gettext('UPDATE_IA_MODEL_ERROR'),
        "message": error
    }
    return response, 401


def launch_train(data, model_name):
    """
    Preparing the model training with data treatment and creation of a new row in the ai_models table
    :param data: The data gathered from the front, containing doctypes info and min_pred argument
    :param model_name: The name of model
    :return: N/A
    """

    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _docservers = _vars[9]

    folders = []
    for element in data['docs']:
        folders.append(element['folder'])
    min_pred = data['min_pred']

    path = _docservers.get('VERIFIER_TRAIN_PATH_FILES') if data['module'] == 'verifier' else _docservers.get('SPLITTER_TRAIN_PATH_FILES')
    csv_file = path + '/data.csv'
    model_name = _docservers.get('VERIFIER_AI_MODEL_PATH') + model_name if data['module'] == 'verifier' else _docservers.get('SPLITTER_AI_MODEL_PATH') + model_name
    start_time = time.time()

    args = {
        'model_path': model_name.split("/")[-1],
        'type': 'doctype',
        'status': 'training',
        'module': data['module'],
        'model_label': data['label']
    }
    model_id = create_model(args)[0].get('id')

    add_train_text_to_csv(path, csv_file, folders, model_id)
    print("--- ocr time: %s seconds ---" % (time.time() - start_time))

    launch_train_model(model_name, csv_file, model_id)
    t2 = round(time.time() - start_time, 0)

    args = {
        'set': {
            'train_time': int(t2),
            'documents': json.dumps(data["docs"]),
            'min_proba': min_pred if min_pred is not None else ""
        },
        'model_id': model_id,
    }
    update_model(args)


def launch_train_model(model_name, csv_file, model_id):
    """
    Model training using data in a csv file, shows accuracy of the model with tests
    :param model_id: model's id
    :param model_name: name of the model that will be saved, .sav format
    :param csv_file: the csv that contains image read text
    :return: N/A
    """

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
    model = pipeline.Pipeline([("vectorizer", vectorizer),
                               ("classifier", classifier)])

    # train classifier
    print("Model training :")
    model["classifier"].fit(x_train, y_train)

    # test the model on test values
    x_test = dtf_test["Text"].values
    predicted = model.predict(x_test)

    # accuracy of the model, based on test results
    accuracy = metrics.accuracy_score(y_test, predicted)
    print("Accuracy:", round(accuracy, 2))

    # saving model
    save_model(model, model_name)

    # update database
    args = {
        'set': {
            'accuracy_score': int(round(accuracy*100, 0)),
            'status': 'OK',
        },
        'model_id': model_id
    }
    update_model(args)


def save_model(model, filename):
    """
    Save the model in a .sav file to re-use it later
    :param model: the trained model we want to save
    :param filename: the model path (.sav format)
    :return: N/A
    """

    pickle.dump(model, open(filename, 'wb'))


def add_train_text_to_csv(file_path, csv_file, chosen_files, model_id):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _ocr = _vars[4]
    _files = _vars[3]
    _docservers = _vars[9]

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
            files = [file for file in os.listdir(file_path + "/" + dir_name + "/")
                     if file.lower().endswith(tuple(image_format))]
            fold_length = len(files)
            j += 1

            for file_name in os.listdir(file_path + "/" + dir_name):
                if file_name.lower().endswith(tuple(image_format)):
                    i += 1
                    total_files += 1
                    if file_name.lower().endswith('.pdf'):
                        _files.jpg_name = _docservers.get('TMP_PATH') + Path(_files.normalize(file_name)).stem + '.jpg'
                        _files.pdf_to_jpg(file_path + "/" + dir_name + "/" + file_name, 1, open_img=False)
                        filtered_image = _files.adjust_image(_files.jpg_name)
                    else:
                        filtered_image = _files.adjust_image(file_path + "/" + dir_name + "/" + file_name)
                    text = _ocr.text_builder(filtered_image).lower()
                    clean_words = word_cleaning(text)
                    text_stem = stemming(clean_words)
                    line = [file_name, text_stem, dir_name]
                    rows.append(line)
                    print(file_name, ": done (" + str(i), "out of", str(fold_length) + "; folder", str(j) + "/" + str(len(chosen_files)) + ")")

                    args = {
                        'set': {
                            'status': str(round(total_files * percent, 1)) + " %"
                        },
                        'model_id': model_id
                    }
                    update_model(args)

    create_csv(csv_file)
    add_to_csv(csv_file, rows)


def add_to_csv(csv_file, data_list):
    """
    Add list data to a csv file
    :param csv_file: path of the csv file
    :param data_list: list containing data we want to add to the csv
    :return: N/A
    """

    with open(csv_file, 'a', encoding='UTF-8') as f:
        writer = csv.writer(f)
        for val in data_list:
            writer.writerow(val)


def create_csv(csv_file):
    """
    Create new csv file with defined header
    :param csv_file: path of the csv file we want to create
    :return: N/A
    """

    header = ['Filename', 'Text', 'Doctype']
    with open(csv_file, 'w', encoding='UTF-8') as f:
        writer = csv.writer(f)
        writer.writerow(header)


def word_cleaning(text):
    """
    Clean a text by removing punctuation, numbers and determiners
    :param text: string text we want to clean
    :return: list of clean words
    """

    words = word_tokenize(text, language='french')  # Creates a list with separated words one by one
    words_no_punc = []
    for word in words:
        if word.isalpha():
            words_no_punc.append(word)  # Keep only alpha characters

        # Help to find if document is a French driver license by detecting 'D1FRA' pattern
        for w in ("d1fra", "dtdra", "difra", "d'fra"):
            if w in word:
                words_no_punc.extend(["permis", "conduire"])

        # Help to find if document is a French ID Card by detecting 'IDFRA' pattern
        for w in ("idfra", "1dfra"):
            if w in word:
                words_no_punc.extend(["carte", "identité"])

    stop_words = stopwords.words("french")  # Stopwords are determiners or much used verbs forms like "est"
    clean_words = []
    for word in words_no_punc:
        if word not in stop_words:
            clean_words.append(word)  # Keeping only words not in stopwords list
    return clean_words


def stemming(clean_text):
    """
    Take a list containing words and keep only the root of these words
    :param clean_text: list of words
    :return: list of stemmed words
    """

    stem = [SnowballStemmer("french").stem(word) for word in clean_text]
    return stem


def launch_pred(model_id, files):
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _files = _vars[3]
    _docservers = _vars[9]

    for file in files:
        _f = files[file]
        file_to_save = _files.normalize(_f.filename)
        path = _docservers.get('TMP_PATH') + file_to_save
        _f.save(path)
        ai_model = artificial_intelligence.get_model_by_id({'model_id': model_id})
        if ai_model:
            ai_model = ai_model[0]
            model_name = _docservers.get('VERIFIER_AI_MODEL_PATH') + ai_model['model_path'] if ai_model['module'] == 'verifier' \
                else _docservers.get('SPLITTER_AI_MODEL_PATH') + ai_model['model_path']
            if os.path.exists(model_name):
                csv_file = _docservers.get('VERIFIER_TRAIN_PATH_FILES') + '/data.csv' if ai_model['module'] == 'verifier' \
                    else _docservers.get('SPLITTER_TRAIN_PATH_FILES') + '/data.csv'
                store_one_file(path, csv_file)
                return model_testing(model_name, csv_file)

    response = {
        "errors": gettext('GET_IA_MODEL_BY_ID_ERROR'),
        "message": gettext('IA_MODEL_DOESNT_EXISTS')
    }
    return response, 401


def model_testing(model, csv_file):
    """
    Use a saved model to predict document types
    :param model: the model we want to use (.sav format)
    :param csv_file: csv file containing test data
    :return: N/A
    """

    dataset = pd.read_csv(csv_file)
    x_test = dataset["Text"].values

    loaded_model = pickle.load(open(model, 'rb'))

    predicted = loaded_model.predict(x_test)
    predicted_prob = loaded_model.predict_proba(x_test)

    values = [dataset.loc[0, 'Filename'], predicted[0], round(np.max(predicted_prob[0] * 100), 0)]
    return values, 200


def store_one_file(file_path, csv_file):
    """
    Use ocr on a single file and store results in a csv file
    :param file_path: path of the file we need to read
    :param csv_file: path of csv file which will get the data
    :return: N/A
    """

    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _files = _vars[3]
    _ocr = _vars[4]
    _docservers = _vars[9]
    rows = []

    _files.jpg_name = _docservers.get('TMP_PATH') + Path(_files.normalize(file_path)).stem + '.jpg'
    _files.pdf_to_jpg(file_path, 1, open_img=False)
    if os.path.exists(_files.jpg_name):
        filtered_image = _files.adjust_image(_files.jpg_name)
    else:
        _files.jpg_name = _docservers.get('TMP_PATH') + Path(_files.jpg_name).stem + '-1.jpg'
        filtered_image = _files.adjust_image(_files.jpg_name)
    text = _ocr.text_builder(filtered_image).lower()
    clean_words = word_cleaning(text)
    text_stem = stemming(clean_words)
    line = [os.path.basename(file_path), text_stem]
    rows.append(line)

    create_csv(csv_file)
    add_to_csv(csv_file, rows)


def store_one_file_from_script(file_path, csv_file, files, ocr, docservers, log):
    rows = []
    jpg_name = docservers.get('TMP_PATH') + Path(files.normalize(file_path)).stem + '.jpg'
    files.save_img_with_pdf2image_static(file_path, jpg_name, log, 1)
    if os.path.exists(jpg_name):
        filtered_image = files.adjust_image(jpg_name)
    else:
        jpg_name = docservers.get('TMP_PATH') + Path(jpg_name).stem + '-1.jpg'
        filtered_image = files.adjust_image(jpg_name)
    text = ocr.text_builder(filtered_image).lower()
    clean_words = word_cleaning(text)
    text_stem = stemming(clean_words)
    line = [os.path.basename(file_path), text_stem]
    rows.append(line)

    create_csv(csv_file)
    add_to_csv(csv_file, rows)


def rename_model(new_name, model_id):
    """
    Rename model .sav file when database name is updated from front
    :param new_name: New name for our model
    :param model_id: unique model's database id
    :return: N/A
    """

    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id)
    _docservers = _vars[9]
    args = {
        'select': ['model_path'],
        'where': ["id = " + str(model_id)],
    }
    data = artificial_intelligence.get_models(args)
    old_name = [row["model_path"] for row in data][0]
    model_path = _docservers.get('SPLITTER_AI_MODEL_PATH')
    os.rename(model_path + old_name, model_path + new_name)
