

var tinder = require('tinderjs').TinderClient;
var tinderClient = new tinder();

var sleep = require('sleep');


var fbToken = 'EAAGm0PX4ZCpsBAK0X1WCUmj8uvTFBksgNEzHTZA6NaNatQ25EgJCZAVfzVnpIXm63svDBPBXNZAUkqpakmVMlBy0e1gVNM4iuT8wxf7gGw3ujasV83RTq52rLPsBQcVWJVZAYa2QXZAQdnnHUP6thsCky0gLUJDh1xMtfuGbkNyn1z6fGZC9c1nQAZBvzlm5oETRlka7vdeM5cVO6eac0rACE7cqyuaRpo6LYOKNGc8XZCkOpwJO4X6MUzWB0k2krwLwZD';
var fbId = '1156918437';

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
			}, 5000);

			//like_all(db, tinderClient);		
			//ping_time_activity(db, tinderClient);	
		}
	});
});

function like_all(db, tinderClient){
	db.collection('profile').find().toArray(function(err, res){

		like(tinderClient, 0, res);
	});
}

function like(tinderClient, index, res){
	tinderClient.like(res[index]._id, function(error, response){
		console.log(res[index]._id);
		console.log(response);
		console.log();
		like(tinderClient, index + 1, res);
	});
}

function ping_time_activity(db, tinderClient){
	db.collection('profile').find().toArray(function(err1, oldItem){
		for(var i = 0; i < oldItem.length; i++){
			//console.log(oldItem[i]._id);

			var old = oldItem[i];

			tinderClient.getUser(old._id, function(newItem){
				//console.log(oldItem[i]._id);
				//console.log(newItem._id);
				if(newItem != null && newItem != undefined){
					prorcess_item(db, old._id, old, newItem);	
				}
			});

			// var seconds = 2;
			// var waitTill = new Date(new Date().getTime() + seconds * 1000);
			// while(waitTill > new Date()){}
		}
	});
}

function prorcess_item(db, id, item_old, item_new, callback){
	//console.log(">> " + item_old.);
	pingTime = item_old.ping_time;
	if(pingTime.constructor === Array) { //array
	   lastActiveTime = new Date(pingTime[pingTime.length - 1]);
	   newActiveTime  = new Date(item_new.ping_time);

	   if(newActiveTime > lastActiveTime){
	   		pingTime.push(newActiveTime);
	   		update_item(db, id, pingTime, callback);
	   }
	   else{
	   	callback;
	   }
	} else {
	 	lastActiveTime = new Date(pingTime);
	   	newActiveTime  = new Date(item_new.ping_time);

	   	if(newActiveTime > lastActiveTime){
	   		temp = [lastActiveTime, newActiveTime];
	   		update_item(db, id, temp, callback);
	   	}
	   	else{
	   		callback;
	   	}
	}
}

function update_item(db, id, item, callback){
	console.log('ping time updated for ' + id);
	db.collection('profile').update({'_id': id}, {$set: {'ping_time': item}}, callback);
}

