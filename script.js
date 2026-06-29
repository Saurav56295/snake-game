// ==========================================
// SNAKE GAME
// Part 1 - Variables & Initialization
// ==========================================

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// UI
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const restartBtn = document.getElementById("restartBtn");

// Settings
const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettings = document.getElementById("closeSettings");

const soundToggle = document.getElementById("soundToggle");
const speedBlocks = document.querySelectorAll(".speed-block");
const speedText = document.getElementById("speedText");

// Mobile Buttons
const upBtn = document.getElementById("up");
const downBtn = document.getElementById("down");
const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");

// ==========================================
// GAME CONSTANTS
// ==========================================

const box = 20;

const rows = canvas.width / box;
const cols = canvas.height / box;

// ==========================================
// GAME VARIABLES
// ==========================================

let snake = [
    {
        x: 10 * box,
        y: 10 * box
    }
];

let direction = "RIGHT";

let score = 0;

let highScore = Number(
    localStorage.getItem("snakeHighScore")
) || 0;

highScoreElement.textContent = highScore;

// ==========================================
// FOOD
// ==========================================

let food = null;

let bonusFood = null;

let bonusFoodVisible = false;

let bonusTimer = null;

let redFoodCount = 0;

// ==========================================
// GAME LOOP
// ==========================================

let gameLoop = null;

let paused = false;

// ==========================================
// SOUND
// ==========================================

let soundEnabled =
    localStorage.getItem("snakeSound") !== "false";

soundToggle.checked = soundEnabled;

// ==========================================
// SPEED
// ==========================================

let speedLevel =
    Number(localStorage.getItem("snakeSpeed")) || 5;

const speedMap = {

    1:220,
    2:200,
    3:180,
    4:160,
    5:140,
    6:120,
    7:100,
    8:90,
    9:80,
    10:70

};

const speedNames = {

    1:"Very Easy",
    2:"Easy",
    3:"Easy+",
    4:"Normal",
    5:"Medium",
    6:"Fast",
    7:"Hard",
    8:"Expert",
    9:"Insane",
    10:"Impossible"

};

speedText.textContent = speedNames[speedLevel];

// ==========================================
// UPDATE SPEED BLOCKS
// ==========================================

function updateSpeedBlocks(){

    speedBlocks.forEach((block,index)=>{

        if(index < speedLevel){

            block.classList.add("active");

        }

        else{

            block.classList.remove("active");

        }

    });

}

updateSpeedBlocks();


// ==========================================
// PART 2
// Food Generation & Drawing
// ==========================================

// ------------------------------------------
// Generate Food
// ------------------------------------------

function generateFood() {

    while (true) {

        let newFood = {

            x: Math.floor(Math.random() * cols) * box,

            y: Math.floor(Math.random() * rows) * box

        };

        let collision = false;

        for (let part of snake) {

            if (
                part.x === newFood.x &&
                part.y === newFood.y
            ) {

                collision = true;
                break;

            }

        }

        if (!collision)
            return newFood;

    }

}

// First Food

food = generateFood();

// ------------------------------------------
// Generate Bonus Food
// ------------------------------------------

function generateBonusFood() {

    bonusFood = generateFood();

    bonusFoodVisible = true;

    clearTimeout(bonusTimer);

    bonusTimer = setTimeout(() => {

        bonusFoodVisible = false;

        bonusFood = null;

    }, 5000);

}

// ==========================================
// Draw Red Food
// ==========================================

function drawFood() {

    ctx.beginPath();

    ctx.fillStyle = "red";

    ctx.arc(

        food.x + box / 2,

        food.y + box / 2,

        box / 2.6,

        0,

        Math.PI * 2

    );

    ctx.fill();

}

// ==========================================
// Draw Bonus Food
// ==========================================

function drawBonusFood() {

    if (!bonusFoodVisible)
        return;

    // Glow

    ctx.shadowColor = "#00BFFF";

    ctx.shadowBlur = 20;

    ctx.beginPath();

    ctx.fillStyle = "#00BFFF";

    ctx.arc(

        bonusFood.x + box / 2,

        bonusFood.y + box / 2,

        box / 2.4,

        0,

        Math.PI * 2

    );

    ctx.fill();

    ctx.shadowBlur = 0;

}

