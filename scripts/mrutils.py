import os
import time

content_dir = os.environ['MRBLOG_CONTENT']
domain = os.environ['MRBLOG_DOMAIN']

def copy_img(file, postfix=''):
    img_path = file.replace('\\','/').strip()
    os.system('cp "'+img_path+'" '+content_dir+'/docs/pics')
    name = os.path.splitext(os.path.basename(img_path))
    ts = str(int(time.time())) # timestamp
    src = content_dir+'/docs/pics/'+name[0]+name[1]
    dst = content_dir+'/docs/pics/'+ts+postfix+name[1]
    os.rename (src, dst)
    md_str = '![]('+domain+'/mrblog-content/pics/'+ts+postfix+name[1]+')'
    return md_str

