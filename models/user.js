var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/nodeblog');
var db = mongoose.connection;

//Schema

var UserSchema = mongoose.Schema({
	username : {
		type : String,
		index : true
	},
	password : {
		type: String
	},
	email : {
		type: String
	},
	name : {
		type: String
	},
	profileimage : {
		type: String
	}
});


var User = module.exports = mongoose.model('User',UserSchema);

module.exports.getUserById = function(id,callback){
	User.findById(id,callback);
}

module.exports.getUserByUsername = function(username,callback) {
	var query = {username:username};
	User.findOne(query,callback);
}

module.exports.comparePassword = function(password,hash,callback) {
	bcrypt.compare(password,hash,function(err,isMatch){
		callback(null,isMatch);
	});
}

module.exports.createUser = function(newUser,callback) {
	bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
    		newUser.password = hash;
       		newUser.save(callback);
    	});
	});
	
}

