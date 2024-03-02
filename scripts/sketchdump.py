#!/usr/bin/env python
# -*- coding: utf-8 -*-

from mrutils import copy_img
from mrparser import mrblog_write

import glob
import os
import time
import datetime
import sys

content_dir = os.environ['MRBLOG_CONTENT']
sketches_dir = os.environ['MRBLOG_SKETCHES']
paths = glob.glob(sketches_dir + '/*.png')

if (len(paths) == 0):
    print('no sketches to dump')
    exit(0)

ts = int(time.time())
dt = datetime.datetime.fromtimestamp(ts)
if not os.path.exists(sketches_dir + '/posted'):
    os.makedirs(sketches_dir + '/posted')

if (len(sys.argv) >= 2):
    content = sys.argv[1] + '\n'
else:
    content = '（自动发图）\n'

cnt = 0
for path in paths:
    content += copy_img(path, '_' + str(cnt)) + '\n'
    cnt += 1
    dirname = os.path.dirname(path)
    basename = os.path.basename(path)
    os.system('mv "' + path + '" "' + dirname + '/posted/' + basename + '"')

collapsed = True
if (len(sys.argv) >= 3 and sys.argv[2] == '0'):
    collapsed = False
post = {
    'title': '',
    'path': 'sketch-' + str(ts),
    'categories': ['绘画-摸'],
    'tags': [],
    'publicity': 2, # true
    'collapsed': collapsed,
    'date': dt,
    'content': content,
    'contentRaw': content
}

mrblog_write(post, content_dir + '/drafts/' + post['path'] + '.md')

print('dumped ' + str(cnt) + ' sketches')