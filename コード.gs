var channel_access_token = "3t3EIwftT+lWk8koU4wt4h3qa58c6Gmlkli8qG3fVgsDbzKFcAkqfuMOsEd6vn2sVjkCProWGFt28hY9CEaUmTbXMPxKR/ai+GsZtTMkFS2w9erpQlI/5kFTN4Cd9hCKqdj/TIe35s9arzuE/a8i4wdB04t89/1O/w1cDnyilFU="; 

function doPost(e) {
  var events = JSON.parse(e.postData.contents).events;
  events.forEach(function(event) {
    if(event.type == "message"){lineReply(event);}
    else if(event.type == "follow"){
      
    }
    else if(event.type == "unfollow"){ /* ブロック */ }
 });
}

function doPush(){
  var id="14TZKXlUNkUdfCtM48b2ymu8ILEvlwi8bVU6IQArybOw";
  var spreadsheet=SpreadsheetApp.openById(id);
  var sheet=spreadsheet.getActiveSheet();
  var to=[];
  for(var i=1;sheet.getRange(i,1).getValue()!="";i++){
    to.push(sheet.getRange(i,1).getValue());
  }
  var time=new Date();
  //if(Number(time.getMinutes())%5==0){
    var postData = {
      "to" : to[1],
      "messages" : [
        {
          "type" : "text",
          "text" : "お知らせだよ!"
        }
      ]
    };
    
    var options = {
      "method" : "post",
      "headers" : {
        "Content-Type" : "application/json",
        "Authorization" : "Bearer " + channel_access_token
      },
      "payload" : JSON.stringify(postData)
    };
    
    UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", options);  
  //}
}

//OpenWeatherMapAPIから情報を取得
function GetWeather(lat,lon) {
  var API_KEY="9d287aeaef7ecc9dae9837a2d2f96934";
  var url="http://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+lon+"&APPID="+API_KEY+"&lang=ja&cnt=12&units=metric";
  var responce=UrlFetchApp.fetch(url);
  //return responce.getContentText();
  var json=JSON.parse(responce.getContentText());
  return Layout(json);
}

//送信用にデータを変更
function Layout(json){
  var location="場所:"+json.city.name;
  var cnt=Number(json.cnt);
  var list=new Array(cnt);
  for(var i=0;i<cnt;i++){
    list[i]=new Array(4);
    var date=new Date(Number(json.list[i].dt)*1000);
    list[i][0]="時刻:"+date.getMonth()+"月"+date.getDate()+"日 "+('00'+date.getHours()).slice(-2)+":"+('00'+date.getMinutes()).slice(-2);
    list[i][1]="天気:"+json.list[i].weather[0]["description"];
    list[i][2]="最高気温:"+json.list[i].main.temp_max+"℃";
    list[i][3]="最低気温:"+json.list[i].main.temp_min+"℃";
  }
  var result=location+"\n";
  for(var i=0;i<cnt;i++){
    result=result+"\n";
    for(var j=0;j<4;j++){
      result=result+list[i][j]+"\n";
    }
  }
  return result;
}

function lineReply(e) {
  var id="14TZKXlUNkUdfCtM48b2ymu8ILEvlwi8bVU6IQArybOw";
  var spreadsheet=SpreadsheetApp.openById(id);
  var sheet=spreadsheet.getActiveSheet();
  var col=1;
  while(sheet.getRange(col,1).getValue()!=""){
    col++;
  }
  sheet.getRange(col,1).setValue(e.source.userId);
  
  var postData = {
    "replyToken" : e.replyToken,
    "messages" : [
      {
        "type" : "text",
        "text" : ((e.message.type=="location")? GetWeather(e.message.latitude,e.message.longitude) : "位置情報以外")
      }
    ]
  };

  var options = {
    "method" : "post",
    "headers" : {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer " + channel_access_token
    },
    "payload" : JSON.stringify(postData)
  };

  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", options);
}