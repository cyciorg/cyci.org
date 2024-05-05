const express = require('express');
const session = require('express-session');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const Snowflake = require("./utils/snowflakeGenerator.js");
const axios = require('axios');
const { connectDb, models } = require('./db/connector.js');
const routes = require('./utils/routes.js');
const app = express();
const path = require("path")

const snowflake = new Snowflake(1, 1609459200000);

// Use session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days in milliseconds
    })
);

// Serve static files.
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['css'] }));
app.use(express.static(path.join(__dirname, 'views'), { extensions: ['css'] }));

// Configure Passport with OAuth2 strategy for Mailcow
passport.use(
    'mailcow',
    new OAuth2Strategy(
        {
            authorizationURL: 'https://mail.cyci.org/oauth/authorize',
            tokenURL: 'https://mail.cyci.org/oauth/token',
            skipUserProfile: false,
            clientID: process.env.MAILCOW_CLIENT_ID,
            clientSecret: process.env.MAILCOW_CLIENT_SECRET,
            callbackURL: 'https://cyci.org/auth/callback',
            state: true,
            scope: 'profile'
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Fetch profile data using Axios
                const response = await axios.get('https://mail.cyci.org/oauth/profile', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                const userProfile = response.data;

                // Check if the user already exists in the database
                let user = await models.User.findOne({ provider: 'mailcow', email: userProfile.email });

                if (!user) {
                    // User doesn't exist, create a new user document
                    const userId = snowflake.generate();
                    user = new models.User({
                        userId: userId.toString(),
                        provider: 'mailcow',
                        email: userProfile.email,
                        username: userProfile.displayName,
                        roles: [0]
                    });
                    await user.save();
                }

                done(null, user);
            } catch (error) {
                // Handle any errors that occur during profile fetching
                console.error('Error fetching profile:', error);
                done(error);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    // Serialize user by storing only the user's id in the session
    done(null, user.id);
});

passport.deserializeUser((id, done) => {

    models.User.findById(id)
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err, null);
        });
});


// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Set the View Engine to EJS
app.set('view engine', 'ejs');

// Login route
app.get('/api/v2/login', passport.authenticate('mailcow'));

// Callback route after authentication
app.get(
    '/auth/callback',
    passport.authenticate('mailcow', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/');
    }
);

// Logout route
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// Frontend Routes
routes.forEach(route => {
    app.get(route.path, route.handler);
});

// Start the server
const PORT = process.env.PORT || 3000;
connectDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});
