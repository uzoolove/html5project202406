/*
	1. 지도를 보여주고 현재 위치 찾기
		1.1 구글맵 로딩
		1.2 현재 위치 찾기
		1.3 지도를 현재 위치로 이동	
		1.4 현재 위치에 마커 표시
		1.5 현재 위치의 오차 표시
	2. 지도에 쿠폰 추가
		2.1 지도에 쿠폰 추가
		2.2 지도 범위 내의 쿠폰을 슬라이더에 보여준다.
		2.3 지도의 범위가 변경될 경우 지도안의 쿠폰을 슬라이더에 보여주도록 이벤트 추가
	3. 슬라이드 이벤트 추가
*/

// 1. 지도를 보여주고 현재 위치 찾기
let map;
function initMap(){
  $(() => {
    // 1.1 구글맵 로딩
    const mapContainer = document.querySelector('#location_map');
    let mapOptions = {
      mapId: 'DEMO_MAP_ID',
      center: { lat: 37.5241, lng: 127.0471 },
      zoom: 14
    };
    // 1.2 현재 위치 찾기
    map = new google.maps.Map(mapContainer, mapOptions);

    window.navigator.geolocation.getCurrentPosition(success, fail);
    
    function success(position){
      // 1.3 지도를 현재 위치로 이동
      let here = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(here);

      // 1.4 현재 위치에 마커 표시
      new google.maps.marker.AdvancedMarkerElement({
        map,
        position: here
      });
      
      // 1.5 현재 위치의 오차 표시
      new google.maps.Circle({
        map,
        center: here,
        radius: position.coords.accuracy,
        strokeColor: 'blue',
        strokeOpacity: 0.2,
        fillColor: 'blue',
        fillOpacity: 0.1
      });
    }

    function fail(err){
      console.error(err);
      /*
      const position = {
        coords: {
          latitude: 37.5017754,
          longitude: 127.0400846,
          accuracy: 200
        }
      };
      success(position);
      */
    }

    // 2. 지도에 쿠폰 추가
    addCouponToMap();
  });
}

let articleList;
let openWindow;
// 2. 지도에 쿠폰 추가
function addCouponToMap(){
	articleList = $('.coupon_list article');
  // 2.1 지도에 쿠폰 추가
  articleList.each(function() {
    const article = $(this);
    const couponName = article.find('h1').text();
    const position = {
      lat: article.data('lat'),
      lng: article.data('lng')
    };
    article.data('position', position);
    // 쿠폰 마커 생성 
    const mulpangMarker = document.createElement('img');
    mulpangMarker.src = '/css/svg/icon_map_coupon.svg';
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      title: couponName,
      content: mulpangMarker
    });
    // 지도 클릭 시 보여줄 정보창 생성
    const info = new google.maps.InfoWindow({
      position,
      content: article.html()
    });
    
    // 마커 클릭 이벤트 추가
    marker.addListener('click', () => {
      if(openWindow) openWindow.close();
      info.open(map);
      openWindow = info;
    });
	});

	// 2.2 지도 범위 내의 쿠폰을 슬라이더에 보여준다.
	function showSlider(){
		const bounds = map.getBounds();
    articleList.each(function(){
      const article = $(this);
      if(bounds.contains(article.data('position'))){
        article.show();
      }else{
        article.hide();
      }
    });
		// 첫번째 쿠폰으로 슬라이더 이동
    slide(0);
		
		// 현재 위치를 history에 기록
		
	}

	// 지도 로딩완료 이벤트
	google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
		showSlider();
		// 2.3 지도의 범위가 변경될 경우 지도안의 쿠폰을 슬라이더에 보여주도록 이벤트 추가
		map.addListener('zoom_changed', showSlider);
    map.addListener('dragend', showSlider);
		// 3. 슬라이드 이벤트 추가
		setSlideEvent();
	});
}
	
// 3. 슬라이드 이벤트 추가
function setSlideEvent(){
	const range = $('#location_coupon_control input[type=range]');
	const preBtn = $('#btn_pre_location_coupon');
	const nextBtn = $('#btn_next_location_coupon');
	
	// 슬라이더 값이 변경될 경우의 이벤트 추가(막대기를 드래그 해서 이동 시)
	range.on('change', function() {
		slide(parseInt(range.val()));
	});
	
	// 이전/이후 버튼의 클릭 이벤트 추가
	preBtn.on('click', function() {
		if(range.val() > 0){
			slide(parseInt(range.val())-1);
		}
	});
	nextBtn.on('click', function() {
		if(range.val() <  $('.coupon_list article:visible').length-1){
			slide(parseInt(range.val())+1);
		}
	});
}

// 지정한 순번의 쿠폰으로 슬라이더 이동
function slide(actNo){
	const visibleArticle = $('.coupon_list article:visible');
	visibleArticle.each(function(i) {
		const article = $(this);
		switch(i){
		case actNo-2:
			article.attr('class', 'location_slide_pre_02');
			break;
		case actNo-1:
			article.attr('class', 'location_slide_pre_01');
			break;
		case actNo:
			article.attr('class', 'location_slide_act');
			break;
		case actNo+1:
			article.attr('class', 'location_slide_next_01');
			break;
		case actNo+2:
			article.attr('class', 'location_slide_next_02');
			break;
		default:
			if(i < actNo){
				article.attr('class', 'location_slide_pre_hide');	
			}else{
				article.attr('class', 'location_slide_next_hide');
			}
			break;
		}
	});
	
	const size = visibleArticle.length;	
	$('#location_coupon_control input[type=range]').val(actNo).attr('max', size==0 ? 0 : size-1);
	$('#counter_now').text(size==0 ? 0 : actNo+1);
	$('#counter_all').text(size);
}








