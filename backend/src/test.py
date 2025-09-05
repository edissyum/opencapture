from time import sleep

import kuyruk
from flask import Flask
from kuyruk import Config


rabbit_custom = Config()
rabbit_custom.RABBIT_PORT = 5672
rabbit_custom.RABBIT_HOST = 'rabbitmq'
kuyruk = kuyruk.Kuyruk(config=rabbit_custom)
@kuyruk.task(queue='test_task')
def test_task():
    print('here')
    sleep(10)
    print("Task executed")


if __name__ == "__main__":
    test_task()