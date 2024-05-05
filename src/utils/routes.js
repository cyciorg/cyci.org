const indexRoute = require('../routes/index');
const loginRoute = require('../routes/login');

module.exports = [
    { path: '/', handler: indexRoute.get },
    { path: '/login', handler: loginRoute.get}
];