const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1300;
canvas.height = 626.5;
let ballX = 100;
let ballY = 380; // Adjusted initial Y position to move the monkey up
let velocityY = 0;
let gravity = 0.5;
let isJumping = false;
let paused = false;

let obstacles = [
    { x: 500, speed: 1.4 },
    { x: 800, speed: 1.4 },
    { x: 1200, speed: 1.4 },
    { x: 2000, speed: 1.4 }
];

let questionData = null;
let backgroundOffset = 0; // Background movement
const backgroundSpeed = 0.5; // Same speed as obstacles

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameOver = false;

const questionContainer = document.getElementById("questionContainer");
const questionImg = document.getElementById("questionImg");
const answerInput = document.getElementById("answerInput");
const submitAnswer = document.getElementById("submitAnswer");
const feedback = document.getElementById("feedback");
// Load the jump sound
const jumpSound = new Audio("music/jump.wav");
const gameOverSound = new Audio("music/gameover.wav");


gameOverSound.play();


document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && !isJumping && !gameOver) {
        velocityY = -14; // Increased for a better jump height
        isJumping = true;
        jumpSound.play(); // Play the jump sound
    }
});


submitAnswer.disabled = true; // Disable the submit button initially

// API Integration for fetching questions
async function fetchQuestion() {
    try {
        const response = await fetch("https://marcconrad.com/uob/banana/api.php?out=json");
        questionData = await response.json();
        console.log("Question Data:", questionData); // Debugging
        submitAnswer.disabled = false; // Enable the submit button for the new question
    } catch (error) {
        console.error("Error fetching question:", error);
    }
}

setInterval(() => {
    if (!gameOver) {
        score += 1;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
        }
    }
}, 500);

document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && !isJumping && !gameOver) {
        velocityY = -14; // Increased for a better jump height
        isJumping = true;
    }
});

function applyPhysics() {
    if (isJumping) {
        velocityY += gravity * 0.8; // Reduce gravity's effect while going up
    } else {
        velocityY += gravity; // Normal gravity effect on descent
    }

    ballY += velocityY;

    // Limit jump height
    if (ballY < 100) { // Adjusted to account for the higher starting position
        ballY = 100;
        velocityY = 0; // Stop excessive upward movement
    }

    // Stop the jump when reaching the ground
    if (ballY >= 380) { // Adjusted ground level to match the new starting position
        ballY = 380;
        isJumping = false;
        velocityY = 0;
    }
}

function checkCollision() {
    for (let obstacle of obstacles) {
        if (ballX + 15 > obstacle.x && ballX - 19 < obstacle.x + 30 &&
            ballY + 15 > 420 - 30 && ballY - 19 < 400) { // Adjusted collision detection for new Y position
            paused = true;
            gameOverSound.currentTime = 0; // Reset sound to allow replay
            gameOverSound.play(); // Play the game over sound
            showQuestion();
            return true;
        }
    }
    return false;
}


function showQuestion() {
    if (questionData) {
        questionImg.src = questionData.question;
        questionContainer.style.display = "block";
        submitAnswer.disabled = false; // Enable the submit button
    } else {
        console.error("No question data available.");
    }
}

submitAnswer.addEventListener("click", () => {
    if (!questionData) {
        feedback.textContent = "Question not loaded yet. Please wait.";
        return;
    }

    const userAnswer = answerInput.value.trim();
    const correctAnswer = String(questionData.solution).toLowerCase();

    if (userAnswer.toLowerCase() === correctAnswer) {
        feedback.textContent = `Correct! The answer is ${questionData.solution}. Resuming game...`;
        submitAnswer.disabled = true; // Disable the submit button after submission
        setTimeout(() => {
            questionContainer.style.display = "none";
            paused = false;
            answerInput.value = "";
            feedback.textContent = "";
            requestAnimationFrame(drawScene);
        }, 1000); // 1-second delay before resuming
    } else {
        feedback.textContent = "Answer is Wrong! Try Again.";
        submitAnswer.disabled = true; // Disable the submit button after submission
    }
});

