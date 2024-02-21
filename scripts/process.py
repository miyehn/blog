#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import glob
import json
import os
import shutil
import time
import datetime
from parser import *

rawData = []
content_dir = os.environ['MRBLOG_CONTENT']
install_dir = os.environ['MRBLOG_PATH']
magicword = open(install_dir + '/magicword', 'r').read().strip()

#remove old files in posts/
paths = glob.glob(content_dir + '/docs/blogposts/*')
for path in paths:
    os.remove(path)

paths = glob.glob(content_dir + '/docs/index/*')
for path in paths:
    os.remove(path)

paths = glob.glob(content_dir + '/drafts/*.md')

# get timestamp (parsed from date)
def getTimeKey(obj):
    datestr = obj['date']
    timestamp = "unparsed"
    try:
        timestamp = time.mktime(datetime.datetime.strptime(datestr, "%Y-%m-%d %H:%M").timetuple())
    except:
        try:
            timestamp = time.mktime(datetime.datetime.strptime(datestr, "%Y-%m-%d %H:%M:%S").timetuple())
        except:
            timestamp = 99999999999999999
    return timestamp

# maintain a set of tags for later
listsPerCategory = {}
listsPerCategoryPublic = {}

for path in paths:

    data = mrblog_read(path)

    # and categories list, in the same way:
    for category in data['categories']:
        if not (category in listsPerCategory): listsPerCategory[category] = []
        listsPerCategory[category].append(data)
        if data['publicity'] == 2:
            if not (category in listsPerCategoryPublic): listsPerCategoryPublic[category] = []
            listsPerCategoryPublic[category].append(data)

    # rewrite file content + magic
    writeData = {
        'title': data['title'],
        'categories': data['categories'],
        'collapsed': data['collapsed'],
        'date': data['date'],
        'content': data['content']
    }

    # append to summary texts
    rawData.append({
        'title': data['title'],
        'categories': data['categories'],
        'collapsed': data['collapsed'],
        'date': data['date'],
        'publicity': data['publicity'],
        'path': data['path']
    })

    path = content_dir + '/docs/blogposts' + path[len(content_dir) + 7:]
    with open(path[:-3], mode='w+', encoding='utf8') as outfile:
        json.dump(writeData, outfile, separators=(',', ':'), ensure_ascii=False)

publicData = list(filter(lambda obj: obj['publicity'] == 2, rawData))

######################### output ############################

# categories
categoriesList = []
for category in listsPerCategoryPublic:
    categoriesList.append({'category':category, 'num':len(listsPerCategoryPublic[category])})
categoriesList.sort(reverse=True, key=lambda e:e['num'])
with open (content_dir + '/docs/index/categories', mode='w+', encoding='utf8') as outfile:
    json.dump(categoriesList, outfile, separators=(',', ':'), ensure_ascii=False)

# and with hidden ones
categoriesList = []
for category in listsPerCategory:
    categoriesList.append({'category':category, 'num':len(listsPerCategory[category])})
categoriesList.sort(reverse=True, key=lambda e:e['num'])
with open (content_dir + '/docs/index/'+magicword+'categories', mode='w+', encoding='utf8') as outfile:
    json.dump(categoriesList, outfile, separators=(',', ':'), ensure_ascii=False)

def stripPublicity(l):
    for i in range(0, len(l)):
        l[i] = {
            'title': l[i]['title'],
            'path': l[i]['path'],
            'categories': l[i]['categories'],
            'collapsed': l[i]['collapsed'],
            'date': l[i]['date']
        }

# @data: list to output into chunks
def writeLists(data, outPrefix):
    chunkSize = 100
    numChunks = int((len(data) + chunkSize - 1) / chunkSize)
    data.sort(reverse=True, key=getTimeKey)
    stripPublicity(data)
    for chunkIndex in range(0, numChunks):
        # get sublist
        lo = chunkIndex * chunkSize
        hi = lo + chunkSize
        if hi > len(data): hi = len(data)
        sublist = data[lo:hi]
        outContent = {
            'count': len(data),
            'chunkIndex': chunkIndex,
            'content': sublist
        }
        # process sublist
        with open (outPrefix + str(chunkIndex), mode='w+', encoding='utf8') as outfile:
            json.dump(outContent, outfile, separators=(',',':'), ensure_ascii=False)
            #json.dump(rawData, outfile, indent=2, ensure_ascii=False)

# all (as seen from blog home page)
writeLists(rawData, content_dir + '/docs/index/' + magicword)
writeLists(publicData, content_dir + '/docs/index/')

# categories.. (filter by each, output two respectively)
for category in listsPerCategory:
    publicCategoryData = list(filter(lambda obj: obj['publicity']==2, listsPerCategory[category]))
    writeLists(listsPerCategory[category], content_dir + '/docs/index/' + magicword + 'category_' + category + '_')
    writeLists(publicCategoryData, content_dir + '/docs/index/category_' + category + '_')

###############################################################
# config
###############################################################

# copy "about"
shutil.copyfile(content_dir + '/config/about.md', content_dir + '/docs/about')

# read and process timeline
def filterCond(l):
    l = l.strip()
    return len(l)>0 and l[0:1]!='#'

def eventLineToObj(l):
    arr = l.split(']')
    return {
        't': arr[0].strip()[1:],
        'd': arr[1].strip()
    }
# read timeline
timelineFile = open(content_dir + '/config/timeline.txt', mode='r', encoding='utf8')
eventLines = timelineFile.read().split('\n')
timelineFile.close()
# process timeline and output
eventObjs = list(map(eventLineToObj, filter(filterCond, eventLines)))
with open(content_dir + '/docs/timeline', mode='w+', encoding='utf8') as outfile:
    json.dump(eventObjs, outfile, separators=(',', ':'), ensure_ascii=False)

print('summary generated')
