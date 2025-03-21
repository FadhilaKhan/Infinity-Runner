const startButton = document.getElementById("startButton");
const signUpButton = document.getElementById("signUpButton");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const authContainer = document.getElementById("authContainer");

startButton.addEventListener("click", () => {
    // Check if the user is logged in
    const user = getCookie("username");
    if (user) {
        alert(`Welcome back, ${user}!`);
        window.location.href = "game.html"; // Redirect to the game page
    } else {
        authContainer.style.display = "block"; // Show login form if not logged in
    }
});

signUpButton.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username && password) {
        // Store user credentials in cookies
        setCookie("username", username, 7); // Username cookie for 7 days
        setCookie("password", password, 7); // Password cookie for 7 days

        alert(`Account created for ${username}!`);
        window.location.href = "game.html"; // Redirect to the game
    } else {
        alert("Please enter both a username and password.");
    }
});

// Helper functions for setting and getting cookies
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
