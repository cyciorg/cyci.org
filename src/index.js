const express = require('express');
const session = require('express-session');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost/mailcow_auth', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// User schema
const userSchema = new mongoose.Schema({
    provider: String,
    id: String,
    username: String,
    email: String,
    accessToken: String
});
const User = mongoose.model('User', userSchema);

// Configure session middleware with 30 days expiration
const sessionMiddleware = session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    }
});

// Configure OAuth2 strategy
passport.use('mailcow', new OAuth2Strategy({
    authorizationURL: 'https://your-mailcow-instance.com/oauth2/auth',
    tokenURL: 'https://your-mailcow-instance.com/oauth2/token',
    clientID: 'your-client-id',
    clientSecret: 'your-client-secret',
    callbackURL: 'http://localhost:3000/login/callback',
    userProfileURL: 'https://your-mailcow-instance.com/profile'
}, (accessToken, refreshToken, profile, done) => {
    // Check if user already exists in database
    User.findOne({ provider: 'mailcow', id: profile.id }, (err, existingUser) => {
        if (err) {
            return done(err);
        }
        if (existingUser) {
            // If user exists, update access token and return
            existingUser.accessToken = accessToken;
            existingUser.save(err => {
                if (err) {
                    return done(err);
                }
                return done(null, existingUser);
            });
        } else {
            // If user does not exist, create a new user
            const newUser = new User({
                provider: 'mailcow',
                id: profile.id,
                username: profile.username,
                email: profile.email,
                accessToken: accessToken
            });
            newUser.save(err => {
                if (err) {
                    return done(err);
                }
                return done(null, newUser);
            });
        }
    });
}));

// Serialize user to session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

const app = express();

// Use session middleware
app.use(sessionMiddleware);

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Login route
app.get('/login', passport.authenticate('mailcow'));

// Callback route after authentication
app.get('/login/callback',
    passport.authenticate('mailcow', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect to profile
        res.redirect('/profile');
    }
);

// Profile route
app.get('/profile', (req, res) => {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
        res.redirect('/login');
        return;
    }

    // User profile data is available in req.user
    res.send(`Welcome, ${req.user.username}!<br>Your email is: ${req.user.email}`);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});