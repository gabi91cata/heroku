var fs = require('fs');


    var cfg = {
        ssl: true,
        port: 2016,
        ssl_key: 'ssl.key',
        ssl_cert: 'ssl.crt'
    };

    var httpServ = require('https') 

    var WebSocketServer   = require('ws').Server;

    var app      = null;
    var processRequest = function( req, res ) {
        res.writeHead(200);
        setTimeout(function(){
        	res.end("test");
        },3000);
        res.end("All glory  3 to WebSockets!\n");
    };

    if ( cfg.ssl ) {

        app = httpServ.createServer({
            key: fs.readFileSync( cfg.ssl_key ),
            cert: fs.readFileSync( cfg.ssl_cert ),
            rejectUnauthorized: false
        }, processRequest ).listen( cfg.port );

    } else {
        app = httpServ.createServer( processRequest ).listen( cfg.port );
    }
 
var WebSocketServer = require('ws').Server;
 



this.init  = function(callback){

	var wss = new WebSocketServer({server: app });

	wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};


	wss.on('connection', function(ws) {

try{
		  callback(ws);	      
	}catch(error){
		console.log(error);
	}    

	});
}
