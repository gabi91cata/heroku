var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()
var port = process.env.PORT || 5000

app.use(express.static(__dirname + "/"))

var server = http.createServer(app)
server.listen(port)

console.log("http server listening on %d", port)

var wss = new WebSocketServer({server: server})
console.log("websocket server created")

wss.on("connection", function(ws) {
  var id = setInterval(function() {
    ws.send(JSON.stringify(new Date()), function() {  })
  }, 1000)

  console.log("websocket connection open")

  ws.on("close", function() {
    console.log("websocket connection close")
    clearInterval(id)
  })
})
 var mysql      = require('mysql');


 
var pool = mysql.createPool({
  		host     : 'consultadoctor.ro',
  		user     : 'drdealsr',
  		database : 'drdealsr_webchat',
  		password : 'l5skm1sxca'
});
   
var query = function(query, callback){

	try{

	pool.query(query, function(err, rows, fields) {
		if(!err)
			callback(rows);
		
	});
	
	}catch(error){
		console.log(error);
	}
}
 

 

app.get('/', function(request, response) {

 	response.send('Hello World!'); 
  	query("UPDATE users SET online = 0   ", function(a){
  	 
 	response.send('Hello World!'); 

  	});



});



