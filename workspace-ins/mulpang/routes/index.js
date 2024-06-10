var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.writeHead(302, { 'Location': 'today.html' });
  // res.end();
  res.redirect('today.html');
});

router.get('/:page.html', function(req, res, next) {
  res.render(req.params.page, {});
});

module.exports = router;
