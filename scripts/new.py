#!/usr/bin/env bash

prefix=$MRBLOG_CONTENT/drafts
defaultname=$(date +%s)
argname=$1
filename=""

DD=$(date +%d)
MM=$(date +%m)
YYYY=$(date +%Y)
HH=$(date +%H)
mm=$(date +%M)

if [ ${#argname} -gt 0 ]
then
    filename="$prefix"/"$argname".md
    if [ -f $filename ]
    then
        echo "This name is taken. Try another one."
        exit
    fi
else
    filename="$prefix"/"$defaultname".md
fi

touch $filename
echo "---" >> $filename
echo "title: " >> $filename
echo "date: $YYYY-$MM-$DD $HH:$mm" >> $filename
echo "categories: []" >> $filename
echo "public: " >> $filename
echo "" >> $filename
echo "---" >> $filename

if [ $MRBLOG_PC=='1' ]
then
	start $filename
else
	open $filename
fi
