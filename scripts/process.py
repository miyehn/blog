#!/usr/bin/env python
# -*- coding: utf-8 -*-

import glob
import json
import os
import shutil
import time
import datetime

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
listsPerTag = {}
listsPerTagPublic = {}
listsPerCategory = {}
listsPerCategoryPublic = {}

for path in paths:
    file = open(path, mode='r', encoding='utf8')
    text = file.read().strip()

    header = text[text.find('---\n')+4:]
    body = header[header.find('---\n')+4:]
    header = header[0:header.find('---\n')]

    # parse body to see if has partially hidden content
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
    if ind<11: # old posts that don't have categories but may have tags
        categoriesStr = tagstr
    else:
        categoriesStr = header[ind:]
        categoriesStr = categoriesStr[0:categoriesStr.find('\n')].strip()[1:-1]
    categoriesArr0 = categoriesStr.split(',')
    categoriesArr0 = filter(None, categoriesArr0)
    categoriesArr = []
    for category in categoriesArr0:
        categoryStripped = category.strip()
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

    # jsonify
    data = {
        'title': title,
        'path': path[len(content_dir) + 8:-3],
        'tags': tagarr,
        'categories': categoriesArr,
        'publicity': publicity,
        'date': datestr
    }

    # append to summary texts
    rawData.append(data)

    # append to tag lists
    for tag in tagarr:
        if not (tag in listsPerTag): listsPerTag[tag] = []
        listsPerTag[tag].append(data)
        if publicity == 2:
            if not (tag in listsPerTagPublic): listsPerTagPublic[tag] = []
            listsPerTagPublic[tag].append(data)

    # and categories list, in the same way:
    for category in categoriesArr:
        if not (category in listsPerCategory): listsPerCategory[category] = []
        listsPerCategory[category].append(data)
        if publicity == 2:
            if not (category in listsPerCategoryPublic): listsPerCategoryPublic[category] = []
            listsPerCategoryPublic[category].append(data)

    # rewrite file content + magic
    writeData = {
        'title': data['title'],
        'tags': data['tags'],
        'categories': data['categories'],
        'date': data['date'],
        'content': textOrig.strip()
    }
    path = content_dir + '/docs/blogposts' + path[len(content_dir) + 7:]
    with open(path[:-3], mode='w+', encoding='utf8') as outfile:
        json.dump(writeData, outfile, separators=(',', ':'), ensure_ascii=False)

    file.close()

publicData = list(filter(lambda obj: obj['publicity'] == 2, rawData))

######################### output ############################

## tags
tagslist = []
for tag in listsPerTagPublic:
    tagslist.append({'tag':tag, 'num':len(listsPerTagPublic[tag])})
tagslist.sort(reverse=True, key=lambda e:e['num'])
with open (content_dir + '/docs/index/tags', mode='w+', encoding='utf8') as outfile:
    json.dump(tagslist, outfile, separators=(',', ':'), ensure_ascii=False)

# w hidden
tagslist = []
for tag in listsPerTag:
    tagslist.append({'tag':tag, 'num':len(listsPerTag[tag])})
tagslist.sort(reverse=True, key=lambda e:e['num'])
with open (content_dir + '/docs/index/'+magicword+'tags', mode='w+', encoding='utf8') as outfile:
    json.dump(tagslist, outfile, separators=(',', ':'), ensure_ascii=False)

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

# tags.. (filter by each, output two respectively)
for tag in listsPerTag:
    publicTagData = list(filter(lambda obj: obj['publicity'] == 2, listsPerTag[tag]))
    writeLists(listsPerTag[tag], content_dir + '/docs/index/' + magicword + 'tag_' + tag + '_')
    writeLists(publicTagData, content_dir + '/docs/index/tag_' + tag + '_')

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
