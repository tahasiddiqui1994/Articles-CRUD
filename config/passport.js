const LocalStrategy = require('passport-local').Strategy ;
const User = require('../models/user') ;
const config = require('../config/database') ;
const bcrypt = require('bcryptjs') ;
const passport = require('passport') ;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

module.exports = function(passport) {
	passport.use(new LocalStrategy(function(username, password, done){
		let query = {username:username} ;
		User.findOne(query, function(err, user) {
			if (err) {
				throw err ;
			} else {
				if (!user) {
					return done(null, false, {message: 'You are not registered'}) ;
				} else {
					bcrypt.compare(password, user.password, function(err, isMatch){
						if (err) {
							throw err ;
						} else {
							if (isMatch) {
								return done(null, user) ;
							} else {
								return done(null, false, {message: 'Invalid Password'}) ;
							}
						}
					}) ;
				}
			}
		}) ;
	})) ;
}
