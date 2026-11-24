let quiz = [];          // массив вопросов
let userAnswers = [];   // userAnswers[i] = индекс выбранного ответа (с 0) или undefined
let current = 0;
let showResults = false;

const $ = id => document.getElementById(id);

// ---------- меню ----------
function openPage(name) {
  $('theory').hidden = name !== 'theory';
  $('quiz').hidden = name !== 'quiz';
  $('menu-theory').classList.toggle('active', name === 'theory');
  $('menu-quiz').classList.toggle('active', name === 'quiz');
}
$('menu-theory').onclick = () => openPage('theory');
$('menu-quiz').onclick = () => openPage('quiz');

// ---------- загрузка вопросов ----------
fetch('quiz.json')
  .then(r => r.json())
  .then(data => {
    quiz = Object.values(data).sort((a, b) => a.number - b.number);
    renderQuiz();
  })
  .catch(() => {
    $('quiz-body').textContent = 'Не удалось загрузить quiz.json (запустите сайт через веб-сервер).';
  });

// ---------- тест ----------
function renderNav() {
  const nav = $('question-nav');
  nav.innerHTML = '';
  quiz.forEach((q, i) => {
    const b = document.createElement('button');
    b.textContent = q.number;
    if (userAnswers[i] !== undefined) b.classList.add('answered');
    if (!showResults && i === current) b.classList.add('current');
    b.onclick = () => { showResults = false; current = i; renderQuiz(); };
    nav.appendChild(b);
  });
}

function renderQuiz() {
  renderNav();
  const body = $('quiz-body');
  if (showResults) return renderResults(body);

  const q = quiz[current];
  body.innerHTML = `
    <table class="pair">
      <tr><td>${q['left-trans']}</td><td>${q['right-trans']}</td></tr>
      <tr><td>${q['left-hiero']}</td><td>${q['right-hiero']}</td></tr>
    </table>
    <div class="answers"></div>`;

  const box = body.querySelector('.answers');
  q.answers.forEach((text, i) => {
    const b = document.createElement('button');
    b.textContent = text;
    if (userAnswers[current] === i) b.classList.add('selected');
    b.onclick = () => selectAnswer(i);
    box.appendChild(b);
  });
}

function selectAnswer(i) {
  userAnswers[current] = i;
  const allDone = quiz.every((_, k) => userAnswers[k] !== undefined);
  if (allDone) showResults = true;
  renderQuiz();
}

function renderResults(body) {
  let score = 0;
  const rows = quiz.map((q, i) => {
    const correctIdx = q.correct - 1;               // нумерация с 1
    const ok = userAnswers[i] === correctIdx;
    if (ok) score++;
    return `<div class="result-row ${ok ? 'ok' : 'bad'}">
      <b>${q.number}.</b>
      <span>Ваш ответ: <span class="hz">${q.answers[userAnswers[i]]}</span></span>
      <span>${ok ? '✓' : 'Правильно: <span class="hz">' + q.answers[correctIdx] + '</span>'}</span>
    </div>`;
  }).join('');

  body.innerHTML = `<div class="results">
    <h1>Результаты</h1>
    <div class="score">Правильных ответов: ${score} из ${quiz.length}</div>
    ${rows}
    <button class="restart" id="restart">Пройти заново</button>
  </div>`;
  $('restart').onclick = () => { userAnswers = []; current = 0; showResults = false; renderQuiz(); };
}
