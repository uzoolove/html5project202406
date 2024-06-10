const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');  // 코어 모듈
// const mime = require('./mimetypes'); // 사용자 정의 모듈
const mime = require('mime'); // 확장 모듈

// const home = 'c:\\html5project202406\\workspace-ins\\nodeweb\\public';
// const home = path.join('c', 'html5project202406', 'workspace-ins', 'nodeweb', 'public');
const home = path.join(__dirname, 'public', 'design');


const server = http.createServer(function(req, res){
  console.log(req.method, req.url, req.httpVersion);
  console.log(req.headers);

  const filename = req.url;
  const mimeType = mime.getType(filename);
  // const mimeType = mime.getMime(filename);

  console.log('1. 파일 읽기 시작.');

  // 비동기 방식
  fs.readFile(path.join(home, filename), function(err, data){
    console.log('3. 파일 읽기 완료.');
    if(err){
      console.error(err);
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>${req.url} 파일을 찾을 수 없습니다!!!  </h1>`);
    }else{
      res.writeHead(200, { 'Content-Type': `${mimeType}; charset=utf-8` });
      // res.writeHead(200, { 'Content-Type': mimeType + '; charset=utf-8' });
      res.end(data);
    }
    console.log('4. 응답 완료.');
  });

  console.log('2. readFile() 호출 완료.');

  // 동기 방식
  // try{
  //   const data = fs.readFileSync(path.join(home, filename));
  //   res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  //   res.end(data);
  // }catch(err){
  //   console.error(err);
  //   res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  //   res.end(`<h1>${req.url} 파일을 찾을 수 없습니다.</h1>`);
  // }



}
);

server.listen(1234, function(){
  console.log('서버 구동 완료. http://localhost:1234');
});