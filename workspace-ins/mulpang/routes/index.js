var express = require('express');
var router = express.Router();

const model = require('../model/mulpangDao');
const { toStar } = require('../utils/myutil');

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
  res.render('detail', { coupon, toStar });
});

// 구매 화면
router.get('/purchases/:no', async function(req, res, next){
  const coupon = await model.buyCouponForm(Number(req.params.no));
  res.render('buy', { coupon });
});

// 구매 등록
router.post('/purchase', async function(req, res, next){
  try{
    const purchaseId = await model.buyCoupon(req.body);
    res.end(String(purchaseId));
  }catch(err){
    res.json({ errors: { message: err.message } });
  }
});

// 근처 메뉴
router.get('/location', async function(req, res, next){
  const list = await model.couponList();
  res.render('location', { list });
});
// 추천 메뉴
router.get('/best', async function(req, res, next){
  res.render('best');
});
// top5 쿠폰 조회
router.get('/topCoupon', async function(req, res, next){
  res.json([]);
});
// 모두 메뉴
router.get('/all', async function(req, res, next){
  res.render('all');
});
// 쿠폰 남은 수량 조회
router.get('/couponQuantity', async function(req, res, next){
  res.end('success');
});

module.exports = router;
