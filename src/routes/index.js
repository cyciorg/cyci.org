const { models } = require('../db/connector.js');
const renderFile = require('../utils/renderFile.js');
const idToRole = require('../utils/idToRole');

async function get(req, res) {
    if (!req.isAuthenticated()) {
        renderFile(req, res, 'index.ejs', { req: req, res: res, user: undefined, isAuthenticated: false });
    } else {
        let userReq = res.req.user;
        let user = await models.User.findByEmailOrId({ email: userReq.email, id: userReq.id });
        var roles = idToRole(user.roles[0]);
        renderFile(req, res, 'index.ejs', { req: req, res: res, user: userReq, role: roles, mongoData: user, isAuthenticated: true });
    }
}

async function post(req, res) {}

module.exports = { post, get };