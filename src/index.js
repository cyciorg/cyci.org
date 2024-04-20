require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const compression = require('compression');
const Sentry = require('@sentry/node');
const Tracing = require("@sentry/tracing");
const DiscordStrategy = require('passport-discord').Strategy;
const refresh = require('passport-oauth2-refresh');
const { connectDb } = require('./db/connector.js');
const User = require('./db/User.schema.js');
const roles = require('./utils/roles.js');
const routes = require('./utils/routes.js');

const app = express();
const scopes = ['identify', 'email', 'guilds', 'guilds.join'];
const prompt = 'consent';

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: scopes,
    prompt: prompt
}, async (accessToken, refreshToken, profile, cb) => {
    try {
        profile.refreshToken = refreshToken;
        const user = await User.findOrCreate(profile);
        return cb(null, user);
    } catch (err) {
        return cb(err);
    }
}));

refresh.use('discord', passport);

app.use(compression());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views'), { extensions: ['css'] }));

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0,
});
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
app.use(Sentry.Handlers.errorHandler());

// Use routes dynamically
routes.forEach(route => {
    app.get(route.path, route.handler);
});

app.get('/api/v1/login', passport.authenticate('discord', { scope: scopes, prompt: prompt }));
app.get('/api/v1/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => res.redirect('/'));
app.get('/api/v1/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

connectDb().then(errMongo => {
    if (errMongo) {
        console.error('Error connecting to MongoDB:', errMongo);
    } else {
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
});