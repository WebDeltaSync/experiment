# This Python file uses the following encoding: utf-8
__author__ = 'xiaohe'
import os
from random import randint,choice
from string import ascii_uppercase
from base64 import b64encode
import shutil

DELETE_LEN = 1024*100



for root, dirs, files in os.walk("output"):
    for name in files:
        if(name != 'file_1024K.txt'): continue;
        filepath = 'output/'+name;
        newfilepath = 'delete_output/'+name
        if(name == '.DS_Store'):
            continue
        length = name.replace('file','')
        length = length.replace('K', '')

        # if(not length.__contains__('txt')):continue
        length = length.replace('_', '')
        length = length.replace('.txt', '')
        length = length.replace('.data', '')
        length = int(length) * 1024
        # if (length != 10*1024*1024): continue
        print "########"+name
        with open(filepath, 'r') as fin:
            origin = fin.read();

            # insert start ##
            # 10 part, every part is 1%
            origin_len = length
            for i in range(0,1):
                delete_pos = randint(0,length-DELETE_LEN)
                
                origin = origin[0:delete_pos]+origin[delete_pos+DELETE_LEN:]
                print 'delete position', delete_pos.__str__() + '; delete length:' + DELETE_LEN.__str__()
                print origin.__len__();

            with open(newfilepath,'w') as fout:
                fout.write(origin);
            # shutil.copyfile("/Users/xiaohe/workspace/websync_scripts/output/"+name, "/Users/xiaohe/workspace/websync/WebR2sync/upload/"+name)


