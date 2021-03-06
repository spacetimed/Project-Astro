/*
    https://github.com/FFFFFF-base16/Project-Astro
*/


var canvas;
var ctx;
var initialized = false;  
var gameInProgress = false;
var GLOBAL_timestamp = 0;
var currentFrameTime = 0;
var lastFrameTimestamp = 0;
var bg = {};

const GAME_WIDTH = 900;
const GAME_HEIGHT = 600;
const imagePath = 'images/';
var SPEED = 0; //player speed (pixels per second)

var levels = {
    'active_level' : false,
    1 : {'speed' : 400},
    2 : {'speed' : 500},
    3 : {'speed' : 600},
    4 : {'speed' : 800},
    5 : {'speed' : 1000},
    6 : {'speed' : 1200},
    7 : {'speed' : 2000},
};

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
var beamModel = {};
var beamModelY = {};
var fireballModel = {};
var resources = {};
resources.crosshair = imagePath + 'crosshair.png';
resources.marker = imagePath + 'hitmarker.png';
resources.playerModel = imagePath + 'player_model_Sprite.png';
resources.opponentModel = imagePath + 'enemy_model_Sprite.png';
resources.beamModel = imagePath + 'beam_animation.png';
resources.beamModelY = imagePath + 'beam_animation_y.png';
resources.fireballModel = imagePath + 'fireball_animation.png';

var abilities = {};

abilities[0] = {};
abilities[0].name = 'fireball';
abilities[0].active = false;
abilities[0].dmg = 25;
abilities[0].cd = 2;
abilities[0].lastUsed = 0;
abilities[0].avail = true;

abilities[1] = {};
abilities[1].name = 'beam';
abilities[1].active = false;
abilities[1].dmg = 2; 
abilities[1].dmgRate = 0.1; //2 dmg per 1.0s
abilities[1].firing = false;
abilities[1].energy = 100;
abilities[1].energyDrainRate = 1.8;
abilities[1].energyGainRate = 2.5;
abilities[1].energyGainTime = 0.5;

var pendingClick = false;
var lastClickAt = 0;
var cursorPos = {};
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

window.onload = function() {
    document.getElementsByClassName('astroSplashscreen')[0].style.display = 'none';

    let helpButton = document.getElementsByClassName('astroHowToPlay')[0];
    helpButton.addEventListener('click', () => {
        helpFunction();
    });

    astro(); 
}

function helpFunction() {
    showHelpContent();
}

