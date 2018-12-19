#!/usr/bin/env bash

cd $MRBLOG_CONTENT
$MRBLOG_SCRIPTS/process.sh
$MRBLOG_SCRIPTS/process_pics.sh

DD=$(date +%d)
MM=$(date +%m)
YYYY=$(date +%Y)
HH=$(date +%H)
mm=$(date +%M)
MSG="publish to mrblog: $YYYY-$MM-$DD $HH:$mm"

git add .
git commit -m "$MSG"
echo "committed changes"
git push -q
echo "published."