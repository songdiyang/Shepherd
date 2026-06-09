/**
 * 俄罗斯方块 - 完整实现
 * 基于 Canvas 的俄罗斯方块游戏
 * 用于牧羊人架构实验
 */

class TetrisGame {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = options.width || 300;
    this.height = options.height || 600;
    this.blockSize = options.blockSize || 30;
    this.cols = 10;
    this.rows = 20;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // 游戏状态
    this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.paused = false;
    
    // 方块定义
    this.pieces = {
      I: { shape: [[1,1,1,1]], color: '#00f0f0' },
      O: { shape: [[1,1],[1,1]], color: '#f0f000' },
      T: { shape: [[0,1,0],[1,1,1]], color: '#a000f0' },
      S: { shape: [[0,1,1],[1,1,0]], color: '#00f000' },
      Z: { shape: [[1,1,0],[0,1,1]], color: '#f00000' },
      J: { shape: [[1,0,0],[1,1,1]], color: '#0000f0' },
      L: { shape: [[0,0,1],[1,1,1]], color: '#f0a000' }
    };
    
    this.currentPiece = null;
    this.currentX = 0;
    this.currentY = 0;
    this.currentColor = '';
    
    this.dropCounter = 0;
    this.dropInterval = 1000;
    this.lastTime = 0;
    
    this.init();
  }
  
  init() {
    this.spawnPiece();
    this.draw();
    this.update();
  }
  
  spawnPiece() {
    const keys = Object.keys(this.pieces);
    const key = keys[Math.floor(Math.random() * keys.length)];
    const piece = this.pieces[key];
    this.currentPiece = piece.shape;
    this.currentColor = piece.color;
    this.currentX = Math.floor(this.cols / 2) - Math.floor(this.currentPiece[0].length / 2);
    this.currentY = 0;
    
    if (this.collision()) {
      this.gameOver = true;
    }
  }
  
  collision() {
    for (let y = 0; y < this.currentPiece.length; y++) {
      for (let x = 0; x < this.currentPiece[y].length; x++) {
        if (this.currentPiece[y][x]) {
          const boardX = this.currentX + x;
          const boardY = this.currentY + y;
          
          if (boardX < 0 || boardX >= this.cols || boardY >= this.rows) {
            return true;
          }
          
          if (boardY >= 0 && this.board[boardY][boardX]) {
            return true;
          }
        }
      }
    }
    return false;
  }
  
  merge() {
    for (let y = 0; y < this.currentPiece.length; y++) {
      for (let x = 0; x < this.currentPiece[y].length; x++) {
        if (this.currentPiece[y][x]) {
          const boardY = this.currentY + y;
          if (boardY >= 0) {
            this.board[boardY][this.currentX + x] = this.currentColor;
          }
        }
      }
    }
  }
  
  rotate() {
    const rows = this.currentPiece.length;
    const cols = this.currentPiece[0].length;
    const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        rotated[x][rows - 1 - y] = this.currentPiece[y][x];
      }
    }
    
    const prevPiece = this.currentPiece;
    this.currentPiece = rotated;
    
    if (this.collision()) {
      this.currentPiece = prevPiece;
    }
  }
  
  move(dir) {
    this.currentX += dir;
    if (this.collision()) {
      this.currentX -= dir;
      return false;
    }
    return true;
  }
  
  drop() {
    this.currentY++;
    if (this.collision()) {
      this.currentY--;
      this.merge();
      this.clearLines();
      this.spawnPiece();
      return false;
    }
    return true;
  }
  
  clearLines() {
    let linesCleared = 0;
    
    for (let y = this.rows - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell !== 0)) {
        this.board.splice(y, 1);
        this.board.unshift(Array(this.cols).fill(0));
        linesCleared++;
        y++;
      }
    }
    
    if (linesCleared > 0) {
      this.lines += linesCleared;
      this.score += this.calculateScore(linesCleared);
      this.level = Math.floor(this.lines / 10) + 1;
      this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
    }
  }
  
  calculateScore(lines) {
    const scores = [0, 40, 100, 300, 1200];
    return scores[lines] * this.level;
  }
  
  draw() {
    // 清空画布
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // 绘制网格
    this.ctx.strokeStyle = '#222';
    this.ctx.lineWidth = 1;
    for (let x = 0; x <= this.cols; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.blockSize, 0);
      this.ctx.lineTo(x * this.blockSize, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y <= this.rows; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.blockSize);
      this.ctx.lineTo(this.width, y * this.blockSize);
      this.ctx.stroke();
    }
    
    // 绘制已固定的方块
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.board[y][x]) {
          this.drawBlock(x, y, this.board[y][x]);
        }
      }
    }
    
    // 绘制当前方块
    if (this.currentPiece) {
      for (let y = 0; y < this.currentPiece.length; y++) {
        for (let x = 0; x < this.currentPiece[y].length; x++) {
          if (this.currentPiece[y][x]) {
            this.drawBlock(this.currentX + x, this.currentY + y, this.currentColor);
          }
        }
      }
    }
    
    // 绘制信息
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 20);
    this.ctx.fillText(`Lines: ${this.lines}`, 10, 40);
    this.ctx.fillText(`Level: ${this.level}`, 10, 60);
    
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '30px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2);
      this.ctx.font = '16px Arial';
      this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 30);
      this.ctx.textAlign = 'left';
    }
    
    if (this.paused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '30px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);
      this.ctx.textAlign = 'left';
    }
  }
  
  drawBlock(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x * this.blockSize + 1, y * this.blockSize + 1, this.blockSize - 2, this.blockSize - 2);
    this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    this.ctx.strokeRect(x * this.blockSize + 1, y * this.blockSize + 1, this.blockSize - 2, this.blockSize - 2);
  }
  
  update(time = 0) {
    if (this.gameOver || this.paused) {
      this.draw();
      return;
    }
    
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    
    this.dropCounter += deltaTime;
    if (this.dropCounter > this.dropInterval) {
      this.drop();
      this.dropCounter = 0;
    }
    
    this.draw();
    requestAnimationFrame(this.update.bind(this));
  }
  
  // 控制方法
  left() { this.move(-1); this.draw(); }
  right() { this.move(1); this.draw(); }
  down() { this.drop(); this.draw(); }
  rotate() { this.rotate(); this.draw(); }
  pause() { this.paused = !this.paused; this.draw(); }
  reset() {
    this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.paused = false;
    this.dropInterval = 1000;
    this.spawnPiece();
    this.draw();
  }
  
  // 获取游戏状态
  getState() {
    return {
      board: this.board,
      score: this.score,
      lines: this.lines,
      level: this.level,
      gameOver: this.gameOver,
      paused: this.paused,
      currentPiece: this.currentPiece,
      currentX: this.currentX,
      currentY: this.currentY
    };
  }
  
  // AI控制接口
  aiMove(action) {
    switch(action) {
      case 'left': this.left(); break;
      case 'right': this.right(); break;
      case 'down': this.down(); break;
      case 'rotate': this.rotate(); break;
      case 'drop': this.drop(); break;
    }
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TetrisGame;
}