function showHelpContent() {
    let helpContainer = document.getElementsByClassName('astroHowToPlayContainer')[0];
    let helpContent = document.createElement('div');
    let titles = ['Movement', 'Abilities', 'Levels', 'Goal'];
    let mainHeading = document.createElement('h1');
    let closeButton = document.createElement('a');
    let helpButton = document.getElementsByClassName('astroHowToPlay')[0];
    helpContent.className = 'astroHowToPlayPanel';
    closeButton.className = 'astroHowToPanel_close';
    mainHeading.innerText = 'How to play Project Astro';
    closeButton.innerText = 'Close';
    helpContent.append(mainHeading);
    titles.forEach((title) => {
        let section = document.createElement('section');
        let head = document.createElement('h2');
        head.innerText = title;
        section.append(head);
        if(title == 'Movement')
        {
            let keys = ['W', 'A', 'S', 'D'];
            keys.forEach((key) => {
                let keyElement = document.createElement('div');
                keyElement.className = 'key';
                keyElement.innerText = key;
                section.append(keyElement);
            });
        }
        if(title == 'Abilities')
        {
            let paragraph = document.createElement('p');
            let img1 = new Image(16, 16);
            let img2 = new Image(16, 16);
            let ability1_info = document.createElement('b');
            let ability2_info = document.createElement('b');
            let ability1_desc = document.createElement('span');
            let ability2_desc = document.createElement('span');

            img1.src = 'images/asteroid.png';
            img2.src = 'images/beam.png';
            ability1_info.innerText = ' Asteroid: ';
            ability1_desc.innerText = 'A high damage skill shot on a 2 second cooldown.';
            ability2_info.innerText = ' Laser: ';
            ability2_desc.innerText = 'A tracking-based laser powered by energy that drains upon use, and rebuilds over time.';

            paragraph.append(img1);
            paragraph.append(ability1_info);
            paragraph.append(ability1_desc);
            paragraph.append(document.createElement('br'));
            paragraph.append(img2);
            paragraph.append(ability2_info);
            paragraph.append(ability2_desc);
            section.append(paragraph);
        }
        if(title == 'Levels')
        {
            let paragraph = document.createElement('p');
            paragraph.innerText = 'There are 7 levels, with overall speed of both players increasing incrementally.';
            section.append(paragraph);
        }
        if(title == 'Goal')
        {
            let paragraph = document.createElement('p');
            paragraph.innerText = 'The goal of Project Astro is to beat all 7 levels as fast as possible. Levels increasingly become more difficult, as overall speed intensifies.';
            section.append(paragraph);
        }
        helpContent.append(section);
    });
    helpContent.append(closeButton);
    helpContainer.append(helpContent);
    closeButton.addEventListener('click', () => {
        helpFunction = () => {
            showHelpContent();
        };
        helpContent.style.display = 'none';
    });
    helpFunction = () => { 
        helpFunction = () => {
            showHelpContent();
        };
        helpContent.style.display = 'none'; 
    };
}

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
        return true;

    if( (direction == 'moveDown') && (player.y < GAME_HEIGHT - (player.y_size / 2)) )
        return true;

    if( (direction == 'moveRight') && (player.x < GAME_WIDTH - (player.x_size / 2) ) )
        return true;

    if( (direction == 'moveLeft') && (player.x > (player.x_size / 2)) )
        return true;
        
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
    let a = 0;
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

lastDamageProc = 0;
function fireAbility(a, x, y)
{
    if(a == 0 && abilities[a].avail)
    {
        abilityAnimationQueues.fireball.queued = true;
        abilityAnimationQueues.fireball.x = x;
        abilityAnimationQueues.fireball.y = y;
        abilities[a].lastUsed = GLOBAL_timestamp;
        
        makeAbilityInactive(0);
        abilities[a].active = false;
        abilities[a].avail = false;
        resources.ability0.style.pointerEvents = 'none';
        resources.ability0cd.innerText = abilities[a].cd.toString();
        resources.ability0cd.style.display = 'block';

        handleCollisionDetection(a, x, y);
    } else if(a == 1)
    {
        if( (GLOBAL_timestamp - lastDamageProc >= abilities[a].dmgRate * 1000) && (abilities[a].energy > 0) )
        {
            cursorPos.last.x =  x;
            cursorPos.last.y =  y;
            handleCollisionDetection(a, x, y);
            lastDamageProc = GLOBAL_timestamp;
            abilities[a].energy -= abilities[a].energyDrainRate;
            if(abilities[a].energy < 0)
                abilities[a].energy = 0;
            resources.statsEnergy.innerText = Math.floor(abilities[a].energy);
        } else if(abilities[0].energy <= 0) {
            abilities[a].firing = false;
        }
    }
}

function mouseDownHandler(e)
{
    let a = 1;
    if(abilities[a].active)
    {
        abilities[a].firing = true;
    }
}

function mouseUpHandler(e)
{
    let a = 1;
    if(abilities[a].active && abilities[a].firing)
    {
        abilities[a].firing = false;
    }
}


function applyDamage(player_obj, amt)
{
    player_obj.HP -= amt;
    if(player_obj.HP <= 0)
    {
        nextLevel();
    }
    updateHudElements();
}

function updateHudElements()
{
    const player_str = 'HP ' + player.HP + '/100';
    const opponent_str = 'ENEMY HP ' + opponent.HP + '/100';
    resources.stats1HP.innerText = player_str;
    resources.stats2HP.innerText = opponent_str;
    const opponent_BarL = Math.floor(opponent.HP);
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
    }
}