// ==========================================
// Draw Snake
// ==========================================

function drawSnake() {

    snake.forEach((segment, index) => {

        if (index === 0) {

            // Snake Head

            ctx.fillStyle = "#00FF66";

        }

        else {

            // Body

            ctx.fillStyle = "#00CC55";

        }

        ctx.fillRect(

            segment.x,

            segment.y,

            box,

            box

        );

        // Border

        ctx.strokeStyle = "#111";

        ctx.strokeRect(

            segment.x,

            segment.y,

            box,

            box

        );

    });

}

// ==========================================
// Draw Whole Game
// ==========================================

function drawScene() {

    ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

    );

    drawFood();

    drawBonusFood();

    drawSnake();

}

// ==========================================
// PART 3
// Snake Movement & Game Logic
// ==========================================

function moveSnake() {

    let headX = snake[0].x;
    let headY = snake[0].y;

    // -------------------------
    // Move
    // -------------------------

    switch(direction){

        case "UP":
            headY -= box;
            break;

        case "DOWN":
            headY += box;
            break;

        case "LEFT":
            headX -= box;
            break;

        case "RIGHT":
            headX += box;
            break;

    }

    // -------------------------
    // Wrap Around Walls
    // -------------------------

    if(headX >= canvas.width)
        headX = 0;

    if(headX < 0)
        headX = canvas.width - box;

    if(headY >= canvas.height)
        headY = 0;

    if(headY < 0)
        headY = canvas.height - box;

    const newHead = {

        x: headX,

        y: headY

    };

    // -------------------------
    // Self Collision
    // -------------------------

    for(let i=0;i<snake.length;i++){

        if(

            snake[i].x === newHead.x &&

            snake[i].y === newHead.y

        ){

            gameOver();

            return;

        }

    }

    // Add Head

    snake.unshift(newHead);

    // -------------------------
    // RED FOOD
    // -------------------------

    if(

        newHead.x === food.x &&

        newHead.y === food.y

    ){

        score++;

        redFoodCount++;

        scoreElement.textContent = score;

        food = generateFood();

        // Every 5 red foods

        if(

            redFoodCount % 5 === 0 &&

            !bonusFoodVisible

        ){

            generateBonusFood();

        }

    }

    // -------------------------
    // BONUS FOOD
    // -------------------------

    else if(

        bonusFoodVisible &&

        newHead.x === bonusFood.x &&

        newHead.y === bonusFood.y

    ){

        score += 5;

        scoreElement.textContent = score;

        bonusFoodVisible = false;

        bonusFood = null;

        clearTimeout(bonusTimer);

    }

    // -------------------------
    // Nothing Eaten
    // -------------------------

    else{

        snake.pop();

    }

    // -------------------------
    // High Score
    // -------------------------

    if(score > highScore){

        highScore = score;

        highScoreElement.textContent = highScore;

        localStorage.setItem(

            "snakeHighScore",

            highScore

        );

    }

}

// ==========================================
// Draw Entire Game
// ==========================================

function drawGame(){

    moveSnake();

    drawScene();

}


// ==========================================
// PART 4
// Controls & Restart
// ==========================================

// ------------------------------------------
// Keyboard Controls
// ------------------------------------------

document.addEventListener("keydown", function(e){

    switch(e.key){

        case "ArrowUp":

            if(direction !== "DOWN")
                direction = "UP";

            break;

        case "ArrowDown":

            if(direction !== "UP")
                direction = "DOWN";

            break;

        case "ArrowLeft":

            if(direction !== "RIGHT")
                direction = "LEFT";

            break;

        case "ArrowRight":

            if(direction !== "LEFT")
                direction = "RIGHT";

            break;

        case " ":

            e.preventDefault();

            togglePause();

            break;

    }

});

// ------------------------------------------
// Mobile Buttons
// ------------------------------------------

upBtn.onclick = ()=>{

    if(direction !== "DOWN")
        direction = "UP";

};

downBtn.onclick = ()=>{

    if(direction !== "UP")
        direction = "DOWN";

};

leftBtn.onclick = ()=>{

    if(direction !== "RIGHT")
        direction = "LEFT";

};

