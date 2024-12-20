# Express 핵심 기능

- 미들웨어
- 라우터
- 파일 업로드

----

## 프로젝트 시작

- 서버 실행
```
npm run dev
```

- app.http 파일에서 'Send Request' 클릭
→ 서버로 요청이 전송됨.

-----

## Ⅰ. 미들웨어

### 1. 미들웨어란
#### 1) 정의
- 요청(request)와 응답(response) 사이에서 동작하는 함수
- 클라이언트의 요청을 처리하고 응답을 만드는 역할

#### 2) 기본 구조
```
app.get('/', (req, res) => {
  res.json({ message: '안녕, 코드잇 (;' });
});
```
- 첫 번째 인자 : path
- 두 번째 인자 : 콜백함수

### 2. 미들웨어의 구조

#### 1) 기본 미들웨어 (2개 파라미터)
```
function greeting(req, res) {
  // req: Request 객체
  // - url: 요청 URL
  // - method: HTTP 메소드(GET, POST 등)
  // - params: URL 파라미터
  // - query: 쿼리스트링
  // - body: 요청 본문
  
  // res: Response 객체
  // - json(): JSON 응답
  // - send(): 일반 응답
  console.log(req);
  res.json({ message: '안녕하십니까' });
};
```

#### 출력되는 request 객체
![ezgif-6-64c5097ec4](https://github.com/user-attachments/assets/39e26a7c-bf1f-4379-9c26-680a7e62ca63)

#### 2) next() 포함 미들웨어 (3개 파라미터)

```
function middleware(req, res, next) {
  // next(): 다음 미들웨어로 이동
  next();
  res.json({ message: '안녕하세요' });
}
```

#### 3) 에러 핸들링 미들웨어 (4개 파라미터)
```
function errorHandler(err, req, res, next) {
  // err: 에러 객체
  // 에러 발생 시에만 실행됨
  // throw 또는 next(err)로 호출
  res.status(500).json({ 
    error: err.message 
  });
}
```

#### 주요 특징
- 하나의 라우터에 여러 미들웨어를 체이닝할 수 있음
- req 객체의 params, query, body 등이 자주 사용되는 속성만 익히기
- 모든 속성을 외울 필요 없이 필요한 것만 사용하면 됨
- <b>next()</b>를 호출해야 다음 미들웨어로 제어가 넘어감
- 에러 핸들러는 <b>에러 상황에서만</b> 실행됨

#### 사용 예시
```
app.get('/users', 
  validateUser,
  checkPermission,
  (req, res) => {
    res.json({ users: [] });
  }
);

// 에러 핸들러는 마지막에 등록
app.user((err, req, res, next) => {
  console.error(err);
  res.status(500).send('에러가 발생했습니다.);
})
```

### 3. 미들웨어 사용법

#### 1) 미들웨어의 실행 순서

- 콜백함수의 나열 순서대로 실행됨.
    ```
    // 첫번째 미들웨어
    function meeting(req, res, next) {
      console.log('1️⃣ meeting 실행');
      next(); // 다음 미들웨어로 이동
    }

    // 두번째 미들웨어
    function greeting(req, res) {
      console.log('2️⃣ greeting 실행');
      res.send('안녕하세요!');
    }

    // meeting -> greeting 순서로 실행됨
    app.get('/hello', meeting, greeting);
    ```
    ![image](https://github.com/user-attachments/assets/1495a776-396c-4619-b11b-d9a7e6a8de54)

- next()의 역할
    ```
    // next()가 없으면 여기서 미들웨어 체인이 멈춤
    function meeting(req, res) {
      console.log('meeting만 실행됨');
      res.send('여기서 종료');
      // greeting은 실행되지 않음
    }

    // next()를 호출해야 다음으로 진행
    function meeting(req, res, next) {
      console.log('meeting 실행');
      next(); // greeting으로 이동
    }
    ```
- 여러 미들웨어 체이닝
    ```
      app.get('/hello',
      // 1번째 실행
      (req, res, next) => {
        console.log('로깅');
        next();
      },
      // 2번째 실행
      (req, res, next) => {
        console.log('인증 체크');
        next();
      },
      // 3번째 실행
      (req, res) => {
        res.send('모든 미들웨어 통과!');
      }
    );
    ```
- 주의 사항
    ```
    // ❌ 잘못된 사용: next() 후에 응답을 보냄
    app.get('/hello', 
      (req, res, next) => {
        next();
        res.send('첫번째 응답'); // 이미 다음으로 넘어감
      },
      (req, res) => {
        res.send('두번째 응답');
      }
    );

    // ✅ 올바른 사용: next()만 호출
    app.get('/hello',
      (req, res, next) => {
        console.log('체크');
        next();
      },
      (req, res) => {
        res.send('응답');
      }
    );
    ```
- 핵심 포인트
  - 첫 번째 콜백은 필수, 나머지는 선택사항
  - 콜백 나열 순서가 실행 순서를 결정
  - next()를 호출해야 다음 미들웨어로 진행
  - next() 후에는 응답(res.send/json 등)을 보내지 않기
  - 마지막 미들웨어에서 최종 응답 처리

#### 2) app.all()과 app.use()

- <b>app.all()</b> : 모든 HTTP 메소드 처리
```
// ❌ 비효율적인 방법
app.get('/hello', greeting);
app.post('/hello', greeting);
app.put('/hello', greeting);
app.delete('/hello', greeting);

// ✅ app.all() 사용
app.all('/hello', greeting);
```

- 실행 순서 예시
```
// 모든 HTTP 메소드에 실행
app.all('/hello', (req, res, next) => {
  console.log('1️⃣ all 미들웨어 실행');
  next();
});

// GET 요청일 때만 실행
app.get('/hello', (req, res) => {
  console.log('2️⃣ GET 미들웨어 실행');
  res.json({ message: '안녕하세요!' });
});

// POST 요청일 때만 실행
app.post('/hello', (req, res) => {
  console.log('2️⃣ POST 미들웨어 실행');
  res.json({ message: '안녕하세요!' });
});
```

- <b>app.use()</b> : 경로 패턴 매칭
```
// 1. 특정 경로로 시작하는 모든 요청에 적용
app.use('/hello', (req, res, next) => {
  console.log('hello로 시작하는 모든 경로에서 실행');
  next();
});

// /hello
// /hello/world
// /hello/users/123
// 위 모든 경로에서 미들웨어가 실행됨

// 2. 모든 요청에 적용 (경로 생략)
app.use((req, res, next) => {
  console.log('모든 요청에서 실행되는 미들웨어');
  next();
});
```

- 사용 예시 
```
// 1. 로깅 미들웨어 - 모든 요청
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 2. 인증 미들웨어 - /admin 경로
app.use('/admin', (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).send('접근 권한이 없습니다');
  }
  next();
});

// 3. 특정 라우트 처리
app.get('/hello', (req, res) => {
  res.send('안녕하세요!');
});

app.get('/hello/world', (req, res) => {
  res.send('Hello World!');
});
```

- 핵심 차이점
  - <b>app.all()</b>
    - 정확한 경로 매칭
    - 모든 HTTP 메소드 처리
    - 주로 특정 엔드포인트에 공통 로직 적용할 때 사용
  - <b>app.use()</b>
    - 경로 패턴 매칭 (시작 경로만 일치하면 됨)
    - 모든 HTTP 메소드 처리
    - 주로 전역 미들웨어나 특정 경로 그룹에 공통 로직 적용할 때 사용


### 4. 미들웨어로 req, res 다루기

- 하나의 리퀘스트가 여러 미들웨어를 지나가도록 되어 있다면 모든 미들웨어에서 <b>같은</b> 리퀘스트와 리스폰스 객체를 사용하게 됨.
- 하나의 라우터에서 여러 미들웨어를 사용하는 코드가 있으면 <b>동일한 내용</b>이 출력됨.

```
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
```
![image](https://github.com/user-attachments/assets/2c23d1c0-7e71-499d-90ea-53fe9f908cfa)

- 미들웨어에서 미들웨어로 값을 전달해야하는 상황에서 사용할 수 있음.
  - 사용 예시 : 사용자 정보에 접근할 수 있도록 하는 것
  ```
  function authentication(req, res, next) {
    req.user = 'Codeit';
    next();
  }

  app.get('/me, authentication, (req, res, next) => {
    console.log(req.user);
    res.json({ user: req.user }')
  }'
  ```

- 미들웨어 req, res에 추가하는 기준
  - 추가하는 값의 성질에 따라 다르게 추가할 수 있음.
  - req에 값 추가하기:
    - 요청에 관련된 데이터를 저장할 때 사용
    - 예시: 사용자 정보, 요청 본문, 쿼리 파라미터 등
    ```
    function authentication(req, res, next) {
      req.user = 'Codeit';  // 사용자 정보를 req에 추가
      next();  // 다음 미들웨어나 라우트로 넘어가기
    }
    ```

  - res에 값 추가하기:
    - 응답에 관련된 데이터를 저장할 때 사용
    - 예시: 응답 데이터, 상태 코드, 헤더 등
    ```
    app.get('/me', authentication, (req, res) => {
      console.log(req.user);  // req에서 사용자 정보 접근
      res.json({ user: req.user });  // 사용자 정보를 응답으로 보내기
    });
    ```

  - 표준 규칙:
    - req: 요청에 관련된 정보 <i>(예: 사용자 정보, 쿼리, 본문)</i>
    - res: 응답에 관련된 정보 <i>(예: 상태, 헤더, 응답 데이터)</i>

### 5. 에러 처리하기

#### 1) 예외사항
- 의도한 대로 동작하지 않는 것, 오류
- 서버가 멈추는 상황을 방지하기 위해서는 오류가 발생했을 때, 기존 동작을 대신해서 수행하는 별도의 동작을 마련해야 함. <br>
→ 이때 대신해서 수행되는 동작이 에러 핸들러임

#### 2) Express에서 기본 오류 처리하는 방법
  - throw 키워드로 에러 발생시키기
  - next로 아큐먼트 넘겨줬을 떄

#### 3) 에러 핸들러를 정의하지 않아도 가능한 이유
- express는 기본적으로 에러 핸들러가 내장되어 있음.
- 내장 에러 핸들러는 기본적으로 http 에러 핸들러를 response 하다보니 response body에 html이 담겨져 있음.
- 만약 rexpress로 웹 API를 만들고 있다면 res.json으로 전달하면 됨.

#### 4) 에러 핸들러는 가장 나중에 작성해야함.
- 앞쪽의 다른 미들웨어 에러를 처리해야하므로 뒤쪽에 위치

#### 5) 예시
- 내장 에러 핸들러
  ```
  function error(req, res, next) {
    throw new Error('에러 발생!')
    next();
  }

  function ok(req, res, next) {
    res.json({ message: 'OK!' });
  }

  app.get('/error', error, ok);
  ```
  ![image](https://github.com/user-attachments/assets/a6bf6732-db63-470e-ae0e-ca385a8f5c3e)

- res.json으로 에러를 반환하도록 함
  - use 메소드를 사용해서 에러가 발생하면 이 에러핸들러가 실행하도록 되어 있음.

  ```
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
  ```
  ```
  Error: 에러 발생!
      at error (file:///C:/Users/airyt/Codeit_Express_Key_Functions/src/app.js:7:8)
      at Layer.handle [as handle_request] (C:\Users\airyt\Codeit_Express_Key_Functions\node_modules\express\lib\router\layer.js:95:5)     
      at next (C:\Users\airyt\Codeit_Express_Key_Functions\node_modules\express\lib\router\route.js:149:13)
      at Route.dispatch (C:\Users\airyt\Codeit_Express_Key_Functions\node_modules\express\lib\router\route.js:119:3)
      at Layer.handle [as handle_request] (C:\Users\airyt\Codeit_Express_Key_Functions\node_modules\express\lib\router\layer.js:95:5)     
      at C:\Users\airyt\Codeit_Express_Key_Functions\node_modules\express\lib\router\index.js:284:15
      at Function.process_params (C:\Users\airyt\Codeit_Express_Key_Functions\node_modules\express\lib\router\index.js:346:12)
      at next (C:\Users\airyt\Codeit_Express_Key_Functions\node_modules\express\lib\router\index.js:280:10)
      at expressInit (C:\Users\airyt\Codeit_Express_Key_Functions\node_modules\express\lib\middleware\init.js:40:5)
      at Layer.handle [as handle_request] (C:\Users\airyt\Codeit_Express_Key_Functions\node_modules\express\lib\router\layer.js:95:5) 
  ```
  ![image](https://github.com/user-attachments/assets/b98fcd2e-fc00-4bbb-9b34-966e3392f080)

### 6. 내장 미들웨어

- <b>내장 미들웨어 특징</b>
  - 모든 경로의 요청에 공통으로 적용
  - 주로 app.use()와 함께 사용
  - 요청 데이터 파싱, 정적 파일 제공 등 기본적인 기능 제공

- <b>express.json()</b>
  - 클라이언트에서 전송한 JSON 형식의 데이터를 req.body에 자동으로 파싱하여 객체로 변환

  ```
  // JSON 요청 처리 미들웨어 등록
  app.use(express.json());

  // POST 요청 처리
  app.post('/users', (req, res) => {
    console.log(req.body); // { name: "Codeit", age: 25 }
    res.json({ success: true });
  });
  ```
  ```
  // 클라이언트 요청
  fetch('/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Codeit',
      age: 25
    })
  });
  ```

- <b>express.urlEncoded()</b>
  - HTML 폼으로 전송된 데이터를 application/x-www-form-urlencoded 형식으로 파싱하여 req.body에 객체로 저장
  ```
  // URL 인코딩된 데이터 처리 미들웨어 등록
  app.use(express.urlencoded({ extended: true }));

  // HTML 폼 데이터 처리
  app.post('/login', (req, res) => {
    console.log(req.body); // { username: "codeit", password: "1234" }
    res.send('로그인 성공');
  });
  ```

  ```
  <!-- HTML 폼 -->
  <form action="/login" method="POST">
    <input name="username" type="text">
    <input name="password" type="password">
    <button type="submit">로그인</button>
  </form>
  ```

- <b>express.static()</b>
  - 서버에서 지정된 디렉토리의 정적 파일을 클라이언트에 제공하기 위해 사용됨.

  ```
  // 정적 파일 제공 미들웨어 등록
  app.use(express.static('public'));

  // public 폴더 구조:
  // public/
  //   ├── images/
  //   │   └── logo.png
  //   ├── css/
  //   │   └── style.css
  //   └── index.html
  ```
  ```
  <!-- 브라우저에서 직접 접근 가능 -->
  <img src="/images/logo.png">
  <link rel="stylesheet" href="/css/style.css">

  <!-- index.html은 루트 경로(/)로 접근 가능 -->
  // localhost:3000/ -> index.html
  ```
  ```
  // 여러 폴더를 정적 파일 경로로 지정
  app.use(express.static('public'));
  app.use(express.static('files'));

  // 가상 경로 설정
  app.use('/static', express.static('public'));
  // /static/images/logo.png로 접근
  ```

  ![image](https://github.com/user-attachments/assets/2f092f03-e937-45e0-8769-32736a779b41)


### 7. 서드파티 미들웨어

- <b>cookie-parser</b>: 클라이언트가 보낸 쿠키를 자동으로 파싱하여 req.cookies 객체로 제공하는 미들웨어 (key, value 형태로 만들어줌)
```
import express from 'express';
import multer from 'multer';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/profile', upload.single('avatar'), (req, res) => {
  console.log(req.file); // 업로드된 파일 정보
  res.json({ message: '파일 업로드 완료!' });
});

app.listen(3000, () => console.log('Server is listening on port 3000'));
```

- <b>morgan</b>: 서버로 들어온 리퀘스트에 대한 로그를 자동으로 기록해주는 미들웨어
```
import express from 'express';
import morgan from 'morgan';

const app = express();
app.use(morgan('tiny')); // 간단한 로그 형식

app.get('/hello', (req, res) => {
  res.json({ message: '안녕!' });
});

app.listen(3000, () => console.log('Server is listening on port 3000'));
```
- <b>cors</b>: 다른 도메인에서 리소스를 접근할 수 있도록 허용하는 CORS 관련 설정을 쉽게 해주는 미들웨어
```
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors()); // 모든 도메인에서 접근 허용

app.get('/hello', (req, res) => {
  res.json({ message: '안녕!' });
});

app.listen(3000, () => console.log('Server is listening on port 3000'));
```

- <b>multer</b>: 파일 업로드를 처리하는 미들웨어로, multipart/form-data 형식의 데이터를 쉽게 다룰 수 있게 해줌.
```
import express from 'express';
import multer from 'multer';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/profile', upload.single('avatar'), (req, res) => {
  console.log(req.file); // 업로드된 파일 정보
  res.json({ message: '파일 업로드 완료!' });
});

app.listen(3000, () => console.log('Server is listening on port 3000'));
```
-----

## Ⅱ. 라우터

### 1. 라우트 중복 제거하기

- <b>app.route()</b> 메소드를 사용하여 중복되는 경로를 하나로 묶을 수 있음.

  - 중복 제거 전
  ```
  import express from 'express';

  const app = express();

  app.get('/products', (req, res) => {
    res.json({ message: 'Product 목록 보기' });
  });

  app.post('/products', (req, res) => {
    res.json({ message: 'Product 추가하기' });
  });

  app.patch('/products/:id', (req, res) => {
    res.json({ message: 'Product 수정하기' });
  });

  app.delete('/products/:id', (req, res) => {
    res.json({ message: 'Product 삭제하기' });
  });

  app.listen(3000, () => {
    console.log('Server is listening on port 3000');
  });
  ```

  - 중복 제거 후
  ```
  import express from 'express';

  const app = express();

  // /products 경로에 대해 여러 HTTP 메서드 처리
  app.route('/products')
    .get((req, res) => {
      res.json({ message: 'Product 목록 보기' });
    })
    .post((req, res) => {
      res.json({ message: 'Product 추가하기' });
    });

  // /products/:id 경로에 대해 여러 HTTP 메서드 처리
  app.route('/products/:id')
    .patch((req, res) => {
      res.json({ message: 'Product 수정하기' });
    })
    .delete((req, res) => {
      res.json({ message: 'Product 삭제하기' });
    });

  app.listen(3000, () => {
    console.log('Server is listening on port 3000');
  });
  ```

### 2. 라우터 만들기

- <b>라우터의 모듈화</b>
  - 관련 있는 라우트들을 하나의 파일로 모듈화
  - 코드 구조가 깔끔해지고 유지보수가 쉬워짐
  - /products나 /users와 같은 URL 그룹별로 라우트 관리 가능
  ```
  // routes/products.js
  const express = require('express');
  const router = express.Router();

  // 제품 관련 라우트들을 하나의 모듈로 관리
  router.get('/', (req, res) => {
    res.json({ products: [] });
  });

  router.get('/:id', (req, res) => {
    res.json({ product: { id: req.params.id } });
  });

  module.exports = router;

  // routes/users.js
  const express = require('express');
  const router = express.Router();

  // 사용자 관련 라우트들을 하나의 모듈로 관리
  router.get('/', (req, res) => {
    res.json({ users: [] });
  });

  router.post('/', (req, res) => {
    res.json({ message: '사용자 생성됨' });
  });

  module.exports = router;

  // app.js (메인 파일)
  const express = require('express');
  const app = express();

  // 라우터 모듈 불러오기
  const productRouter = require('./routes/products');
  const userRouter = require('./routes/users');

  // 라우터 연결
  app.use('/products', productRouter);  // /products 경로로 시작하는 요청
  app.use('/users', userRouter);        // /users 경로로 시작하는 요청

  app.listen(3000);
  ```

### 3. 라우터 레벨 미들웨어

- <b>라우터 레벨 미들웨어</b>
  - Express에서 특정 라우터에만 적용되는 미들웨어
  - 이를 통해, 라우터마다 다른 미들웨어를 실행하거나, 공통 미들웨어를 라우터 단위로 분리하여 관리할 수 있음.
  - <b>router.use()</b>로 특정 라우터에만 적용되는 미들웨어를 설정함.

  - 예시:
    - productRouter.use()로 /products 경로에 대한 모든 요청에 공통 미들웨어 실행.
    - app.use('/products', productRouter)로 /products 경로에 productRouter 미들웨어 적용.

    ```
    import express from 'express';
    const app = express();

    // Product Router
    const productRouter = express.Router();

    // 공통 미들웨어
    productRouter.use((req, res, next) => {
      console.log('Product Router에서 항상 실행!');
      next();
    });

    // 라우트 정의
    productRouter.route('/')
      .get((req, res) => res.json({ message: 'Product 목록 보기' }))
      .post((req, res) => res.json({ message: 'Product 추가하기' }));

    productRouter.route('/:id')
      .patch((req, res) => res.json({ message: 'Product 수정하기' }))
      .delete((req, res) => res.json({ message: 'Product 삭제하기' }));

    // 미들웨어 적용
    app.use('/products', productRouter);

    app.listen(3000, () => console.log('Server running on port 3000'));
    ```
    => product에서 시작하는 경로에서 미들웨어의 콘솔이 출력됨


### 4. Express 프로젝트 구조와 모듈화

- <b>프로젝트 구조</b>
  ```
  src/
  ├── middlewares/
  │   ├── always.js       # 항상 실행되는 공통 미들웨어
  │   └── otherMiddleware.js  # 다른 미들웨어 예시
  ├── routes/
  │   ├── product.js      # 상품 관련 라우터
  │   └── user.js         # 사용자 관련 라우터
  └── app.js              # Express 앱 설정 및 라우터 연결
  ```

-----

## Ⅲ. 파일 업로드

### 1. 파일과 multipart/form-data

#### Content-Type이란?
- HTTP 요청/응답의 본문(body)이 어떤 형식인지 명시하는 헤더
- 서버와 클라이언트가 데이터를 올바르게 해석하기 위해 사용됩니다.
- 주요 Content-Type 종류
  - `application/json` : JSON 형식의 데이터 전송
  ```
  app.use(express.json());  // JSON 파싱 미들웨어
  ```
  ```
  // 클라이언트 요청
  fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'  // JSON 형식임을 명시
    },
    body: JSON.stringify({ name: 'Codeit' })
  });
  ```
  - `application/x-www-form-urlencoded` : HTML 폼의 기본 전송 형식
  ```
  app.use(express.urlencoded({ extended: true }));  // 폼 데이터 파싱
  ```
  ```
  <form method="POST">
    <input name="username">  
    // username=codeit 형식으로 전송됨
  </form>
  ```

#### 파일 전송 방식

- <b>Base64 인코딩 방식 (텍스트 변환)</b>
  - 장점: 단순함, 텍스트로 전송 가능
  - 단점: 파일 크기가 약 30% 증가, 비효율적
  ```
  {
    "fileName": "photo.jpg",
    "fileData": "iVBORw0KGgoAAAANSU..." // 파일을 텍스트로 변환
  }
  ```

- <b>Multipart 방식 (권장)</b>
  - 장점: 효율적, 파일 원본 그대로 전송
  - 특징: 폼 데이터와 파일을 함께 전송 가능
  ```
  / 파일 업로드 폼
  <form method="POST" enctype="multipart/form-data">
    <input type="file" name="photo">
    <input type="text" name="title">
  </form>
  ```
  ```
  // 서버 처리 (multer 사용)
  const multer = require('multer');
  const upload = multer({ dest: 'uploads/' });

  app.post('/upload', 
    upload.single('photo'),  // 파일 처리 미들웨어
    (req, res) => {
      // req.file: 업로드된 파일 정보
      // req.body: 다른 폼 데이터
    }
  );
  ```

- <b>요약</b>
  - Content-Type은 데이터 형식을 명시하는 중요한 헤더
  - 파일 전송은 multipart/form-data 사용이 권장됨
  - multer 같은 미들웨어로 파일 업로드 처리 가능
  - 브라우저는 multipart/form-data 설정 시 자동으로 적절한 요청 형식 구성

### 2. multer 미들웨어 사용하기

#### Multer
  - multipart/form-data 형식의 요청 본문을 처리하는 미들웨어
  - <b>upload.single('attachment')</b>: 파일을 한 개만 업로드 받을 때 사용. 여기서 'attachment'는 HTML 폼에서 파일 필드의 이름
  - <b>req.file</b>: 업로드된 파일에 대한 정보가 담김.

    ![image](https://github.com/user-attachments/assets/b55e9755-e84e-47fc-a055-861d715378f5)

    ```
    import express from 'express';
    import multer from 'multer';

    const app = express();
    const upload = multer({ dest: 'uploads/' });

    app.post('/files', upload.single('attachment'), (req, res) => {
      console.log(req.file);  // 업로드된 파일 정보
      res.json({ message: "파일 업로드 완료!" });
    });

    app.listen(3000, () => {
      console.log('Server is listening on port 3000');
    });
    ```

- 파일 이름은 hello.txt로 만들었는데 랜덤한 문자열로 생성됨.
  - 이유 : 파일명이 같을 수 있어서 서버에서는 파일명을 랜덤하게 만드는 방식을 사용함.

  ![image](https://github.com/user-attachments/assets/b49c61e6-dc4f-451a-a4db-fc277d0bcba5)

### 3. 서버의 파일 제공하기

#### 1) Static 파일 제공 설정
  - express.static() 미들웨어는 서버에서 정적 파일을 제공하는 데 사용됨.
  - 파일이 업로드된 폴더를 정적 파일로 설정하여 사용자가 파일을 직접 접근할 수 있도록 할 수 있음.
  ```
  import express from 'express';
  import multer from 'multer';
  import path from 'path';

  const app = express();

  // 파일 업로드 설정
  const upload = multer({ dest: 'uploads/' });

  // 정적 파일 제공 설정
  app.use(express.static('uploads'));  // 'uploads' 폴더 내의 파일을 접근 가능하게 설정
  ```

  - 위 코드에서 /uploads 경로에 있는 파일들을 클라이언트가 직접 접근할 수 있도록 제공할 수 있음. 
  - 예를 들어, http://localhost:3000/abc.png와 같은 형식으로 파일에 접근할 수 있게 됨.

#### 2) 파일 업로드 및 접근 경로 설정
  - 사용자가 파일을 업로드한 후, 업로드된 파일의 경로를 클라이언트에게 반환하고, 해당 파일을 접근할 수 있도록 설정함.
  ```
  // 예시: 파일 업로드 후 접근 경로 반환

  // 파일 업로드 API
  app.post('/files', upload.single('attachment'), (req, res) => {
    // 업로드된 파일의 경로를 반환
    const filePath = `/files/${req.file.filename}`;
    res.json({ path: filePath });
  });
  ```
  - upload.single('attachment'): 클라이언트가 업로드한 파일을 attachment라는 필드로 처리
  - req.file.filename: 업로드된 파일의 이름을 반환
  - /files/filename: 클라이언트가 업로드된 파일을 접근할 수 있는 URL 경로

#### 3) 파일 접근 경로 설정
  - 파일이 업로드된 후 해당 파일에 접근할 수 있는 경로를 설정해야 함.
  - express.static() 미들웨어를 사용하여 uploads 폴더에서 파일을 제공하도록 설정할 수 있음. 
  - 업로드된 파일을 /files/파일명 형태로 접근할 수 있도록 하려면, /files 경로를 추가로 설정해야 함.

  ```
  // 예시: /files 경로에서 업로드된 파일 제공
  app.use('/files', express.static('uploads'));
  ```

  - 위 코드에서 app.use('/files', express.static('uploads'))는 /files 경로를 통해 uploads 폴더 내의 파일을 제공할 수 있게 설정함.
  - 예를 들어, abc.png 파일을 업로드한 후, 사용자는 http://localhost:3000/files/abc.png와 같이 파일에 접근할 수 있음.

  ```
  import express from 'express';
  import multer from 'multer';
  import path from 'path';

  const app = express();

  // 파일 업로드 설정
  const upload = multer({ dest: 'uploads/' });

  // /files 경로를 통해 uploads 폴더 내의 파일에 접근 가능하게 설정
  app.use('/files', express.static('uploads'));

  // 파일 업로드 API
  app.post('/files', upload.single('attachment'), (req, res) => {
    const filePath = `/files/${req.file.filename}`;
    res.json({ path: filePath });  // 업로드된 파일의 경로 반환
  });

  // 서버 시작
  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
```

#### 요약:
- <b>파일 업로드</b>: multer를 사용하여 파일을 업로드하고, uploads 폴더에 저장함.
- <b>파일 제공</b>: express.static() 미들웨어를 사용하여 uploads 폴더를 정적 파일로 제공함.
- <b>파일 업로드 후 경로 반환</b>: 파일을 업로드한 후, /files/파일명 경로를 클라이언트에 반환하여 사용자가 파일을 접근할 수 있게 함.

#### 실행 예시:
  - <b>파일 업로드</b>: POST /files로 파일을 업로드하면 JSON 응답으로 파일 경로(path: '/files/filename')를 받음.

    ![image](https://github.com/user-attachments/assets/cdd9b5f6-c982-468e-a618-ef9153234440)

  - <b>파일 접근</b>: GET /files/filename으로 업로드된 파일을 접근할 수 있음.

    ![image](https://github.com/user-attachments/assets/69ffef06-8ae2-4e46-8314-cd6117e5be17)