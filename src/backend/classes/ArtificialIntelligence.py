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

# @dev : Tristan Coulange <tristan.coulange@free.fr>
# @dev : Oussama Brich <oussama.brich@edissyum.com>

import os
import csv
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from nltk import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import SnowballStemmer


class ArtificialIntelligence:
    def __init__(self, csv_file, model_name, model_id, files, ocr, docservers, log):
        self.log = log
        self.ocr = ocr
        self.files = files
        self.csv_file = csv_file
        self.model_id = model_id
        self.model_name = model_name
        self.docservers = docservers

    def predict_from_file_content(self, files_content, ai_model):
        """
        Predict on a list of files
        :param files_content: list of files we want to predict on
        :param ai_model: AI model configuration
        :return:
        """

        file_path = ''
        for file in files_content:
            _f = files_content[file]
            file_to_save = self.files.normalize(_f.filename)
            file_path = self.docservers.get('TMP_PATH') + file_to_save
            _f.save(file_path)

        result, status = self.predict_from_file_path(file_path, ai_model)
        return result, status

    def predict_from_file_path(self, file_path, ai_model):
        """
        Launch prediction on a file
        :param file_path: path of the files we want to predict on
        :param ai_model: AI model configuration
        :return: prediction result
        """
        model_name = self.docservers.get('VERIFIER_AI_MODEL_PATH') + ai_model['model_path'] \
            if ai_model['module'] == 'verifier' \
            else self.docservers.get('SPLITTER_AI_MODEL_PATH') + ai_model['model_path']

        if os.path.exists(model_name):
            csv_file = self.docservers.get('VERIFIER_TRAIN_PATH_FILES') + '/data.csv' \
                if ai_model['module'] == 'verifier' \
                else self.docservers.get('SPLITTER_TRAIN_PATH_FILES') + '/data.csv'
            self.csv_file = csv_file
            self.store_one_file(file_path)
            result, status = self.model_testing(model_name)

            if ai_model['module'] == 'splitter':
                for document in ai_model['documents']:
                    if document['folder'] == result[1]:
                        result.append(document['doctype'])
                        break

            return result, status

    def model_testing(self, model):
        """
        Use a saved model to predict document types
        :param model: the model we want to use (.sav format)
        :return: N/A
        """

        dataset = pd.read_csv(self.csv_file)
        x_test = dataset["Text"].values

        with open(model, 'rb') as _f:
            loaded_model = pickle.load(_f)

        predicted = loaded_model.predict(x_test)
        predicted_prob = loaded_model.predict_proba(x_test)

        values = [dataset.loc[0, 'Filename'], predicted[0], round(np.max(predicted_prob[0] * 100), 0)]
        return values, 200

    def store_one_file(self, file_path):
        """
        Use ocr on a single file and store results in a csv file
        :param file_path: path of the file we need to read
        :return: N/A
        """

        rows = []
        self.files.jpg_name = self.docservers.get('TMP_PATH') + Path(self.files.normalize(file_path)).stem + '.jpg'
        self.files.pdf_to_jpg(file_path, 1, open_img=False)
        if os.path.exists(self.files.jpg_name):
            filtered_image = self.files.adjust_image(self.files.jpg_name)
        else:
            self.files.jpg_name = self.docservers.get('TMP_PATH') + Path(self.files.jpg_name).stem + '-1.jpg'
            filtered_image = self.files.adjust_image(self.files.jpg_name)
        text = self.ocr.text_builder(filtered_image).lower()
        clean_words = self.word_cleaning(text)
        text_stem = self.stemming(clean_words)
        line = [os.path.basename(file_path), text_stem]
        rows.append(line)

        self.create_csv()
        self.add_to_csv(rows)

    def create_csv(self):
        """
        Create new csv file with defined header
        :return: N/A
        """

        header = ['Filename', 'Text', 'Doctype']
        with open(self.csv_file, 'w', encoding='UTF-8') as f:
            writer = csv.writer(f)
            writer.writerow(header)

    def add_to_csv(self, data_list):
        """
        Add list data to a csv file
        :param data_list: list containing data we want to add to the csv
        :return: N/A
        """

        with open(self.csv_file, 'a', encoding='UTF-8') as _f:
            writer = csv.writer(_f)
            for val in data_list:
                writer.writerow(val)

    def store_one_file_from_script(self, file_path):
        rows = []
        jpg_name = self.docservers.get('TMP_PATH') + Path(self.files.normalize(file_path)).stem + '.jpg'
        self.files.save_img_with_pdf2image_static(file_path, jpg_name, self.log, 1)
        if os.path.exists(jpg_name):
            filtered_image = self.files.adjust_image(jpg_name)
        else:
            jpg_name = self.docservers.get('TMP_PATH') + Path(jpg_name).stem + '-1.jpg'
            filtered_image = self.files.adjust_image(jpg_name)
        text = self.ocr.text_builder(filtered_image).lower()
        clean_words = self.word_cleaning(text)
        text_stem = self.stemming(clean_words)
        line = [os.path.basename(file_path), text_stem]
        rows.append(line)

        self.create_csv()
        self.add_to_csv(rows)

    def save_model(self, model):
        """
        Save the model in a .sav file to re-use it later
        :param model: the trained model we want to save
        :return: N/A
        """
        pickle.dump(model, open(self.model_name, 'wb'))

    @staticmethod
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
            for _w in ("d1fra", "dtdra", "difra", "d'fra"):
                if _w in word:
                    words_no_punc.extend(["permis", "conduire"])

            # Help to find if document is a French ID Card by detecting 'IDFRA' pattern
            for _w in ("idfra", "1dfra"):
                if _w in word:
                    words_no_punc.extend(["carte", "identité"])

        stop_words = stopwords.words("french")  # Stopwords are determiners or much used verbs forms like "est"
        clean_words = []
        for word in words_no_punc:
            if word not in stop_words:
                clean_words.append(word)  # Keeping only words not in stopwords list
        return clean_words

    @staticmethod
    def stemming(clean_text):
        """
        Take a list containing words and keep only the root of these words
        :param clean_text: list of words
        :return: list of stemmed words
        """

        stem = [SnowballStemmer("french").stem(word) for word in clean_text]
        return stem
