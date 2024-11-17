import express from 'express';

const app = express();

function meeting(req, res, next) {
  console.log('오!');
  next();
}

function greeting(req, res, next) {
  console.log('안녕, GET!')
  res.json({ message: '안녕하십니까!' });
};

app.use('/hello', (req, res, next) => {
  console.log('안녕, use!');
  next();
})

app.all('/hello/all', (req, res, next) => {
  console.log('안녕, all!');
  next();
})

app.get('/hello/all', (req, res, next) => {
  console.log('안녕, GET!')
  res.json({ message: '안녕하십니까!' });
});

app.post('/hello/all', (req, res, next) => {
  console.log('안녕, POST!')
  res.json({ message: '안녕하십니까!' });
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
