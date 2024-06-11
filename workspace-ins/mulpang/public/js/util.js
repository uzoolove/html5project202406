const Util = {
	// 지정한 URL의 스크립트를 읽어온다.
	require: (url) => {
		if(!url.indexOf('http')==0 && !url.indexOf('/')==0){	// 내부 URL
			document.write('<script src="/js/' + url + '"></script>');
		}else{
			// defer 스크립트를 비동기로 다운받고 페이지 로딩이 완료된 후 순차적으로 실행한다.
			document.write('<script defer src="' + url + '"></script>');
		}		
	},

	// 지정한 날짜를 지정한 구분자를 기준으로 변환한 문자열을 반환한다.
	dateToString: (delimiter, date) => {
		if(date){
			if(typeof date == 'string'){
				date = new Date(date);
			}
		}else{
			date = new Date();
		}
		const year = date.getFullYear();
		let month = date.getMonth()+1;
		if(month < 10) month = '0' + month;
		let day = date.getDate();
		if(day < 10) day = '0' + day;
		const result = year + delimiter + month + delimiter + day;
		return result;
	},
	
	// 지정한 날짜를 지정한 구분자를 기준으로 변환한 문자열을 반환한다.
	timeToString: (delimiter, date) => {
		if(date){
			if(typeof date == 'string'){
				date = new Date(date);
			}
		}else{
			date = new Date();
		}
		let hour = date.getHours();
		if(hour < 10) hour = '0' + hour;
		let minute = date.getMinutes();
		if(minute < 10) minute = '0' + minute;
		let second = date.getSeconds();
		if(second < 10) second = '0' + second;
		const result = Util.dateToString(delimiter, date) + ' ' + hour + ':' + minute + ':' + second;
		return result;
	}
};













