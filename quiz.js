const Q_TIMER_SECONDS = 15;
const DND_TIMER_SECONDS = 120;

const questions = [
  {
    q: "What is software?",
    hint: "Think about what tells the computer what to do.",
    opts: [
      "Physical parts inside a computer",
      "A set of instructions that tells the computer what to do",
      "The screen and keyboard of a device",
      "The internet connection used by a device",
    ],
    answer: 1,
    explanation: "Correct! Software is a set of instructions — you cannot touch it, unlike hardware.",
  },
  {
    q: "Which of the following is an example of System Software?",
    opts: ["Microsoft Word", "Google Chrome", "Windows 11", "GCash"],
    answer: 2,
    explanation:
      "Windows 11 is an Operating System — the core system software that manages your hardware and runs other programs.",
  },
  {
    q: "A student uses Spotify to listen to music. What type of software is Spotify?",
    opts: ["System Software", "Application Software", "Utility Software", "Operating System"],
    answer: 1,
    explanation: "Spotify is Application Software — it helps the user do a specific task (listening to music).",
  },
  {
    q: 'Which software acts as a "translator" between a device (like a printer) and the operating system?',
    opts: ["Antivirus", "Web Browser", "Device Driver", "Media Player"],
    answer: 2,
    explanation:
      "Device Drivers are system/utility software that let the OS communicate with hardware like printers, GPUs, and USB devices.",
  },
  {
    q: "Your antivirus software scans your USB drive. Is this System or Application Software?",
    opts: [
      "Application Software — it does a task for me",
      "System Software — it protects and maintains the OS",
      "Both equally",
      "Neither — it is hardware",
    ],
    answer: 1,
    explanation:
      "Antivirus is System/Utility Software. It maintains the computer's health, not a user productivity task.",
  },
  {
    q: "Which of the following is NOT an example of Application Software?",
    opts: ["Mobile Legends", "Android OS", "GCash", "Zoom"],
    answer: 1,
    explanation: "Android OS is an Operating System — System Software. The others are all Application Software.",
  },
  {
    q: "YouTube is best classified as which type of software?",
    opts: ["System Software", "Application Software", "Device Driver", "Utility Software"],
    answer: 1,
    explanation: "YouTube (and its app) is Application Software — it helps users watch videos, a specific user task.",
  },
  {
    q: "Without ________, hardware is just an expensive paperweight.",
    hint: "Fill in the blank.",
    opts: ["The internet", "Software", "A printer", "More RAM"],
    answer: 1,
    explanation: "Software gives hardware its purpose. Without software, a computer cannot do anything useful.",
  },
  {
    q: "Which type of system software manages all the hardware and allows other programs to run?",
    opts: ["Device Driver", "Utility Software", "Operating System", "Web Browser"],
    answer: 2,
    explanation:
      "The Operating System (like Windows, macOS, or Android) is the boss — it manages all hardware and lets other software run on top of it.",
  },
  {
    q: "A student opens WinRAR to compress a large file before sending it. What type of software is WinRAR?",
    opts: ["Application Software", "Operating System", "Utility Software", "Device Driver"],
    answer: 2,
    explanation:
      "WinRAR is Utility Software — it is a system tool that helps maintain and optimize how the computer handles files, making it a type of System Software.",
  },
];

const dndItems = [
  { label: "macOS", correct: "system" },
  { label: "Messenger", correct: "app" },
  { label: "Printer Driver", correct: "system" },
  { label: "MS Excel", correct: "app" },
  { label: "Linux", correct: "system" },
  { label: "Duolingo", correct: "app" },
  { label: "Antivirus", correct: "system" },
  { label: "GCash", correct: "app" },
  { label: "Disk Cleaner", correct: "system" },
  { label: "Netflix", correct: "app" },
  { label: "GPU Driver", correct: "system" },
  { label: "Google Docs", correct: "app" },
  { label: "iOS", correct: "system" },
  { label: "Zoom", correct: "app" },
];

let current = 0,
  score = 0,
  answered = false;
const placements = {};

