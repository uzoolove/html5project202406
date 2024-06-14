$(function(){
	setTabEvent();
	setGalleryEvent();
  setCloseEvent();
  setAddCartEvent();
});

// 상세보기 탭 클릭
function setTabEvent(){	
  $('.coupon_tab > section').on('click', function(){
    $(this).removeClass('tab_off').siblings().addClass('tab_off');
  });
}

// 갤러리 이미지 클릭
function setGalleryEvent(){
  const bigPhoto = $('.big_photo > img');
	$('.photo_list a').on('click', function(event){
    event.preventDefault(); // 브라우저의 기본 동작 취소(하이퍼링크 동작)
    bigPhoto.attr('src', $(this).attr('href'));
  });
}

// 상세보기 닫기 클릭
function setCloseEvent(){
	$('.btn_close_coupon_detail').on('click', function(){
    window.history.back();
  });
}

// 관심쿠폰 등록 이벤트
function setAddCartEvent(){
	$('.btn_add_cart').on('click', function(){
    const coupon = $(this).parent();
    addCart(coupon);
  });
}

// 관심 쿠폰 등록(로컬 스토리지에 저장)
function addCart(coupon){
	const couponId = coupon.data('couponid');
  const couponName = coupon.children('h1').text();
  const couponImg = coupon.children('.list_img').attr('src');
  
  // TODO 관심 쿠폰 목록을 localStorage에서 꺼낸다.
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  
  if(Object.keys(cart).length == 5){
    alert('관심 쿠폰은 최대 5개 등록 가능합니다.');
  }else if(cart[couponId]){
    alert(couponName + '\n이미 등록되어 있습니다.');
  }else{
    // TODO 관심 쿠폰을 localStorage에 저장한다.
    cart[couponId] = {
      name: couponName,
      image: couponImg,
      noti: 10
    };
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(couponName + '\n관심쿠폰으로 등록되었습니다.');
    common.cart.showCart();

    // TODO 알림메세지 사용 여부 체크
    Notification.requestPermission();
  }
}