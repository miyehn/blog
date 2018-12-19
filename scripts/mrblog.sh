#!/usr/local/bin/python2

import sys
import os

argc = len(sys.argv)
scripts_dir = os.environ['MRBLOG_SCRIPTS']

if argc==1:
    with open(scripts_dir + '/usage', 'r') as file:
        print file.read()

elif sys.argv[1]=='new':
    os.system(scripts_dir + '/new.sh')
elif sys.argv[1]=='publish':
    os.system(scripts_dir + '/publish.sh')
elif sys.argv[1]=='pic':
    if argc>=3:
        os.system(scripts_dir + '/post_pic.sh ' + sys.argv[2])
    else:
        print('give another argument (image path)')
elif sys.argv[1]=='setenv':
    os.system('./setenv.sh')