var fireball = {};
var t = false;
var fireballAnimationComplete = false;
var fireballFrame = 0;
var fireballSpriteLastTimestamp = 0;
function showFireballAnimation()
{
    const AnimationSpeed = 10;
    const AnimationSpriteSpeed = 25;
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
    fireballSize_x = 30;
    fireballSize_y = 30;
    if(GLOBAL_timestamp - fireballSpriteLastTimestamp >= AnimationSpriteSpeed)
    {
        fireballSpriteLastTimestamp = GLOBAL_timestamp;
        fireballFrame = (fireballFrame >= 2) ? 0 : fireballFrame + 1;
    }
    fireballFramePos = fireballFrame * fireballSize_x;
    ctx.drawImage(fireballModel, fireballFramePos, 0, fireballSize_x, fireballSize_y, fireball.x_equation - (fireballSize_x / 2), fireball.y_equation - (fireballSize_y / 2), fireballSize_x, fireballSize_y);
}

function handleMovement()
{
    if(movement.move_posY && Boolean(isValidBoundary('moveUp')))
        player.y -= SPEED * currentFrameTime / 1000;
    else
        movement.move_posY = false;
    if(movement.move_negY && Boolean(isValidBoundary('moveDown')))
        player.y += SPEED * currentFrameTime / 1000;
    else
        movement.move_negY = false;
    if(movement.move_posX && Boolean(isValidBoundary('moveRight')))
        player.x += SPEED * currentFrameTime / 1000;
    else
        movement.move_posX = false;
    if(movement.move_negX && Boolean(isValidBoundary('moveLeft')))
        player.x -= SPEED * currentFrameTime / 1000;
    else
        movement.move_negX = false;
    return;
}

let playerFrame = 0;
let playerLastTimestamp = 0;
let deg = 0;
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
    ctx.save();
    ctx.drawImage(playerModel, x_pick, 0, 60, 60, x_pos, y_pos, 60, 60);
    ctx.restore();
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

function renderCrosshair()
{
    if(crosshair.constructor.name == 'HTMLImageElement')
        ctx.drawImage(crosshair, cursorPos.x - (crosshair.width / 2), cursorPos.y - (crosshair.height / 2));
}

function renderMarker()
{
    if(marker.constructor.name == 'HTMLImageElement')
        ctx.drawImage(marker, cursorPos.last.x - (marker.width / 2), cursorPos.last.y - (marker.width / 2));
}

