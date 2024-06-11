$(function(){
	setCancelEvent();
	setBuyEvent();
	setPriceEvent();	
});

// 취소 버튼 클릭
function setCancelEvent(){
	$('form button[type=reset]').on('click', function(){
    window.history.back();
  });
}

// 구매 버튼 클릭
function setBuyEvent(){
	$('.detail form').on('submit', async function(event){
    event.preventDefault();
    const body = $(this).serialize();
    console.log(body);
    const result = await $.post('/purchase', body);
    if(result.errors){
      alert(result.errors.message);
    }else{
      alert('쿠폰 구매가 완료되었습니다.');
      location.href = '/';
    }
  });
}

// 구매수량 수정시 결제가격 계산
function setPriceEvent(){
	
}