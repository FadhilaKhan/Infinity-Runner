<?php
session_start(); // Start the session to access user data
include('db_connection.php'); // Include your database connection

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Ensure the user is logged in
    if (!isset($_SESSION["user_id"])) {
        echo json_encode(["success" => false, "message" => "User not authenticated."]);
        exit;
    }

    // Get and validate the score values
    $score = isset($_POST['score']) ? intval($_POST['score']) : 0;
    $high_score = isset($_POST['high_score']) ? intval($_POST['high_score']) : 0;
    $user_id = $_SESSION["user_id"];

    // Insert a new score record for the user
    $sql = "INSERT INTO score (user_id, score, high_score) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "Prepare failed: " . $conn->error]);
        exit;
    }

    $stmt->bind_param("iii", $user_id, $score, $high_score);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Score saved successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error saving score: " . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}

$conn->close();