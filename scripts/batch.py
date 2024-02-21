#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
from parser import mrblog_read, mrblog_write, mrblog_process_all

def donothing(inObj):
    return inObj

mrblog_process_all(donothing, 'testout')