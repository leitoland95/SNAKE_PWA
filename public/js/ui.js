// UI bindings and simple helpers
const startBtn = document.getElementById('startBtn');
const resumeBtn = document.getElementById('resumeBtn');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlaySub = document.getElementById('overlay-sub');

startBtn.addEventListener('click', () => {
  window.game && window.game.start();
  overlay.classList.add('hidden');
});

resumeBtn.addEventListener('click', () => {
  window.game && window.game.resume();
  overlay.classList.add('hidden');
});

document.getElementById('pauseBtn').addEventListener('click', () => {
  window.game && window.game.togglePause();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  window.game && window.game.reset();
  overlay.classList.remove('hidden');
  overlayTitle.textContent = 'Reiniciado';
  overlaySub.textContent = 'Pulsa Jugar para comenzar de nuevo';
});