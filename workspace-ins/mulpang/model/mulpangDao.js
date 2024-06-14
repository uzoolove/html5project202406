const util = require('node:util');
const path = require('node:path');
const fs = require('node:fs');
const moment = require('moment');
const MyUtil = require('../utils/myutil');

// DB 접속
let db;
const { MongoClient } = require('mongodb');
const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

async function main() {
  await client.connect();
  db = client.db('mulpang');
  db.member = db.collection('member');
  db.shop = db.collection('shop');
  db.coupon = db.collection('coupon');
  db.purchase = db.collection('purchase');
  db.epilogue = db.collection('epilogue');
  db.sequence = db.collection('sequence');
  return 'DB 접속 완료.';
}

main()
  .then(console.info)
  .catch(console.error);

// 쿠폰 목록조회
module.exports.couponList = async (qs={}) => {
	// 검색 조건
	const query = {};
  const now = moment().format('YYYY-MM-DD');
	// 1. 판매 시작일이 지난 쿠폰, 구매 가능 쿠폰(기본 검색조건)
  query['saleDate.start'] = { $lte: now };
  query['saleDate.finish'] = { $gte: now };
	// 2. 전체/구매가능/지난쿠폰
  switch(qs.date){
    case 'all':
      delete query['saleDate.finish'];
      break;
    case 'past':
      query['saleDate.finish'] = { $lt: now };
      break;
  }
	// 3. 지역명	
  const location = qs.location;
  if(location){
    query['region'] = location;
  }
	// 4. 검색어	
  const keyword = qs.keyword;
  if(keyword?.trim() != ''){
    const regExp = new RegExp(keyword, 'i');
    query['$or'] = [{ couponName: regExp }, { desc: regExp }];
  }

	// 정렬 옵션
	const orderBy = {};
	// 1. 사용자 지정 정렬 옵션	
  const orderCondition = qs.order;
  if(orderCondition){
    orderBy[orderCondition] = -1; // -1: 내림차순, 1: 오름차순
  }
	// 2. 판매 시작일 내림차순(최근 쿠폰)	
  orderBy['saleDate.start'] = -1;
	// 3. 판매 종료일 오름차순(종료 임박 쿠폰)
  orderBy['saleDate.finish'] = 1;

	// 출력할 속성 목록
	const fields = {
		couponName: 1,
		image: 1,
		desc: 1,
		primeCost: 1,
		price: 1,
		useDate: 1,
		quantity: 1,
		buyQuantity: 1,
		saleDate: 1,
		position: 1
	};
	
	// TODO 쿠폰 목록을 조회한다.
  let count = 0;
  let offset = 0;
  if(qs.page){
    count = 5;
    offset = (qs.page - 1) * count;
  }
  const result = await db.coupon.find(query).project(fields).sort(orderBy).skip(offset).limit(count).toArray();
  const totalCount = await db.coupon.countDocuments(query);
  result.totalPage = Math.floor((totalCount+count-1)/count);
  console.log(`${ result.length }건 조회.`);
  return result;
};

// 쿠폰 상세 조회
module.exports.couponDetail = async (_id, io) => {
	// coupon, shop, epilogue 조인
	const coupon = await db.coupon.aggregate([{
    $match: { _id }
  }, {
    // shop 조인
    $lookup: {
      from: 'shop',
      localField: 'shopId', // coupon.shopId
      foreignField: '_id', // shop._id
      as: 'shop'
    }
  }, {
    // shop 조인 결과(배열)에서 배열을 풀어 헤친다.
    $unwind: '$shop'
  }, {
    // epilogue 조인
    $lookup: {
      from: 'epilogue',
      localField: '_id', // coupon._id
      foreignField: 'couponId', // epilogue.couponId
      as: 'epilogueList'
    }
  }]).next();

	// 뷰 카운트를 하나 증가시킨다.
	await db.coupon.updateOne({ _id }, { $inc: { viewCount: 1 } });

	// 웹소켓으로 수정된 조회수 top5를 전송한다.
  const top5 = await topCoupon('viewCount');
  io.emit('new5', top5);
	
  console.log(coupon);
  return coupon;
};

// 구매 화면에 보여줄 쿠폰 정보 조회
module.exports.buyCouponForm = async (_id) => {
	const fields = {
		couponName: 1,
    price: 1,
    quantity: 1,
    buyQuantity: 1,
    'image.detail': 1
	};
	// TODO 쿠폰 정보를 조회한다.
	return await db.coupon.findOne({ _id }, { projection: fields });
};

