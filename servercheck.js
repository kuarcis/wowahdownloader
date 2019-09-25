function servercheck() {
    //0.02-不用import json改用JSON.parser抓資料,整理輸出
    //指定sheet
    Logger.log('servercheck start')
    var ahss= globalvar('shadowmoon');
    var ssurl = getjsonurl('ss');
   
    
    //開啟sheet 清空上次的清單
    var ss= SpreadsheetApp.openById(ahss);
    var statussheet =ss.setActiveSheet(ss.getSheetByName('server狀態檢查'));
    var sheetname = ss.getName()
    Logger.log('checking '+sheetname)
    
    //檢查server json回傳狀態 json回傳格式只有一列的話(這列可能是error或是只有標題)就跳出檢查
    //server json結構為/realms為第一層，與server有關的資訊都在第二層
    var serverchk =false;
    Logger.log('start querying server status')
      var qoptions = {
      'method' : 'get',   
    }
      try{
        var checkresp =UrlFetchApp.fetch(ssurl,qoptions)
        }
    catch(err){
      Logger.log(err)
      Logger.log('api querying fail, checking end')
      return false
    }
    var responsecode = checkresp.getResponseCode()
    if(responsecode >299){
      Logger.log('api return code:'+responsecode+', abort AH update')
      return false
    }
    var checkjson=JSON.parse(checkresp)
    if(checkjson.realms.length==0){
      Logger.log('Blizzard server api return empty list, abort AH update')
      return false
    }
    Logger.log('server list fetched,checking...')
    var tstatus = false
    var serverstatus=checkjson.realms.reduce(
      function (prev, curr){
        if (curr.name ==sheetname){
          tstatus = curr.status
          prev=tstatus
          return prev
        }
        prev=tstatus
        return prev
      },[])
    Logger.log('server :'+sheetname+', status:'+serverstatus+' , updating checking result' )
         
        //寫入server檢查結果 時間標籤為unix time
    var checkresult =statussheet.getRange(1,1,1,6)
    var resultvalue = [
      ["檢查結果",serverstatus,"檢查時間",(new Date).getTime(),"server:",sheetname]
      ]
    checkresult.setValues(resultvalue)
    Logger.log('servercheck complete' )
    return serverstatus
    
  }
  