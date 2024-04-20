const indexRoute = require('../routes/index');
const pricingRoute = require('../routes/pricing');

module.exports = [
    { path: '/', handler: indexRoute.get },
    { path: '/pricing', handler: pricingRoute.get }
];