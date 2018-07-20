const router = require('express').Router() ;
let Article = require('../models/articles') ;
let User = require('../models/user') ;

router.get('/edit/:id', isAuthenticated, function(req, res){
	Article.findById(req.params.id, function(err, article){
		if (err) {
			console.log(err) ;
		} else {
			if (article.author != req.user._id) {
				req.flash('danger', 'You can not make changes in this Article.') ;
				res.redirect('/') ;
			} else {
				res.render('editArticle', {
					title: "Edit Article",
					article:article
				}) ;
			}
		}
	});
});
router.post('/edit/:id', isAuthenticated, function(req, res){
	let article = {} ;

	article.title = req.body.title ;
	article.author = req.user._id ;
	article.body = req.body.body ;

	let query = {_id:req.params.id} ;
	Article.update(query, article, function(err){
		if (err) {
			console.log("Error while saving data: ", err) ;
		} else {
			req.flash('success', 'Article Updated') ;
			res.redirect('/') ;
		}
	}) ;
}) ;

router.get('/add', isAuthenticated, function(req, res){
	res.render('add_article', {
		title: 'Add Article'
	});
})

router.post('/add', isAuthenticated, function(req, res){

	req.checkBody('title', 'Title is required').notEmpty() ;
	//req.checkBody('author', 'Author is required').notEmpty() ;
	req.checkBody('body', 'Body is required').notEmpty() ;

	//let errors = req.asyncValidationErrors() ;
	//let errors = req.getValidationResult() ;
	let errors = req.validationErrors() ;

	if(errors){
		res.render('add_article', {
			title: "Add Article",
			errors: errors
		}) ;
	} else {
		let article = new Article() ;
		article.title = req.body.title ;
		article.author = req.user._id ;
		article.body = req.body.body ;

		article.save(function(err){
			if (err) {
				console.log("Error while saving data: ", err) ;
			} else {
				req.flash('success', 'Article Added') ;
				res.redirect('/') ;
			}
		}) ;
	}

}) ;

router.delete('/:id', isAuthenticated, function(req, res){
	if (!req.user._id) {
		console.log('Tried to be deleted') ;
		res.status(500).send() ;
	} else {
		let query = {_id:req.params.id} ;

		Article.findById(req.params.id, function(err, article){
			if (article.author != req.user._id) {
				res.status(500).send() ;
			} else {
				Article.remove(query, function(err){
					if (err) {
						console.log("Error while remove: ",err) ;
					}
					res.send('Success') ;
				}) ;
			}
		}) ;
	}
}) ;

router.get('/:id', function(req, res){
	Article.findById(req.params.id, function(err, article){
		if (err) {
			console.log(err) ;
		} else {
			User.findById(article.author, function(err, user){
				if (err) {
					console.log(err) ;
				} else {
					res.render('article', {
						article:article,
						name: user.name
					}) ;
				}
			}) ;
		}
	});
});

function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
  		req.flash('danger', 'Please Login First') ;
		res.redirect('/users/login') ;
	}
}

module.exports = router ;
