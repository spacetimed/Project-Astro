var canvas;
var ctx;
var initialized = false;
var movement = {};
var player = {};

movement.move_posY = false;
movement.move_negY = false;
movement.move_posX = false;
movement.move_negX = false;

const GAME_WIDTH = 900;
const GAME_HEIGHT = 600;
const SPEED = 100; //Pixels per Second (will accomodate for differing frametimes [ms])
player.x_size = 30;
player.y_size = 30;

window.addEventListener('DOMContentLoaded', (event) => {
    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
    astro();
});

var first = true;
var startTime = 0;
var end = false;
var startDistance = 0;

function isValidBoundary(direction)
{
    if( (direction == 'moveUp') && (player.y > player.y_size) )
    {
        if(end)
            return;
        if(first)
        {
            startDistance = player.y;
            startTime = Date.now();
            console.log("Started");
            first = false;
        }
        const secondsPassed = (Date.now() - startTime) / 1000;
        if(secondsPassed >= 1)
        {
            end = true;
            const distanceTrav = player.y - startDistance;
            console.log("Seconds Passed\t" + secondsPassed);
            console.log("Distance (px)\t" + distanceTrav.toFixed(3));
            console.log("Frametime (ms)\t" + currentFrameTime);
        }
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

    console.log("Bad movement");
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
}

var currentFrameTime = 0;
var lastFrameTimestamp = 0;

function astro(timestamp)
{ 
    timestamp = timestamp || 0;
    currentFrameTime = (timestamp - lastFrameTimestamp); // avg ~0.069
    lastFrameTimestamp = timestamp;

    canvas = document.getElementById('gameContainer');
    ctx = canvas.getContext('2d');
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    if(!initialized)
    {
        player.x = GAME_WIDTH / 4;
        player.y = GAME_HEIGHT / 2;
        initialized = true;
    }
    
    handleMovement();
    renderPlayer();

    window.requestAnimationFrame(astro);
}

//With a frametime of 6.9ms, (0.069 s)
//to move 10px per sec?
//How much should you move in a given frame to move 10 pixels in 1 second?
// X = 10*0.069 <--- Move this amount in each frame.
//         ^ currentFrameTime

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


}

function renderPlayer()
{
    ctx.fillStyle = 'white'; 
    ctx.fillRect(player.x - player.x_size, player.y - player.y_size, player.x_size, player.y_size); 
}