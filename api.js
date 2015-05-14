var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()
var port = process.env.PORT || 5000
app.use(express.static(__dirname + "/"))
var server = http.createServer(app)
server.listen(port)
var wss = new WebSocketServer({server: server, path:"/gab"});

var mysql = require('mysql');
 
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
	}
    catch(error)
    {
	}
}
 

function merge_options(obj1, obj2) {
    var obj3 = {};
    for (var attrname in obj1) {
        obj3[attrname] = obj1[attrname];
    }
    for (var attrname in obj2) {
        obj3[attrname] = obj2[attrname];
    }
    return obj3;
}




wss.on("connection", function(ws) {

    ws.on('close', function() {
		 
    });
	


    ws.on('error', function() {
      

    });




 

    ws.on('message', function(message) {
        var m = JSON.parse(message);
        send(m);
    });
 
    ws.send("test", function(){});
  
})

 

