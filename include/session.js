 
exports.lv = [];
this.init = function (ws) {
	ws.on('message', function(message) {
		m = (JSON.parse(message));	
	    if(m.type=="init")
		{
			ws.send("init");
			exports.lv =m.value;
		}		 
	});	 
}  