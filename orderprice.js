function newprice() {
    Logger.log('start price cal')
    var ahss= globalvar('shadowmoon');
    var ssurl = getjsonurl('ss');
    
    
    var ss= SpreadsheetApp.openById(ahss);
    var jsonraw =ss.setActiveSheet(ss.getSheetByName('ah json dump'));
    var newprices =ss.setActiveSheet(ss.getSheetByName('價量表'));
    var sheetname = ss.getName();
    //raw data有更新才做計算
    if (jsonraw.getRange(3, 2).getValue()==true) {
      Logger.log('new ah dump exist, cal start')
      var rawlistlen = jsonraw.getRange(3, 4).getValue()-1;
      var rawitemlist = jsonraw.getRange(5, 1, rawlistlen).getValues();
      var rawpvlist =jsonraw.getRange(5, 1, rawlistlen,3).getValues();
      var oldpvlist = newprices.getRange(3, 1, newprices.getRange(1, 4).getValue(),4 )
      oldpvlist.clear();
      
      //產生同價位加總的價量清單，照物品id->價位->量做排序
      var pvtmp =pvsum(rawpvlist)
      //產生商品清單
      
  //    var unilist = uniqueitem (rawitemlist);  
  //    var unilen=unilist.length;
  //    Logger.log( unilen)
      
      //總量清單，照物品id排序
      var totalv=volumesum(pvtmp)
      var totalvl=totalv.length
  //    Logger.log( totalvl)
      
      //產生前五低價量清單
      var top5list=top5pv(pvtmp)   
      
      //前五低總量
      var top5v =volumesum(top5list)
      var top5vl=top5v.length
  //    Logger.log( top5vl)  
      
      //前五加權均價
      var top5wp=top5p(top5list)
      var top5wpl=top5wp.length
  //    Logger.log( top5wpl)    
      
      //加權均價、總量、前五低價總量三者長度不等於物品清單長度時輸出錯誤訊息
  //    unilen+=1
      
      if ( top5vl!=top5wpl || totalvl!=top5vl || totalvl!=top5wpl){
        newprices.getRange(3, 1, 1, 5).setValues([[false,top5wpl,top5vl,totalvl,'清單長度不一致']]) 
        Logger.log('error:length not consist p:'+top5wpl+', top5v:'+top5vl+',totalv:'+totalvl)
        return false
      }
      else{
        //輸出清單
        //uniqueitem輸出的物品ID沒有排序 不能用
        var out = []
  //      Logger.log('1')
        for (var i = 0 ; i<totalvl; i++){
          out.push([totalv[i][0],Math.round(top5wp[i][1]/100)/100,top5v[i][1],totalv[i][1]])        
        }
  //      Logger.log('2')
        newprices.getRange(3, 1, totalvl,4 ).setValues(out)
        newprices.getRange(1, 4).setValue(totalvl)
        newprices.getRange(1, 2).setValue(jsonraw.getRange(2, 4).getValue())
        Logger.log('calculate done')
        return true
      }
    }
    Logger.log('no new ah dump , cal abort')
    //沒更新 回傳false
    return false
  }