var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()
var port = process.env.PORT || 5000
app.use(express.static(__dirname + "/"))
var server = http.createServer(app)
server.listen(port)
var wss = new WebSocketServer({server: server})

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
		if(session.username)
			query("UPDATE users SET online = 0 WHERE username = '"+session.username+"' ", function(){});
    });
	


    ws.on('error', function() {
        console.log('ERROR');
        clearInterval(interval);

    });




    var send = function(data) {
        var ts = JSON.stringify(data);

        if (ts != lastSend) {
            ws.send(ts, function(error) {
                console.log(error);
                console.log(ts);
            });
            lastSend = ts;
        }
    }

    ws.on('message', function(message) {
        var m = JSON.parse(message);
        send(m);
    });
 

    wss.clients.forEach(function each(client) {
        client.send(JSON.stringify( wss.clients));
    });
  
})

 

