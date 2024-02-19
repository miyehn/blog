#!/usr/bin/env python

import os
pc = os.environ.get('MRBLOG_PC', '0')

content_dir = os.environ['MRBLOG_CONTENT']

s = input('gimme some text in the post you\'re trying to find:\n> ')
files = os.popen('grep -l "' + s + '" ' + content_dir + '/drafts/*.md').read().strip().split('\n')

while not (len(files)==1 and len(files[0])>0):
    if len(files[0])==0:
        print('no post contains it.')
    else:
        print('more than one post contains it')

    s = input('gimme some other text:\n> ')
    files = os.popen('grep -l "' + s + '" ' + content_dir + '/drafts/*.md').read().strip().split('\n')

f = files[0]
print('cool. the post you\'re looking for is in file\n' + f)

rec_action = False

while not rec_action:
    a = input('what do you want to do with it?\nreply [e]dit, [r]ename, [d]elete, or [n]othing:\n> ').lower()
    if a=='e' or a=='edit':
        if pc=='1':
            os.system('start '+f)
        else:
            os.system('open '+f)
        rec_action = True
    elif a=='r' or a=='rename':
        new_name = input('sure. gimme it\'s new name (not the whole path) (without extension):\n> ')
        while True:
            new_path = content_dir+'/drafts/'+new_name+'.md'
            if os.path.isfile(new_path):
                new_name = input('this name\'s taken. gimme another one:\n> ')
            else:
                os.system('mv '+f+' '+new_path)
                print('ok it\'s renamed.')
                exit()
    elif a=='d' or a=='delete':
        os.system('mkdir -p '+content_dir+'/trash')
        os.system('mv '+f+' '+content_dir+'/trash')
        print('ok it\'s moved to mrblog-content/trash.')
        rec_action = True
    elif a=='n' or a=='nothing':
        print('alright.')
        rec_action = True
    else:
        print('can\'t recognize this input. try again.\n')