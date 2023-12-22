#!/usr/bin/env python

import glob
import os
from PIL import Image

content_dir = os.environ['MRBLOG_CONTENT']
paths = glob.glob(content_dir + '/docs/pics/*.jpg')
morepaths = glob.glob(content_dir + '/docs/pics/*.png')
paths.extend(morepaths)
for path in paths:
    
    img = Image.open(path)
    w, h = img.size
    if (w>800 or h>640):
        ratio = min(800/w, 640/h)
        newsize = (int(w * ratio + 0.5), int(h * ratio + 0.5))
        # see: https://clouard.users.greyc.fr/Pantheon/experiments/rescaling/index-en.html
        img = img.resize(size=newsize, resample=Image.Resampling.LANCZOS)
        img.save(path)
        print('resized ' + path)
    
    #info = os.popen('magick identify -format "%w %h" '+path).read()
    #wh = info.split(' ')
    #w = int(wh[0])
    #h = int(wh[1])
    #if (w>800 or h>640):
        #cmd='magick "'+path+'" -resize "800x640>" -quality 100 "'+path+'"'
        #os.system(cmd)

print('resized large images to at most 800x640')
