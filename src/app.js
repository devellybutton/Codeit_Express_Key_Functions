import express from 'express';
import productRouter from './routes/product.js'
import userRouter from './routes/user.js'
import always from './middlewares/always.js';
import multer from 'multer';

const app = express();

app.use(express.static('uploads'));

app.use(always);

app.use('/products', productRouter);
app.use('/users', userRouter);

const upload = multer({ dest: 'uploads/' });

app.post('/files', upload.single('attachment'), (req, res) => {
	const path = `/files/${req.file.filename}`
	res.json({ path })
})

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
