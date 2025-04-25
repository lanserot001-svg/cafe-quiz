const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

const ADMIN_PASSWORD = '1234';

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// 정답 불러오기
function loadAnswers() {
  try {
    return JSON.parse(fs.readFileSync('./answers.json', 'utf8'));
  } catch {
    return [];
  }
}

// 정답 저장
function saveAnswers(answerList) {
  fs.writeFileSync('./answers.json', JSON.stringify(answerList));
}

// 관리자 페이지
app.get('/admin', (req, res) => {
  res.render('admin');
});

app.post('/admin', (req, res) => {
  const { password, ...answers } = req.body;
  if (password !== ADMIN_PASSWORD) return res.send('비밀번호가 틀렸습니다.');
  const answerList = Object.values(answers).filter(a => a.trim() !== '');
  saveAnswers(answerList);
  res.send('정답이 저장되었습니다!');
});

// 손님 페이지
app.get('/', (req, res) => {
  res.render('guest');
});

app.post('/submit', (req, res) => {
  const userAnswers = Object.values(req.body).map(a => a.trim().toLowerCase());
  const correctAnswers = loadAnswers().map(a => a.trim().toLowerCase());

  const correctCount = userAnswers.filter(ans => correctAnswers.includes(ans)).length;

  if (correctCount >= 7) {
    res.send(`
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              height: 100vh;
              width: 100vw;
               overflow: hidden;
              background-image: url('https://cdn.glitch.global/8ad5a062-999b-4450-bbaa-f3fe6bafa82b/Quiz-congratuation.webp?v=1745590017462');
              
              background-repeat: no-repeat;
              background-position: center center;
              background-size: auto 100vh; /* 💡 핵심! */
              background-color: #000;
              font-family: Arial, sans-serif;
              color: black;
              
              display: flex;
              flex-direction: column;
              justify-content: flex-end; /* ✅ 아래로 정렬 */
              align-items: center;
              padding-bottom: 80px; /* ✅ 바닥에서 간격 띄우기 */
              text-align: center;
              
              
           
            }
            h2 { font-size: 48px; }
            p  { font-size: 24px; }
          </style>
        </head>
        <body>
          <h2>🎉 잘했군, 자 이걸 받아라.</h2>
          <p><strong>1357</strong></p>
        </body>
      </html>
    `);
  } else {
    res.send(`
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
               height: 100vh;
              width: 100vw;
               overflow: hidden;
              background-image: url('https://cdn.glitch.global/8ad5a062-999b-4450-bbaa-f3fe6bafa82b/Quiz-fail.jpg?v=1745590021592');
              
              background-repeat: no-repeat;
              background-position: center center;
              background-size: auto 100vh; /* 💡 핵심! */
              background-color: #000;
              font-family: Arial, sans-serif;
              color: white;
              text-align: center;
              padding-top: 100px
              
              
            }
            h2 { font-size: 48px; }
            p  { font-size: 24px; }
            button {
              margin-top: 20px;
              font-size: 20px;
              padding: 10px 20px;
              border: none;
              border-radius: 5px;
              background-color: #ff6b6b;
              color: white;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <h2>❌ 이걸론 부족한데!</h2>
          <p>맞힌 개수: ${correctCount}개</p>
          <form action="/" method="GET">
            <button type="submit">🔄 다시 입력</button>
          </form>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
