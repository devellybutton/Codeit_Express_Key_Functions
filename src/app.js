import express from 'express';

const app = express();

function error(req, res, next) {
  // throw new Error('에러 발생!')
  next(new Error('에러 발생!'))
  next();
}

function ok(req, res, next) {
  res.json({ message: 'OK!' });
}

app.get('/error', error, ok);

app.use((err, req, res, next) => {
  console.log(err);
  res.json({ message: '에러 핸들러!' });
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});