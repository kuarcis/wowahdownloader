function ahdump() {
    //0.0.2-整理輸出資訊 移掉importjson 改用JSON.parser
    Logger.log('ah json data dump start')
    var ahss= globalvar('shadowmoon');
    var ssurl = getjsonurl('ss');
    
  
    var ss= SpreadsheetApp.openById(ahss);
    var jsonraw =ss.setActiveSheet(ss.getSheetByName('ah json dump'));
    var serverchecksheet =ss.setActiveSheet(ss.getSheetByName('server狀態檢查'))
    var sheetname = ss.getName()
    var updatecheck =false
     
    function resultwriter(result,updatelength){
      var updateresult =jsonraw.getRange(3,1,1,6)
      var updatereport = [
        ["是否完成更新",result,"清單長度",updatelength,"更新時間",(new Date).getTime()]
      ]
      updateresult.setValues(updatereport)
    }
   
    //寫入ah dump json產生時間跟網址
    var lastdump =jsonraw.getRange(1,1,1,2)
    var newdump =jsonraw.getRange(2,1,1,6)
    var lastdumptime =newdump.getValues()[0][3]
      //將上次dump裡的時間搬去lastdump
          //不管怎樣都清掉舊的dump
    Logger.log('cleaning previous dump...')  
    var dumprange = jsonraw.getRange(3,4).getValue();
    jsonraw.getRange(5, 1,dumprange, 3).clear();
    Logger.log('cleaning dump done')
      
    Logger.log('previous json dump time:'+lastdumptime)  
    Logger.log('checking blizzard dump time')  
    
    if(serverchecksheet.getRange(1,2).getValue()){
      var ahdumpurl = "https://tw.api.battle.net/wow/auction/data/"+sheetname+"?locale=zh_TW&apikey="+globalvar('bliztoken')
      try{
        var dumpurlfile = UrlFetchApp.fetch(ahdumpurl)
      }
      catch(err){
        Logger.log('api querying fail, abort update')
        Logger.log(err)
        resultwriter(updatecheck,1)
        var dumpvalue = [
          ["最新dump url",false,"最新dump時間",false,"是否為新dump",false]
        ];
        newdump.setValues(dumpvalue)  
        return updatecheck
      }
      if (dumpurlfile.getResponseCode()>299){
        Logger.log('fail downloading, abort update, error code:'+dumpurlfile.getResponseCode())
        resultwriter(updatecheck,1)
        return updatecheck
      }
      var urlfilejson = JSON.parse(dumpurlfile)
      try{
        var tmpurldata = urlfilejson.files
      }
      catch(err){
        Logger.log('api response didnt contain info, abort update')
        resultwriter(updatecheck,1)
        var dumpvalue = [
          ["最新dump url",false,"最新dump時間",false,"是否為新dump",false]
        ];
        newdump.setValues(dumpvalue)  
        return updatecheck
      }
      var newdumpurl= tmpurldata[0].url
      var newdumptime = tmpurldata[0].lastModified
      var isDumpUpdated =  (newdumptime>lastdumptime)
      var dumpvalue = [
          ["最新dump url",newdumpurl,"最新dump時間",newdumptime,"是否為新dump",isDumpUpdated]
          ];
      newdump.setValues(dumpvalue)  
    }
    //檢查到新的dump
    if (jsonraw.getRange(2, 6).getValue()){
      Logger.log('newer dump exist, dump time:'+newdumptime+' ,start downloading....')
  
      //下載新dump
      var dumpresp =UrlFetchApp.fetch(jsonraw.getRange(2,2).getValue())
      if (dumpresp.getResponseCode()>299){
        Logger.log('fail downloading, abort update, error code:'+dumpresp.getResponseCode())
        resultwriter(updatecheck,1)
        return updatecheck
      }
      Logger.log('download complete, rearranging...')
      var respjson = JSON.parse(dumpresp)
      //error catch, 假如表格沒有auctions物件就跳出updater
      
      try{
        var tmpahdata = respjson.auctions
      }
      catch(err){
        Logger.log('json file didnt contain auction data, abort update')
        resultwriter(updatecheck,1)
        return updatecheck
      }
      
      try{
        var ahlistraw = tmpahdata.reduce(
          function(prev, curr){
            var itemtmp = []
            itemtmp = [curr.item,curr.buyout,curr.quantity]
            prev.push(itemtmp)
            return prev        
          },[])
      }
      catch(err){
        Logger.log('json file didnt contain auction data, abort update')
        resultwriter(updatecheck,1)
        return updatecheck
      }
      Logger.log('rearrange done, writing...')
  
  
      var length =ahlistraw.length;
      //長度為1的清單直接紀錄為失敗
      if (length == 1){
        Logger.log('json file didnt contain auction data, abort update')
        resultwriter(updatecheck,1)
        return updatecheck
      }
      else{
        Logger.log('raw dump length:'+ length+' ,writing...')
        var ahraw = jsonraw.getRange(5,1,length,3);
        ahraw.setValues(ahlistraw);
        updatecheck = true
        resultwriter(updatecheck,length)      
        Logger.log('writing done')
        return updatecheck 
      }
      //有新的dump 回傳dump更新結果//      
    }
    //  //沒有新的dump
    resultwriter(updatecheck,1)
    Logger.log('no newer dump exist, stop updating price ')
    return updatecheck
  }
  