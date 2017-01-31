
var tinder = require('tinderjs').TinderClient;
var tinderClient = new tinder();

var fbToken = ''; //fbtoken here
var fbId = ''; //numeric fb id here.

var MongoClient = require('mongodb').MongoClient;

// Connection url
var url = 'mongodb://localhost:27017/tinder_dump';

// Connect using MongoClient
MongoClient.connect(url, function(err, db) {
	
	tinderClient.authorize(fbToken, fbId, function(){
		if(tinderClient.isAuthorized() == true){
			console.log("Login successful!");

			var count = 0;
			setInterval(function(){
				tinderClient.getRecommendations(null, function(err, data){
				if(data != null && data.status == 200){
					//console.log(data.status);
					results = data.results;
					count += results.length;

					for(var i = 0; i < results.length; i++){
						curr = results[i];
						db.collection('profile').insertOne(curr);
					}
					console.log('\t' + count);
				}
			});
			}, 5 * 1000);

			setInterval(function(){
				updateLocation(tinderClient);
			}, 60 * 1000);
		}
	});
});

function updateLocation(tinderClient){
	locations = [	{"lat": 28.7041, "long": 77.1025, "city": "delhi"},
					{"lat": 19.0760,  "long": 72.8777, "city": "mumbai"}, 
					{"lat": 12.9716, "long": 77.5946, "city": "bangalore"},
					{"lat": 22.5726, "long": 88.3639, "city": "kolkata"}, 
	];

	var i = Math.floor(Math.random() * locations.length);
	tinderClient.updatePosition(locations[i].long, locations[i].lat, function(err, res){
		console.log("\t\tLOCATION UPDATED TO " + locations[i].city);
		console.log(res);
	});
}
