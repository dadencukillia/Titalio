const canva = document.getElementsByTagName("canvas")[0];
const ctx = canva.getContext("2d");
canva.width = window.innerWidth;
canva.height = window.innerHeight;

let speedOfRunner = 2;
let HP = 5;
let enemiesCouter = 0;
let score = 0;
let hitboxes = false;
let enemyDelay = Date.now();
let isPlaying = false;

//Sprites
//- Background
const s_background = new Image();
s_background.src = "background.png";
//- Player
const s_player = new Image();
s_player.src = "player.png";
//- Tree
const s_tree = new Image();
s_tree.src = "tree.png";
const s_tree_flip = new Image(); //flip
s_tree_flip.src = "tree_flipped.png";
//- Spike
const s_spike = new Image();
s_spike.src = "spike.png";
const s_spike_flip = new Image(); //flip
s_spike_flip.src = "spike_flipped.png";
//- Spider
const s_spider = new Image();
s_spider.src = "spider.png";
//- Rock
const s_rock = new Image();
s_rock.src = "rock.png";
const s_rock_flip = new Image(); //flip
s_rock_flip.src = "rock_flipped.png";
//- Mini Rock
const s_mini_rock = new Image();
s_mini_rock.src = "mini-rock.png";
const s_mini_rock_flip = new Image(); //flip
s_mini_rock_flip.src = "mini-rock_flipped.png";

YPOS = {top: 0, bottom: 1, random: 2}
FADEIN = {None: 0, TopToBottom: 1, BottomToTop: 2}

const bullets = [];
const enemies = [];
const particles = [];
const items = [];

function restart() {
    speedOfRunner = 2;
    HP = 5;
    enemiesCouter = 0;
    score = 0;
    hitboxes = false;
    enemyDelay = Date.now();
    bullets.length = 0;
    enemies.length = 0;
    particles.length = 0;
    items.length = 0;
}

const TypeOfEnemies = [
    { name: "Rock", width: 169*1.5, height: 171*1.5, y_positions: [YPOS.top, YPOS.bottom], color: s_rock, xp: 5, score: 7, fadein: FADEIN.None, flip: s_rock_flip},
    { name: "Mini-Rock", width: 226, height: 129, y_positions: [YPOS.top, YPOS.bottom], color: s_mini_rock, xp: 4, score: 4, fadein: FADEIN.None, flip: s_mini_rock_flip},
    { name: "Spider", width: 100, height: 100, y_positions: [YPOS.random], color: s_spider, xp: 2, score: 5, fadein: FADEIN.TopToBottom},
    { name: "Spike", width: 119, height: 41, y_positions: [YPOS.top, YPOS.bottom], color: s_spike, xp: 2, score: 1, fadein: FADEIN.None, flip: s_spike_flip},
    { name: "Tree", width: 171, height: 87, y_positions: [YPOS.top, YPOS.bottom], color: s_tree, xp: 1, score: 1, fadein: FADEIN.None, flip: s_tree_flip}
];

//classes
class AlertParticle {
    constructor ({text = "None"}) {
        this.y = 100;
        this.text = text;
        this.velocityX = Math.round(Math.random()*2)-1;
        this.velocityY = -1;
        this.alpha = 1;
    }

    draw () {
        this.alpha /= 1.05;
        this.y += this.velocityY;
        ctx.beginPath();
        ctx.fillStyle = `rgba(200, 200, 100, ${this.alpha})`;
        ctx.font = "32px Aria, sans serif";
        ctx.textAlign = "center";
        ctx.fillText(this.text, canva.width/2, this.y);
        ctx.closePath();
        if (this.alpha < 0.1) {
            particles.splice(particles.indexOf(this), 1);
        }
    }
}

class NumberParticle {
    constructor ({ x = 0, y = 0, number = 0}) {
        this.x = x;
        this.y = y;
        this.number = number;
        this.maxNumber = 10;
        this.velocityX = Math.round(Math.random()*2)-1;
        this.velocityY = -1;
        this.alpha = 1;
        this.red = number * (255 / this.maxNumber);
    }

