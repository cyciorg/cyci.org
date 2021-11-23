require('dotenv').config()
const express = require('express');
const logger = require('./utils/logger');
const path = require('path')
const resfile = require('./utils/renderFile'); // temp in public dir bc weird bug
const app = express();

function route() {
    logger.log("Main - Adding routes ")
    app.set('trust proxy', 1);
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'views'), {extensions: ['css'],}));
    app.get('/', function(req, res) { 
        const ip =  req.headers['x-forwarded-for'] || req.socket.remoteAddress, who = req.headers['user-agent'] || "Undefined (1.0.0)";
        //logger.log(`index requested by ${ip} - ${who}`)
        resfile(req, res, "index.ejs") 
    });
    app.get('/signup', function(req, res) { 
        const ip =  req.headers['x-forwarded-for'] || req.socket.remoteAddress, who = req.headers['user-agent'] || "Undefined (1.0.0)";
        //logger.log(`signup requested by ${ip} - ${who}`)
        resfile(req, res, "signup.ejs") 
    });
    app.get('/login', function(req, res) { 
        const ip =  req.headers['x-forwarded-for'] || req.socket.remoteAddress, who = req.headers['user-agent'] || "Undefined (1.0.0)";
        //logger.log(`signup requested by ${ip} - ${who}`)
        resfile(req, res, "signup.ejs") 
    });
    app.get('/pricing', function(req, res) { 
        const ip =  req.headers['x-forwarded-for'] || req.socket.remoteAddress, who = req.headers['user-agent'] || "Undefined (1.0.0)";
        //logger.log(`pricing requested by ${ip} - ${who}`)
        resfile(req, res, "pricing.ejs") 
    });
    app.get('/team', function(req, res) { 
        const ip =  req.headers['x-forwarded-for'] || req.socket.remoteAddress, who = req.headers['user-agent'] || "Undefined (1.0.0)";
        //logger.log(`signup requested by ${ip} - ${who}`)
        resfile(req, res, "signup.ejs") 
    });
}

route();
logger.log("Main - Server started on " + process.env.SERVER_PORT);
app.listen(process.env.SERVER_PORT, function(err) {if (err) return logger.error("Error! " + err);})

process.on('uncaughtException', (error) => {
    logger.error('something terrible happened: ' + error);
})
process.on('unhandledRejection', (error, promise) => {
    logger.error(' promise rejection here: ' + promise);
    logger.error(' The error was: ' + error);
});