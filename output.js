function data2legion() {
    var legionsid= globalvar('legionsheet');
    var ahss= globalvar('shadowmoon');
    
    var legionsheet = SpreadsheetApp.openById(legionsid);
    var ss= SpreadsheetApp.openById(ahss);
    
    var oldprice =legionsheet.setActiveSheet(legionsheet.getSheetByName('報價資料'))
    var newprice =ss.setActiveSheet(ss.getSheetByName('價量表'));
    
    var oldpricetime = oldprice.getRange(1, 2).getValue()
    var newpricetime = newprice.getRange(1, 2).getValue()
    
    //檢查新舊報價表時間
    if (newpricetime==oldpricetime){
      return false
    }
    var olddatarange= oldprice.getRange(1, 1, oldprice.getRange(1, 4).getValue()+2, 4)
    olddatarange.clear()
    var newdatarange= newprice.getRange(1, 1, newprice.getRange(1, 4).getValue()+2, 4)
    olddatarange =oldprice.getRange(1, 1, newprice.getRange(1, 4).getValue()+2, 4)
    olddatarange.setValues(newdatarange.getValues())
    return true
      
  }
  
  
  //
  function data2dbtmp(){
    //把資料轉成raw值，轉給db暫存檔
    var ahss= globalvar('shadowmoon');
    var ss= SpreadsheetApp.openById(ahss);
    var pvsr =ss.setActiveSheet(ss.getSheetByName('價量表'));
    
    var dbsheet=SpreadsheetApp.openById(globalvar('dbtmp'))
    var dbtmp = dbsheet.setActiveSheet(dbsheet.getSheetByName('dbouttmp'))
    
    var newpricetime = pvsr.getRange(1, 2).getValue()
    //檢查表內最後一筆資料的時間
    //暫存表的起始點在現有資料的下一列，空白表的資料長度也是1
    var tmplen =dbtmp.getDataRange().getValues().length
    var tmplasttime = dbtmp.getRange(tmplen, 1) .getValue()
    
    if (newpricetime*1000000 ==tmplasttime){
      return 'no new data, length:'+tmplen
    }
    if (tmplasttime==''){
      //把空白表的長度改成0
      tmplen =0
    }
    var newdata= pvsr.getRange(3, 1, pvsr.getRange(1, 4).getValue(), 4).getValues()
    var rawtmp = newdata.reduce(
        function jsontoinflux(prev,curr){
          var influxout = [newpricetime*1000000,curr[0],curr[1],curr[2],curr[3]]
          prev.push(influxout);
          return prev;        
        },[])
    if ((rawtmp.length+tmplen+1)*5 < 1999990) {
      dbtmp.getRange(tmplen+1, 1, rawtmp.length, 5).setValues(rawtmp)
      return 'db tmp done, length:'+dbtmp.getDataRange().getValues().length
      //2000000格上限
    }
    else {
      return 'exceed 2000000 google item limit, pass dbtmp update'
    }
    
    
  }
  
  function data2influxdb(){
  Logger.log('data2influxdb start')
    var outtmps= SpreadsheetApp.openById(globalvar('dbtmp'));
    var outtmp =outtmps.setActiveSheet(outtmps.getSheetByName('dbouttmp'));
    outraw = outtmp.getDataRange().getValues()
    
    var memlim=4000
  //  Logger.log(outraw.length)
    Logger.log('checking dbtmp data...')
    var newpricetime = outraw[outraw.length-1][0]
    if(newpricetime==''){
      return 'empty dbtmp,db upload stop'
    }
    Logger.log('dbtmp data latest time:'+newpricetime)
    var influxdb = 'http://kuarcis.myqnapcloud.com:10081/'
    var dbname= 'wowtest1'
    
    var queryhead = 'query?pretty=true&db='+dbname+'&q='
    var querystring= 'select * from "'+dbname+'" where time ='+newpricetime//1000000
    var outquery = encodeURIComponent(querystring)
    var qoptions = {
      'method' : 'get',   
    }
    Logger.log('checking influx db data time ...')
    
  //  Logger.log('GET:'+influxdb+queryhead+outquery)
    try{
      var tcheck =UrlFetchApp.fetch(influxdb+queryhead+outquery,qoptions)
      }
    catch (err){
      Logger.log(err)
      return 'db server down, data dump process stop'
    }
    
    
    try{
      var tcheckcode =tcheck.getResponseCode()
    }
    catch (err){
      Logger.log(err)
      return 'db server down, data dump process stop'
    }
    if(tcheck.getResponseCode()!=200){
      //query的res code不是200就直接當作server down
      return 'db server down, data dump process stop'
    }
    var tresult=JSON.parse(tcheck).results
    Logger.log('checking done')
  //  Logger.log(tresult[0].series)
    
    
    if ((tresult[0].length===undefined)){
      //以下是influx沒有新資料的上載程式碼
      //轉字串 加換行
      Logger.log('dbtmp data are newer, start pv data upload')
      var rawl=outraw.length
      Logger.log('dbtmp total length :'+rawl)
      delete outraw
      //這些上傳選項不要每次都重var
      var whead='write?db='+dbname
      var woptions = {
        'method' : 'post',
        'contentType':'application/octet-stream',
      }
      var pcount =0
      var uoutl = rawl
  
      do {
        outdata =''
        pi = 0
        //6000筆一批 超過6000的payload會撐爆記憶體
        Logger.log(uoutl+' lines left')
        Logger.log('making payload....')
        
        if (uoutl >memlim){
          partrange = outtmp.getRange(1,1,memlim,5).getValues()
        }
        else{
          partrange = outtmp.getDataRange().getValues()
        }
        
        
        //map可能有memory leak問題 不想幫google debug 0.0
        outdata = partrange.reduce(
          function (prev, curr){       
            //表名叫做weightpv
            var out_1 = 'weightpv,itemid='+curr[1]+' top5p='+curr[2]+',top5v='+curr[3]+',totalv='+curr[4]+' '+curr[0]+'\n'
            prev +=out_1
            out_1 = ''   
            pi +=1
            return prev
          },''   
        )
       
        Logger.log('payload builded, '+pi+' lines to payload')      
        //    Logger.log(outdata)      
        woptions.payload = outdata
        Logger.log('payload sending...')
        try{
          var wresponse = UrlFetchApp.fetch(influxdb+whead,woptions)
        }
        catch(err){
          Logger.log(err)
          Logger.log('influxdb no response')
          return 'uplaod stop'        
        }
        if (wresponse.getResponseCode() >299){
          return 'db write error, stop upload'
        }
        pcount+=1
        Logger.log(pcount+' payload upload done, total upload length :'+((pcount-1)*memlim+pi))      
        if (pi<memlim){
          //無法刪除全部的列 最後一組只能用清空的
          outtmp.getDataRange().clear()
        }
        else{
          outtmp.deleteRows(1, pi)
        }
        Logger.log('delete top '+pi+' lines' )
        delete partrange
        delete outdata
        delete pi
        uoutl-=memlim
      }while(uoutl>0)
      return 'all payload uploadad,done'
  
    }
     //以上是influx沒有新資料的上載程式碼
    
    else{
      Logger.log('influx db have lastest data, update stop')
      //influx有比較新的資料 清空google端的dbtmp
      outtmp.clear()
      return 'dbtmp clean up'
    }  
  }
  
  function itemidrefresh(){
    Logger.log('influxdb query start')
    var influxdb = 'place your influx db api key'
    var dbname= 'place your influx db name for save price data'  
    var queryhead = 'query?pretty=true&db='+dbname+'&q='
    //從influx抓itemid
    var querystring= 'show tag values from "weightpv" with key = "itemid"'
    var outquery = encodeURIComponent(querystring)
    var qoptions = {
      'method' : 'get',   
    }
    
    try{
      var tcheck =UrlFetchApp.fetch(influxdb+queryhead+outquery,qoptions)
    }
    catch(err){
      Logger.log(err)
      return 'influx db server down, process stop'
    }
    if(tcheck.getResponseCode()!=200){
      //query的res code不是200就直接當作server down
      return 'influx db server down, process stop'
    }
    
    try{
      var tresult=JSON.parse(tcheck).results
    }
    catch(err){
      Logger.log(err)
      return 'influx db didnt response JSON file, process stop'
    }
    
    try{
      var idlistr = tresult[0].series[0].values
    }
    catch(err){
      Logger.log(err)
      return 'influx db response JSON file contain wrong format, process stop'
    }  
    var idlist =idlistr.reduce(
      function cleanl(prev,curr){
        prev.push(curr[1])
        return prev
      },[])
    //排序influx的資料
     
     
    var influx_id = idlist.sort(
      function (a, b){
        return a-b
      }
    )
    Logger.log('influxdb id table grab done, length:'+influx_id.length)
    Logger.log(influx_id[0])
  
    Logger.log('mongodb query start')
    var mongodb = 'https://api.mlab.com/api/1/databases/'+dbname+'/collections/'
    var mongo_itemread = 'itemdata?apiKey='+globalvar('mongokey')+'&l=9999&f='
    var mongo_readstring = encodeURIComponent('{"_id":1}')
    
    try{
      var mongo_read=UrlFetchApp.fetch(mongodb+mongo_itemread+mongo_readstring)
    }
    catch(err){
      Logger.log(err)
      return 'mongodb down, process stop'
    }
    if(mongo_read.getResponseCode()!=200){
      //query的res code不是200就直接當作server down
      return 'mongo db catch fail, data pickup process stop'
    }
    
    try{
      var mongo_id = JSON.parse(mongo_read)
    }
    catch(err){
      Logger.log(err)
      return 'influx db response JSON file contain wrong format, process stop'    
    }
    mongo_id =mongo_id.reduce(
      function(prev,curr){
        prev.push(curr['_id'])
        return prev
      },[])
    
    mongo_id.sort(
      function(a,b){
        return a-b
      }
    )
    Logger.log('mongodb id table grab done, length:'+mongo_id.length)
    Logger.log(mongo_id[0])
   //兩組清單在都排序過的狀況下 只有influx會出現新的id
   //此時只需依序比較兩組清單 然後mark influx清單裡面對不上mongodb的項目  
    var newitem = []
    var influx_counter = 0
    var mongo_counter = 0
    
    while (influx_counter <influx_id.length){
      if (influx_id[influx_counter] != mongo_id[mongo_counter]) {
        
        var new_tmp = {}
        new_tmp['_id'] = influx_id[influx_counter]
        newitem.push(new_tmp)
        influx_counter++ 
        
      } else{
      influx_counter++
      mongo_counter++
      }
    }
  //  Logger.log(newitem)
      
  
    if(newitem.length==0){
      return 'no new item, update done, total length:'+mongo_id.length
    }
  //有新物品才將新物品id寫入mongodb 
    Logger.log('id compare done, new item list length:'+newitem.length)
    Logger.log('mongodb writing start')
    var mongo_itemquery = 'itemdata?apiKey='+globalvar('mongokey')
    var mongo_woptions = {
      'method' : 'post',
      'contentType':'application/json',
      'payload': JSON.stringify(newitem),
      'muteHttpExceptions': true
    }
    try{
      var mongo_write=UrlFetchApp.fetch(mongodb+mongo_itemquery,mongo_woptions)
    }
    catch(err){
      Logger.log(err)
      return 'mongodb down, process stop'
    }
     if(mongo_write.getResponseCode()>299){
      //query的res code不是200就直接當作server down
      Logger.log(mongo_write.getContentText())
      return 'mongo db write fail,id writing process stop'
    }
    return 'done new id writing, upload id length:'+newitem.length 
  
    
    
    
  }