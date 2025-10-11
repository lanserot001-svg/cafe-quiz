const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// 관리자 비밀번호
const ADMIN_PASSWORD = '1234';

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// 🔹 정답 불러오기
function loadAnswers() {
  try {
    return JSON.parse(fs.readFileSync('./answers.json', 'utf8'));
  } catch {
    return [];
  }
}

// 🔹 정답 저장
function saveAnswers(answerList) {
  fs.writeFileSync('./answers.json', JSON.stringify(answerList));
}

// 🔹 보상 불러오기
function loadReward() {
  try {
    return JSON.parse(fs.readFileSync('./reward.json', 'utf8')).reward;
  } catch {
    return "1357"; // 기본 보상 코드
  }
}

// 🔹 보상 저장
function saveReward(reward) {
  fs.writeFileSync('./reward.json', JSON.stringify({ reward }));
}

// ✅ 관리자 페이지 (기존 정답/보상코드 미리 표시)
app.get('/admin', (req, res) => {
  const answers = loadAnswers();
  const reward = loadReward();
  res.render('admin', { answers, reward });
});

// ✅ 관리자 입력 처리
app.post('/admin', (req, res) => {
  const { password, reward, ...answers } = req.body;
  if (password !== ADMIN_PASSWORD) return res.send('비밀번호가 틀렸습니다.');

  const answerList = Object.values(answers).filter(a => a.trim() !== '');
  if (answerList.length > 0) {
    saveAnswers(answerList);
  }

  if (reward && reward.trim() !== '') {
    saveReward(reward.trim());
  }

  res.send('정답 또는 보상 코드가 저장되었습니다!');
});

// ✅ 손님 페이지 (퀴즈 화면)
app.get('/', (req, res) => {
  res.render('guest');
});

// ✅ 정답 제출 처리
app.post('/submit', (req, res) => {
  // 🔹 입력값 전처리 및 중복 제거
  const userAnswers = [...new Set(
    Object.values(req.body)
      .map(a => a.trim().toLowerCase())
      .filter(a => a !== "")
  )];

  const correctAnswers = loadAnswers().map(a => a.trim().toLowerCase());
  const reward = loadReward();

  // 🔹 중복 제거 후 정답 카운트 계산
  let correctCount = 0;
  for (const ans of userAnswers) {
    if (correctAnswers.includes(ans)) {
      correctCount++;
    }
  }

  // ✅ 성공 (정답 8개 이상)
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
            }
            .reward {
              font-size: 60px;
              font-weight: bold;
              color: #080808ff;
            }
          .message {
              margin-top: 20px;
              font-size: 30px;
              color: white; /* ✅ 추가 문구는 흰색 */
              text-shadow: 2px 2px 6px #000;
            }
            </style>
        </head>
        <body>
          <h2>하얀 얼굴이 내뿜는 붉은 빛을<br>빨간 점에 3초 이상 비추어라!</h2>
          <p class="reward">${reward}</p>
          <p class="message">"플레이그는 잭 스캘리톤을<br>그가 주연으로 세상에 처음 나온 때로<br> 보내버렸다."</p>
        </body>
      </html>
    `);
  } else {
    // ❌ 실패 화면
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
              padding-top: 250px;
              text-align: center;
            }
            h2 { font-size: 42px; color: #ff4444; }
            p  { font-size: 24px; margin: 10px 0; }
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
            button:hover { background-color: #ff4444; }
          </style>
        </head>
        <body>
          <h2>❌ 이걸론 부족한데! 8개 이상이상이 필요해.</h2>
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
