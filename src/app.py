from time import sleep

import kuyruk
from flask import Flask
from kuyruk import Config

app = Flask(__name__)

@app.route('/')
def super_endpoint():
    return 'Hello World'

@app.route('/test')
def test_endpoint():
    print('here')
    test_task()
    return 'test_endpoint'

rabbit_custom = Config()
rabbit_custom.RABBIT_PORT = 5672
rabbit_custom.RABBIT_HOST = 'rabbitmq'
rabbit_custom.RABBIT_USER = 'admin'
rabbit_custom.RABBIT_PASSWORD = 'admin'
kuyruk = kuyruk.Kuyruk(config=rabbit_custom)
@kuyruk.task(queue='test_task')
def test_task():
    print('here')
    sleep(10)
    print("Task executed")