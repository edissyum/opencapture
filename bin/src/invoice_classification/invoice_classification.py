#!/usr/bin/env python
# coding:utf-8
"""
Name : author.py
Author : OBR01
Contact : oussama.brich@edissyum.com
Time    : 10/09/2020 15:56
Desc: this python show how to use the invoice classification model
"""

import os
# Set error/warning level to 3 (to much warnings displayed by Tensorflow)
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
from pdf2image import convert_from_path
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers


# Prediction label list
'''
Every label must be changed with the right label 
keeping the same order 
Example : if "EXEMPLE_1"="TYPOLOGIE_1" then
"EXEMPLE_1" must be replaced with "TYPOLOGIE_1" in the same position (first position for this example)
'''
LABELS_ORDERED_LIST = ['1', '10', '11', '12', '13',
                       '14', '15', '16', '17', '18',
                       '19', '2', '20', '21', '22',
                       '23', '3', '4', '5', '6',
                       '7', '8', '9']

# Global vars
MONO_FACTURE_PATH = ''  # must be set if train function is launched (with forward / slash at end of path)
PREDICT_IMAGES_PATH = ''
TRAIN_IMAGES_PATH = ''
MODEL_PATH = ''  # Tensorflow model path
IMG_HEIGHT = 699
IMG_WIDTH = 495

def convert_pdf_dir_to_images(pdfs_path):
    for dir_name in os.listdir(pdfs_path):
        new_image_dir = TRAIN_IMAGES_PATH + dir_name + "/"
        os.mkdir(new_image_dir)
        for file_name in os.listdir(pdfs_path + "/" + dir_name):
            pages = convert_from_path(pdfs_path + dir_name + "/" + file_name, size=(IMG_WIDTH, IMG_HEIGHT))
            pages[0].save(new_image_dir + file_name.split(".")[0] + '.jpg', 'JPEG')

def get_pdf_first_page(pdf_path):
    pages = convert_from_path(pdf_path, size=(IMG_WIDTH, IMG_HEIGHT))
    file_name = pdf_path.split("/")[-1].replace('pdf', 'jpg')
    image_path = PREDICT_IMAGES_PATH + file_name
    pages[0].save(image_path, 'JPEG')
    return image_path

# Train and save tensorFlow model
def train(images_data_path):
    train_ds = tf.keras.preprocessing.image_dataset_from_directory(
        images_data_path,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=(IMG_HEIGHT, IMG_WIDTH),
        batch_size=32)

    AUTOTUNE = tf.data.experimental.AUTOTUNE

    train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
    val_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)

    num_classes = 23

    input_shape = (IMG_HEIGHT, IMG_WIDTH)

    model = tf.keras.Sequential([
        layers.experimental.preprocessing.Rescaling(1. / 255),
        layers.Conv2D(23, 3, activation='relu', input_shape=input_shape),
        layers.MaxPooling2D(),
        layers.Conv2D(23, 3, activation='relu', input_shape=input_shape),
        layers.MaxPooling2D(),
        layers.Conv2D(23, 3, activation='relu', input_shape=input_shape),
        layers.MaxPooling2D(),
        layers.Flatten(),
        layers.Dense(128, activation='relu', input_shape=input_shape),
        layers.Dense(num_classes)
    ])
    model.compile(
        optimizer='adam',
        loss=tf.losses.SparseCategoricalCrossentropy(from_logits=True),
        metrics=['accuracy'])
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=15
    )

    # Save model
    model.save(MODEL_PATH)

def predict(path_image_test):
    # Load image using Keras
    img = keras.preprocessing.image.load_img(
        path_image_test, target_size=(IMG_HEIGHT, IMG_WIDTH)
    )

    # Convert image to array
    img_array = keras.preprocessing.image.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0)

    # Use Tensorflow model to get predoct list
    if os.path.exists(MODEL_PATH):
        try:
            digit_model = tf.keras.models.load_model(MODEL_PATH)
            pred_probab = digit_model.predict(img_array)[0]
        except IndexError:
            return None
        return pred_probab
    else:
        return None

def predict_typo(pdf_path):
    image_path = get_pdf_first_page(pdf_path)
    pred_probab = predict(image_path)

    file_name = pdf_path.split("/")[-1].replace('pdf', 'jpg')
    image_path = PREDICT_IMAGES_PATH + file_name

    if pred_probab is not None:
        pred_index = list(pred_probab).index(max(pred_probab))
        typo = LABELS_ORDERED_LIST[pred_index]
        predict_op = tf.nn.softmax(pred_probab)
        pred_index = list(predict_op).index(max(predict_op))
        predictionPercentage = str(float('%2f' % int(predict_op[pred_index].numpy() * 100)))

        try:
            os.remove(image_path)
        except FileNotFoundError:
            pass

        return typo, predictionPercentage
    else:
        try:
            os.remove(image_path)
        except FileNotFoundError:
            pass
        return False, False
