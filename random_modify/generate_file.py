# This Python file uses the following encoding: utf-8
__author__ = 'xiaohe'

import os
from random import choice
from string import ascii_uppercase
from base64 import b64encode

# 64M


for i in range(1,2):
    # i M bytes
    length = i*1024
    print length
    # with open('output/file'+length.__str__()+'K.txt', 'w') as fout:
    #     fout.write(''.join(choice(ascii_uppercase) for i in range(length*1024)))
    with open('output/file_'+length.__str__()+'K.txt', 'w') as fout:
        # token = b64encode(os.urandom(length * 1024)).decode('utf-8')
        # fout.write(token)
        fout.write(os.urandom(length * 1024))