let qTimerInterval = null;
let qTimeLeft = Q_TIMER_SECONDS;

let dndTimerInterval = null;
let dndTimeLeft = DND_TIMER_SECONDS;
let dndChecked = false;

function render() {
  clearQTimer();
  if (current >= questions.length) {
    showDnD();
    return;
  }

  const q = questions[current];
  const pct = (current / questions.length) * 100;
  document.getElementById("progressBar").style.width = pct + "%";
  updateScore();

  const circumference = 2 * Math.PI * 22;
  const html = `
    <div class="q-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem;">
        <div class="q-number">Question ${current + 1} of ${questions.length}</div>
        <div class="q-timer-wrap">
          <div class="q-timer-ring">
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle class="bg" cx="26" cy="26" r="22"/>
              <circle class="fg" id="qTimerCircle" cx="26" cy="26" r="22"
                stroke-dasharray="${circumference.toFixed(1)}"
                stroke-dashoffset="0"/>
            </svg>
            <div class="q-timer-text" id="qTimerText">${Q_TIMER_SECONDS}</div>
          </div>
        </div>
      </div>
      <div class="q-text">${q.q}</div>
      ${q.hint ? `<div class="q-hint">Hint: ${q.hint}</div>` : ""}
      <div class="timed-out-banner" id="timedOutBanner">⏰ Time's up! Moving on...</div>
      <div class="options">
        ${q.opts
          .map(
            (o, i) => `
          <button class="opt-btn" id="opt${i}" onclick="pick(${i})">
            <span class="opt-icon">${["A", "B", "C", "D"][i]}.</span> ${o}
          </button>
        `,
          )
          .join("")}
      </div>
      <div class="feedback" id="feedback"></div>
      <button class="next-btn" id="nextBtn" onclick="next()">
        ${current + 1 < questions.length ? "Next Question →" : "Go to Part 2 →"}
      </button>
    </div>
  `;
  document.getElementById("questionWrap").innerHTML = html;
  answered = false;
  startQTimer();
}

function startQTimer() {
  qTimeLeft = Q_TIMER_SECONDS;
  updateQTimerUI();

  const hdr = document.getElementById("headerTimer");
  hdr.style.display = "flex";
  updateHeaderTimer(qTimeLeft);

  qTimerInterval = setInterval(() => {
    qTimeLeft--;
    updateQTimerUI();
    updateHeaderTimer(qTimeLeft);
    if (qTimeLeft <= 0) {
      clearQTimer();
      autoExpireQuestion();
    }
  }, 1000);
}

function clearQTimer() {
  if (qTimerInterval) {
    clearInterval(qTimerInterval);
    qTimerInterval = null;
  }
  const hdr = document.getElementById("headerTimer");
  if (hdr) hdr.style.display = "none";
}

function updateQTimerUI() {
  const circle = document.getElementById("qTimerCircle");
  const text = document.getElementById("qTimerText");
  if (!circle || !text) return;

  const circumference = 2 * Math.PI * 22;
  const fraction = qTimeLeft / Q_TIMER_SECONDS;
  circle.style.strokeDashoffset = circumference * (1 - fraction);

  if (qTimeLeft <= 5) {
    circle.style.stroke = "var(--red)";
    text.style.color = "var(--red)";
  } else if (qTimeLeft <= 8) {
    circle.style.stroke = "var(--gold)";
    text.style.color = "var(--gold)";
  } else {
    circle.style.stroke = "var(--green)";
    text.style.color = "var(--white)";
  }
  text.textContent = qTimeLeft;
}

function updateHeaderTimer(secs) {
  const badge = document.getElementById("headerTimer");
  const text = document.getElementById("headerTimerText");
  if (!badge || !text) return;
  text.textContent = secs + "s";
  badge.className =
    "timer-badge" +
    (secs <= 5 ? " danger"
    : secs <= 8 ? " warning"
    : "");
}

