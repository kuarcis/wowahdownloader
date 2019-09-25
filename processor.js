function uniqueitem(datarange) {
    //不包含表頭的物件清單
    var seen= {};
    var out =[];
    var len=datarange.length;
    var j = 0;
    for (var i = 0; i< len; i++) {
      var item = datarange[i];
      if (seen[item] !==1) {
        seen[item]=1;
        out[j++] = item;
      }
    }
    return out
  }
  
  function pvsum(datarange){
        //將原始資料換成單價清單
      
    var unitpvlist = datarange.reduce(
      function (prev,curr){
        var tmparr = [curr[0],curr[1]/curr[2],curr[2]]
        prev.push(tmparr)
        return prev
      },[])
  
      
      //清單排序
      var pvtmp=[]
      pvtmp=unitpvlist.sort(
        function pv(prev,curr){
          if(prev[0]==curr[0]){
            if(prev[1]==curr[1]){
              return prev[2]-curr[2]
            }
            return prev[1]-curr[1]
          }
        return prev[0]-curr[0]
        }
      )
      
      //同物品同價位加總
      var pvcal = []
      var lastdump ;
      pvcal = pvtmp.reduce(
        function grouping(prev,curr){
          if (lastdump){
            if(lastdump[0]==curr[0] && lastdump[1]==curr[1]){
              lastdump[2]+=curr[2]
              return prev;
            } 
            prev.push(lastdump);
            
          }
          lastdump =curr        
          return prev;
          
        },[])
      return pvcal
  }
  
  //前五低價量表
  function top5pv(datarange){
      var top5list 
      var pvdump ;
      var top5cnt =1;
      top5list = datarange.reduce(
        function grouping(prev,curr){
  //        Logger.log(top5cnt)
          if(pvdump){
  
            if(pvdump[0] !=curr[0]){
              pvdump=curr
              prev.push(curr);
              top5cnt =1
              return prev;
            }
            
            if(top5cnt >4){
              return prev;
            }
            
            top5cnt += 1
            pvdump=curr
            prev.push(curr);
            return prev;
          }
          pvdump=curr
          prev.push(curr);
          return prev;
        },[])
      return top5list
  }
  
  //物品掛單量合計
  function volumesum(datarange){
      var volumetmp;
      var totalv =datarange.reduce(
        function volume(prev,curr){
          if (volumetmp){
            if(volumetmp[0]==curr[0]){
              volumetmp[1] +=curr[2]
  //            Logger.log(volumetmp)
              return prev;
            }
          }
          
          volumetmp = [curr[0],curr[2]]
          prev.push(volumetmp)
          return prev
        },[])
      return totalv
  }
  
  //前五低價加權價計算，只能用top5pv的輸出做計算
  function top5p(datarange){
  
      var ptmp
      var vtmp
      var itmp
      var weightcnt=1
      var out = datarange.reduce(
        function wp(prev,curr){
          if(itmp){
            prev.pop()
            if(itmp!=curr[0]){
              prev.push([itmp,ptmp/vtmp])
              weightcnt =1 
              itmp=curr[0];
              ptmp=10*curr[1]*curr[2]
              vtmp=10*curr[2]
              prev.push([itmp,ptmp/vtmp])
              return prev
            }
            else{
              weightcnt +=1
              if (weightcnt ==2){                            
                ptmp+=3.16*curr[1]*curr[2]
                vtmp+=3.16*curr[2]
              }
              if (weightcnt ==3){ 
                ptmp+=1.78*curr[1]*curr[2]
                vtmp+=1.78*curr[2]
              }
              if (weightcnt ==4){
                ptmp+=1.33*curr[1]*curr[2]
                vtmp+=1.33*curr[2]
              }
              if (weightcnt ==5){
                ptmp+=1.15*curr[1]*curr[2]
                vtmp+=1.15*curr[2]
              }
            prev.push([itmp,ptmp/vtmp])
            return prev
            }
          }
          itmp=curr[0];
          ptmp=10*curr[1]*curr[2]
          vtmp=10*curr[2]
          prev.push([itmp,ptmp/vtmp])
          return prev;
        },[])
      return out 
    
  }
  