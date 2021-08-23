var initialized = false; 
var canvas;
var ctx;
var GLOBAL_timestamp = 0;
var currentFrameTime = 0;
var lastFrameTimestamp = 0;

const GAME_WIDTH = 900;
const GAME_HEIGHT = 600;
const SPEED = 400; //Pixels per Second (px/s)
const imagePath = 'images/';

var movement = {};
movement.move_posY = false;
movement.move_negY = false;
movement.move_posX = false;
movement.move_negX = false;

var player = {};
player.x_size = 60;
player.y_size = 60;
player.x = GAME_WIDTH / 4;
player.y = GAME_HEIGHT / 2;
player.HP = 100;

var opponent = {};
opponent.x_size = 60;
opponent.y_size = 60;
opponent.x = (GAME_WIDTH * 3/4);
opponent.y = (GAME_HEIGHT / 2);
opponent.HP = 100;

var crosshair = {};
var marker = {};
var playerModel = {};
var opponentModel = {};

var resources = {};
resources.crosshair = imagePath + 'crosshair.png';
resources.marker = imagePath + 'marker.png';
resources.playerModel = imagePath + 'player_model_Sprite.png';
resources.opponentModel = imagePath + 'enemy_model_Sprite.png';

var abilities = {};
abilities[0] = {};
abilities[0].name = 'fireball';
abilities[0].active = false;
abilities[0].dmg = 10;

var cursorPos = {};
var pendingClick = false;
var lastClickAt = 0;
cursorPos.x = 0;
cursorPos.y = 0;
cursorPos.last = {};
cursorPos.last.x = 0;
cursorPos.last.y = 0;

var abilityAnimationQueues = {};
abilityAnimationQueues.fireball = {};
abilityAnimationQueues.fireball.queued = false;
abilityAnimationQueues.fireball.x = 0;
abilityAnimationQueues.fireball.y = 0;

window.addEventListener('DOMContentLoaded', (event) => { astro(); });

function logger(message)
{
    console.log('%c[Astro-Log] %c' + message, 'color:red;', '');
}

function welcomeToAstro()
{
    console.log('%cProject-Astro', 'color:purple;font-family:\'Courier New\';font-size:24px;font-weight:700;');
    logger('Initialization Complete');
}

function isValidBoundary(direction)
{
    if( (direction == 'moveUp') && (player.y > (player.y_size / 2)) )
    {
        return true;
    }

    if( (direction == 'moveDown') && (player.y < GAME_HEIGHT - (player.y_size / 2)) )
    {
        return true;
    }

    if( (direction == 'moveRight') && (player.x < GAME_WIDTH - (player.x_size / 2) ) )
    {
        return true;
    }

    if( (direction == 'moveLeft') && (player.x > (player.x_size / 2)) )
    {
        return true;
    }
    return false;
}

function keyDownHandler(e)
{
    const key = e.code;
    switch(key)
    {
        case 'KeyW':
            movement.move_posY = true;
            break;
        case 'KeyS':
            movement.move_negY = true;
            break;
        case 'KeyA':
            movement.move_negX = true;
            break;
        case 'KeyD':
            movement.move_posX = true;
            break;
    }
    return;
}

function keyUpHandler(e)
{
    const key = e.code;
    switch(key)
    {
        case 'KeyW':
            movement.move_posY = false;
            break;
        case 'KeyS':
            movement.move_negY = false;
            break;
        case 'KeyA':
            movement.move_negX = false;
            break;
        case 'KeyD':
            movement.move_posX = false;
            break;
    }
    return;
}

function mouseMoveHandler(e)
{
    cursorPos.x = e.offsetX;
    cursorPos.y = e.offsetY;
}

function mouseClickHandler(e)
{
    for(a in abilities)
    {
        if(abilities[a].active)
        {
            pendingClick = true;
            lastClickAt = GLOBAL_timestamp;
            cursorPos.last.x = e.offsetX;
            cursorPos.last.y = e.offsetY;
            fireAbility(a, e.offsetX, e.offsetY);
            return;
        }
    }
}

