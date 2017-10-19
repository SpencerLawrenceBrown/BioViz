
var one = function(q, p){
	return q * p;
}

var two = function(q, p){
	return q * p * 2;
}


var three = function(q, p){
	return p;
}

function findCost(arr, config){

	var total = 0;
	var itemCounts = {}


	//Item Costs
	for (let item of arr){
		if (!itemCounts.hasOwnProperty(item)){
			itemCounts[item] = 0;
		}
		itemCounts[item] += 1;
	}

	//Determine total
	for (let itemType in itemCounts){
		let itemConfig = config[itemType];
		let price = itemConfig[0];
		let sumFunction = itemConfig[1];

		total += sumFunction(itemCounts[itemType], price);

	}

	return total

}

var input = ["A", "B", "C", "C", "C"];
var config = {
	"A" : [70, three],
	"B" : [60, two],
	"C" : [10, one]
}

var total = findCost(input, config);
