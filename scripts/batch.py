#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import copy
from mrparser import mrblog_read, mrblog_process_all

def donothing(inObj):
    return inObj

def renameCategory(inObj):
    outObj = copy.deepcopy(inObj)
    cats = outObj['categories']

    for i in range(len(cats)):
        if cats[i] == '绘画':
            cats[i] = '绘画-（未分类）'

    #if '81天日记' in cats and len(cats)==1:
        #outObj['collapsed'] = True

    return outObj

mrblog_process_all(renameCategory, 'testout')