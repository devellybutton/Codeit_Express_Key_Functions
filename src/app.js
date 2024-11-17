import express from 'express';

const app = express();

// app.post('/products', (req, res) => {
//   console.log(req.body); // undefined
//   res.json({ message: 'Product 추가하기' });
// });

// application/json
app.use(express.json())
app.post('/products', (req, res) => {
  console.log(req.body); // { name: '상품 1', price: 100 }
  res.json({ message: 'Product 추가하기' });
});

// app.post('/users', (req, res) => {
//   console.log(req.body); // {}
//   res.json({ message: 'User 추가하기' });
// })

// ***** application/x-ww-form-urlencoded 
// extended: true는 복잡한 키, 값을 읽어올 수 있는 옵션
app.use(express.urlencoded({ extended: true }));
app.post('/users', (req, res) => {
  console.log(req.body); // {}
  res.json({ message: 'User 추가하기' });
})

// ***** 해당 폴더 안에 있는 파일에 접근 가능
app.use(express.static('public'));
// GET http://localhost:3000/index.html

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});