function updateBackground() {
    backgroundOffset += backgroundSpeed; // Move background rightward
    if (backgroundOffset >= canvas.width) {
        backgroundOffset = 0; // Reset background for looping effect
    }
}

function drawBackground() {
    ctx.fillStyle = "lightgreen";
    ctx.fillRect(-backgroundOffset, 450, canvas.width, 200);
    ctx.fillRect(canvas.width - backgroundOffset, 450, canvas.width, 200);

    ctx.fillStyle = "brown";
    ctx.fillRect(-backgroundOffset, 450, canvas.width, 20);
    ctx.fillRect(canvas.width - backgroundOffset, 450, canvas.width, 20);
}

let frame = 0; // Animation frame counter
const animationSpeed = 5; // Speed of animation (lower is faster)

function drawMonkey() {
    // Draw the head with a gradient for fur texture
    const headGradient = ctx.createRadialGradient(ballX, ballY, 0, ballX, ballY, 15);
    headGradient.addColorStop(0, "#8B4513"); // Dark brown for shading
    headGradient.addColorStop(1, "#A0522D"); // Light brown for highlights
    ctx.beginPath();
    ctx.arc(ballX, ballY, 15, 0, Math.PI * 2);
    ctx.fillStyle = headGradient;
    ctx.fill();
    ctx.closePath();

    // Draw the ears with fur texture
    ctx.beginPath();
    ctx.arc(ballX - 20, ballY - 10, 8, 0, Math.PI * 2);
    ctx.arc(ballX + 20, ballY - 10, 8, 0, Math.PI * 2);
    ctx.fillStyle = headGradient;
    ctx.fill();
    ctx.closePath();

    // Draw the eyes with more detail
    ctx.beginPath();
    ctx.arc(ballX - 8, ballY - 5, 4, 0, Math.PI * 2);
    ctx.arc(ballX + 8, ballY - 5, 4, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();

    // Draw the pupils with a highlight
    ctx.beginPath();
    ctx.arc(ballX - 8, ballY - 5, 2, 0, Math.PI * 2);
    ctx.arc(ballX + 8, ballY - 5, 2, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(ballX - 6, ballY - 6, 1, 0, Math.PI * 2); // Highlight
    ctx.arc(ballX + 10, ballY - 6, 1, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();

    // Draw the nose
    ctx.beginPath();
    ctx.arc(ballX, ballY + 5, 4, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();

    // Draw the mouth
    ctx.beginPath();
    ctx.arc(ballX, ballY + 10, 6, 0, Math.PI, false);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // Draw the body with a gradient for fur texture
    const bodyGradient = ctx.createLinearGradient(ballX, ballY + 20, ballX, ballY + 80);
    bodyGradient.addColorStop(0, "#8B4513"); // Dark brown
    bodyGradient.addColorStop(1, "#A0522D"); // Light brown
    ctx.beginPath();
    ctx.ellipse(ballX, ballY + 36, 15, 25, 0, 0, Math.PI * 2); // More proportional body
    ctx.fillStyle = bodyGradient;
    ctx.fill();
    ctx.closePath();

    // Animate the arms and legs
    const armSwing = Math.sin(frame / animationSpeed) * 10; // Swing arms back and forth
    const legSwing = Math.cos(frame / animationSpeed) * 10; // Swing legs back and forth

    // Draw the arms with animation
    ctx.beginPath();
    ctx.moveTo(ballX - 15, ballY + 20);
    ctx.quadraticCurveTo(ballX - 30 - armSwing, ballY + 30, ballX - 30 - armSwing, ballY + 10); // Left arm
    ctx.moveTo(ballX + 15, ballY + 20);
    ctx.quadraticCurveTo(ballX + 30 + armSwing, ballY + 30, ballX + 30 + armSwing, ballY + 10); // Right arm
    ctx.strokeStyle = "brown";
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.closePath();

    // Draw the legs with animation
    ctx.beginPath();
    ctx.moveTo(ballX - 8, ballY + 50);
    ctx.quadraticCurveTo(ballX - 15 - legSwing, ballY + 70, ballX - 15 - legSwing, ballY + 80); // Left leg
    ctx.moveTo(ballX + 8, ballY + 50);
    ctx.quadraticCurveTo(ballX + 15 + legSwing, ballY + 70, ballX + 15 + legSwing, ballY + 80); // Right leg
    ctx.strokeStyle = "brown";
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.closePath();

    // Draw the tail with a dynamic curve
    ctx.beginPath();
    ctx.moveTo(ballX + 15, ballY + 30);
    ctx.quadraticCurveTo(ballX + 40, ballY + 50, ballX + 30, ballY + 90); // More dynamic tail
    ctx.strokeStyle = "brown";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.closePath();

    // Increment the animation frame
    frame++;
}

function drawObstacle(x) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(x, 450);  // Move obstacle to ground level
    ctx.lineTo(x + 15, 427);
    ctx.lineTo(x + 30, 450);
    ctx.closePath();
    ctx.fill();
}

function updateObstacles() {
    if (!paused) {
        obstacles.forEach(obstacle => {
            obstacle.x -= obstacle.speed;
            if (obstacle.x < -30) {
                obstacle.x = canvas.width + Math.random() * 200;
            }
        });
    }
}

function drawScore() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, 20, 40);
    ctx.fillText("High Score: " + highScore, 20, 80);
}

function drawGameOver() {
    ctx.font = "50px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("Game Over", canvas.width / 2 - 150, canvas.height / 2);
    ctx.font = "30px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Press F5 to Restart", canvas.width / 2 - 130, canvas.height / 2 + 50);
}

