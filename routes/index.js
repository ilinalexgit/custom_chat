var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('default', { title: 'Socket.io and Express' });
});

module.exports = router;