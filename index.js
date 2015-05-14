var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()
var port = process.env.PORT || 5000

app.use(express.static(__dirname ))

var server = http.createServer(app)
server.listen(port)
var mysql  = require('mysql');



var pool = mysql.createPool({
    host     : 'consultadoctor.ro',
    user     : 'drdealsr',
    database : 'drdealsr_webchat',
    password : 'l5skm1sxca'
});

var wss = new WebSocketServer({server: server, path:"/"})
var api = new WebSocketServer({server: server, path:"/api"})

function getMonday(d) {
  d = new Date(d);
  var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
      return new Date(d.setDate(diff));
  }



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
var actions = [];



wss.on("connection", function(ws) {

    var session = {};
    var myStatus = {};
    var checking = null;
    var lastSend = null;

    ws.on('close', function() {

        console.log('Client disconnected.');
        clearInterval(interval);
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
        try {
            var m = JSON.parse(message);
        } catch (err) {
            return;
        }


        if(m.type == "getCalendar")
        {

          getCalendar(m);



      }

      
      if (m.type == "init") {

        session = merge_options(session, m.value);

        if(session.username)
         query("UPDATE users SET online = 1 WHERE username = '"+session.username+"' ", function(){});
        }



         if (m.type == "action") {
            actions[m.to] = m.value;
            send(actions);

        }

        if (m.type == "delete") {
            var token = session.token;
            var id = session.id;
            query("UPDATE " + m.what + " SET deleted_at = NOW() WHERE id = '" + m.id + "' AND (token = '" + token + "' OR user_id = '" + id + "')  ", function() {});
            send({
                m: m,
                s: session
            });
        }

    });
    var getCalendarDay = function(date, dstart, dend, duration, dt, ut)
    {
      var monday = [];
      var ms = dstart.split(":");
      var start = new Date(date);
      start.setUTCHours(parseInt(ms[0]));
      start.setUTCMinutes(parseInt(ms[1]));
      start = start.getTime();

      var me = dend.split(":");
      var end = new Date(date);;
      end.setUTCHours(parseInt(me[0]));
      end.setUTCMinutes(parseInt(me[1]));
      end = end.getTime();

      dt = dt * 60 * 60 * 1000;
      ut = ut * 60 * 60 * 1000;

      console.log(dt,ut); 
      var dates = [];
      for(var i = start; i< end; i+=duration) {
         var d = new Date(i);
         dates.push(new Date(d.getTime() - dt + ut));


     }


     return dates;
 }

 var getCalendar = function(m){
    	//m.date
    	//m.sid
      var date = new Date(Date.parse(m.date));

      date = (getMonday(date));
      query("SELECT s.*, se.duration FROM schedules AS s INNER JOIN services AS se ON se.user_id = s.user_id WHERE se.id = '"+m.sid+"' AND valid_from < NOW() AND (valid_to IS NULL OR valid_to > NOW()) LIMIT 1 ", function(data){
        if(data.length <= 0) 
            return;

        var sch = data[0];
        var duration = sch.duration * 60 *1000;

        var dates = [];
        console.log(date); 


		 	//monday
		 	dates.push(getCalendarDay(date, sch.monday_start, sch.monday_end, duration, sch.timezone, m.timezone));

		 	//tuesday
		 	date = new Date(date.getTime() + 24 * 60 * 60 * 1000);  
		 	dates.push(getCalendarDay(date, sch.tuesday_start, sch.tuesday_end, duration, sch.timezone, m.timezone));

		 	//wednesday_start
		 	date = new Date(date.getTime() + 24 * 60 * 60 * 1000);  
		 	dates.push(getCalendarDay(date, sch.wednesday_start, sch.wednesday_end, duration, sch.timezone, m.timezone));

		 	//thursday_start
		 	date = new Date(date.getTime() + 24 * 60 * 60 * 1000);  
		 	dates.push(getCalendarDay(date, sch.thursday_start, sch.thursday_end, duration, sch.timezone, m.timezone));


		 	//friday_start
		 	date = new Date(date.getTime() + 24 * 60 * 60 * 1000);  
		 	dates.push(getCalendarDay(date, sch.friday_start, sch.friday_end, duration, sch.timezone, m.timezone));


		 	//saturday_start
		 	date = new Date(date.getTime() + 24 * 60 * 60 * 1000);  
		 	dates.push(getCalendarDay(date, sch.saturday_start, sch.saturday_end, duration, sch.timezone, m.timezone));


		 	//sunday_start
		 	date = new Date(date.getTime() + 24 * 60 * 60 * 1000);  
		 	dates.push(getCalendarDay(date, sch.sunday_start, sch.sunday_end, duration, sch.timezone, m.timezone));

		 	var datas = [];
		 	for(var i in dates)
		 	{
		 		for(var j in dates[i])
                 datas.push(dates[i][j]);
         }		 	 

         var days = {};
         for(var i in datas)
         {
             var d = new Date(datas[i]); 
             var dateString = d.toDateString();

             if(!days[dateString]) 
              days[dateString] = [];

          days[dateString].push(datas[i]);
      }

      var dateNext = new Date(date.getTime() + 24 * 60 * 60 * 1000); 
      var datePrev = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);  

      if(datePrev < new Date())
          datePrev = null;


      send({
         response: "getCalendar",
         dates: days,
         next: dateNext,
         prev: datePrev,
         timezone: {
          client: m.timezone,
          user: sch.timezone
      }
  });


      console.log(days);
  })

    }

    var lastAction = {};
    var lastStatus = {};
    var lastAppoint = {};

    var interval = setInterval(function() {


        var username = session.username;
        var token = session.token;
        var guestStatus = session.guestStatus;
        var password = session.password;
        var checkStatus = session.checkStatus;




        if (username) {

            	//check my status
                query("SELECT s.status, u.id, u.username FROM users AS u INNER JOIN statuses AS s ON s.user_id = u.id AND (s.valid_from <= NOW() OR valid_from IS NULL) AND (valid_to >= NOW() OR valid_to IS NULL) WHERE u.online = 1 AND  u.username = '" + username + "' AND MD5(u.password_confirmation) = '" + password + "' ", function(data) {
                    var status = "offline";
                    data = data[0];
                    if (JSON.stringify(data) != JSON.stringify(myStatus)) {
                        if (data) {
                            status = data.status;
                            session.id = data.id;
                        }
                        myStatus = data;
                        send({
                            "action": "myStatus",
                            "status": status
                        });
                    }
                });



                //check for incoming appointemtns
                query("SELECT r.reg_user, a.* FROM appointments AS a INNER JOIN registrations AS r ON r.reg_user = a.order_id WHERE  a.date > DATE_SUB(NOW(), INTERVAL 10 MINUTE) AND a.date < DATE_ADD(NOW(), INTERVAL 10 MINUTE) AND  a.user_id = '"+session.id+"'  ", function(data){

                	if (JSON.stringify(data) != JSON.stringify(lastAppoint)) {

                		send({
                         "action": "onlineList",
                         "list": data
                     });

                     lastAppoint = data;
                 }            	
             });

            }
            if(session.appointment)
            {
            	query("SELECT * FROM appointments   WHERE  date > DATE_SUB(NOW(), INTERVAL 10 MINUTE) AND date < DATE_ADD(NOW(), INTERVAL 10 MINUTE) AND order_id = '"+session.appointment+"'  ", function(data){

                 if (data.length == 0) {

                  send({
                     "action": "expire",
                     "redirect": "/expired/"+session.appointment 
                 });

                  session.appointment = null;
              }            	
          });

            }

            if (guestStatus) {
                query("SELECT * FROM registrations WHERE reg_user = '" + guestStatus + "' ", function(data) {
                    var status = "offline";
                    data = data[0];
                    if (JSON.stringify(data) != JSON.stringify(lastStatus)) {
                        if (data)
                            status = "online"
                        lastStatus = data;
                        send({
                            "action": "userStatus",
                            "user": guestStatus,
                            "status": status 
                        });
                    }


                });
            }
            if (checkStatus) {
                query("SELECT s.status FROM users AS u INNER JOIN statuses AS s ON s.user_id = u.id AND (s.valid_from <= NOW() OR valid_from IS NULL) AND (valid_to >= NOW() OR valid_to IS NULL) WHERE u.online = 1  AND  u.username = '" + checkStatus + "' ", function(data) {
                    var status = "offline";
                    data = data[0];
                    if (JSON.stringify(data) != JSON.stringify(myStatus)) {
                        if (data)
                            status = data.status;
                        myStatus = data;
                        send({
                            "action": "userStatus",
                            "user": checkStatus,
                            "status": status
                        });
                    }
                });
            }
            if (actions[token]) {
                send(actions[token]);
                actions[token] = null;
            }
            if (actions[username]) {
                send(actions[username]);
                actions[username] = null;
            }
            if (username || token) {
                query("SELECT a.* FROM actions AS a LEFT JOIN users AS u ON u.id = a.user_id WHERE (u.username = '" + username + "' OR a.token = '" + token + "') AND deleted_at IS NULL  ", function(data) {
                    if (JSON.stringify(data) != JSON.stringify(lastAction)) {
                        if (data[0]) {
                            send(data[0]);
                            if (data[0].autodelete == 1)
                                query("UPDATE actions SET deleted_at = NOW() WHERE id = '" + data[0].id + "' ", function() {});
                        }
                        lastAction = data;
                    }
                });
            }
        }, 1000);

})



app.get('/', function(request, response) {


   query("SELECT * FROM users  ", function(a){

      response.send(a); 

  });



});



api.on("connection", function(ws) {

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

 
