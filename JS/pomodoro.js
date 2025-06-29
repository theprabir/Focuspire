// DOM Elements
const focusButton = document.getElementById("focus");
const buttons = document.querySelectorAll(".btn");
const shortBreakButton = document.getElementById("shortbreak");
const longBreakButton = document.getElementById("longbreak");
const startBtn = document.getElementById("btn-start");
const resetBtn = document.getElementById("btn-reset");
const pauseBtn = document.getElementById("btn-pause");
const timeDisplay = document.getElementById("time");

// Timer Variables
let timer;
let activeMode = "focus";
let secondsLeft = 25 * 60;
let isPaused = true;
let focusSessionsCompleted = 0;
const maxSessionsBeforeLongBreak = 2;

// Audio Notification
const timerCompleteSound = new Audio("Assets/notification.mp3");

// Initialize display
updateDisplayFromSeconds();
updateButtonStates(); // Initialize button states

// Helper Functions
function appendZero(value) {
  return value < 10 ? `0${value}` : value;
}

function updateDisplayFromSeconds() {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  timeDisplay.textContent = `${appendZero(minutes)}:${appendZero(seconds)}`;
}

function updateButtonStates() {
  if (isPaused) {
    startBtn.style.display = "inline-block";
    pauseBtn.style.display = "none";
    resetBtn.style.display = "none";
  } else {
    startBtn.style.display = "none";
    pauseBtn.style.display = "inline-block";
    resetBtn.style.display = "inline-block";
  }
}

function resetTimer() {
  clearInterval(timer);
  isPaused = true;
  
  switch (activeMode) {
    case "long":
      secondsLeft = 10 * 60;
      break;
    case "short":
      secondsLeft = 5 * 60;
      break;
    default: // focus
      secondsLeft = 25 * 60;
      break;
  }
  
  updateDisplayFromSeconds();
  updateButtonStates();
}

function pauseTimer() {
  clearInterval(timer);
  isPaused = true;
  updateButtonStates();
}

function startTimer() {
  if (isPaused) {
    isPaused = false;
    updateButtonStates();
    
    timer = setInterval(() => {
      secondsLeft--;
      updateDisplayFromSeconds();
      
      if (secondsLeft <= 0) {
        clearInterval(timer);
        timerCompleteSound.play().catch(e => console.log("Audio error:", e));
        autoSwitchMode();
      }
    }, 1000);
  }
}

function autoSwitchMode() {
  pauseTimer();
  
  if (activeMode === "focus") {
    focusSessionsCompleted++;
    
    if (focusSessionsCompleted >= maxSessionsBeforeLongBreak) {
      focusSessionsCompleted = 0;
      switchToLongBreak();
    } else {
      switchToShortBreak();
    }
  } else {
    switchToFocus();
  }
}

function switchToFocus() {
  activeMode = "focus";
  removeActiveClass();
  focusButton.classList.add("btn-focus");
  secondsLeft = 25 * 60;
  updateDisplayFromSeconds();
}

function switchToShortBreak() {
  activeMode = "short";
  removeActiveClass();
  shortBreakButton.classList.add("btn-focus");
  secondsLeft = 5 * 60;
  updateDisplayFromSeconds();
}

function switchToLongBreak() {
  activeMode = "long";
  removeActiveClass();
  longBreakButton.classList.add("btn-focus");
  secondsLeft = 15 * 60;
  updateDisplayFromSeconds();
}

function removeActiveClass() {
  buttons.forEach((btn) => btn.classList.remove("btn-focus"));
}

// Event Listeners
focusButton.addEventListener("click", () => {
  switchToFocus();
  resetTimer();
});

shortBreakButton.addEventListener("click", () => {
  switchToShortBreak();
  resetTimer();
});

longBreakButton.addEventListener("click", () => {
  switchToLongBreak();
  resetTimer();
});

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);