let particleInit = true;
let particleT = 0;
let particles = {};
function renderParticles() //https://github.com/FFFFFF-base16/Floatr
{
    bg.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    let g = 0.05;
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
    canvas = document.getElementById('gameContainer');
    ctx = canvas.getContext('2d');
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    bg.canvas = document.getElementById('gameBackdrop');
    bg.ctx = bg.canvas.getContext('2d');
    bg.canvas.width = GAME_WIDTH;
    bg.canvas.height = GAME_HEIGHT;
    bg.particleCount = 30;
    bg.canvas.style.display = 'block';

    crosshair = new Image();
    marker = new Image();
    playerModel = new Image();
    opponentModel = new Image();
    beamModel = new Image();
    beamModelY = new Image();
    fireballModel = new Image();
    crosshair.src = resources.crosshair;
    marker.src = resources.marker;
    playerModel.src = resources.playerModel;
    opponentModel.src = resources.opponentModel;
    beamModel.src = resources.beamModel;
    beamModelY.src = resources.beamModelY;
    fireballModel.src = resources.fireballModel;
    
    resources.container = document.getElementsByClassName('astroContainer')[0];
    resources.abilityContainer = document.createElement('div');
    resources.ability0 = document.createElement('div');
    resources.ability1 = document.createElement('div');
    resources.ability0cd = document.createElement('div');
    resources.hud = document.createElement('div');
    resources.stats1 = document.createElement('div'); 
    resources.stats1bar = document.createElement('div'); 
    resources.stats1HP = document.createElement('span'); 
    resources.stats2 = document.createElement('div'); 
    resources.stats2bar = document.createElement('div'); 
    resources.stats2HP = document.createElement('span'); 
    resources.statsEnergy = document.createElement('div');
    resources.infoBar = document.createElement('div');
    resources.infoBarTime = document.createElement('span');
    resources.infoBarLevel = document.createElement('span');
    resources.newLevelOverlay = document.createElement('div');
    resources.gameOver = document.createElement('div');
    resources.gameOverHead = document.createElement('div');
    resources.gameOverBody = document.createElement('div');
    resources.gameOverButton = document.createElement('div');
    resources.gameOverTime = document.createElement('div');
    resources.abilityContainer.className = 'astroAbilityContainer';
    resources.ability0.className = 'astroAbility';
    resources.ability1.className = 'astroAbility';
    resources.ability0cd.className = 'astroAbilityCd';
    resources.hud.className = 'astroHud';
    resources.stats1bar.className = 'astroStats1Bar';
    resources.stats1HP.className = 'astroStats1HP';
    resources.stats2bar.className = 'astroStats2Bar';
    resources.stats2HP.className = 'astroStats2HP';
    resources.statsEnergy.className = 'astroStatsEnergy';
    resources.stats1.className = 'astroStats1';
    resources.stats2.className = 'astroStats2';
    resources.infoBar.className = 'astroInfoBar';
    resources.infoBarTime.className = 'astroInfoBarTime';
    resources.infoBarLevel.className = 'astroInfoBarLevel';
    resources.newLevelOverlay.className = 'astroNewLevelOverlay';
    resources.gameOver.className = 'astroGameOver';
    resources.gameOverHead.className = 'astroGameOverHead';
    resources.gameOverBody.className = 'astroGameOverBody';
    resources.gameOverButton.className = 'astroGameOverButton';
    resources.gameOverTime.className = 'astroGameOverTime';
    resources.stats1HP.innerText = 'ENERGY';
    resources.stats2HP.innerText = 'ENEMY HP 100/100';
    resources.statsEnergy.innerText = '100';
    resources.infoBarTime.innerText = '00:00:00';
    resources.infoBarLevel.innerText = 'LEVEL 1 -';
    resources.newLevelOverlay.innerText = 'LEVEL 1';
    resources.ability0cd.innerText = '0';
    resources.ability0cd.style.display = 'none';
    resources.gameOverHead.innerText = 'VICTORY!';
    resources.gameOverBody.innerText = 'You completed the game!';
    resources.gameOverButton.innerText = 'Play Again';
    resources.gameOverTime.innerText = 'Your Time: 00:00:00';
    resources.gameOver.append(resources.gameOverHead);
    resources.gameOver.append(resources.gameOverBody);
    resources.gameOver.append(resources.gameOverButton);
    resources.ability0.prepend(resources.ability0cd);
    resources.abilityContainer.append(resources.ability0);
    resources.abilityContainer.append(resources.ability1);
    resources.stats2.append(resources.stats2HP);
    resources.stats2.append(resources.stats2bar);
    resources.hud.prepend(resources.statsEnergy);
    resources.hud.prepend(resources.stats2);
    //resources.stats1.append(resources.stats1HP);
    //resources.stats1.append(resources.stats1bar);
    //resources.hud.prepend(resources.stats1);
    resources.infoBar.append(resources.infoBarLevel);
    resources.infoBar.append(resources.infoBarTime);
    resources.container.prepend(resources.hud);
    resources.container.prepend(resources.abilityContainer);
    resources.container.prepend(resources.infoBar);
    resources.container.prepend(resources.newLevelOverlay);
    resources.gameOverBody.append(resources.gameOverTime);
    resources.container.append(resources.gameOver);
    abilities[0].element = resources.ability0;
    abilities[1].element = resources.ability1;

    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
    canvas.addEventListener('mousemove', mouseMoveHandler, false);
    canvas.addEventListener('click', mouseClickHandler, false);
    canvas.addEventListener('mousedown', mouseDownHandler, false);
    canvas.addEventListener('mouseup', mouseUpHandler, false);

    resources.ability0.addEventListener('click', () => {
        handleAbilityClick(0);
    });
    resources.ability1.addEventListener('click', () => {
        handleAbilityClick(1);
    });
    resources.gameOverButton.addEventListener('click', () => {
        location.reload();
    });

    welcomeToAstro();

    if(!levels['active_level'])
        nextLevel();

    initialized = true;
    gameInProgress = true;
}

