var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Travelr', subtitle: 'The App for Unique Travelling' });
});

module.exports = router;