rightBtn.onclick = ()=>{

    if(direction !== "LEFT")
        direction = "RIGHT";

};

// ------------------------------------------
// Pause
// ------------------------------------------

function togglePause(){

    if(paused){

        gameLoop = setInterval(

            drawGame,

            speedMap[speedLevel]

        );

        paused = false;

    }

    else{

        clearInterval(gameLoop);

        paused = true;

    }

}

// ------------------------------------------
// Restart Game
// ------------------------------------------

function restartGame(){

    clearInterval(gameLoop);

    snake = [

        {

            x:10 * box,

            y:10 * box

        }

    ];

    direction = "RIGHT";

    score = 0;

    redFoodCount = 0;

    scoreElement.textContent = score;

    bonusFood = null;

    bonusFoodVisible = false;

    clearTimeout(bonusTimer);

    food = generateFood();

    paused = false;

    gameLoop = setInterval(

        drawGame,

        speedMap[speedLevel]

    );

}

// Restart Button

restartBtn.addEventListener(

    "click",

    restartGame

);

// ------------------------------------------
// Game Over
// ------------------------------------------

function gameOver(){

    clearInterval(gameLoop);

    alert(

        "🐍 GAME OVER\n\n" +

        "Score : " + score +

        "\nHigh Score : " + highScore

    );

}

// ==========================================
// PART 5
// SETTINGS
// ==========================================

// ------------------------------------------
// Open Settings
// ------------------------------------------

settingsBtn.addEventListener("click", () => {

    settingsPanel.classList.add("active");

});

// ------------------------------------------
// Close Settings
// ------------------------------------------

closeSettings.addEventListener("click", () => {

    settingsPanel.classList.remove("active");

});

// Click outside the box to close

settingsPanel.addEventListener("click", (e) => {

    if (e.target === settingsPanel) {

        settingsPanel.classList.remove("active");

    }

});

// ------------------------------------------
// Speed Block UI
// ------------------------------------------

function updateSpeedBlocks() {

    speedBlocks.forEach((block, index) => {

        if (index < speedLevel) {

            block.classList.add("active");

        }

        else {

            block.classList.remove("active");

        }

    });

    speedText.textContent = speedNames[speedLevel];

}

updateSpeedBlocks();

// ------------------------------------------
// Speed Block Click
// ------------------------------------------

speedBlocks.forEach((block) => {

    block.addEventListener("click", () => {

        speedLevel = Number(block.dataset.speed);

        localStorage.setItem(
            "snakeSpeed",
            speedLevel
        );

        updateSpeedBlocks();

        // Change speed immediately

        if (!paused) {

            clearInterval(gameLoop);

            gameLoop = setInterval(

                drawGame,

                speedMap[speedLevel]

            );

        }

    });

});

// ------------------------------------------
// Sound Toggle
// ------------------------------------------

soundToggle.addEventListener("change", () => {

    soundEnabled = soundToggle.checked;

    localStorage.setItem(

        "snakeSound",

        soundEnabled

    );

});

// ------------------------------------------
// ESC Key Closes Settings
// ------------------------------------------

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        settingsPanel.classList.remove("active");

    }

});


// ==========================================
// PART 6
// Game Initialization
// ==========================================

// ------------------------------------------
// Start Game
// ------------------------------------------

function startGame() {

    clearInterval(gameLoop);

    gameLoop = setInterval(

        drawGame,

        speedMap[speedLevel]

    );

}

// ------------------------------------------
// Initialize Game
// ------------------------------------------

function initializeGame() {

    // Load Saved Speed

    speedLevel = Number(

        localStorage.getItem("snakeSpeed")

    ) || 5;

    // Load Sound

    soundEnabled =

        localStorage.getItem("snakeSound") !== "false";

    soundToggle.checked = soundEnabled;

    // Load High Score

    highScore = Number(

        localStorage.getItem("snakeHighScore")

    ) || 0;

    highScoreElement.textContent = highScore;

    // Update Speed UI

    updateSpeedBlocks();

    speedText.textContent = speedNames[speedLevel];

    // Generate Food

    food = generateFood();

    bonusFood = null;

    bonusFoodVisible = false;

    score = 0;

    scoreElement.textContent = score;


    startGame();

}

window.onload = function(){

    initializeGame();

};

