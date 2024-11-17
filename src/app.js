import express from 'express';

const app = express();

function one(req, res, next) {
  console.log(req.query);
  return next();
}

function two(req, res, next) {
  console.log(req.query);
  return next();
}

function three(req, res, next) {
  console.log(req.query);
  return res.json({ message: '안녕, 코드잇 (;' });
}

app.get('/hello', one, two, three);

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