function fireAbility(a, x, y)
{
    if(a == 0)
    {
        abilityAnimationQueues.fireball.queued = true;
        abilityAnimationQueues.fireball.x = x;
        abilityAnimationQueues.fireball.y = y;
        handleCollisionDetection(a, x, y);
    }
}

function applyDamage(player_obj, amt)
{
    player_obj.HP -= amt;
    updateHudElements();
}

function updateHudElements()
{
    // background: linear-gradient(90deg, #FFF 100%, transparent 0%);
    const player_str = 'HP ' + player.HP + '/100';
    const opponent_str = 'ENEMY HP ' + opponent.HP + '/100';
    resources.stats1HP.innerText = player_str;
    resources.stats2HP.innerText = opponent_str;
    //resources.stats2bar.className = 'astroStats2Bar';
    const opponent_BarL = Math.floor(opponent.HP);
    const opponent_BarR = Math.floor(100 - opponent.HP);
    resources.stats2bar.style.backgroundImage = 'linear-gradient(90deg, red ' + opponent_BarL + '%, transparent 0%)';
}

function handleCollisionDetection(a, x, y)
{
    if ( (x >= opponent.x - (opponent.x_size / 2)) && 
         (x <= opponent.x + (opponent.x_size / 2)) &&
         (y >= opponent.y - (opponent.y_size / 2)) &&
         (y <= opponent.y + (opponent.y_size / 2)) )
    {
        applyDamage(opponent, abilities[a].dmg);
        logger('Collision Successful');
    }
}

var fireball = {};
var t = false;
var fireballAnimationComplete = false;
function showFireballAnimation()
{
    const AnimationSpeed = 10;
    let newAnim = (abilityAnimationQueues.fireball.x != fireball.x_end) ? true : false;
    fireball.x_0 = player.x;
    fireball.y_0 = player.y;
    fireball.x_end = abilityAnimationQueues.fireball.x;
    fireball.y_end = abilityAnimationQueues.fireball.y;
    fireball.x_center = fireball.x_0 + (fireball.x_end - fireball.x_0) / 2;
    fireball.y_center = fireball.y_0 + (fireball.y_end - fireball.y_0) / 2;
    fireball.distance = Math.sqrt( (fireball.x_end - fireball.x_0)**2 + (fireball.y_end - fireball.y_0)**2 );
    fireball.radius = fireball.distance / 2;
    fireball.theta = Math.atan((fireball.y_end - fireball.y_0) / (fireball.x_end - fireball.x_0));
    fireball.t_min = fireball.theta + Math.PI;
    fireball.t_max = fireball.theta + Math.PI*2;
    let reverse = (fireball.x_end < fireball.x_0) ? true : false;
    if(newAnim)
        t = (!reverse) ? fireball.t_min : fireball.t_max;
    t = (!reverse) ? (t + (AnimationSpeed * currentFrameTime / 1000)) : (t - (AnimationSpeed * currentFrameTime / 1000));
    if((!reverse && t >= fireball.t_max) || (reverse && t <= fireball.t_min))
    {
        abilityAnimationQueues.fireball.queued = false; 
        fireball.x_end = 0;
    }
    fireball.x_equation = fireball.x_center + fireball.radius * Math.cos(t);
    fireball.y_equation = fireball.y_center + fireball.radius * Math.sin(t);
    ctx.fillStyle = 'yellow'; 
    ctx.fillRect(fireball.x_equation, fireball.y_equation, 10, 10); 
}

function handleMovement()
{
    if(movement.move_posY && Boolean(isValidBoundary('moveUp')))
    {
        player.y -= SPEED * currentFrameTime / 1000;
    } else {
        movement.move_posY = false;
    }
    
    if(movement.move_negY && Boolean(isValidBoundary('moveDown')))
    {
        player.y += SPEED * currentFrameTime / 1000;
    } else {
        movement.move_negY = false;
    }
    
    if(movement.move_posX && Boolean(isValidBoundary('moveRight')))
    {
        player.x += SPEED * currentFrameTime / 1000;
    } else {
        movement.move_posX = false;
    }
    
    if(movement.move_negX && Boolean(isValidBoundary('moveLeft')))
    {
        player.x -= SPEED * currentFrameTime / 1000;
    } else {
        movement.move_negX = false;
    }
    return;
}

