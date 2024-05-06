const { models } = require('../db/connector.js');
const checkAuth = require('../utils/checkAuth.js');

async function get(req, res) {
    let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.realAddress || req.connection.remoteAddress,who = req.headers['user-agent'] || "Undefined (1.0.0)";
    let user = await models.User.findByEmailOrId({email: req.user.email, id: req.user.id});
    if (!checkAuth) return res.status(401).send('You are not logged in');
    if ((user instanceof Error)) return res.status(401).send('You are not logged in');
    const {ShareXConfig} = require('../utils/createSharexConfig.js');
    let conf = new ShareXConfig(user);
    let fileData = await conf.generateConfig();
    res.setHeader('Content-disposition', 'attachment; filename=' + fileData.name);
    res.setHeader('Content-type', "application/json");
    var fileContents = new Buffer.from(JSON.stringify(fileData.json), 'utf8');

    return res.status(200).send(fileContents);
};

async function post(req, res) {
};

module.exports = { post, get };