function autoExpireQuestion() {
  if (answered) return;
  answered = true;

  questions[current].opts.forEach((_, idx) => {
    const btn = document.getElementById("opt" + idx);
    if (!btn) return;
    btn.disabled = true;
    if (idx === questions[current].answer) btn.classList.add("correct");
  });

  const banner = document.getElementById("timedOutBanner");
  if (banner) banner.classList.add("show");

  const nextBtn = document.getElementById("nextBtn");
  if (nextBtn) nextBtn.classList.add("show");
}

function pick(i) {
  if (answered) return;
  answered = true;
  clearQTimer();

  const q = questions[current];
  const isCorrect = i === q.answer;
  if (isCorrect) score++;
  updateScore();

  q.opts.forEach((_, idx) => {
    const btn = document.getElementById("opt" + idx);
    btn.disabled = true;
    if (idx === q.answer) btn.classList.add("correct");
    else if (idx === i) btn.classList.add("wrong");
  });

  const fb = document.getElementById("feedback");
  fb.className = "feedback show " + (isCorrect ? "correct" : "wrong");
  fb.innerHTML = (isCorrect ? "✓ " : "✗ ") + q.explanation;

  document.getElementById("nextBtn").classList.add("show");
}

function next() {
  current++;
  render();
}

function updateScore() {
  const total = current + (answered ? 1 : 0);
  document.getElementById("scoreBadge").textContent = `Score: ${score} / ${total}`;
}

function showDnD() {
  clearQTimer();
  document.getElementById("quizSection").style.display = "none";
  document.getElementById("dndSection").style.display = "block";
  document.getElementById("progressBar").style.width = "100%";

  const pool = document.getElementById("chipPool");
  pool.innerHTML = "";
  const shuffled = [...dndItems].sort(() => Math.random() - 0.5);
  shuffled.forEach((item) => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.draggable = true;
    chip.textContent = item.label;
    chip.dataset.label = item.label;
    chip.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", item.label);
      chip.classList.add("dragging");
    });
    chip.addEventListener("dragend", () => chip.classList.remove("dragging"));
    pool.appendChild(chip);
  });

  dndChecked = false;
  startDndTimer();
}

function startDndTimer() {
  dndTimeLeft = DND_TIMER_SECONDS;
  updateDndTimerUI();

  const hdr = document.getElementById("headerTimer");
  hdr.style.display = "flex";
  updateHeaderTimerDnd(dndTimeLeft);

  dndTimerInterval = setInterval(() => {
    dndTimeLeft--;
    updateDndTimerUI();
    updateHeaderTimerDnd(dndTimeLeft);
    if (dndTimeLeft <= 0) {
      clearDndTimer();
      autoExpireDnd();
    }
  }, 1000);
}

function clearDndTimer() {
  if (dndTimerInterval) {
    clearInterval(dndTimerInterval);
    dndTimerInterval = null;
  }
  const hdr = document.getElementById("headerTimer");
  if (hdr) hdr.style.display = "none";
}

function updateDndTimerUI() {
  const circle = document.getElementById("dndTimerCircle");
  const text = document.getElementById("dndTimerText");
  if (!circle || !text) return;

  const circumference = 2 * Math.PI * 34;
  const fraction = dndTimeLeft / DND_TIMER_SECONDS;
  circle.style.strokeDashoffset = circumference * (1 - fraction);

  const mins = Math.floor(dndTimeLeft / 60);
  const secs = dndTimeLeft % 60;
  text.textContent = mins + ":" + String(secs).padStart(2, "0");

  if (dndTimeLeft <= 15) {
    circle.style.stroke = "var(--red)";
    text.style.color = "var(--red)";
  } else if (dndTimeLeft <= 30) {
    circle.style.stroke = "var(--gold)";
    text.style.color = "var(--gold)";
  } else {
    circle.style.stroke = "var(--green)";
    text.style.color = "var(--white)";
  }
}

function updateHeaderTimerDnd(secs) {
  const badge = document.getElementById("headerTimer");
  const text = document.getElementById("headerTimerText");
  if (!badge || !text) return;
  const m = Math.floor(secs / 60),
    s = secs % 60;
  text.textContent = m + ":" + String(s).padStart(2, "0");
  badge.className =
    "timer-badge" +
    (secs <= 15 ? " danger"
    : secs <= 30 ? " warning"
    : "");
}

