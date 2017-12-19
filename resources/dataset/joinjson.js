let fs = require('fs');

const file_one = require("./restaurants_list.json");
const file_two = require("./convertcsv.json");
let o_one = Object.assign({}, file_one);
let o_two = Object.assign({}, file_two);
var array = new Array();
var i= 0;
//console.log(o_two[0]);
//const file_list = [  './restaurants_list.json', './convertcsv.json' ];
for (var key1 in o_one){
	array[i]=o_one[key1];
	for (var key2 in o_two){
		
		if(o_one[key1].objectID==o_two[key2].objectID){
			//console.log(o_one[key]);
			array[i].food_type = o_two[key2].food_type;
			array[i].stars_count = o_two[key2].stars_count;
			array[i].reviews_count = o_two[key2].reviews_count;
			array[i].neighborhood = o_two[key2].neighborhood;
			array[i].phone_number = o_two[key2].phone_number;
			array[i].price_range = o_two[key2].price_range;
			array[i].dining_style = o_two[key2].dining_style;
		};
	};
	console.log(i);
	i++;
};
fs.writeFile('combined.json', JSON.stringify(array), function(err) {
    if (err) {
        console.log("failed");
    } else {
        console.log("printed to 'combined.json'");
    }
});