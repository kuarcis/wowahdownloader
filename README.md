# wowahdownloader
A wow auction house json downloader and data processor

This is originally a google app script project, and all is written in google script, which is 99% like javascript.

All the code is done in the envrioment when blizzard still using single token mechanism to check json request (around 2016 I think), 
so there may need some adjsutment for current json api requirement

The idea of this project is to
1.check if there's newer auction house price json , and keep ah json file by using ahdump.js
2.calculate weight-average top five order price for all items, and keep the result in dbtmp sheet
3.upload new item info to a mango db.
4.uplaod price data to an influx db.

If you are using a free google script acount like i did, you'll face the 6 min daily limit of computing time.
For all the data process tasks 1 to 4 , free google script service will take about 10~20 seconds to complete.(12 to 15 seconds to be precise)
In real life case, i put a 30 min schedule for the whole project.

In the forseeable future, this porject will not be updated for the current blizzard token system, or to other platform.
Still welcome for any question about data process or any other aspects.

Joseph, 2019/9