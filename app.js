var express = require('express');
var path = require('path');

var app = express();
const port =  process.env.NODE_PORT;

app.use(express.static(path.join(__dirname, "/public")));

app.get('/', (req, res) => {

	res.sendFile('index.html');

});

app.listen(port, (err) => {

	if (err){
		return console.log(err);
	}

	console.log("Server is listening on port: " + port);

});