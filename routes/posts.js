var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest:'./public/images/'});
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var fs = require('fs');

router.get('/add',ensureAuthenticated ,function(req, res, next) {
	var categories = db.get('categories');
	categories.find({},{}, function(err,categories){
		  res.render('addpost',{title:'Add Post', categories:categories});
	});	

});


router.get('/remove/:id/:filename',ensureAuthenticated ,function(req, res, next) {
	var id = req.params.id;
	var filename = req.params.filename;
	var posts = db.get('posts');
	fs.unlinkSync(req.app.locals.cwd + "images/" + filename);
	posts.remove({_id:id});
	res.location('/');
    res.redirect('/');

});


router.get('/show/:id', ensureAuthenticated,function(req, res, next) {
	var id = req.params.id;
	var posts = db.get('posts');
	posts.find({_id:id},{}, function(err,post){
		  post = post[0];
		  res.render('showPost',{title:'Article | ' + post.title.substring(0,10)+"...", post:post});
	});	

});


router.get('/categories/:cat', ensureAuthenticated,function(req, res, next) {
	var cat = req.params.cat;
	var posts = db.get('posts');
	posts.find({category:cat},{}, function(err,posts){
		  res.render('index',{title:'NodeBlog | ' + cat, posts:posts});
	});	

});


router.get('/author/:author', ensureAuthenticated,function(req, res, next) {
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


function ensureAuthenticated(req,res,next) {
	if(req.isAuthenticated())
	{
		return next();
	} else {
		res.redirect('/users/login');
	}
};


router.post('/addcomment',ensureAuthenticated,function(req, res, next) {
	 var postid = req.body.postid;
	 var name = req.body.name;
	 var body = req.body.body;
 	 var commentdate = new Date();
	 var posts = db.get('posts');

	req.checkBody('body', 'Body field is required').notEmpty();

	// Check Errors
	var errors = req.validationErrors();

	if(errors){
				req.flash('error', 'Comment without body can\'t be added');
				res.location('/posts/show/'+postid);
				res.redirect('/posts/show/'+postid);
	} else {
		var comment = {
			"name": name,
			"body": body,
			"commentdate": commentdate
		}

		var posts = db.get('posts');

		posts.update({
			"_id": postid
		},{
			$push:{
				"comments": comment
			}
		}, function(err, doc){
			if(err){
				throw err;
			} else {
				req.flash('success', 'Comment Added');
				res.location('/posts/show/'+postid);
				res.redirect('/posts/show/'+postid);
			}
		});
	}

});



module.exports = router;
