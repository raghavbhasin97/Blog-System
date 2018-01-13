var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

/* GET home page. */
router.get('/', ensureAuthenticated,function(req, res, next) {
	var db = req.db;
	var posts = db.get('posts');
	posts.find({}, {}, function(err, posts){
		res.render('index', { title: 'NodeBlog | Home', posts: posts });
	});
});



function ensureAuthenticated(req,res,next) {
	if(req.isAuthenticated())
	{
		return next();
	} else {
		res.redirect('/users/login');
	}
};

module.exports = router;
