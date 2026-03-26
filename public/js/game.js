// Juego Snake futurista - implementacion completa y comentada
class NeonSnake {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.gridSize = 24; // tamaño de celda en px
    this.cols = Math.floor(this.canvas.width / this.gridSize);
    this.rows = Math.floor(this.canvas.height / this.gridSize);
    this.reset();
    this.bindKeys();
    this.loadState();
    this.tickInterval = 120; // ms por movimiento (velocidad base)
    this.lastTick = 0;
    this.paused = false;
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  reset() {
    this.snake = [{x: Math.floor(this.cols/2), y: Math.floor(this.rows/2)}];
    this.dir = {x:1,y:0};
    this.nextDir = {x:1,y:0};
    this.spawnFood();
    this.score = 0;
    this.lives = 3;
    this.startTime = Date.now();
    this.best = parseInt(localStorage.getItem('neon-best')||'0',10);
    this.gameOver = false;
  }

  spawnFood() {
    let pos;
    do {
      pos = {x: Math.floor(Math.random()*this.cols), y: Math.floor(Math.random()*this.rows)};
    } while (this.snake.some(s => s.x===pos.x && s.y===pos.y));
    this.food = pos;
    // food type: normal or bonus
    this.foodType = Math.random() < 0.12 ? 'bonus' : 'normal';
  }

  bindKeys() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w') this.setDir(0,-1);
      if (e.key === 'ArrowDown' || e.key === 's') this.setDir(0,1);
      if (e.key === 'ArrowLeft' || e.key === 'a') this.setDir(-1,0);
      if (e.key === 'ArrowRight' || e.key === 'd') this.setDir(1,0);
      if (e.key === ' ' ) {
        if (this.paused) this.resume();
        else this.togglePause();
      }
    });

    // on-screen controls
    ['up','down','left','right'].forEach(id=>{
      const el = document.getElementById(id);
      if(!el) return;
      el.addEventListener('click', ()=>{
        if(id==='up') this.setDir(0,-1);
        if(id==='down') this.setDir(0,1);
        if(id==='left') this.setDir(-1,0);
        if(id==='right') this.setDir(1,0);
      });
    });
  }

  setDir(x,y) {
    // evitar invertir direccion
    if (this.dir.x === -x && this.dir.y === -y) return;
    this.nextDir = {x,y};
  }

  start() {
    this.reset();
    this.paused = false;
    this.startTime = Date.now();
  }

  resume() {
    this.paused = false;
    this.startTime += (Date.now() - (this.pauseAt || Date.now()));
  }

  togglePause() {
    this.paused = !this.paused;
    if (this.paused) this.pauseAt = Date.now();
    else this.resume();
  }

  saveState() {
    const state = {
      best: this.best
    };
    localStorage.setItem('neon-snake-state', JSON.stringify(state));
    localStorage.setItem('neon-best', String(this.best));
  }

  loadState() {
    try {
      const s = JSON.parse(localStorage.getItem('neon-snake-state')||'{}');
      if (s.best) this.best = s.best;
    } catch(e){}
  }

  loop(ts) {
    if (!this.lastTick) this.lastTick = ts;
    const elapsed = ts - this.lastTick;
    if (!this.paused && elapsed >= this.tickInterval) {
      this.update();
      this.lastTick = ts;
    }
    this.render();
    requestAnimationFrame(this.loop);
  }

  update() {
    this.dir = this.nextDir;
    const head = {x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y};

    // envolver bordes (modo futurista)
    head.x = (head.x + this.cols) % this.cols;
    head.y = (head.y + this.rows) % this.rows;

    // colision con cuerpo
    if (this.snake.some(s => s.x===head.x && s.y===head.y)) {
      this.lives -= 1;
      if (this.lives <= 0) {
        this.gameOver = true;
        this.onGameOver();
        return;
      } else {
        // recortar snake y continuar
        this.snake = [this.snake[0]];
        this.dir = {x:1,y:0};
        this.nextDir = {x:1,y:0};
        return;
      }
    }

    this.snake.unshift(head);

    // comer comida
    if (head.x === this.food.x && head.y === this.food.y) {
      const gained = this.foodType === 'bonus' ? 50 : 10;
      this.score += gained;
      // aumentar velocidad ligeramente
      this.tickInterval = Math.max(50, this.tickInterval - (this.foodType === 'bonus' ? 6 : 1));
      this.spawnFood();
    } else {
      this.snake.pop();
    }

    // actualizar record
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem('neon-best', String(this.best));
    }
  }

  onGameOver() {
    this.saveState();
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    document.getElementById('overlay-title').textContent = 'Game Over';
    document.getElementById('overlay-sub').textContent = `Puntos: ${this.score} — Record: ${this.best}`;
    document.getElementById('startBtn').textContent = 'Jugar de nuevo';
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // fondo con rejilla sutil
    ctx.fillStyle = '#001018';
    ctx.fillRect(0,0,w,h);

    // grid glow
    ctx.strokeStyle = 'rgba(0,255,255,0.02)';
    ctx.lineWidth = 1;
    for (let x=0;x<=this.cols;x++){
      ctx.beginPath();
      ctx.moveTo(x*this.gridSize,0);
      ctx.lineTo(x*this.gridSize,h);
      ctx.stroke();
    }
    for (let y=0;y<=this.rows;y++){
      ctx.beginPath();
      ctx.moveTo(0,y*this.gridSize);
      ctx.lineTo(w,y*this.gridSize);
      ctx.stroke();
    }

    // dibujar comida
    const fx = this.food.x * this.gridSize;
    const fy = this.food.y * this.gridSize;
    if (this.foodType === 'bonus') {
      // pulso
      const t = Date.now()/200;
      const pulse = 0.6 + 0.4*Math.sin(t);
      ctx.fillStyle = `rgba(124,58,237,${pulse})`;
      ctx.beginPath();
      ctx.arc(fx+this.gridSize/2, fy+this.gridSize/2, this.gridSize*0.45, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.stroke();
    } else {
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(fx+4, fy+4, this.gridSize-8, this.gridSize-8);
    }

    // dibujar snake con gradiente neon
    for (let i=0;i<this.snake.length;i++){
      const s = this.snake[i];
      const x = s.x * this.gridSize;
      const y = s.y * this.gridSize;
      const ratio = i / this.snake.length;
      const r = Math.floor(0 + (124-0)*ratio);
      const g = Math.floor(240 - (240-120)*ratio);
      const b = Math.floor(255 - (255-200)*ratio);
      ctx.fillStyle = `rgba(${r},${g},${b},1)`;
      ctx.fillRect(x+2, y+2, this.gridSize-4, this.gridSize-4);

      // glow
      ctx.shadowColor = `rgba(${r},${g},${b},0.6)`;
      ctx.shadowBlur = 12;
      ctx.fillRect(x+2, y+2, this.gridSize-4, this.gridSize-4);
      ctx.shadowBlur = 0;
    }

    // HUD actualizacion
    document.getElementById('score').textContent = this.score;
    document.getElementById('lives').textContent = this.lives;
    document.getElementById('best').textContent = this.best;
    const elapsed = Math.floor((Date.now() - this.startTime)/1000);
    const mm = String(Math.floor(elapsed/60)).padStart(2,'0');
    const ss = String(elapsed%60).padStart(2,'0');
    document.getElementById('time').textContent = `${mm}:${ss}`;
  }
}

// inicializar juego global
window.game = new NeonSnake('gameCanvas');