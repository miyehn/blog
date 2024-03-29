#!/usr/bin/env python

import sys
import os
import shutil

argc = len(sys.argv)
scripts_dir = os.environ['MRBLOG_PATH'] + "/scripts"
content_dir = os.environ['MRBLOG_CONTENT']

pc = os.environ.get('MRBLOG_PC', '0')

def redirect_script(cmd):
    args = sys.argv[2:]
    for arg in args:
        cmd += ' ' + arg
    os.system(cmd)

if argc==1:
    print('-------- Welcome to mrblog! --------')
    print('Currently configured for domain: '+os.environ['MRBLOG_DOMAIN'])
    with open(scripts_dir + '/usage', 'r') as f:
        shutil.copyfileobj(f, sys.stdout)
    print('')
elif sys.argv[1]=='new':
    redirect_script('bash ' + scripts_dir + '/new.sh')
elif sys.argv[1]=='find':
    os.system('python ' + scripts_dir + '/find.py')
elif sys.argv[1]=='publish':
    os.system('bash ' + scripts_dir + '/publish.py')
elif sys.argv[1]=='pic':
    os.system('python ' + scripts_dir + '/post_pic.py')
elif sys.argv[1]=='content':
    if pc=='1':
        os.system('start ' + content_dir)
    else:
        os.system('open ' + content_dir)
elif sys.argv[1]=='sketchdump':
    redirect_script('python ' + scripts_dir + '/sketchdump.py')