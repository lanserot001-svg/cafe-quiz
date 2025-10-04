const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// ✅ EJS 설정
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('view cache', false); // 캐시 비활성화

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

console.log('현재 views 경로:', app.get('views'));

const ADMIN_PASSWORD = '1234';

// ✅ 정답 불러오기
function loadAnswers() {
  try {
    return JSON.parse(fs.readFileSync('./answers.json', 'utf8'));
  } catch {
    return [];
  }
}

// ✅ 정답 저장
function saveAnswers(answerList) {
  fs.writeFileSync('./answers.json', JSON.stringify(answerList));
}

// ✅ 보상 불러오기
function loadReward() {
  try {
    return JSON.parse(fs.readFileSync('./reward.json', 'utf8')).reward;
  } catch {
    return "1357"; // 기본 보상 코드
  }
}

// ✅ 보상 저장
function saveReward(reward) {
  fs.writeFileSync('./reward.json', JSON.stringify({ reward }));
}

// ✅ 관리자 페이지
app.get('/admin', (req, res) => {
  const answers = loadAnswers();
  const reward = loadReward();
  res.render('admin', { answers, reward });
});

app.post('/admin', (req, res) => {
  const { password, reward, ...answers } = req.body;
  if (password !== ADMIN_PASSWORD) return res.send('비밀번호가 틀렸습니다.');

  const answerList = Object.values(answers).filter(a => a.trim() !== '');
  if (answerList.length > 0) saveAnswers(answerList);

  if (reward && reward.trim() !== '') saveReward(reward.trim());

  res.send('정답 또는 보상 코드가 저장되었습니다!');
});

// ✅ 손님 페이지
app.get('/', (req, res) => {
  res.render('guest');
});

// ✅ 퀴즈 제출 처리
app.post('/submit', (req, res) => {
  const userAnswers = Object.values(req.body).map(a => a.trim().toLowerCase());
  const correctAnswers = loadAnswers().map(a => a.trim().toLowerCase());
  const correctCount = userAnswers.filter(ans => correctAnswers.includes(ans)).length;
  const reward = loadReward();

  // 성공 시
  if (correctCount >= 8) {
    res.send(`
      <html>
        <head>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              height: 100vh;
              width: 100vw;
              overflow: hidden;
            }
            body {
              background-image: url('/success.png');
              background-repeat: no-repeat;
              background-position: center center;
              background-size: auto 100vh;
              background-color: #000;
              font-family: Arial, sans-serif;
              color: white;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
              padding-top: 180px;
            }
            h2 {
              font-size: 42px;
              margin-bottom: 10px;
              color: #ff5555;
              text-shadow: 2px 2px 6px #000;
            }
            p.reward {
              font-size: 60px;
              font-weight: bold;
              color: #ffff33;
              text-shadow: 2px 2px 10px #000;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <h2>🎉 하얀 얼굴이 내뿜는 붉은 빛을<br>빨간 점에 3초 이상 비추어라!</h2>
          <p class="reward">${reward}</p>
        </body>
      </html>
    `);
  } 
  // 실패 시
  else {
    res.send(`
      <html>
        <head>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              height: 100vh;
              width: 100vw;
              overflow: hidden;
            }
            body {
              background-image: url('/fail.png');
              background-repeat: no-repeat;
              background-position: center center;
              background-size: auto 100vh;
              background-color: #000;
              font-family: Arial, sans-serif;
              color: white;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
              padding-top: 220px;
            }
            h2 {
              font-size: 44px;
              color: #ff3333;
              text-shadow: 2px 2px 10px #000;
            }
            p {
              font-size: 22px;
            }
            button {
              margin-top: 25px;
              font-size: 20px;
              padding: 10px 20px;
              border: none;
              border-radius: 6px;
              background-color: #ff6b6b;
              color: white;
              cursor: pointer;
              transition: background-color 0.2s;
            }
            button:hover {
              background-color: #ff3333;
            }
          </style>
        </head>
        <body>
          <h2>❌ 이걸론 부족한데!</h2>
          <p>맞힌 개수: ${correctCount}개</p>
          <form action="/" method="GET">
            <button type="submit">🔄 다시 도전</button>
          </form>
        </body>
      </html>
    `);
  }
});

// ✅ 서버 시작
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