function handleAbilityClick(n) 
{
    const n_2 = n ? 0 : 1; //other ability
    if(abilities[n_2].active)
    {
        abilities[n_2].active = false;
        makeAbilityInactive(n_2);
    }
    abilities[n].active = (abilities[n].active) ? false : true;
    if(abilities[n].active)
        makeAbilityActive(n);
    else
        makeAbilityInactive(n);
}

function makeAbilityInactive(n)
{
    resources.container.style.cursor = 'default';
    abilities[n].element.style.border = '2px solid rgba(255,255,255)';
    abilities[n].element.style.removeProperty('box-shadow');
}

function makeAbilityActive(n)
{
    resources.container.style.cursor = 'none';
    abilities[n].element.style.border = '2px solid #27ff00';
    abilities[n].element.style.boxShadow = '0px 0px 3px 3px #27ff00';
}

function getCurrentFramerate()
{
    return((1 / currentFrameTime * 1000).toFixed(1));
}

let lastFramerateRender = 0;
function renderFramerate()
{
    const UpdateSpeed = 1000;
    if(GLOBAL_timestamp - lastFramerateRender >= UpdateSpeed)
    {
        resources.framerate = document.getElementsByClassName('astroContainer_stats')[0];
        resources.framerate.innerText = 'FPS ' + getCurrentFramerate();
        lastFramerateRender = GLOBAL_timestamp;
    }
}

function formatTimer(n_int)
{
    const n = n_int.toString();
    if(n.length < 2)
        return '0' + n;
    return n;
}

var lastTimerRender = 0;
var lastCdSecond = 0;
var lastEnergyRaise = 0;
function renderGameTimer() 
{
    const UpdateSpeed = 50;
    if(GLOBAL_timestamp - lastTimerRender >= UpdateSpeed)
    {
        var s = (Math.floor(GLOBAL_timestamp / 1000));
        const m = formatTimer(Math.floor(s / 60));
        const ms = formatTimer(Math.floor((GLOBAL_timestamp / 1000 - s) * 100));
        s = formatTimer(s % 60);
        resources.infoBarTime.innerText = (m + ':' + s + ':' + ms);
        lastTimerRender = GLOBAL_timestamp;
    }

    if(GLOBAL_timestamp - abilities[0].lastUsed < (abilities[0].cd * 1000) && abilities[0].lastUsed > 0)
    {
        let tmpLastCdSecond = (abilities[0].cd - ((GLOBAL_timestamp - abilities[0].lastUsed) / 1000)).toFixed(1).toString();
        resources.ability0cd.innerText = tmpLastCdSecond;
    } else if(abilities[0].lastUsed > 0) {
        abilities[0].avail = true;
        abilities[0].lastUsed = 0;
        resources.ability0.style.pointerEvents = 'auto';
        resources.ability0cd.style.display = 'none';
        resources.ability0cd.innerText = abilities[0].cd.toString();
    }

    if(Math.round(abilities[1].energy < 100) && (GLOBAL_timestamp - lastEnergyRaise >= abilities[1].energyGainTime * 1000) && (!abilities[1].firing))
    {
        abilities[1].energy += abilities[1].energyGainRate;
        if(abilities[1].energy > 100)
            abilities[1].energy = 100;
        resources.statsEnergy.innerText = Math.floor(abilities[1].energy);
        lastEnergyRaise = GLOBAL_timestamp;
    }
}

function rand(min, max)
{
    return(Math.floor(Math.random() * ((max + 1) - min) + min));
}

