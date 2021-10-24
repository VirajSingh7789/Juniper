chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
  let url = tabs[0].url;
  let companyName = url.substring(url.indexOf(".") + 1, url.indexOf(".com")); 
  document.getElementById("company").innerHTML = companyName.toUpperCase();
  var ws;
  if ("WebSocket" in window) {
    ws = new WebSocket("ws://localhost:3000");
    ws.onopen = function () {
      ws.send(companyName);
    };

    ws.onmessage = function (event) {
      var msg = event.data;
      var content = msg.split(",");
      document.getElementById("sentiment").innerHTML = content[0].substring(0,content[0].indexOf(".") + 2);
      document.getElementById("articleOneLink").innerHTML = content[0].substring(content[0].indexOf(" "));
      document.getElementById("articleOneLink").setAttribute(href,content[1]);
    };
  }
});


