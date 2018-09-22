var express = require("express");
var path = require("path");
var mongoose = require("mongoose");
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');

//connect to db
mongoose.connect(config.database, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

//init app
var app = express();

//view
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//set public folder - static
app.use(express.static(path.join(__dirname, 'public')));

//set global errors variable
app.locals.errors = null;

//get Page model
var Page = require('./models/page');

// Get all pages to pass to header.ejs
Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages;
    }
});

//get City model
var City = require('./models/cities');

// Get all Cities to pass to header.ejs
City.find(function (err, cities) {
    if (err) {
        console.log(err);
    } else {
        app.locals.cities = cities;
    }
});

// Body Parser middleware
// 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());

// Express Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
//  cookie: { secure: true }
}));

// Express Validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));


// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.get('*', function(req, res, next) {
    res.locals.cart = req.session.cart;
    next();
});

//set routes
var pages = require('./routes/pages.js');
var flights = require('./routes/flights.js');
var adminPages = require('./routes/admin_pages.js');
var adminFlights = require('./routes/admin_flights.js');
var adminCities = require('./routes/admin_cities.js');


app.use('/', pages);
app.use('/flights', flights);
app.use('/admin/pages', adminPages);
app.use('/admin/flights', adminFlights);
app.use('/admin/cities', adminCities);


//start the server
var port = 3000;
app.listen(port, function() {
    console.log('Server started on port ' + port);
});

function debounce(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this,
        args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };