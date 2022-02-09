function doPost(e) {
  try {
    /*conf読み込み*/
    var confData = getConf();

    var contents = JSON.parse(e.postData.contents);
    SpreadsheetApp.openById(confData.logkey).getSheetByName('log').getRange(14, 1).setValue(contents);
    var dType  = contents["type"];
    var dGenre  = contents["ge"];

    if ( dType !== "1"){
      return false;
    }

    let payload = {}

    switch (dGenre){
      case "1" :
        payload = doMKsheet(contents);
    }

    // ContentServiceを利用して、responseを作成
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    output.setContent(payload);
    return output;
  } catch(ex) {
    //失敗したらlogに投げる
    toLog(ex);
    var err_msg = "Bot通知：全体不具合のためスクリプトをキャンセルします。";
    sendMessage(err_msg,confData.room_id);
    return false;
  }
}
