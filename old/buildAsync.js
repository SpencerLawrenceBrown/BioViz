
var x = function(callback){
	setTimeout(function(){
		callback(null,"a");
	}, 100);
};

var y = function(callback){
	setTimeout(function(){
		callback(null, "b");
	}, 10);
}

function buildAsyncPar(arr, finalCallback){

	var count = 0;
	var res = [];
	var functions = arr;

	function manageContent(index, callback){

		functions[index](function(err, data){
			if (err){
				finalCallback(err, null);
				return
			}

			res[index] = data;
			count += 1

			if (count == functions.length){
				finalCallback(null, res);
				return
			}

		});

	}

	for (let i = 0; i<arr.length; i++){
		manageContent(i, finalCallback);
	}

};

function buildAsyncSeries(arr, finalCallback){

	var functions = arr;
	var res = [];

	function callInSeries(index){
		
		myFunc = functions.shift(); //take the first function
		myFunc(function(err, data){
			if (err){
				finalCallback(err, null);
				return
			}

			res[index] = data

			//If its the final index
			if (functions.length == 0){
				finalCallback(null, res);
			} else {
				callInSeries(index + 1);
			}

		});
	}

	callInSeries(0);

};


//Call Async
allFunctions = [x,y];

buildAsyncPar(allFunctions, function(err, results){
	if (err){
		console.log(err);
		return
	}

	console.log(results);

});



