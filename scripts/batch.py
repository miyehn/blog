#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import copy
from parser import mrblog_read, mrblog_write, mrblog_process_all

def donothing(inObj):
    return inObj

def renameCategory(inObj):
    outObj = copy.deepcopy(inObj)
    cats = outObj['categories']

    for i in range(len(cats)):
        if cats[i] == 'Echoes（USC学生项目）':
            cats[i] = 'Echoes'

    if '81天日记' in cats and len(cats)==1:
        outObj['collapsed'] = True

    return outObj

mrblog_process_all(renameCategory, 'testout')