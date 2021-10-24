const http = require('http');
const static = require('node-static');
const file = new static.Server('./');
const lib = require('./lib');
const server = http.createServer((req, res) => {
  req.addListener('end', () => file.serve(req, res)).resume();
});
const port = 3000; 
const WebSocket = require("ws");
// const { resolve } = require('path/posix');
const websocketServer = new WebSocket.Server({ server });

websocketServer.on('connection', (webSocketClient) => {
  console.log("client has connected");
  webSocketClient.send("loading...");

  webSocketClient.on('message', (message) => {
    websocketServer
    .clients
    .forEach (client => {
      var str = lib.ab2str(message);
      console.log(str);
      lib.generateJSON(str);
      lib.loop()
        .then(function(results) {
          console.log("Done :)");
          var score = 0;
          var data = results;
          for (var key in data) {
            var d = data[key];
            score += d["magnitude"] * d["score"];
          }
          client.send(score + " " + lib.getInfo());
          console.log(score + " " + lib.getInfo());
        })
      }
    );
  });
});

server.listen(port, () => console.log('Server running at http://localhost:${port}'));