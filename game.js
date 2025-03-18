const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 580;
let ballX = 100;
let ballY = 380;
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

submitAnswer.disabled = true; // Disable the submit button initially

//API Integration for fetching questions
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
    if (ballY < 150) {
        ballY = 150;
        velocityY = 0; // Stop excessive upward movement
    }

    // Stop the jump when reaching the ground
    if (ballY >= 380) {
        ballY = 380;
        isJumping = false;
        velocityY = 0;
    }
}

function checkCollision() {
    for (let obstacle of obstacles) {
        if (ballX + 19 > obstacle.x && ballX - 19 < obstacle.x + 30 &&
            ballY + 19 > 375 && ballY - 19 < 400) {
                paused = true;
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
    ctx.fillRect(-backgroundOffset, 400, canvas.width, 180);
    ctx.fillRect(canvas.width - backgroundOffset, 400, canvas.width, 180);
    
    ctx.fillStyle = "brown";
    ctx.fillRect(-backgroundOffset, 400, canvas.width, 10);
    ctx.fillRect(canvas.width - backgroundOffset, 400, canvas.width, 10);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, 20, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
}

function drawObstacle(x) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(x, 400);
    ctx.lineTo(x + 15, 375);
    ctx.lineTo(x + 30, 400);
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
        ctx.fillRect(x + backgroundOffset, 400 - trunkHeight, 25, trunkHeight);
        ctx.fillStyle = "darkgreen";
        ctx.beginPath();
        ctx.arc(x + backgroundOffset + 12, 400 - trunkHeight - 20, leavesRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    drawTree(150, 80, 40);
    drawTree(600, 90, 45);
    drawTree(900, 70, 35);
}

function drawScene() {
    if (gameOver || paused) return; 

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateBackground();
    drawBackground();

    // Move clouds at a slower rate for a parallax effect
    drawCloud(100 + backgroundOffset * 0.5, 100);
    drawCloud(700 + backgroundOffset * 0.5, 80);
    drawCloud(300 + backgroundOffset * 0.5, 150);
    drawCloud(500 + backgroundOffset * 0.5, 120);

    drawTrees();
    drawBall();
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