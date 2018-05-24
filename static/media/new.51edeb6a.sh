#!/usr/bin/env bash

filename=~/Documents/github/blog-page/drafts/$(date +%s).md
DD=$(date +%d)
MM=$(date +%m)
YYYY=$(date +%Y)
HH=$(date +%H)
mm=$(date +%M)

touch $filename
echo "---" >> $filename
echo "title: " >> $filename
echo "date: $YYYY-$MM-$DD $HH:$mm" >> $filename
echo "tags: []" >> $filename
echo "public: " >> $filename
echo "" >> $filename
echo "---" >> $filename

open $filename
