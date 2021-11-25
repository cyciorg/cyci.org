require('dotenv').config()
const express = require('express');
const logger = require('./utils/logger');
const path = require('path')
const resfile = require('./utils/renderFile'); // temp in public dir bc weird bug
var cookieParser = require('cookie-parser');
var session = require('express-session');
var userInViews = require('./lib/userInViews');
var passport = require('passport');
const app = express();
const { auth, requiresAuth } = require('express-openid-connect');
var Auth0Strategy = require('passport-auth0');
var authRouter = require('./routes/auth');
var usersRouter = require('./routes/userPage');

  var strategy = new Auth0Strategy(
    {
      domain: "dev-xmxltrh6.us.auth0.com",
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_SECRET,
      callbackURL: 'https://localhost/callback'
    },
    function (accessToken, refreshToken, extraParams, profile, done) {
      // accessToken is the token to call Auth0 API (not needed in the most cases)
      // extraParams.id_token has the JSON Web Token
      // profile has all the information from the user
      return done(null, profile);
    }
  );
  passport.use(strategy);

  // You can use this section to keep a smaller payload
  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

function route() {
    //logger.log("Main - Adding routes ")
    app.set('trust proxy', 1);
    app.set('view engine', 'ejs');
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'views'), {extensions: ['css'],}));
    var sess = {
        secret: 'CTFRVYGBUHCDnwjkfw687347892GUY#8907246y23$&*($2yguoishdbfjknsf',
        cookie: {},
        resave: false,
        saveUninitialized: true
      };
      
      if (app.get('env') === 'production') {
        // If you are using a hosting provider which uses a proxy (eg. Heroku),
        // comment in the following app.set configuration command
        //
        // Trust first proxy, to prevent "Unable to verify authorization request state."
        // errors with passport-auth0.
        // Ref: https://github.com/auth0/passport-auth0/issues/70#issuecomment-480771614
        // Ref: https://www.npmjs.com/package/express-session#cookiesecure
        // app.set('trust proxy', 1);
        
        sess.cookie.secure = true; // serve secure cookies, requires https
      }
      app.use(session(sess));

        app.use(passport.initialize());
        app.use(passport.session());
    // app.use(auth(config));
    
    app.use(userInViews());
    app.use('/', authRouter);
    app.use('/', usersRouter);
    app.get('/', function(req, res) { 
        const ip =  req.headers['x-forwarded-for'] || req.socket.remoteAddress, who = req.headers['user-agent'] || "Undefined (1.0.0)";
        //logger.log(`index requested by ${ip} - ${who}`)
        resfile(req, res, "index.ejs") 
    });
    // app.get('/profile', requiresAuth(), (req, res) => {
    //     res.send(JSON.stringify(req.oidc.user));
    // });
    // app.get('/signup', function(req, res) { 
    //     const ip =  req.headers['x-forwarded-for'] || req.socket.remoteAddress, who = req.headers['user-agent'] || "Undefined (1.0.0)";
    //     //logger.log(`signup requested by ${ip} - ${who}`)
    //     resfile(req, res, "signup.ejs") 
    // });
    // app.get('/login', function(req, res) { 
    //     const ip =  req.headers['x-forwarded-for'] || req.socket.remoteAddress, who = req.headers['user-agent'] || "Undefined (1.0.0)";
    //     //logger.log(`signup requested by ${ip} - ${who}`)
    //     resfile(req, res, "login.ejs") 
    // });
    app.get('/pricing', function(req, res) { 
        const ip =  req.headers['x-forwarded-for'] || req.socket.remoteAddress, who = req.headers['user-agent'] || "Undefined (1.0.0)";
        //logger.log(`pricing requested by ${ip} - ${who}`)
        resfile(req, res, "pricing.ejs") 
    });
    app.get('/team', function(req, res) { 
        const ip =  req.headers['x-forwarded-for'] || req.socket.remoteAddress, who = req.headers['user-agent'] || "Undefined (1.0.0)";
        //logger.log(`signup requested by ${ip} - ${who}`)
        resfile(req, res, "team.ejs") 
    });

}
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
route();
//logger.log("Main - Server started on " + process.env.SERVER_PORT);
app.listen(process.env.SERVER_PORT, function(err) {if (err) return logger.error("Error! " + err);})

process.on('uncaughtException', (error) => {
    logger.error('something terrible happened: ' + error);
})
process.on('unhandledRejection', (error, promise) => {
    logger.error(' promise rejection here: ' + promise);
    logger.error(' The error was: ' + error);
});
