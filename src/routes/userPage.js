var express = require('express');
var secured = require('../lib/secured');
var router = express.Router();
const resfile = require('../utils/renderFile');

/* GET user profile. */
router.get('/user', secured(), function (req, res, next) {
  const { _raw, _json, ...userProfile } = req.user;
  resfile(req, res, 'index.ejs', {userProfile: JSON.stringify(userProfile, null, 2)})
});

module.exports = router;