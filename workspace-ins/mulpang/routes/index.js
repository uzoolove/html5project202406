var express = require('express');
var router = express.Router();

const model = require('../model/mulpangDao');
const { toStar, generateOptions } = require('../utils/myutil');

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.writeHead(302, { 'Location': 'today.html' });
  // res.end();
  res.redirect('today');
});

// 오늘 메뉴
router.get('/today', async function(req, res, next) {
  req.query.page = Number(req.query.page) || 1;

  const list = await model.couponList(req.query);

  const params = {};

  if(req.query.page > 1){
    params.prePage = (new URLSearchParams({ ...req.query, page: req.query.page-1 })).toString();
  }
  if(req.query.page < list.totalPage){
    params.nextPage = (new URLSearchParams({ ...req.query, page:  req.query.page+1 })).toString();
  }
    
  res.render('today', { list, params, query: req.query, options: generateOptions });
});

// 상세 조회 화면
router.get('/coupons/:no', async function(req, res, next){
  const io = req.app.get('io');
  const coupon = await model.couponDetail(Number(req.params.no), io);
  res.render('detail', { coupon, toStar });
});

// 구매 화면
router.get('/purchases/:no', async function(req, res, next){
  const user = req.session.user;
  if(user){
    const coupon = await model.buyCouponForm(Number(req.params.no));
    res.render('buy', { coupon });
  }else{
    req.session.backurl = req.originalUrl;
    res.redirect('/users/login');
  }  
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
// top5 쿠폰 조회(http://localhost/topCoupon?condition=buyQuantity)
router.get('/topCoupon', async function(req, res, next){
  const list = await model.topCoupon(req.query.condition);
  res.json(list);
});
// 모두 메뉴
router.get('/all', async function(req, res, next){
  const list = await model.couponList(req.query);
  res.render('all', { list, query: req.query, options: generateOptions });
});
// 쿠폰 남은 수량 조회
router.get('/couponQuantity', async function(req, res, next){
  const list = await model.couponQuantity(req.query.couponIdList.split(',').map(id=>Number(id)));
  res.contentType('text/event-stream');
  res.write(`data: ${ JSON.stringify(list) }\n`);
  res.write(`retry: ${ 1000 * 10 }\n`);
  res.end('\n');
});

module.exports = router;
