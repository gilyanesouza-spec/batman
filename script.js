document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('dinoCanvas');
  const ctx = canvas.getContext('2d');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const container = document.querySelector('.dino-game-container');

  // Suporte a tela cheia
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });

  // Configurações e Variáveis do Jogo
  let isGameOver = false;
  let score = 0;
  let highScore = 0;
  let frameCount = 0;
  let gameSpeed = 5;

  const dino = {
    x: 50,
    y: 100,
    width: 20,
    height: 30,
    dy: 0,
    gravity: 0.6,
    jumpPower: -10,
    isGrounded: true
  };

  const obstacles = [];

  // Leitura de teclas
  function handleInput() {
    if (dino.isGrounded && !isGameOver) {
      dino.dy = dino.jumpPower;
      dino.isGrounded = false;
    } else if (isGameOver) {
      resetGame();
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      handleInput();
    }
  });

  canvas.addEventListener('click', handleInput);

  function resetGame() {
    isGameOver = false;
    score = 0;
    gameSpeed = 5;
    obstacles.length = 0;
    dino.y = 100;
    dino.dy = 0;
    dino.isGrounded = true;
    loop();
  }

  function spawnObstacle() {
    obstacles.push({
      x: canvas.width,
      y: 105,
      width: 15,
      height: 25
    });
  }

  function update() {
    if (isGameOver) return;

    frameCount++;
    score = Math.floor(frameCount / 5);

    if (score > highScore) {
      highScore = score;
    }

    if (frameCount % 1000 === 0) {
      gameSpeed += 0.5;
    }

    // Movimentação do Dinossauro
    dino.dy += dino.gravity;
    dino.y += dino.dy;

    if (dino.y >= 100) {
      dino.y = 100;
      dino.dy = 0;
      dino.isGrounded = true;
    }

    // Geração de Obstáculos
    if (frameCount % Math.max(60, Math.floor(120 - gameSpeed * 3)) === 0) {
      if (Math.random() > 0.3) {
        spawnObstacle();
      }
    }

    // Atualização dos Obstáculos e Colisão
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.x -= gameSpeed;

      // Verificação de Colisão (AABB)
      if (
        dino.x < obs.x + obs.width &&
        dino.x + dino.width > obs.x &&
        dino.y < obs.y + obs.height &&
        dino.y + dino.height > obs.y
      ) {
        isGameOver = true;
      }

      if (obs.x + obs.width < 0) {
        obstacles.splice(i, 1);
      }
    }
  }

  function draw() {
    // Limpar Tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Chão
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 130);
    ctx.lineTo(canvas.width, 130);
    ctx.stroke();

    // Dinossauro
    ctx.fillStyle = '#535353';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // Obstáculos (Cactos)
    ctx.fillStyle = '#228B22';
    for (const obs of obstacles) {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }

    // Pontuação
    ctx.fillStyle = '#535353';
    ctx.font = '14px monospace';
    ctx.fillText(`HI ${String(highScore).padStart(5, '0')}  ${String(score).padStart(5, '0')}`, canvas.width - 160, 20);

    // Mensagem de Game Over
    if (isGameOver) {
      ctx.fillStyle = '#535353';
      ctx.font = '20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('G A M E  O V E R', canvas.width / 2, canvas.height / 2);
      ctx.font = '12px monospace';
      ctx.fillText('Pressione Espaço ou Clique para Reiniciar', canvas.width / 2, canvas.height / 2 + 25);
      ctx.textAlign = 'start';
    }
  }

  function loop() {
    update();
    draw();
    if (!isGameOver) {
      requestAnimationFrame(loop);
    }
  }

  loop();
});