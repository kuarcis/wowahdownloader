function getjsonurl(jsontype) {
    //var ui = SpreadsheetApp.getUi()
    
    if (jsontype == 'ss') {
      var ss_url ='https://tw.api.battle.net/wow/realm/status?locale=zh_TW&apikey='
      var urlstring= ss_url.concat(globalvar('bliztoken'))
      }
    
      
      
    return urlstring
    
    //ui.alert(urlstring)
      
    }
    