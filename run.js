function runme() {
    Logger=BetterLog.useSpreadsheet('place your sheet id for logging uploading process');
    Logger.log('start')
    var svrcheck =servercheck()
    if(svrcheck){    
      Logger.log('servercheck='+svrcheck)
      var dumpcheck =ahdump()
      if(dumpcheck){
        Logger.log('ahdump='+dumpcheck)
        var pricecal=newprice()
        if(pricecal){
          Logger.log('price cal='+pricecal)
          var write2sheet=data2legion()
          if(write2sheet){
            Logger.log('write2sheet='+write2sheet)
            Logger.log(data2dbtmp())
            Logger.log('done')
          }
        }
      }
    }
    
  }
  
  function uploader() {
    Logger.log('uploader start')
    Logger=BetterLog.useSpreadsheet('place your sheet id for logging uploading process'); 
    Logger.log(data2influxdb())
  }
  
  function idcacher(){
    Logger.log('idcacher start')
    Logger=BetterLog.useSpreadsheet('place your sheet id for logging uploading process'); 
    Logger.log(itemidrefresh())
  }
  