function drawCloud(x, y) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 20, y - 10, 25, 0, Math.PI * 2);
    ctx.arc(x + 40, y, 20, 0, Math.PI * 2);
    ctx.fill();
}

function drawTrees() {
    function drawTree(x, trunkHeight, leavesRadius) {
        ctx.fillStyle = "brown";
        ctx.fillRect(x + backgroundOffset, 450 - trunkHeight, 25, trunkHeight);
        ctx.fillStyle = "darkgreen";
        ctx.beginPath();
        ctx.arc(x + backgroundOffset + 12, 450 - trunkHeight - 30, leavesRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Add more trees at various locations
    drawTree(100, 80, 40);
    drawTree(300, 100, 45);
    drawTree(500, 90, 50);
    drawTree(700, 110, 48);
    drawTree(900, 80, 35);
    drawTree(1100, 120, 55);
    drawTree(1300, 95, 42);
    drawTree(1500, 105, 45);
    drawTree(1700, 85, 40);
}

function drawClouds() {
    drawCloud(100 + backgroundOffset * 0.5, 100);
    drawCloud(300 + backgroundOffset * 0.4, 150);
    drawCloud(500 + backgroundOffset * 0.6, 120);
    drawCloud(700 + backgroundOffset * 0.5, 80);
    drawCloud(900 + backgroundOffset * 0.7, 110);
    drawCloud(1100 + backgroundOffset * 0.3, 130);
    drawCloud(1300 + backgroundOffset * 0.5, 90);
    drawCloud(1500 + backgroundOffset * 0.4, 140);
    drawCloud(1700 + backgroundOffset * 0.6, 100);
}

function drawScene() {
    if (gameOver || paused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateBackground();
    drawBackground();
    drawClouds();
    drawTrees();
    drawMonkey();  // Draw the animated monkey
    obstacles.forEach(obstacle => drawObstacle(obstacle.x));
    updateObstacles();
    drawScore();
    applyPhysics();

    if (checkCollision()) return;

    requestAnimationFrame(drawScene);
}

drawScene();

// Fetch a question at game start
fetchQuestion().then(() => drawScene());