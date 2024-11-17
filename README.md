# Express 핵심 기능

- 미들웨어
- 라우터
- 파일 업로드

## 프로젝트 시작

- 서버 실행
```
npm run dev
```

- app.http 파일에서 'Send Request' 클릭
→ 서버로 요청이 전송됨.

-----

## 1. 미들웨어

### 미들웨어란
1) 정의
- 요청(request)와 응답(response) 사이에서 동작하는 함수
- 클라이언트의 요청을 처리하고 응답을 만드는 역할

2) 기본 구조
```
app.get('/', (req, res) => {
  res.json({ message: '안녕, 코드잇 (;' });
});
```
- 첫 번째 인자 : path
- 두 번째 인자 : 콜백함수


### 미들웨어의 구조

1) 기본 미들웨어 (2개 파라미터)
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

2) next() 포함 미들웨어 (3개 파라미터)

```
function middleware(req, res, next) {
  // next(): 다음 미들웨어로 이동
  next();
  res.json({ message: '안녕하세요' });
}
```

3) 에러 핸들링 미들웨어 (4개 파라미터)
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

#### 주요 특징:
- 하나의 라우터에 여러 미들웨어를 체이닝할 수 있음
- req 객체의 params, query, body 등이 자주 사용되는 속성만 익히기
- 모든 속성을 외울 필요 없이 필요한 것만 사용하면 됨
- next()를 호출해야 다음 미들웨어로 제어가 넘어감
- 에러 핸들러는 에러 상황에서만 실행됨

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

### 미들웨어 사용법

1. 미들웨어의 실행 순서
    1) 콜백함수의 나열 순서대로 실행됨.
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

    2) next()의 역할
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
    3) 여러 미들웨어 체이닝
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
    4) 주의 사항
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
    5) 핵심 포인트:
      - 첫 번째 콜백은 필수, 나머지는 선택사항
      - 콜백 나열 순서가 실행 순서를 결정
      - next()를 호출해야 다음 미들웨어로 진행
      - next() 후에는 응답(res.send/json 등)을 보내지 않기
      - 마지막 미들웨어에서 최종 응답 처리

### 미들웨어로 req, res 다루기




### 에러 처리하기




### 내장 미들웨어




### 서드파티 미들웨어




-----

## 2. 라우터

### 라우트 중복 제거하기

### 라우터 만들기

### 라우터 레벨 미들웨어

### Express 프로젝트 구조와 모듈화

-----

## 3. 파일 업로드

### 파일과 multipart/form-data

### multer 미들웨어 사용하기

### 서버의 파일 제공하기