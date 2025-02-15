const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game variables
let monkey = { x: 50, y: 250, width: 50, height: 50, velocityY: 0, jumping: false };
let bananas = [];
let obstacles = [];
let gravity = 0.5;
let score = 0;
let gameRunning = true;

// Event-driven programming: Handle key press for jumping
document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && !monkey.jumping) {
        monkey.velocityY = -10;
        monkey.jumping = true;
    }
});

// Function to update game objects
function update() {
    if (!gameRunning) return;

    // Apply gravity
    monkey.velocityY += gravity;
    monkey.y += monkey.velocityY;

    // Prevent monkey from falling off
    if (monkey.y > 250) {
        monkey.y = 250;
        monkey.jumping = false;
    }

    // Move bananas and obstacles
    bananas.forEach((banana, index) => {
        banana.x -= 5;
        if (banana.x < 0) bananas.splice(index, 1);
    });

    obstacles.forEach((obstacle, index) => {
        obstacle.x -= 5;
        if (obstacle.x < 0) obstacles.splice(index, 1);
    });

    // Collision detection
    obstacles.forEach(obstacle => {
        if (monkey.x < obstacle.x + obstacle.width &&
            monkey.x + monkey.width > obstacle.x &&
            monkey.y < obstacle.y + obstacle.height &&
            monkey.y + monkey.height > obstacle.y) {
            triggerBananaAPI();
        }
    });
}

// Function to draw game objects
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw monkey
    ctx.fillStyle = "brown";
    ctx.fillRect(monkey.x, monkey.y, monkey.width, monkey.height);
    
    // Draw bananas
    ctx.fillStyle = "yellow";
    bananas.forEach(banana => ctx.fillRect(banana.x, banana.y, banana.width, banana.height));
    
    // Draw obstacles
    ctx.fillStyle = "black";
    obstacles.forEach(obstacle => ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height));
    
    // Draw score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);
}

// Function to spawn bananas and obstacles
function spawnObjects() {
    if (Math.random() < 0.1) {
        bananas.push({ x: canvas.width, y: 250, width: 20, height: 20 });
    }
    if (Math.random() < 0.05) {
        obstacles.push({ x: canvas.width, y: 260, width: 30, height: 30 });
    }
}

// Function to trigger Banana API
function triggerBananaAPI() {
    gameRunning = false;
    alert("Game Over! Redirecting to Banana API...");
    window.location.href = "https://bananaapi.com/game"; // Replace with actual API link
}

// Game loop function
function gameLoop() {
    update();
    draw();
    spawnObjects();
    if (gameRunning) requestAnimationFrame(gameLoop);
}

gameLoop();
