#!/usr/bin/env python
# -*- coding: utf-8 -*-

import glob
import os
import sys
sys.path.append('/usr/local/lib/python2.7/dist-packages')
sys.path.append('/Library/Frameworks/Python.framework/Versions/3.12/lib/python3.12/site-packages')
import pyperclip

from mrutils import copy_img

pc = os.environ.get('MRBLOG_PC', '0')
if pc == '1':
    infile = input('gimme an image (drag it to this window):\n')
else:
    infile = raw_input('gimme an image (drag it to this window):\n')

copystr = copy_img(infile)
pyperclip.copy(copystr)
print(copystr)
print('(it\'s already copied to clipboard)')