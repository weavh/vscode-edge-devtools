function fetchJsonFromUrl(yourUrl){
  var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  var Httpreq = new XMLHttpRequest(); // a new request
  Httpreq.open("GET",yourUrl,false);
  Httpreq.send(null);
  return Httpreq.responseText;
}

function fetchDownloadUrl() {
  const jsonString = fetchJsonFromUrl("https://thirdpartysource.microsoft.com/downloads");
  const jsonObjects = JSON.parse(jsonString);
  for (let object of jsonObjects) {
    if (object.release === '81.0.416.0' && object.platform === 'Windows x64') {
      console.log(object.url);
    }
  }
}

fetchDownloadUrl();