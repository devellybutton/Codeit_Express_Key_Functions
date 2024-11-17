import express from 'express';
import productRouter from './routes/product.js'
import userRouter from './routes/user.js'
import always from './middlewares/always.js';

const app = express();

app.use(always);

app.use('/products', productRouter);
app.use('/users', userRouter);

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
