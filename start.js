document.getElementById('startButton').addEventListener('click', function() {
    // Hide the start button
    this.classList.add('hidden');
    
    // Show the account options
    document.getElementById('accountOptions').classList.remove('hidden');
});

document.getElementById('newUser').addEventListener('click', function() {
    // Redirect to signup.php
    window.location.href = 'signup.php';
});

document.getElementById('registeredUser').addEventListener('click', function() {
    // Redirect to login.php
    window.location.href = 'login.php';
});

