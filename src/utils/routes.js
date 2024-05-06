const indexRoute = require('../routes/index');
const loginRoute = require('../routes/login');
const uploadRoute = require('../routes/upload')

module.exports = [
    { path: '/', handler: indexRoute.get },
    { path: '/login', handler: loginRoute.get},
    { path: '/api/v2/upload', hanlder: uploadRoute.post}
];