    draw () {
        this.alpha /= 1.05;
        this.y += this.velocityY;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${this.red}, ${255-this.red}, 0, ${this.alpha})`;
        ctx.font = "32px Aria, sans serif";
        ctx.fillText(this.number, this.x, this.y);
        ctx.closePath();
        if (this.alpha < 0.1) {
            particles.splice(particles.indexOf(this), 1);
        }
    }
}

class MagicParticle {
    constructor ({ x = 0, y = 0, scale = 1}) {
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.color = [49, 140, 231];
        this.alpha = 1;
        this.speed = Math.round(Math.random()*5) == 1?0:2;
        this.velocityX = -1;
        this.velocityY = Math.round(Math.random()*1) == 0?2:-2;
    }
    
    draw() {
        this.x += this.velocityX*this.speed;
        this.y += this.velocityY*this.speed;
        this.velocityY += Math.random()*2-1;
        this.scale *= 1.05;
        this.alpha /= 1.1;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.alpha})`;
        ctx.arc(this.x, this.y, this.scale, 0, 2*Math.PI, true);
        ctx.fill();
        ctx.closePath();
        if (this.alpha < 0.1) {
            particles.splice(particles.indexOf(this), 1);
        }
    }
}

class Player {
    constructor({ x = 0, y = 0 }) {
        this.x = x;
        this.y = y;
        this.width = 235;
        this.height = 158;
        this.originX = 1;
        this.originY = 0.45;
    }

    draw() {
        ctx.beginPath();
        if (hitboxes) {
            ctx.strokeStyle = "red";
            ctx.width = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
        ctx.drawImage(s_player, this.x, this.y, this.width, this.height);
        ctx.closePath();
    }
}

class Bullet {
    constructor() {
        this.x = pers.x + pers.width;
        this.y = pers.y + pers.height / 2;
        this.width = 20;
        this.height = 7;
        this.speed = 2;
        bullets.push(this);
    }

    draw() {
        this.speed += 0.4;
        this.x += this.speed;
        if (this.x > canva.width + this.width) {
            bullets.shift();
        }
        if (hitboxes) {
            ctx.beginPath();
            ctx.strokeStyle = "blue";
            ctx.width = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.stroke();
            ctx.closePath();
        }
        particles.push(new MagicParticle({x:this.x, y:this.y, scale:1}));
    }
}

class Heal {
    constructor() {
        this.x = canva.width;
        this.fontScale = 32;
        this.width = this.fontScale;
        this.height = this.fontScale;
        this.y = randint(0, canva.height-this.fontScale);
        items.push(this);
    }

    draw() {
        this.x -= 4 - speedOfRunner;
        if (this.x < -this.width) {
            items.shift();
        }
        if (easyColisionDetection(this, pers)) {
            HP++;
            particles.push(new NumberParticle({x: this.x, y: this.y, number: 1}));
            return items.splice(items.indexOf(this), 1);
        }
        if (hitboxes) {
            ctx.beginPath();
            ctx.strokeStyle = "yellow";
            ctx.width = 2;
            ctx.strokeRect(this.x, this.y, this.fontScale, this.fontScale);
            ctx.stroke();
            ctx.closePath();
        }
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.font = "20px Aria, sans serif";
        ctx.textAlign = "left";
        ctx.fillText("❤", this.x, this.y);
        ctx.closePath();
    }
}

class Enemy {
    constructor({ type = 0 }) {
        this.type = type;
        this.width = this.type.width;
        this.height = this.type.height;
        this.x = canva.width;
        this.type_y = choice(type.y_positions);
        this.y = (this.type_y==YPOS.random?randint(0, canva.height-this.height):(this.type_y==YPOS.top?0:(this.type_y==YPOS.bottom?canva.height-this.height:0)));
        this.y_fade = type.fadein==FADEIN.None?-999:(type.fadein==FADEIN.TopToBottom?-this.height:(type.fadein==FADEDEIN.BottomToTop?canva.height:-999));
        this.fade_speed = Math.abs(speedOfRunner);
        this.xp = this.type.xp;
        this.id = enemiesCouter++;
        enemies.push(this);
    }