let lastOpponentMove = 0;
let activeMovementAnimation = false;
let opponentMovementQueue = {'x' : 0, 'y' : 0};
function handleOpponentMovement()
{
    const MIN_Y = 0;
    const MAX_Y = GAME_HEIGHT - 100;
    const MIN_X = GAME_WIDTH / 6;
    const MAX_X = GAME_WIDTH;
    const UpdateSpeed = 1000;
    const OpponentSpeed = SPEED / 4;
    if(GLOBAL_timestamp - lastOpponentMove >= UpdateSpeed && !activeMovementAnimation)
    {
        let direction = rand(0, 3);
        opponentMovementQueue['x'] = (direction == 0 || direction == 2) ? rand(MIN_X, MAX_X) : opponentMovementQueue['x'];
        opponentMovementQueue['y'] = (direction == 1 || direction == 2) ? rand(MIN_Y, MAX_Y) : opponentMovementQueue['y'];
        activeMovementAnimation = true;
    }
    if(activeMovementAnimation)
    {
        if(opponentMovementQueue['x'] > 0)
        {
            if(Math.abs(opponentMovementQueue['x'] - opponent.x) > 10)
            {
                if(opponentMovementQueue['x'] > opponent.x)
                    opponent.x += OpponentSpeed * currentFrameTime / 1000;
                else
                    opponent.x -= OpponentSpeed * currentFrameTime / 1000;
            } else {
                opponentMovementQueue['x'] = 0;
            }
        }
        if(opponentMovementQueue['y'] > 0)
        {
            if(Math.abs(opponentMovementQueue['y'] - opponent.y) > 10)
            {
                if(opponentMovementQueue['y'] > opponent.y)
                    opponent.y += OpponentSpeed * currentFrameTime / 1000;
                else
                    opponent.y -= OpponentSpeed * currentFrameTime / 1000;
            } else {
                opponentMovementQueue['y'] = 0;
            }
        }
        activeMovementAnimation = !(opponentMovementQueue['x'] == 0 && opponentMovementQueue['y'] == 0);
    }
}

var beamFrame = 0;
var beamReverseFrame = false;
function showBeamAnimation()
{
    const x_0 = player.x; //0
    const y_0 = player.y;
    const x_1 = cursorPos.x; //1000
    const y_1 = cursorPos.y;
    var beamSize_x = 4;
    var beamSize_y = 20;
    var vertical = false;
    const increment_1 = (Math.abs(x_1 - x_0) / beamSize_x);
    const increment_2 = (Math.abs(y_1 - y_0) / beamSize_y);
    const increment = (increment_1 > increment_2) ? increment_1 : increment_2;
    const distance = Math.sqrt( (x_1 - x_0)**2 + (y_1 - y_0)**2 );
    const slope = (y_1 - y_0) / (x_0 - x_1);
    if(Math.abs(x_1 - x_0) > Math.abs(y_1 - y_0)) 
    {
        vertical = false;
        activeBeamModel = beamModel;
    } else {
        vertical = true;
        activeBeamModel = beamModelY;
        [beamSize_x, beamSize_y] = [beamSize_y, beamSize_x];
    }
    if(!vertical)
    {
        for(i = 0; i <= increment; i++)
        {
            if(i == 0)
                beamFrame = rand(0, 3);
    
            if(beamFrame >= 3) {
                beamReverseFrame = true;
                beamFrame -= 2;
            }
            else if(beamFrame < 0) {
                beamReverseFrame = false;
                beamFrame += 2;
            }
    
            const x_c = x_0 + (x_1 - x_0) * (i / increment);
            const y_c = y_0 + (y_1 - y_0) * (i / increment);
            ctx.drawImage(activeBeamModel, (beamFrame * beamSize_x), 0, beamSize_x, beamSize_y, x_c - (beamSize_x / 2), y_c - (beamSize_y / 2), beamSize_x, beamSize_y);
    
            if(!beamReverseFrame)
                beamFrame += 1;
            else
                beamFrame -= 1;
        }
    } else {
        for(i = 0; i <= increment * 5; i++)
        {
            if(i == 0)
                beamFrame = rand(0, 3);
    
            if(beamFrame >= 3) {
                beamReverseFrame = true;
                beamFrame -= 2;
            }
            else if(beamFrame < 0) {
                beamReverseFrame = false;
                beamFrame += 2;
            }
    
            const x_c = x_0 + (x_1 - x_0) * (i / increment / 5);
            const y_c = y_0 + (y_1 - y_0) * (i / (increment * 5));
            ctx.drawImage(activeBeamModel, 0, (beamFrame * beamSize_y), beamSize_x, beamSize_y, x_c - (beamSize_x / 2), y_c - (beamSize_y / 2), beamSize_x, beamSize_y);
            if(!beamReverseFrame)
                beamFrame += 1;
            else
                beamFrame -= 1;
        }
    }
}

