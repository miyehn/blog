#!/usr/local/bin/python2

import sys
import os
import json

# set environment variables

filepath = os.environ['HOME'] + '/.bash_profile'

file = open(filepath,'a+')

with open ('package.json') as f:
    data = json.load(f)

domain = os.path.dirname(data['homepage'])
content_dir = data['content_dir']
scripts_dir = data['scripts_dir']

file.write('\n# -------- mrblog setup --------\n')
file.write('MRBLOG_DOMAIN="'+domain+'"\n')
file.write('MRBLOG_CONTENT="'+content_dir+'"\n')
file.write('MRBLOG_SCRIPTS="'+scripts_dir+'"\n')
file.write('export MRBLOG_DOMAIN\nexport MRBLOG_CONTENT\nexport MRBLOG_SCRIPTS\n')
file.write('alias mrblog="$MRBLOG_SCRIPTS/mrblog.sh"\n')
file.write('# -------- end of setup --------\n')

file.close()

print('environment variables set')

# create empty content folder in content repo

os.system('mkdir '+content_dir)
os.system('mkdir '+content_dir+'/blogposts')
os.system('mkdir '+content_dir+'/drafts')
os.system('mkdir '+content_dir+'/pics')
os.system('mkdir '+content_dir+'/tracks')

print('content folder created')

# edit .gitignore for content repo

filepath = content_dir + '/../.gitignore'
with open (filepath, 'a+') as gitignore:
    gitignore.write('mrblog-content/drafts\n')
    gitignore.write('mrblog-content/localSummary\n')

print('edited .gitignore')

os.system('npm install')

print('done!')