// ==========================================
// SNAKE GAME
// Part 1 - Variables & Initialization
// ==========================================

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Score
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");

// Settings
const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettings = document.getElementById("closeSettings");

const soundToggle = document.getElementById("soundToggle");
const speedBlocks = document.querySelectorAll(".speed-block");
const speedText = document.getElementById("speedText");

// Mobile Controls
const upBtn = document.getElementById("up");
const downBtn = document.getElementById("down");
const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");

// ==========================================
// GAME CONSTANTS
// ==========================================

const box = 20;

const rows = canvas.height / box;
const cols = canvas.width / box;

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

let highScore =
    Number(localStorage.getItem("snakeHighScore")) || 0;

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

    1: 220,
    2: 200,
    3: 180,
    4: 160,
    5: 140,
    6: 120,
    7: 100,
    8: 90,
    9: 80,
    10: 70

};

const speedNames = {

    1: "Very Easy",
    2: "Easy",
    3: "Easy+",
    4: "Normal",
    5: "Medium",
    6: "Fast",
    7: "Hard",
    8: "Expert",
    9: "Insane",
    10: "Impossible"

};

// ==========================================
// Update Speed Blocks
// ==========================================

function updateSpeedBlocks() {

    speedBlocks.forEach((block, index) => {

        if (index < speedLevel) {

            block.classList.add("active");

        } else {

            block.classList.remove("active");

        }

    });

    speedText.textContent = speedNames[speedLevel];

}

// ==========================================
// PART 2
// Food Generation & Drawing
// ==========================================

// ------------------------------------------
// Generate Food
// ------------------------------------------

