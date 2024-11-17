import express from 'express';
import productRouter from './routes/product.js'
import userRouter from './routes/user.js'
import always from './middlewares/always.js';
import multer from 'multer';

const app = express();

app.use(always);
app.use('/products', productRouter);
app.use('/users', userRouter);

const upload = multer({ dest: 'uploads/' });

// name 속성과 single 안에 있는 아규먼트가 일치해야됨.
app.post('/files', upload.single('attachment'), (req, res) => {
	console.log(req.file);
	res.json({ message: "파일 업로드 완료!" })
})



app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
