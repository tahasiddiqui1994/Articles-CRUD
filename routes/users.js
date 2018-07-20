const express	 = require('express') ;
const bcrypt	 = require('bcryptjs') ;
const router	 = express.Router() ;
const passport = require('passport') ;
let User		 = require('../models/user') ;

router.get('/register', function(req, res) {
	res.render('register') ;
}) ;

router.post('/register', function(req, res){
	const name = req.body.name ;
	const email = req.body.email ;
	const username = req.body.username ;
	const password = req.body.password ;
	const password2 = req.body.password2 ;

	req.checkBody('name', 'Name is reqired').notEmpty() ;
	req.checkBody('email', 'Email is reqired').notEmpty() ;
	req.checkBody('email', 'Email is not valid').notEmpty() ;
	req.checkBody('username', 'Username is reqired').notEmpty() ;
	req.checkBody('password', 'Password is reqired').notEmpty() ;
	req.checkBody('password2', 'Password do not match').equals(password) ;

	//let errors = req.asyncValidationErrors() ;
	//let errors = req.getValidationResult() ;
	let errors = req.validationErrors() ;

	if (errors) {
		res.render('register', {
			errors: errors
		}) ;
	} else {
		let newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password
		}) ;

		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(newUser.password, salt, function(err, hash){
				if (err) {
					console.log("Error while hash: ",err) ;
				} else {
					newUser.password = hash ;
					newUser.save(function(err){
						if (err) {
							console.log("Error while save: ", err) ;
						} else {
							req.flash('success', 'Registration completed') ;
							res.redirect('/users/login/') ;
						}
					}) ;
				}
			}) ;
		}) ;
	}
}) ;

router.get('/login', function(req, res){
	res.render('login') ;
}) ;

router.post('/login', function(req, res, next) {
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next) ;
}) ;

router.get('/logout', function(req, res) {
	req.logout() ;
	req.flash('success', 'You are logged out') ;
	res.redirect('/users/login') ;
})

module.exports = router ;