let playerFrame = 0;
let playerLastTimestamp = 0;
function renderPlayer()
{
    ctx.fillStyle = 'white'; 
    const AnimationSpeed = 100; //cycle a frame every 1000ms (1s)

    if(GLOBAL_timestamp - playerLastTimestamp >= AnimationSpeed)
    {
        ctx.imageSmoothingEnabled = false;
        playerLastTimestamp = GLOBAL_timestamp;
        playerFrame = (playerFrame >= 2) ? 0 : playerFrame + 1;
    }

    const x_pos = player.x - (player.x_size / 2);
    const y_pos = player.y - (player.y_size / 2);
    const x_pick = playerFrame * 60;
    ctx.drawImage(playerModel, x_pick, 0, 60, 60, x_pos, y_pos, 60, 60);

}

let opponentFrame = 0;
let opponentLastTimestamp = 0;
function renderOpponent()
{
    ctx.fillStyle = 'white'; 
    const AnimationSpeed = 100; //cycle a frame every 1000ms (1s)

    if(GLOBAL_timestamp - opponentLastTimestamp >= AnimationSpeed)
    {
        ctx.imageSmoothingEnabled = false;
        opponentLastTimestamp = GLOBAL_timestamp;
        opponentFrame = (opponentFrame >= 2) ? 0 : opponentFrame + 1;
    }

    const x_pos = opponent.x - (opponent.x_size / 2);
    const y_pos = opponent.y - (opponent.y_size / 2);
    const x_pick = opponentFrame * 60;
    ctx.drawImage(opponentModel, x_pick, 0, 60, 60, x_pos, y_pos, 60, 60);

}

/* function renderOpponent()
{
    ctx.fillStyle = 'red'; 
    ctx.fillRect(opponent.x - (opponent.x_size / 2), opponent.y - (opponent.y_size / 2), opponent.x_size, opponent.y_size); 
    return;
} */

function renderCrosshair()
{
    if(crosshair.constructor.name == 'HTMLImageElement')
        ctx.drawImage(crosshair, cursorPos.x - (crosshair.width / 2), cursorPos.y - (crosshair.height / 2));
}

function renderMarker()
{
    if(marker.constructor.name == 'HTMLImageElement')
        ctx.drawImage(marker, cursorPos.last.x, cursorPos.last.y);
}

let particleInit = true;
let particleT = 0;
let particles = {};
function renderParticles()
{
    let bg = {};
    bg.canvas = document.getElementById('gameBackdrop');
    bg.ctx = bg.canvas.getContext('2d');
    bg.canvas.width = GAME_WIDTH;
    bg.canvas.height = GAME_HEIGHT;
    bg.particleCount = 30;
    let g = 0.05;

    //init
    if(particleInit)
    {
        for(i = 0; i < bg.particleCount; i++)
        {
            particles[i] = {};
            particles[i].x = Math.floor(Math.random() * (bg.canvas.width + 1)); 
            particles[i].y = Math.floor(Math.random() * (bg.canvas.height + 500)) - 500;
            particles[i].v = Math.floor(Math.random() * 5) + 1; //variance
            particles[i].s = Math.floor(Math.random() * 2) + 1;
        }
        particleInit = false;
    }

    //main loop
    let particleTimeRange = 5;
    let calcT = Math.sin(particleT) * 10;

    for(i = 0; i < bg.particleCount; i++)
    {
        let calcT = Math.sin(particleT * particles[i].v) * 10;
        let calcT_xMod = Math.cos(particleT * 2 * particles[i].v) * 10;
        particles[i].y += (1/2) * g * calcT * particles[i].v * 0.6;
        particles[i].x += (1/2) * g * calcT_xMod * particles[i].v;
        var circle = new Path2D();
        circle.arc(particles[i].x, particles[i].y, particles[i].s, 0, 2 * Math.PI);
        bg.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        bg.ctx.fill(circle);
    }
    
    particleT += 0.02 * (currentFrameTime / 100); //time mod
}

