function doMKsheet(body) {
  try{
    /*conf読み込み*/
    var confData = getConf();
    
    //シートの自動作成スクリプト実行
    let titleArray = createSheet(body);
    
    var rUrl = titleArray[1];
    var payload = JSON.stringify({ status: 1, URL: rUrl })

    return payload;

  } catch(ex){
    //失敗したらlogに投げる
    toLog(ex);
    var err_msg = "Bot通知：doMKsheet 失敗";
    sendMessage(err_msg,confData.room_id);
    return false;
  }
}

// シートの自動作成スクリプト(戻り値：[0]案件タイトル　[1]Q&AシートURL)
function createSheet(deta) {
  try{
    /*conf読み込み*/
    var confData = getConf();

    var pj = deta['pj'];
    var title = deta['title'];
    
    // テンプレートファイル
    var templateFile = DriveApp.getFileById(confData.key); //ファイルID
    var ckTitleRes = checkTitle(title);
    var setFold;
    
    // 出力フォルダ
    if (pj == 1){
      setFold = confData.setFold_a; //A フォルダID
    }else if (pj == 2){
      if (ckTitleRes === 1){
        setFold = confData.setFold_b; //B フォルダID
      }else if(ckTitleRes === 2){
        setFold = confData.setFold_c; //C フォルダID
      }
    }else{
      //
    }
    var OutputFolder = DriveApp.getFolderById(setFold);
    
    // 出力ファイル名
    var OutputFileName = "（test）" + title;
    
    //チャットワークメッセージ部
    var retBody = "";

    //シートURL
    var sheetURL = "";

    if (checkSheet(OutputFileName,setFold) == 0){
      templateFile.makeCopy(OutputFileName, OutputFolder);
      setAuth(title,setFold);
      sheetURL = getURL(title,setFold);      //タイトルからURL取得
      retBody = "[To:0000000]A\n" + "[BOT] Q&Aシートを作成しました：" + title + "\nURL:" + sheetURL;
      sendMessage(retBody,confData.room_id);
      return [title, sheetURL];
    }else{
      sheetURL = getURL(title,setFold);      //タイトルからURL取得
      retBody = "[To:0000000]A\n" + "[BOT] Q&Aシートは既に存在しております：" + title + "\nURL:" + sheetURL;
      sendMessage(retBody,confData.room_id);
      return [title, sheetURL];
    }
  } catch(ex){
    //失敗したらlogに投げる
    toLog(ex);
    var err_msg = "Bot通知：createSheet 失敗";
    sendMessage(err_msg,confData.room_id);
    return false;
  }
}

// title 判定
function checkTitle(title){
  if (title.startsWith('B-')){
    return 1;
  }else if(title.startsWith('B_sub-')){
    return 1;
  }else if(title.startsWith('C-')){
    return 2;
  }else if(title.startsWith('C_sub-')){
    return 2;
  }else{
    return 3;
  }
}

// 指定のファイル名を検索、URL取得し値を返す
function getURL(setName,setFold) {
  try{
    /*conf読み込み*/
    var confData = getConf();

    // 指定フォルダ内のファイルを一括取得(FileIteratorオブジェクト)
    const files = DriveApp.getFolderById(setFold).getFiles();

    SpreadsheetApp.openById(confData.logkey).getSheetByName('log').getRange(1, 1).setValue(files);

    // ファイル名
    const reg = "（test）" + setName;

    //Q&AシートURL取得
    var qasheet_url = "NONE";

    //まだ取り出していないファイルが存在するか判定をする「hasNext()」メソッド
    while (files.hasNext()) {
      const file = files.next();
      const filename = file.getName();

      if (filename === reg){
        qasheet_url = file.getUrl();
        break;
      }
    }
    if (qasheet_url != "NONE"){
      return qasheet_url;
    }else{
      sendMessage("error_URL:指定のファイルが見つかりません"); 
    }
  } catch(ex){
    //失敗したらlogに投げる
    toLog(ex);
    var err_msg = "Bot通知：getURL 失敗";
    sendMessage(err_msg,confData.room_id);
    return false;
  }
}

// 指定のファイル名を検索し、ファイルの権限を変更
function setAuth(wName,setFold) {
  /*conf読み込み*/
  var confData = getConf();
    try{
    // 指定フォルダ内のファイルを一括取得(FileIteratorオブジェクト)
    const files = DriveApp.getFolderById(setFold).getFiles();

    //まだ取り出していないファイルが存在するか判定をする「hasNext()」メソッド
    while (files.hasNext()) {
      const file = files.next();
      const filename = file.getName();

      if (filename === wName){
        var document = DriveApp.getFileById(file.getId());
        var access;
        var permission;

        //リンク共有有効(編集権限あり)
        access = DriveApp.Access.ANYONE_WITH_LINK;
        permission = DriveApp.Permission.EDIT;
        document.setSharing(access, permission);
      }
    }
  } catch(ex){
    //失敗したらlogに投げる
    toLog(ex);
    var err_msg = "Bot通知：setAuth 失敗";
    sendMessage(err_msg,confData.room_id);
    return false;
  }
}

//ファイルの存在チェック
function checkSheet(fname,setFold){

  // ファイル名正規表現で絞り込む
  const reg = new RegExp(fname + '(.*?)', 'g');
  
  // 指定フォルダ内のファイルを一括取得(FileIteratorオブジェクト)
  const files = DriveApp.getFolderById(setFold).getFiles();
  
  //まだ取り出していないファイルが存在するか判定をする「hasNext()」メソッド
  while (files.hasNext()) {
    const file = files.next();
    const filename = file.getName();

    if (filename === fname){
      return 1;
    } else{
      return 0;
    }
  }
}
