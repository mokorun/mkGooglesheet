/* チャットワークにメッセージを送る */
function sendMessage(body,room_id){
  
  //設定読み込み
  var confData = getConf();
  
  //chatworkのトークン
  var token = confData.token;
  
  var params = {
    headers : {"X-ChatWorkToken" : token},
    method : "post",
    payload : {
      body : body
    }
  };

  var url = "https://api.chatwork.com/v2/rooms/" + room_id + "/messages";
  UrlFetchApp.fetch(url, params);
}

//log
function toLog(logt){
  //設定読み込み
  var confData = getConf();

  //sheet指定
  SpreadsheetApp.openById(confData.logkey).getSheetByName('log').getRange(14, 2).setValue(logt);
}