// 쿠폰 구매
module.exports.buyCoupon = async (params) => {
  console.log(params)
	// 구매 컬렉션에 저장할 형태의 데이터를 만든다.
	const document = {
		couponId: Number(params.couponId),
		email: 'uzoolove@gmail.com',	// 나중에 로그인한 id로 대체
		quantity: Number(params.quantity),
		paymentInfo: {
			cardType: params.cardType,
			cardNumber: params.cardNumber,
			cardExpireDate: params.cardExpireYear + params.cardExpireMonth,
			csv: params.csv,
			price: Number(params.unitPrice) * Number(params.quantity)
		},
		regDate: moment().format('YYYY-MM-DD HH:mm:ss')
	};

	// TODO 구매 정보를 등록한다.
  try{
    const sequence = await db.sequence.findOneAndUpdate({ _id: 'purchase' }, { $inc: { value: 1 } });
    document._id = sequence.value;
    db.purchase.insertOne(document);
    
    // TODO 쿠폰 구매 건수를 하나 증가시킨다.
    await db.coupon.updateOne({ _id: document.couponId }, { $inc: { buyQuantity: document.quantity } });
    return document._id;
  }catch(err){
    console.error(err);
    throw new Error('쿠폰 구매에 실패했습니다. 잠시후 다시 시도하시기 바랍니다.');
  }
};
	
// 추천 쿠폰 조회
const topCoupon = module.exports.topCoupon = async (condition) => {
  const query = {}; // 검색 조건
  const now = moment().format('YYYY-MM-DD');
	// 1. 판매 시작일이 지난 쿠폰, 구매 가능 쿠폰(기본 검색조건)
  query['saleDate.start'] = { $lte: now };
  query['saleDate.finish'] = { $gte: now };

  const orderBy = {
    [condition]: -1
  };
	const list = await db.coupon.aggregate([{
    $match: query
  }, {
    $sort: orderBy
  }, {
    $limit: 5
  }, {
    $project: {
      couponName: 1,
      value: '$'+condition
    }
  }]).toArray();

  return list;
};

// 지정한 쿠폰 아이디 목록을 받아서 남은 수량을 넘겨준다.
module.exports.couponQuantity = async (coupons) => {
  const list = await db.coupon.find({ _id: { $in: coupons } }, { projection: { quantity: 1, buyQuantity: 1, couponName: 1 } }).toArray();
  return list;
};

// 임시로 저장한 프로필 이미지를 회원 이미지로 변경한다.
function saveImage(tmpFileName, destFileName){
  const org = path.join(__dirname, '..', 'public', 'tmp', tmpFileName);
  const dest = path.join(__dirname, '..', 'public', 'image', 'member', destFileName);
	// TODO 임시 이미지를 member 폴더로 이동시킨다.
	fs.rename(org, dest, function(err){
    if(err) console.error(err);
  });
}

// 회원 가입
module.exports.registMember = async (params) => {
	const member = {
    _id: params._id,
    password: params.password,
    profileImage: params._id,
    regDate: moment().format('YYYY-MM-DD HH:mm:ss')
  };

  try{
    const result = await db.member.insertOne(member);
    saveImage(params.tmpFileName, member.profileImage);
    return result.insertedId;
  }catch(err){
    console.error(err);
    // 아이디 중복 여부 체크
    if(err.code === 11000){
      throw new Error('이미 등록된 이메일입니다.');
    }else{
      throw new Error('작업 처리에 실패했습니다. 잠시후 다시 시도하시기 바랍니다.');
    }
  }
};

// 로그인 처리
module.exports.login = async (params) => {
	// TODO 지정한 아이디와 비밀번호로 회원 정보를 조회한다.
	try{
    var result = await db.member.findOne(params, { projection: { profileImage: 1 } });
  }catch(err){
    console.error(err);
    throw new Error('작업 처리에 실패했습니다. 잠시후 다시 시도하시기 바랍니다.');
  }
  if(!result){  // 로그인 실패
    throw new Error('아이디와 비밀번호를 확인하시기 바랍니다.');
  }
  return result;
};

// 회원 정보 조회
module.exports.getMember = async (userid) => {
	
};

// 회원 정보 수정
module.exports.updateMember = async (userid, params) => {
	
};

// 쿠폰 후기 등록
module.exports.insertEpilogue = async (userid, epilogue) => {
	
};