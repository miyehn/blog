#!/usr/local/bin/python2

import sys
import os
import json

# set environment variables
print('setting environment variables..')

filepath = os.environ['HOME'] + '/.bash_profile'

file = open(filepath,'a+')

with open ('package.json') as f:
    data = json.load(f)

username = data['github_username']
domain = os.path.dirname(data['homepage'])
site_repo = os.path.basename(data['homepage'])
content_dir = data['content_dir']
scripts_dir = data['scripts_dir']

file.write('\n#_begin_mrblog_setup\n')
file.write('MRBLOG_DOMAIN="'+domain+'"\n')
file.write('MRBLOG_CONTENT="'+content_dir+'"\n')
file.write('MRBLOG_SCRIPTS="'+scripts_dir+'"\n')
file.write('export MRBLOG_DOMAIN\nexport MRBLOG_CONTENT\nexport MRBLOG_SCRIPTS\n')
file.write('alias mrblog="$MRBLOG_SCRIPTS/mrblog.sh"\n')
file.write('#_end_mrblog_setup\n')

file.close()

# create empty content folder in content repo
print('creating content folder..')

os.system('mkdir '+content_dir)
os.system('mkdir '+content_dir+'/blogposts')
os.system('mkdir '+content_dir+'/drafts')
os.system('mkdir '+content_dir+'/pics')
os.system('mkdir '+content_dir+'/tracks')

# edit .gitignore for both repos
print('edited .gitignore..')

filepath = content_dir + '/../.gitignore'
with open (filepath, 'a+') as gitignore:
    gitignore.write('mrblog-content/drafts\n')
    gitignore.write('mrblog-content/localSummary\n')

filepath = scripts_dir + '/../.gitignore'
with open (filepath, 'a+') as gitignore:
    gitignore.write('*')
    gitignore.write('!build')

# install packages
# amplitudejs had to be installed this way 
# bc its code from website has some weird bug
print('installing packages..')

os.system('npm install')
os.system('mv amplitudejs node_modules')


# detach this repo from mine and link to yours instead
print('re-linking repo..')

os.system('rm -rf .git')
os.system('git init')
repo = 'https://github.com/' + username + '/' + site_repo + '.git'
os.system('git remote add origin ' + repo)

print('done!')
