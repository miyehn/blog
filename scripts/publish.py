#!/usr/bin/env bash

cd $MRBLOG_CONTENT
$MRBLOG_PATH/scripts/process.py
$MRBLOG_PATH/scripts/process_pics.py

DD=$(date +%d)
MM=$(date +%m)
YYYY=$(date +%Y)
HH=$(date +%H)
mm=$(date +%M)
MSG="publish to mrblog: $YYYY-$MM-$DD $HH:$mm"

git add -A
git commit -m "$MSG"
echo "committed changes"
git push -q
echo "published."
