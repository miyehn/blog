#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import glob

content_dir = os.environ['MRBLOG_CONTENT']

def mrblog_read(path, includeTags=False):
    file = open(path, mode='r', encoding='utf8') # encoding not supported in python2 wtf
    text = file.read().strip()
    file.close()

    header = text[text.find('---\n')+4:]
    body = header[header.find('---\n')+4:]
    header = header[0:header.find('---\n')]

    # parse body to see if has partially hidden content
    contentRaw = body
    ind = body.find('<!--hide-->')+11
    partial = False
    textOrig = ''
    textAlt = ''
    while ind >= 11:
        partial = True
        textOrig += body[0:ind-11]
        textAlt += body[0:ind-11]
        ind2 = body.find('<!--endhide-->')
        if ind2>=0:
            textAlt += body[ind:ind2]
            body = body[ind2 + 14:]
        else:
            textAlt += body[ind:]
            body = ''
        ind = body.find('<!--hide-->')+11

    textOrig += body
    textAlt += body

    # title
    ind = header.find('title:')+6
    if ind<6:
        title = ''
    else:
        title = header[ind:]
    title = title[0:title.find('\n')].strip()

    # tags
    ind = header.find('tags:')+5
    if ind<5:
        tagstr = ''
    else:
        tagstr = header[ind:]
        tagstr = tagstr[0:tagstr.find('\n')].strip()[1:-1]
    tagarr0 = tagstr.split(',')
    tagarr0 = filter(None, tagarr0)
    tagarr = []
    for tag in tagarr0:
        tagStripped = tag.strip()
        tagarr.append(tagStripped)

    # categories
    ind = header.find('categories:')+11
    if ind<11: # old posts that don't have categories but may have tags. TODO: cleanup
        categoriesStr = tagstr
    else:
        categoriesStr = header[ind:]
        categoriesStr = categoriesStr[0:categoriesStr.find('\n')].strip()[1:-1]
    categoriesArr0 = categoriesStr.split(',')
    categoriesArr0 = filter(None, categoriesArr0)
    categoriesArr = []
    for category in categoriesArr0:
        levels = category.split('-')
        categoryStripped = ''
        for l in levels:
            categoryStripped += l.strip() + '-'
        categoryStripped = categoryStripped[:-1]
        categoriesArr.append(categoryStripped)

    # publicity
    ind = header.find('public:')+7
    if ind<7:
        publicity = 0
    elif header[ind:].strip()[0:4].lower()=='true':
        if partial:
            publicity = 1
        else:
            publicity = 2
    else:
        publicity = 0
    if publicity==0 or publicity==1:
        tagarr.append('hidden')
        categoriesArr.append('hidden')

    # date
    ind = header.find('date:')+5
    if ind<5:
        datestr = ''
    else:
        datestr = header[ind:]
    datestr = datestr[0:datestr.find('\n')].strip()

    # collapsed
    ind = header.find('collapsed:')+10
    if ind<10:
        collapsed = False
    elif header[ind:].strip()[0:4].lower()=='true':
        collapsed = True
    else:
        collapsed = False

    # jsonify
    data = {
        'title': title,
        'path': path[len(os.environ['MRBLOG_CONTENT']) + 8:-3],
        'categories': categoriesArr,
        'publicity': publicity,
        'collapsed': collapsed,
        'date': datestr,
        'content': textOrig.strip(),
        'contentRaw': contentRaw.strip()
    }
    if includeTags:
        data['tags'] = tagarr

    return data

publicVals = ['hidden', 'partial', 'true']
def mrblog_write(obj, path):
    dirname = os.path.dirname(path)
    if len(dirname) > 0 and not os.path.exists(dirname):
        os.makedirs(dirname)
    with open(path, 'w+', encoding='utf8') as outfile:
        outfile.write('---\n')
        # title
        outfile.write('title: {}\n'.format(obj['title']))
        # date
        outfile.write('date: {}\n'.format(obj['date']))
        # tags
        tags = list(filter(lambda s: s != 'hidden', obj['tags']))
        if len(tags) > 0:
            outfile.write('tags: [{}]\n'.format(', '.join(tags)))
        # categories
        categories = list(filter(lambda s: s != 'hidden', obj['categories']))
        outfile.write('categories: [{}]\n'.format(', '.join(categories)))
        # collapsed
        outfile.write('collapsed: {}\n'.format(obj['collapsed']))
        # public
        outfile.write('public: {}\n'.format(publicVals[obj['publicity']]))

        outfile.write('\n---\n\n')
        outfile.write(obj['contentRaw'])


# fn: PostObject -> PostObject
def mrblog_process_all(fn, outDir):
    paths = glob.glob(content_dir + '/drafts/*.md')
    for path in paths:
        inObj = mrblog_read(path, True)
        outObj = fn(inObj)
        mrblog_write(outObj, content_dir + '/' + outDir + '/' + outObj['path'] + '.md')