function rand(min, max) { //function from MDN
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

var ActiveLevelOverlay = false;
var LastLevelInit = false;
var LastLevelOverlay = 0;
function renderLevelOverlay()
{
    const OverlayDuration = 2000;

    if(!ActiveLevelOverlay)
        return;

    if(LastLevelOverlay == 0)
        LastLevelOverlay = GLOBAL_timestamp;

    if(GLOBAL_timestamp - LastLevelOverlay <= OverlayDuration)
    {
        if(!LastLevelInit)
        {
            LastLevelOverlay = GLOBAL_timestamp;
            resources.newLevelOverlay.style.display = 'block';
            LastLevelInit = true;
        }
    } else {
        resources.newLevelOverlay.style.display = 'none';
        ActiveLevelOverlay = false;
    }
}

function nextLevel()
{
    levels['active_level'] = (!levels['active_level']) ? 1 : levels['active_level'] + 1;
    if(levels['active_level'] in levels)
    {
        SPEED = levels[levels['active_level']].speed;
        opponent.HP = 100;
        resources.infoBarLevel.innerText = resources.newLevelOverlay.innerText = 'LEVEL ' + levels['active_level'] + '/7';
        ActiveLevelOverlay = true;
        LastLevelOverlay = 0;
        LastLevelInit = false;
        abilities[1].energy = 100;
        resources.statsEnergy.innerText = '100';
        if(levels['active_level'] > 1)
        {
            bg.canvas.style.filter = 'hue-rotate(' + (levels['active_level'] * 5) + 'deg)';
        }
        logger('Level ' + levels['active_level']);
    } else {
        handleGameOver();
    }
}

function handleGameOver()
{
    gameInProgress = false;
    resources.gameOver.style.display = 'flex';
    resources.container.style.cursor = 'default';
    var s = (Math.floor(GLOBAL_timestamp / 1000));
    const m = formatTimer(Math.floor(s / 60));
    const ms = formatTimer(Math.floor((GLOBAL_timestamp / 1000 - s) * 100));
    s = formatTimer(s % 60);
    resources.gameOverTime.innerText = 'Your Time: ' + (m + ':' + s + ':' + ms);
}

function astro(timestamp)
{ 
    timestamp = timestamp || 0;
    GLOBAL_timestamp = timestamp;
    currentFrameTime = (timestamp - lastFrameTimestamp); 
    lastFrameTimestamp = timestamp;
    
    if(!initialized)
        boot();

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    renderFramerate();
    renderGameTimer();
    renderParticles();
    renderLevelOverlay();

    if(abilityAnimationQueues.fireball.queued)
        showFireballAnimation();

    if(abilities[1].firing && abilities[1].energy > 0)
    {
        showBeamAnimation();
        fireAbility(a, cursorPos.x, cursorPos.y);
    }
    
    handleOpponentMovement();
    renderOpponent();
    handleMovement();
    renderPlayer();

    if(pendingClick && ((timestamp - lastClickAt) < 500))
        renderMarker();

    for(a in abilities)
    {
        if(abilities[a].active)
            renderCrosshair();
    }

    if(gameInProgress)
        window.requestAnimationFrame(astro);
}