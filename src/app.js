import express from 'express';

const app = express();

function meeting(req, res, next) {
  console.log('오!');
  next();
}

function waving(req, res, next) {
  console.log('손을 흔든다!');
  next();
}

function greeting(req, res, next) {
  console.log('안녕!');
  res.json({ message: '안녕하십니까!' });
};

app.get('/', meeting, waving, greeting);

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
