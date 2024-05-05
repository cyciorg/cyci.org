const indexRoute = require('../routes/index');

module.exports = [
    { path: '/', handler: indexRoute.get }
];