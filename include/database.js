 var mysql      = require('mysql');


 
	var pool = mysql.createPool({
  		host     : 'consultadoctor.ro',
  		user     : 'drdealsr',
  		database : 'drdealsr_webchat',
  		password : 'l5skm1sxca'
	});
   
this.query = function(query, callback){

	try{

	pool.query(query, function(err, rows, fields) {
		if(!err)
			callback(rows);
		
	});
	
	}catch(error){
		console.log(error);
	}
}
 