function autoExpireDnd() {
  if (dndChecked) return;
  document.getElementById("dndResult").innerHTML =
    `⏰ <strong style="color:var(--red)">Time's up!</strong> Checking your answers...`;
  setTimeout(() => checkDnD(), 800);
}

function onOver(e, zone) {
  e.preventDefault();
  document.getElementById("zone-" + zone).classList.add("over");
}
function onLeave(zone) {
  document.getElementById("zone-" + zone).classList.remove("over");
}
function onDrop(e, zone) {
  e.preventDefault();
  onLeave(zone);
  const label = e.dataTransfer.getData("text/plain");
  if (!label) return;

  if (placements[label]) {
    const prev = document.getElementById("dropped-" + placements[label]);
    prev.querySelectorAll(".dropped-chip").forEach((c) => {
      if (c.dataset.label === label) c.remove();
    });
  }
  placements[label] = zone;

  document.querySelectorAll(".chip").forEach((c) => {
    if (c.dataset.label === label) c.classList.add("placed");
  });

  const dropped = document.getElementById("dropped-" + zone);
  const el = document.createElement("div");
  el.className = "dropped-chip neutral";
  el.dataset.label = label;
  el.textContent = label;
  el.draggable = true;
  el.style.cursor = "grab";
  el.addEventListener("dragstart", (ev) => {
    ev.dataTransfer.setData("text/plain", label);
    el.style.opacity = "0.4";
  });
  el.addEventListener("dragend", () => {
    el.style.opacity = "1";
  });
  dropped.appendChild(el);
}

function checkDnD() {
  if (dndChecked) return;
  dndChecked = true;
  clearDndTimer();

  let dndScore = 0;
  dndItems.forEach((item) => {
    const placed = placements[item.label];
    document.querySelectorAll(".dropped-chip").forEach((c) => {
      if (c.dataset.label === item.label) {
        if (placed === item.correct) {
          c.classList.replace("neutral", "correct");
          dndScore++;
        } else {
          c.classList.replace("neutral", "wrong");
        }
      }
    });
  });

  const placed = Object.keys(placements).length;
  document.getElementById("dndResult").innerHTML =
    `You got <strong style="color:var(--green)">${dndScore}</strong> out of ${dndItems.length} correct in Part 2.` +
    (placed < dndItems.length ?
      ` <span style="color:var(--muted)">(${dndItems.length - placed} item(s) not placed)</span>`
    : "") +
    (dndScore === dndItems.length ? " 🎉 Perfect!" : " Review the red ones above!");

  setTimeout(() => showResults(dndScore), 1800);
}

function showResults(dndScore) {
  document.getElementById("dndSection").style.display = "none";
  const rs = document.getElementById("results");
  rs.style.display = "block";

  const total = questions.length + dndItems.length;
  const grand = score + dndScore;
  const pct = Math.round((grand / total) * 100);

  const el = document.getElementById("resultScore");
  el.textContent = pct + "%";
  el.className =
    "result-score " +
    (pct >= 80 ? "great"
    : pct >= 50 ? "ok"
    : "low");

  const msgs = {
    great: "Excellent! You clearly understand computer software. 🎉",
    ok: "Good effort! Review the ones you missed and try again.",
    low: "Keep going — re-read the lesson and try again. You got this!",
  };
  document.getElementById("resultMsg").textContent =
    pct >= 80 ? msgs.great
    : pct >= 50 ? msgs.ok
    : msgs.low;
}

function restartQuiz() {
  current = 0;
  score = 0;
  answered = false;
  dndChecked = false;
  Object.keys(placements).forEach((k) => delete placements[k]);
  document.getElementById("results").style.display = "none";
  document.getElementById("dndSection").style.display = "none";
  document.getElementById("quizSection").style.display = "block";
  document.getElementById("progressBar").style.width = "0%";
  document.getElementById("dropped-system").innerHTML = "";
  document.getElementById("dropped-app").innerHTML = "";
  updateScore();
  render();
}

render();
