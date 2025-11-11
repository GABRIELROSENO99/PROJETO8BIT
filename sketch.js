// ===================================
// GUI THE KID: VENCENDO A CLT (DEMO)
// Versão 3.0: Visual Pixel-Art Aprimorado
// ===================================

let gui;          
let chaoY;        
let obstaculos = []; 
let velocidadeJogo = 5;
let gameState = 'running';

// Paleta de Cores Básica (8-Bit Style)
const COLOR_FUNDO_CEU = [color(50, 50, 180), color(200, 100, 50)]; // Azul Escuro para Laranja
const COLOR_CHAO = color(100);
const COLOR_CALCADA = color(150);

function setup() {
    // Responsividade: O canvas terá o tamanho máximo de 800x450, mas será reduzido para caber na janela.
    createCanvas(min(800, windowWidth), min(450, windowHeight)); 
    
    textAlign(CENTER);
    chaoY = height - 50; 

    gui = new Player(50, chaoY);
    obstaculos.push(new Obstacle());
}

function draw() {
    
    // 1. Desenha o Fundo de Céu em Gradiente
    drawBackgroundGradient(); 
    
    if (gameState === 'running') {
        
        // --- 1. Lógica do Jogo ---
        
        // Gera novos obstáculos
        if (frameCount % 120 === 0) { 
            obstaculos.push(new Obstacle());
        }

        // Atualiza e verifica colisões
        for (let i = obstaculos.length - 1; i >= 0; i--) {
            let obs = obstaculos[i];
            obs.update();
            obs.draw();

            if (gui.hits(obs)) {
                gameOver();
            }

            if (obs.x < -obs.w) {
                obstaculos.splice(i, 1);
            }
        }

        // Atualiza e desenha o Gui
        gui.update();
        gui.draw();
        
        // Desenha o Chão (Calçada e Rua)
        drawChao();
        
        // Desenha o Prédio (Referência ao Morumbi Tower)
        drawMorumbiTower();

    } else if (gameState === 'gameover') {
        drawChao();
        drawGameOverScreen();
    }
}


// ===================================
// LÓGICA DO JOGO E INPUT
// ===================================

function gameOver() {
    gameState = 'gameover';
    noLoop(); 
}

function restartGame() {
    gameState = 'running';
    obstaculos = [];
    gui = new Player(50, chaoY);
    loop(); 
}

function windowResized() {
    resizeCanvas(min(800, windowWidth), min(450, windowHeight));
    chaoY = height - 50;
    gui.y = chaoY; 
}

function keyPressed() {
    if (gameState === 'running' && (key === ' ' || key === 'ArrowUp')) {
        gui.jump();
    } else if (gameState === 'gameover') {
        restartGame();
    }
}

function touchStarted() {
    if (gameState === 'running') {
        gui.jump();
    } else if (gameState === 'gameover') {
        restartGame();
    }
    return false;
}


// ===================================
// FUNÇÕES DE DESENHO VISUAL PIXEL ART
// ===================================

function drawBackgroundGradient() {
    push();
    for (let y = 0; y < height; y++) {
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(COLOR_FUNDO_CEU[0], COLOR_FUNDO_CEU[1], inter); 
        stroke(c);
        line(0, y, width, y);
    }
    pop();
}

function drawMorumbiTower() {
    push();
    // Prédio simples à esquerda (Simulando o Morumbi Tower na imagem)
    let predioX = 10;
    let predioY = 50;
    let predioW = 50;
    let predioH = height - chaoY - predioY;
    
    fill(50, 50, 50); // Cor escura
    rect(predioX, predioY, predioW, predioH); 

    // Janelas (simulando pixel art)
    fill(255, 255, 100); 
    for(let y = predioY + 5; y < height - chaoY - 5; y += 10) {
        for(let x = predioX + 5; x < predioX + predioW - 5; x += 10) {
             rect(x, y, 5, 5); 
        }
    }

    // Título "Morumbi Tower" (Pixel Font style)
    textSize(8);
    fill(255, 255, 0); 
    text("MORUMBI", predioX + predioW / 2, predioY + 15);
    text("TOWER", predioX + predioW / 2, predioY + 25);
    pop();
}

function drawChao() {
    push();
    // Rua (mais escura)
    fill(80); 
    rect(0, chaoY, width, height - chaoY); 

    // Calçada (mais clara, linha grossa 8-bit)
    fill(130); 
    rect(0, chaoY - 15, width, 15); 
    
    // Linha de rua
    stroke(255, 255, 0);
    strokeWeight(2);
    for(let x = 10; x < width; x += 40) {
        line(x, height - 10, x + 20, height - 10);
    }
    
    pop();
}

