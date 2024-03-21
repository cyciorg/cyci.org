require('dotenv').config();
const express = require('express');
const session = require('express-session');
const Sentry = require('@sentry/node');
const Tracing = require("@sentry/tracing");
const passport = require('passport');
const path = require('path');
const compression = require('compression');
const DiscordStrategy = require('passport-discord').Strategy;
const refresh = require('passport-oauth2-refresh');
const User = require('./db/User.schema.js');
const { connectDb } = require('./db/connector.js');
const roles = require('./utils/roles.js');

const app = express();
const routes = [require('./routes/index.js').get, require('./routes/pricing').get];
const scopes = ['identify', 'email', 'guilds', 'guilds.join'];
const prompt = 'consent';

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const discordStrat = new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: scopes,
    prompt: prompt
}, (accessToken, refreshToken, profile, cb) => {
    profile.refreshToken = refreshToken;
    User.findOrCreate(profile, (err, user) => {
        if (err) return cb(err);
        return cb(profile, user);
    });
    return cb(null, profile);
});

passport.use(discordStrat);
refresh.use(discordStrat);

app.use(compression());
app.use(session({
    secret: 'secret',
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

app.get('/', routes[0]);
app.get('/pricing', routes[1]);
app.get('/api/v1/login', passport.authenticate('discord', { scope: scopes, prompt: prompt }));
app.get('/api/v1/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => res.redirect('/'));
app.get('/api/v1/logout', (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/');
    });
});

connectDb().then(errMongo => {
    app.listen(process.env.PORT, err => {
        if (err) return console.log(err);
        console.log(`Listening on port ${process.env.PORT}`);
    });
});