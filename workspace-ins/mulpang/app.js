var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const nocache = require('nocache');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 미들웨어(app.use()나 router에 등록하는 함수)
// 1. (err), req, res, next를 매개변수로 정의한다.
// 2. 처리하고 싶은 작업을 수행한다.
// 3. 둘중 하나의 작업으로 종료한다.
//    1) 다음 미들웨어를 호출한다(next())
//    2) 클라이언트에 응답메세지를 전송한다.(res.render(), res.json(), res.end(), res.redirect() ...)
// app.use(function(req, res, next){
//   console.log('첫번째 미들웨어');
//   console.log('http 모듈에서 제공');
//   console.log('req.method', req.method);
//   console.log('req.url', req.url);
//   console.log('req.headers', req.headers);
//   console.log('express에서 기본 제공');
//   console.log('req.query', req.query);
//   console.log('미들웨어에서 제공');
//   console.log('req.body', req.body);
//   console.log('req.cookies', req.cookies);
//   console.log('req.session', req.session);
//   next();
// });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(logger('dev'));

// "/couponQuantity"로 시작하지 않는 url에 세션 사용
app.use(/^((?!\/couponQuantity).)*$/, session({
  cookie: {maxAge: 1000*60*30},// 30분
  secret: 'some seed text',
  rolling: true,  // 매 요청마다 세션 시간 초기화
  resave: false,  // 세션이 수정되지 않으면 서버에 다시 저장하지 않음
  saveUninitialized: false  // 세션에 아무 값도 지정되지 않으면 클라이언트에 전송 안함
}), function(req, res, next){
  // ejs 렌더링에 사용할 로그인 정보 지정
  res.locals.user = req.session.user;
  next();
});

app.use(nocache());


// app.use(function(req, res, next){
//   console.log('라우터 직전 미들웨어');
//   console.log('http 모듈에서 제공');
//   console.log('req.method', req.method);
//   console.log('req.url', req.url);
//   console.log('req.headers', req.headers);
//   console.log('express에서 기본 제공');
//   console.log('req.query', req.query);
//   console.log('미들웨어에서 제공');
//   console.log('req.body', req.body);
//   console.log('req.cookies', req.cookies);
//   console.log('req.session', req.session);
//   next();
// });

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404, `${req.url} Not Found!!!`));
});

app.use(function(err, req, res, next){
  if(req.xhr){
    res.json({ errors: err });
  }else{
    next(err);
  }
});

// error handler
app.use(function(err, req, res, next) {
  console.error(err.stack);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
