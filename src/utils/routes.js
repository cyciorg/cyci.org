const indexRoute = require('../routes/index');
const loginRoute = require('../routes/login');
const uploadRoute = require('../routes/upload');
const getConfigRoute = require('../routes/getConfig');

module.exports = [
    { path: '/', handler: indexRoute.get },
    { path: '/login', handler: loginRoute.get },
    { path: '/api/v2/upload', handler: uploadRoute.post },
    { path: '/api/v2/genconfig', handler: getConfigRoute.post }
];