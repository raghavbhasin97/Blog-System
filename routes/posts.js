var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest:'./public/images/'});
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

router.get('/add', function(req, res, next) {
	var categories = db.get('categories');
	categories.find({},{}, function(err,categories){
		  res.render('addpost',{title:'Add Post', categories:categories});
	});	

});



router.get('/show/:id', function(req, res, next) {
	var id = req.params.id;
	var posts = db.get('posts');
	posts.find({_id:id},{}, function(err,post){
		  post = post[0];
		  res.render('showPost',{title:'Article | ' + post.title.substring(0,10), post:post});
	});	

});


router.get('/categories/:cat', function(req, res, next) {
	var cat = req.params.cat;
	var posts = db.get('posts');
	posts.find({category:cat},{}, function(err,posts){
		  res.render('index',{title:'NodeBlog | ' + cat, posts:posts});
	});	

});


router.get('/author/:author', function(req, res, next) {
	var author = req.params.author;
	var posts = db.get('posts');
	posts.find({author:author},{}, function(err,posts){
		  res.render('index',{title:'NodeBlog | ' + author, posts:posts});
	});	

});


router.post('/add', upload.single('mainimage'),function(req, res, next) {
 //Get form Values
 var title = req.body.title;
 var category = req.body.category;
 var body = req.body.body;
 var author = req.body.author;
 var date = new Date();

 var image = req.file;

 //Check file upload
 if(image)
 {
 	image = image.filename;
 } else {
 	image = 'noimage'
 }

 req.checkBody('title','Title is required!').notEmpty();
 req.checkBody('body','Body is required!').notEmpty();

 var errors = req.validationErrors();
 var posts = db.get('posts');
 if(errors) {
 	var categories = db.get('categories');
 	res.render('addpost',{title:'Add Post', categories:categories,errors:errors});
 } else {
 	posts.insert(
 	{
 		"title":title,
 		"body" :body,
 		"category":category,
 		"author":author,
 		"date":date,
 		"mainimage":image
 	}, function(err,post) {
 		if(err) res.send(err);
 		else {
 			req.flash('success','Post Added');
 			res.location('/');
 			res.redirect('/');
 		}
 	});
 }
});

module.exports = router;
