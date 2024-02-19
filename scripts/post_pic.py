#!/usr/bin/env python
# -*- coding: utf-8 -*-

import glob
import os
import sys
import time
sys.path.append('/usr/local/lib/python2.7/dist-packages')
sys.path.append('/Library/Frameworks/Python.framework/Versions/3.12/lib/python3.12/site-packages')
import pyperclip

content_dir = os.environ['MRBLOG_CONTENT']
domain = os.environ['MRBLOG_DOMAIN']

pc = os.environ.get('MRBLOG_PC', '0')
if pc == '1':
    file = input('gimme an image (drag it to this window):\n')
else:
    file = raw_input('gimme an image (drag it to this window):\n')

img_path = file.replace('\\','/').strip()
os.system('cp "'+img_path+'" '+content_dir+'/docs/pics')
name = os.path.splitext(os.path.basename(img_path))
ts = str(int(time.time())) # timestamp
src = content_dir+'/docs/pics/'+name[0]+name[1]
dst = content_dir+'/docs/pics/'+ts+name[1]
os.rename (src, dst)

md_str = '![]('+domain+'/mrblog-content/pics/'+ts+name[1]+')'
pyperclip.copy(md_str)
print(md_str)
print('(it\'s already copied to clipboard)')