function boot()
{
    crosshair = new Image();
    marker = new Image();
    playerModel = new Image();
    opponentModel = new Image();
    crosshair.src = resources.crosshair;
    marker.src = resources.marker;
    playerModel.src = resources.playerModel;
    opponentModel.src = resources.opponentModel;
    
    resources.container = document.getElementsByClassName('astroContainer')[0];
    resources.abilityContainer = document.createElement('div');
    resources.ability0 = document.createElement('div');
    resources.ability1 = document.createElement('div');
    resources.hud = document.createElement('div');
    resources.stats1 = document.createElement('div'); 
    resources.stats1bar = document.createElement('div'); 
    resources.stats1HP = document.createElement('span'); 
    resources.stats2 = document.createElement('div'); 
    resources.stats2bar = document.createElement('div'); 
    resources.stats2HP = document.createElement('span'); 
    
    resources.abilityContainer.className = 'astroAbilityContainer';
    resources.ability0.className = 'astroAbility';
    resources.ability1.className = 'astroAbility';
    resources.hud.className = 'astroHud';
    resources.stats1bar.className = 'astroStats1Bar';
    resources.stats1HP.className = 'astroStats1HP';
    resources.stats2bar.className = 'astroStats2Bar';
    resources.stats2HP.className = 'astroStats2HP';
    resources.stats1.className = 'astroStats1';
    resources.stats2.className = 'astroStats2';
    resources.stats1HP.innerText = 'HP 100/100';
    resources.stats2HP.innerText = 'ENEMY HP 100/100';
    resources.abilityContainer.append(resources.ability0);
    resources.abilityContainer.append(resources.ability1);
    resources.stats2.append(resources.stats2HP);
    resources.stats2.append(resources.stats2bar);
    resources.hud.prepend(resources.stats2);
    resources.stats1.append(resources.stats1HP);
    resources.stats1.append(resources.stats1bar);
    resources.hud.prepend(resources.stats1);
    resources.container.prepend(resources.hud);
    resources.container.prepend(resources.abilityContainer);

    abilities[0].element = resources.ability0;

    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
    canvas.addEventListener('mousemove', mouseMoveHandler, false);
    canvas.addEventListener('click', mouseClickHandler, false);

    resources.ability0.addEventListener('click', (event) => {
        abilities[0].active = (abilities[0].active) ? false : true;
        if(abilities[0].active)
        {
            //resources.container.style.cursor = 'none';
            abilities[0].element.style.border = '2px solid #27ff00';
            abilities[0].element.style.boxShadow = '0px 0px 3px 3px #27ff00';
        } else {
            //resources.container.style.cursor = 'default';
            abilities[0].element.style.border = '2px solid rgba(255,255,255)';
            abilities[0].element.style.removeProperty('box-shadow');
        }
    });
    
    initialized = true;
    welcomeToAstro();
}

function astro(timestamp)
{ 
    timestamp = timestamp || 0;
    GLOBAL_timestamp = timestamp;
    currentFrameTime = (timestamp - lastFrameTimestamp); 
    lastFrameTimestamp = timestamp;

    canvas = document.getElementById('gameContainer');
    ctx = canvas.getContext('2d');
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    if(!initialized)
        boot();
    
    window.requestAnimationFrame(astro);
    
    handleMovement();
    renderPlayer();
    renderOpponent();
    renderParticles();

    if(pendingClick && ((timestamp - lastClickAt) < 500))
        renderMarker();

    for(a in abilities)
    {
        if(abilities[a].active)
            renderCrosshair();
    }

    if(abilityAnimationQueues.fireball.queued)
        showFireballAnimation();
}