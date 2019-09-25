function globalvar(string) {

var bliztoken =' place your bz api token here'
var shadowmoon =' place your sheet id for server json dump'
var legionsheet =' tmp dump target for legion item json info'
var dbtmp = ' place your sheet id for processed data, data in this sheet can be used to uplaod to other db '
var mongokey= ' palce your mongo db api key'
  
  if (string == 'shadowmoon' ){
  return shadowmoon
  }
  if (string == 'bliztoken'){
    return bliztoken
  }
  if (string == 'legionsheet'){
    return legionsheet
  }
  if (string == 'dbtmp'){
    return dbtmp
  }
  if (string == 'mongokey'){
    return mongokey
  }
  
    return null
  
  
}