function drawGameOverScreen() {
    push();
    textSize(50 * (width / 800));
    fill(255, 0, 0); 
    text("FALHOU NA CLT!", width / 2, height / 2 - 40);
    
    textSize(25 * (width / 800));
    fill(255);
    text("Pressione ESPAÇO ou Toque para Tentar de Novo", width / 2, height / 2 + 20);
    pop();
}


// ===================================
// CLASSE PLAYER (GUI) - Desenho Aprimorado
// ===================================

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y; // Posição Y (pés)
        this.w = 30; 
        this.h = 40; 
        this.velY = 0; 
        this.gravidade = 1;
        this.forcaPulo = -15;
    }

    jump() {
        if (this.y >= chaoY - 5) { 
            this.velY = this.forcaPulo;
        }
    }

    update() {
        this.velY += this.gravidade;
        this.y += this.velY;

        if (this.y > chaoY) {
            this.y = chaoY;
            this.velY = 0;
        }
    }

    hits(obstacle) {
        // Área de colisão mais justa (um pouco menor que o corpo)
        let hitW = this.w * 0.8;
        let hitH = this.h * 0.9;
        let hitX = this.x + (this.w - hitW) / 2;
        let hitY = this.y - hitH;

        if (hitX < obstacle.x + obstacle.w &&
            hitX + hitW > obstacle.x &&
            hitY < obstacle.y &&
            hitY + hitH > obstacle.y - obstacle.h) {
            
            return true;
        }
        return false;
    }

    draw() {
        push();
        noStroke();
        
        // Posição de desenho
        let drawX = this.x;
        let drawY = this.y - this.h;
        
        // 1. Camisa (Azul Claro)
        fill(100, 100, 255); 
        rect(drawX, drawY + this.h * 1/4, this.w, this.h * 3/4); 

        // 2. Cabeça/Pele (Laranja Claro)
        fill(255, 200, 150); 
        rect(drawX + this.w * 1/4, drawY, this.w * 2/3, this.h * 1/3); 
        
        // 3. Cabelo (Marrom)
        fill(100, 50, 0); 
        rect(drawX + this.w * 1/4, drawY, this.w * 2/3, this.h * 1/6); 
        
        // 4. Mochila (Verde Musgo)
        fill(50, 100, 50);
        rect(drawX - 5, drawY + this.h * 1/4, 5, this.h * 1/2); 

        // 5. Olho (Pixel simples)
        fill(0);
        rect(drawX + this.w * 1/2, drawY + this.h * 1/6, 2, 2); 

        pop();
    }
}


// ===================================
// CLASSE OBSTACLE (Desenho Aprimorado)
// ===================================

class Obstacle {
    constructor() {
        this.x = width; 
        
        let types = [
            // { w: 20, h: 30, type: 'cone' }, 
            // { w: 40, h: 50, type: 'lixeira' },        
            { w: 80, h: 10, type: 'caixa' } 
        ];
        
        // Aumenta a chance de ser um cone ou lixeira para mais variedade
        if (random() < 0.6) {
             types.push({ w: 20, h: 30, type: 'cone' }); 
             types.push({ w: 40, h: 50, type: 'lixeira' }); 
        }

        this.type = random(types);
        this.w = this.type.w;
        this.h = this.type.h;
        this.y = chaoY - 15; // Ajuste para ficar na calçada
    }

    update() {
        this.x -= velocidadeJogo; 
    }

    draw() {
        push();
        noStroke();
        
        if (this.type.type === 'cone') {
            // Desenha um cone Laranja e Branco
            fill(255, 100, 0); 
            triangle(this.x, this.y, this.x + this.w, this.y, this.x + this.w/2, this.y - this.h);
            fill(255);
            rect(this.x + this.w * 1/4, this.y - this.h * 1/3, this.w * 1/2, 5); // Faixa branca
            fill(255, 100, 0);
            rect(this.x, this.y, this.w, 5); // Base Laranja
        } 
        else if (this.type.type === 'lixeira') {
            // Desenha uma lixeira Cinza com tampa
            fill(100); 
            rect(this.x, this.y - this.h, this.w, this.h);
            fill(50); // Tampa
            rect(this.x, this.y - this.h - 5, this.w, 5); 
            fill(255); // "Fumaça" (apenas visual)
            ellipse(this.x + this.w * 1/4, this.y - this.h - 10, 8, 8);
            ellipse(this.x + this.w * 3/4, this.y - this.h - 12, 10, 10);
        }
        else if (this.type.type === 'caixa') {
            // Desenha uma caixa de papelão Marrom
            fill(150, 100, 50); 
            rect(this.x, this.y - this.h, this.w, this.h); 
            stroke(100, 50, 0); 
            strokeWeight(2);
            line(this.x, this.y - this.h/2, this.x + this.w, this.y - this.h/2); // Fita
        }

        pop();
    }
}
