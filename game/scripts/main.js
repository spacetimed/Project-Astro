var canvas;
var ctx;
var initialized = false;
var currentFrameTime = 0;
var lastFrameTimestamp = 0;

const GAME_WIDTH = 900;
const GAME_HEIGHT = 600;
const SPEED = 500; //Pixels per Second (px/s) -- (will accomodate for differing frametimes [ms])
const imagePath = 'images/';

var movement = {};
movement.move_posY = false;
movement.move_negY = false;
movement.move_posX = false;
movement.move_negX = false;

var player = {};
player.x_size = 30;
player.y_size = 30;

var crosshair = {};

var resources = {};
resources.crosshair = imagePath + 'crosshair.png';
resources.container = {};
resources.ability1 = {};
resources.ability2 = {};
resources.hud = {};

window.addEventListener('DOMContentLoaded', (event) => {
    astro();
});

function logger(message)
{
    console.log("%c[Astro-Log] %c" + message, "color:red;", "");
}

function welcomeToAstro()
{
    console.log("%cProject-Astro", "color:purple;font-family:'Courier New';font-size:24px;font-weight:700;");
    logger("Initialization Complete");
}

function isValidBoundary(direction)
{
    if( (direction == 'moveUp') && (player.y > player.y_size) )
    {
        return true;
    }

    if( (direction == 'moveDown') && (player.y < GAME_HEIGHT) )
    {
        return true;
    }

    if( (direction == 'moveRight') && (player.x < GAME_WIDTH) )
    {
        return true;
    }

    if( (direction == 'moveLeft') && (player.x > player.x_size) )
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

function renderPlayer()
{
    ctx.fillStyle = 'white'; 
    ctx.fillRect(player.x - player.x_size, player.y - player.y_size, player.x_size, player.y_size); 
    return;
}

function renderCrosshair()
{
    if(crosshair.constructor.name == 'HTMLImageElement')
    {
        ctx.drawImage(crosshair, 10, 10);
        return true;
    }
    return false;
}

function boot()
{
    player.x = GAME_WIDTH / 4;
    player.y = GAME_HEIGHT / 2;
    crosshair = new Image();
    crosshair.src = resources.crosshair;
    crosshair.addEventListener('load', function() {
        renderCrosshair();
    }, false);
    
    resources.container = document.getElementsByClassName('astroContainer')[0];
    resources.hud = document.createElement('div');
    resources.ability1 = document.createElement('div');
    resources.ability2 = document.createElement('div');
    
    resources.hud.className = 'astroHud';
    resources.ability1.className = 'astroAbility';
    resources.ability2.className = 'astroAbility';
    
    resources.hud.append(resources.ability1);
    resources.hud.append(resources.ability2);
    resources.container.prepend(resources.hud);

    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
    
    initialized = true;
    welcomeToAstro();
}

function astro(timestamp)
{ 
    timestamp = timestamp || 0;
    currentFrameTime = (timestamp - lastFrameTimestamp); // avg ~0.069 @ 144hz
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
    renderCrosshair();
}