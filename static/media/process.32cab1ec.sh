#!/usr/bin/python
# -*- coding: utf-8 -*-

import glob
import json
tmp = ''
rawData = []

paths = glob.glob('../posts/*.md')
for path in paths:
    file = open(path, 'r')
    text = file.read().strip()

    header = text[text.find('---\n')+4:]
    header = header[0:header.find('---\n')]
    #title
    ind = header.find('title:')+6
    if ind<6:
        title = ''
    else:
        title = header[ind:]
    title = title[0:title.find('\n')].strip()
    #tags
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
        tagarr.append(tag.strip())
    #publicity
    ind = header.find('public:')+7
    if ind<5:
        publicity = False
    elif header[ind:].strip()[0:4].lower()=='true':
        publicity = True
    else:
        publicity = False
    #date
    ind = header.find('date:')+5
    if ind<5:
        date = ''
    else:
        date = header[ind:]
    date = date[0:date.find('\n')].strip()

    #jsonify
    data = {
        'title': title,
        'path': path[9:],
        'tags': tagarr,
        'publicity': publicity,
        'date': date
    }
    rawData.append(data)
    file.close()

with open('summary.txt', 'w+') as outfile:
    json.dump(rawData, outfile, indent=4, ensure_ascii=False)

print('summary.txt generated')