function generateFood() {

    while (true) {

        const newFood = {

            x: Math.floor(Math.random() * cols) * box,

            y: Math.floor(Math.random() * rows) * box

        };

        let collision = false;

        // Check snake collision
        for (const part of snake) {

            if (part.x === newFood.x && part.y === newFood.y) {

                collision = true;
                break;

            }

        }

        // Check bonus food collision
        if (
            bonusFoodVisible &&
            bonusFood &&
            bonusFood.x === newFood.x &&
            bonusFood.y === newFood.y
        ) {

            collision = true;

        }

        if (!collision) {

            return newFood;

        }

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

    if (!bonusFoodVisible || !bonusFood)
        return;

    ctx.save();

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

    ctx.restore();

}

// ==========================================
// Draw Snake
// ==========================================

function drawSnake() {

    snake.forEach((segment, index) => {

        // Head
        if (index === 0) {

            ctx.fillStyle = "#00FF66";

        }

        // Body
        else {

            ctx.fillStyle = "#00CC55";

        }

        ctx.fillRect(

            segment.x,

            segment.y,

            box,

            box

        );

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
// Draw Scene
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
    // Move Snake
    // -------------------------

    switch (direction) {

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

    if (headX >= canvas.width)
        headX = 0;

    if (headX < 0)
        headX = canvas.width - box;

    if (headY >= canvas.height)
        headY = 0;

    if (headY < 0)
        headY = canvas.height - box;

    const newHead = {

        x: headX,
        y: headY

    };

    // -------------------------
    // Self Collision
    // -------------------------

    for (let i = 1; i < snake.length; i++) {

        if (

            snake[i].x === newHead.x &&
            snake[i].y === newHead.y

        ) {

            gameOver();
            return;

        }

    }

    // Add New Head

    snake.unshift(newHead);

    // -------------------------
    // Red Food
    // -------------------------

    if (

        newHead.x === food.x &&
        newHead.y === food.y

    ) {

        score++;

        redFoodCount++;

        scoreElement.textContent = score;

        food = generateFood();

        // Every 5 foods create bonus

        if (

            redFoodCount % 5 === 0 &&
            !bonusFoodVisible

        ) {

            generateBonusFood();

        }

    }

    // -------------------------
    // Bonus Food
    // -------------------------

    else if (

        bonusFoodVisible &&
        bonusFood &&
        newHead.x === bonusFood.x &&
        newHead.y === bonusFood.y

    ) {

        score += 5;

        scoreElement.textContent = score;

        bonusFoodVisible = false;

        bonusFood = null;

        clearTimeout(bonusTimer);

    }

    // -------------------------
    // Remove Tail
    // -------------------------

    else {

        snake.pop();

    }

    // -------------------------
    // High Score
    // -------------------------

    if (score > highScore) {

        highScore = score;

        highScoreElement.textContent = highScore;

        localStorage.setItem(

            "snakeHighScore",

            highScore

        );

    }

}

// ==========================================
// Draw Game
// ==========================================

function drawGame() {

    moveSnake();

    drawScene();

}

// ==========================================
// Restart Game
// ==========================================

function restartGame() {

    clearInterval(gameLoop);

    snake = [

        {

            x: 10 * box,
            y: 10 * box

        }

    ];

    direction = "RIGHT";

    score = 0;

    redFoodCount = 0;

    scoreElement.textContent = score;

    food = generateFood();

    bonusFood = null;

    bonusFoodVisible = false;

    clearTimeout(bonusTimer);

    paused = false;

    gameLoop = setInterval(

        drawGame,

        speedMap[speedLevel]

    );

}

// ==========================================
// Game Over
// ==========================================

function gameOver() {

    clearInterval(gameLoop);

    alert(

        "💀 GAME OVER!\n\n" +

        "Score : " + score +

        "\nHigh Score : " + highScore +

        "\n\nClick OK to Play Again."

    );

    // Restart automatically
    restartGame();

}


// ==========================================
// PART 4
// Controls & Pause
// ==========================================

// ------------------------------------------
// Keyboard Controls
// ------------------------------------------

document.addEventListener("keydown", function (e) {

    switch (e.key) {

        case "ArrowUp":

            if (direction !== "DOWN") {

                direction = "UP";

            }

            break;

        case "ArrowDown":

            if (direction !== "UP") {

                direction = "DOWN";

            }

            break;

        case "ArrowLeft":

            if (direction !== "RIGHT") {

                direction = "LEFT";

            }

            break;

        case "ArrowRight":

            if (direction !== "LEFT") {

                direction = "RIGHT";

            }

            break;

        // Pause / Resume
        case " ":

            e.preventDefault();

            togglePause();

            break;

    }

});

// ------------------------------------------
// Mobile Controls
// ------------------------------------------

upBtn.addEventListener("click", () => {

    if (direction !== "DOWN") {

        direction = "UP";

    }

});

downBtn.addEventListener("click", () => {

    if (direction !== "UP") {

        direction = "DOWN";

    }

});

leftBtn.addEventListener("click", () => {

    if (direction !== "RIGHT") {

        direction = "LEFT";

    }

});

rightBtn.addEventListener("click", () => {

    if (direction !== "LEFT") {

        direction = "RIGHT";

    }

});

// ------------------------------------------
// Pause / Resume
// ------------------------------------------

function togglePause() {

    if (paused) {

        gameLoop = setInterval(

            drawGame,

            speedMap[speedLevel]

        );

        paused = false;

    }

    else {

        clearInterval(gameLoop);

        paused = true;

    }

}

// ------------------------------------------
// Restart Game With Current Speed
// ------------------------------------------

function restartCurrentGameSpeed() {

    if (!paused) {

        clearInterval(gameLoop);

        gameLoop = setInterval(

            drawGame,

            speedMap[speedLevel]

        );

    }

}


// ==========================================
// PART 5
// Settings
// ==========================================

// ------------------------------------------
// Open Settings
// ------------------------------------------

settingsBtn.addEventListener("click", () => {

    settingsPanel.classList.add("active");

});

// ------------------------------------------
// Close Settings Button
// ------------------------------------------

closeSettings.addEventListener("click", () => {

    settingsPanel.classList.remove("active");

});

// ------------------------------------------
// Close When Clicking Outside
// ------------------------------------------

settingsPanel.addEventListener("click", (e) => {

    if (e.target === settingsPanel) {

        settingsPanel.classList.remove("active");

    }

});

// ------------------------------------------
// Close Using ESC Key
// ------------------------------------------

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        settingsPanel.classList.remove("active");

    }

});

// ------------------------------------------
// Update Speed Blocks
// ------------------------------------------

updateSpeedBlocks();

// ------------------------------------------
// Speed Selection
// ------------------------------------------

speedBlocks.forEach((block) => {

    block.addEventListener("click", () => {

        speedLevel = Number(block.dataset.speed);

        localStorage.setItem(
            "snakeSpeed",
            speedLevel
        );

        updateSpeedBlocks();

        // Change game speed immediately
        restartCurrentGameSpeed();

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

    // Load Saved Sound

    soundEnabled =

        localStorage.getItem("snakeSound") !== "false";

    soundToggle.checked = soundEnabled;

    // Load High Score

    highScore = Number(

        localStorage.getItem("snakeHighScore")

    ) || 0;

    highScoreElement.textContent = highScore;

    // Update Settings UI

    updateSpeedBlocks();

    // Reset Game Variables

    snake = [

        {

            x: 10 * box,

            y: 10 * box

        }

    ];

    direction = "RIGHT";

    score = 0;

    redFoodCount = 0;

    paused = false;

    scoreElement.textContent = score;

    // Food

    food = generateFood();

    bonusFood = null;

    bonusFoodVisible = false;

    clearTimeout(bonusTimer);

    // Draw Initial Scene

    drawScene();

    // Start Game

    startGame();

}

// ------------------------------------------
// Window Loaded
// ------------------------------------------

window.onload = () => {

    initializeGame();

};