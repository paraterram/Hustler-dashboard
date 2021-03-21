var argv = require('minimist')(process.argv.slice(2));
var express  = require('express');
var mongoose = require( 'mongoose' );
var models   = require('models');
var utility = require('./lib/utility');
var app      = express();
var port     = process.env.PORT || argv.port || 3000;

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

process.env.NODE_ENV = process.env.NODE_ENV || argv.env || 'local';
console.log('in server.js: NODE_ENV=' + process.env.NODE_ENV);

// For storing persistent cookie data on the server
var MongoStore = require('connect-mongostore')(express);

var MONGO_URI = 'mongodb://localhost:27017/aux_prop_prod_restore';
var storeConfig = {
    'db': {
        name: 'aux_prop_prod_restore',
        servers: [{
            'host': 'localhost',
            'port': '27017'
        }]
    }
};

if(process.env.NODE_ENV === 'production') {
    MONGO_URI = 'mongodb://steve:Home=2149@candidate.32.mongolayer.com:10467,candidate.33.mongolayer.com:10429/aux_prop_prod_restore';
    storeConfig = {
        'db': {
            name: 'aux_prop_prod_restore',
            servers: [{
                'host': 'candidate.32.mongolayer.com',
                'port': 10467
            },
            {
                'host': 'candidate.33.mongolayer.com',
                'port': 10429
            }]
        },
        username: 'steve',
        password: 'Home=2149'
    };
}

// View engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.compress());
app.use(express.bodyParser());
//app.use(express.logger());
app.use(express.cookieParser());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

app.use(express.session({
    store: new MongoStore(storeConfig),
    secret: 'AllWelpRBelongToMe',
    cookie:{ maxAge: utility.loginDuration }
}));

app.use(express.static(__dirname + '/static/images'));
app.use(express.static(__dirname + '/static/html'));
app.use(express.static(__dirname + '/static/css'));
app.use(express.static(__dirname + '/static/css/third-party'));
app.use(express.static(__dirname + '/static/js'));
app.use(express.static(__dirname + '/static/js/third-party'));
app.use(express.static(__dirname + '/static/js/SPIM'));
app.use(express.static(__dirname + '/static/js/hustler-dashboard'));
app.use(express.static(__dirname + '/static/js/models'));
app.use(express.static(__dirname + '/static/js/legacyViews'));
app.use(express.static(__dirname + '/static/js/legacyViews/forms'));
app.use(express.static(__dirname + '/static/js/reactViews'));
app.use(express.static(__dirname + '/static/js/reactViews/phoneViews'));
app.use(express.static(__dirname + '/static/js/reactViews/contactViews'));
app.use(express.static(__dirname + '/static/js/reactViews/propertyViews'));
app.use(express.static(__dirname + '/static/js/reactViews/dealViews'));
app.use(express.static(__dirname + '/static/js/reactViews/buyerViews'));
app.use(express.static(__dirname + '/static/js/reactViews/userViews'));
app.use(express.static(__dirname + '/static/js/reactViews/agencyViews'));
app.use(express.static(__dirname + '/static/js/reactViews/widgetViews'));
app.use(express.static(__dirname + '/static/js/reactViews/scraperViews'));
app.use(express.static(__dirname + '/static/js/reactViews/reactForms'));
app.use(express.static(__dirname + '/static/js/collections'));
app.use(express.static(__dirname + '/static/js/routers'));
app.use(express.static(__dirname + '/static/js/templates'));
app.use(express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/bower_components/bootstrap'));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(models.User.authenticate()));
passport.serializeUser(models.User.serializeUser());
passport.deserializeUser(models.User.deserializeUser());

// This should allow property-search to load properly inside SPIM
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Origin', 'http://dealsource.co');
    next();
});

require('./db/db')(mongoose, MONGO_URI);

// http://stackoverflow.com/questions/15813677/https-redirection-for-all-routes-node-js-express-security-concerns
function requireHTTPS(req, res, next) {
    //http://jaketrent.com/post/https-redirect-node-heroku/
    if (req.header('x-forwarded-proto') !== 'https' &&
        req.headers.host.indexOf('localhost') === -1)
    {
        //FYI this should work for local development as well
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
}

app.use(requireHTTPS);

require('./config/routes')(app, __dirname);

app.listen(port, function () {
    console.log( "Listening on ", port);
});

// Expose app
exports = module.exports = app
