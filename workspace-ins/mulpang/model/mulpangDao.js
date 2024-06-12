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
	// 1. 판매 시작일이 지난 쿠폰, 구매 가능 쿠폰(기본 검색조건)	
	// 2. 전체/구매가능/지난쿠폰
	// 3. 지역명	
	// 4. 검색어	

	// 정렬 옵션
	const orderBy = {};
	// 1. 사용자 지정 정렬 옵션	
	// 2. 판매 시작일 내림차순(최근 쿠폰)	
	// 3. 판매 종료일 오름차순(종료 임박 쿠폰)

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
  const count = 5;
  const result = await db.coupon.find(query).project(fields).limit(count).toArray();
  console.log(`${ result.length }건 조회.`);
  return result;
};

// 쿠폰 상세 조회
module.exports.couponDetail = async (_id) => {
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
  }catch(err){
    console.error(err);
    throw new Error('쿠폰 구매에 실패했습니다. 잠시후 다시 시도하시기 바랍니다.');
  }
  
};	
	
// 추천 쿠폰 조회
const topCoupon = module.exports.topCoupon = async (condition) => {
	
};

// 지정한 쿠폰 아이디 목록을 받아서 남은 수량을 넘겨준다.
module.exports.couponQuantity = async (coupons) => {

};

// 임시로 저장한 프로필 이미지를 회원 이미지로 변경한다.
function saveImage(tmpFileName){
  const org = path.join(__dirname, '..', 'public', 'tmp', tmpFileName);
  const dest = path.join(__dirname, '..', 'public', 'image', 'member', tmpFileName);
	// TODO 임시 이미지를 member 폴더로 이동시킨다.
	
}

// 회원 가입
module.exports.registMember = async (params) => {
	
};

// 로그인 처리
module.exports.login = async (params) => {
	// TODO 지정한 아이디와 비밀번호로 회원 정보를 조회한다.
	
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