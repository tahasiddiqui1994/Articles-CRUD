const express    = require('express') ;
const app        = express() ;
const path       = require('path') ;
const mongoose   = require('mongoose') ;
const bodyparser = require('body-parser') ;
const session    = require('express-session') ;
const flash      = require('connect-flash') ;
const validator  = require('express-validator') ;
const logger     = require('morgan');
const config     = require('./config/database');
const passport = require('passport') ;

/*
mongoose.connect('mongodb://localhost:27017/traversymedia', { useNewUrlParser: true }, function(err){
	if (err) {
		console.log(err) ;
	} else {
		//console.log('Connected to MongoDB')
	};
}) ;*/

mongoose.connect(config.database) ;
let db      = mongoose.connection ;
let Article = require('./models/articles') ;

db.once('open', function(){
	console.log("Connected to MongoDB");
});
db.on('error', function(err){
	console.log(err);
});

app.use(flash());
app.use(logger('dev'));
app.use(bodyparser.json()) ;
app.use(bodyparser.urlencoded({extended: false})) ;
app.use(express.static(path.join(__dirname, 'public'))) ;
app.use(function (req, res, next) {
		res.locals.messages = require('express-messages')(req, res);
		next();
});
app.use(session({
		secret: 'keyboard cat',
		resave: true,
		saveUninitialized: true
})) ;
app.use(validator({
	errorFormatter: function(param, msg, value) {
		var namespace = param.split('.')
			, root    	= namespace.shift()
			, formParam 	= root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param : formParam,
			msg   : msg,
			value : value
		};
	}
}));
app.use(passport.initialize()) ;
app.use(passport.session()) ;
app.get('*', function(req, res, next) {
	res.locals.user = req.user || null ;
	next() ;
}) ;
require('./config/passport')(passport) ;


app.set('views', path.join(__dirname, 'views')) ;
app.set('view engine', 'pug') ;

app.get('/', function(req, res) {
		Article.find({}, function(err, articles){
				if (err) {
					console.log(err) ;
		} else {
				res.render('index', {
					title: 'Articles',
					articles:articles
				}) ;
			}
	}) ;
}) ;

let articles = require('./routes/articles') ;
let users = require('./routes/users') ;
app.use('/articles', articles) ;
app.use('/users', users) ;

app.listen(3000, function(){
		console.log('http://localhost:3000');
});

/*
let articles =[
	{
		id: 1,
		title: 'Article 1',
		author: 'Taha',
		body: 'This is Article 1'
	},
	{
		id: 2,
		title: 'Article 2',
		author: 'Taha',
		body: 'This is Article 2'
	},
	{
		id: 3,
		title: 'Article 3',
		author: 'Taha',
		body: 'This is Article 3'
	}
];
*/
