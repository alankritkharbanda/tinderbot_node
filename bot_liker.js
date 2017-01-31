
var tinder = require('tinderjs').TinderClient;
var tinderClient = new tinder();

var sleep = require('sleep');


var fbToken = '';
var fbId = '';

var MongoClient = require('mongodb').MongoClient;

// Connection url
var url = 'mongodb://localhost:27017/tinder_dump';

// Connect using MongoClient
MongoClient.connect(url, function(err, db) {
	
	tinderClient.authorize(fbToken, fbId, function(){
		if(tinderClient.isAuthorized() == true){
			console.log("Login successful!");

			like_all(db, tinderClient);		
			//ping_time_activity(db, tinderClient);	
		}
	});
});

function like_all(db, tinderClient){
	db.collection('profile').find().toArray(function(err, res){

		like(tinderClient, 0, res);

		// var i;	
		// for(i = 0; i < res.length; i++){
		// 	like(tinderClient, i, res);
		// }
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