    draw() {
        this.y = this.type_y==YPOS.bottom?canva.height-this.height:this.y;
        if (this.y_fade != -999) {
            this.fade_speed*=1.1;
            (this.y_fade>this.y)?(this.y_fade-=this.fade_speed):((this.y_fade>this.y-this.fade_speed&this.y_fade<this.y+this.fade_speed)?(this.y_fade=-999):this.y_fade+=this.fade_speed);
        }
        this.x -= 4 - speedOfRunner;
        if (this.x < -this.width) {
            enemies.shift();
        }
        bullets.forEach((i) => {
            if (easyColisionDetection(this, i)) {
                bullets.splice(bullets.indexOf(i), 1);
                this.xp--;
                if(this.xp <= 0){
                    particles.push(new NumberParticle({x: this.x, y: this.y, number: this.type.score}));
                    score += this.type.score;
                    return enemies.splice(enemies.indexOf(this), 1);
                }
            }
        })
        if (easyColisionDetection(this, pers)) {
            HP--;
            return enemies.splice(enemies.indexOf(this), 1);
        }
        if (hitboxes) {
            ctx.beginPath();
            ctx.strokeStyle = "green";
            ctx.width = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.stroke();
            ctx.closePath();
        }
        ctx.drawImage(this.type_y==YPOS.top?this.type.flip:this.type.color, this.x, (this.y_fade===-999)?(this.y):(this.y_fade), this.width, this.height);
    }
}

//Class instances
const pers = new Player({x: 40, y: 100});

// Events
document.onmousemove = (e) => pers.y = Math.max(0, Math.min(canva.height-pers.height, e.clientY-(pers.originY*pers.height)));
document.onclick = () => (isPlaying?(bullets.length<2?new Bullet():particles.push(new AlertParticle({text:"Перезарядка магічного пилу.."}))):null);
addEventListener("resize", (ev) => {
    canva.width = innerWidth;
    canva.height = innerHeight;
});
document.getElementById("play").onclick = (ev) => {
    document.getElementById("gameState").innerText = "Ви програли!"
    document.getElementsByClassName("startMenu")[0].style.display = "none";
    restart();
    isPlaying = true;
}

setInterval(() => {
    speedOfRunner -= 1;
    let monserType = randint(0, TypeOfEnemies.length - 1);
    new Enemy({ type: TypeOfEnemies[monserType] });
}, 2000 * speedOfRunner);

//Functions
function hpText() {
    let hpText = ''
    for (let i = 0; i < HP; i++) {
        hpText += '❤'
    }
    return hpText
}

function randint(min, max) {
    let rand = min + Math.random() * (max + 1 - min)
    return Math.floor(rand)
}

function choice(list) {
    return list[randint(0, list.length-1)];
}

function easyColisionDetection(first, second) {
    if (
        first.x + first.width > second.x &&
        second.x + second.width > first.x &&
        first.y + first.height > second.y &&
        second.y + second.height > first.y
    ) {
        return true
    }
}

function spawnEnemy() {
    new Enemy({ type: choice(TypeOfEnemies) });
}

//Draw
function game() {
    ctx.drawImage(s_background, 0, 0, canva.width, canva.height)
    speedOfRunner *= 1.000001;
    if (enemies.length < 10 && randint(0, 50) == 1 & Date.now()-enemyDelay>10000) {
        enemyDelay = Date.now();
        spawnEnemy();
    }
    if (items.length < 1 && randint(0, 800) == 1 && HP < 7) {
        new Heal();
    }
    pers.draw();
    bulletsCache = [];
    enemiesCache = [];
    particlesCache = [];
    itemsCache = [];
    bullets.forEach(e => bulletsCache.push(e));
    enemies.forEach(e => enemiesCache.push(e));
    particles.forEach(e => particlesCache.push(e));
    items.forEach(e => itemsCache.push(e));
    bulletsCache.forEach(e => e.draw());
    enemiesCache.forEach(e => e.draw());
    particlesCache.forEach(e => e.draw());
    itemsCache.forEach(e => e.draw());
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.font = "20px Aria, sans serif";
    ctx.textAlign = "left";
    ctx.fillText(hpText(), 40, 50);
    ctx.fillText("Бали: "+score, 40, 70);
    ctx.closePath();
}

function draw() {
    ctx.clearRect(0, 0, canva.width, canva.height);
    if (HP < 1) {
        document.getElementsByClassName("startMenu")[0].style.display = "flex";
        isPlaying = false;
    }
    if (isPlaying) {
        game();
    }
    requestAnimationFrame(draw);
}

draw();