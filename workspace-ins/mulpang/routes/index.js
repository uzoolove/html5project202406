var express = require('express');
var router = express.Router();

const model = require('../model/mulpangDao');

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.writeHead(302, { 'Location': 'today.html' });
  // res.end();
  res.redirect('today');
});

// 오늘 메뉴
router.get('/today', async function(req, res, next){
  const list = await model.couponList();
  res.render('today', { list });
});

// 상세 조회 화면
router.get('/coupons/:no', async function(req, res, next){
  const coupon = await model.couponDetail(Number(req.params.no));
  res.render('detail', { coupon });
});

router.get('/:page.html', function(req, res, next) {
  res.render(req.params.page, {});
});

module.exports = router;
