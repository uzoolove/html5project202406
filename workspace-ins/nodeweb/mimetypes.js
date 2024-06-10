const path = require('node:path');  // 코어 모듈

// JSON 표기법(JavaScript Object Notation)
const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  // ......
};

// 확장자에 매칭되는 Mime Type 반환
function getMime(url){
  // /today.html => .html
  // /css/today.css => .css
  const extname = path.extname(url);
  return mime[extname];
}

// require()의 리턴값
module.exports = { getMime };