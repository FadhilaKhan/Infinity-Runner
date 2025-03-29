<?php
include('db_connection.php'); // Ensure your DB connection details are correct

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['user_id']) && isset($_POST['score'])) {
        $user_id = intval($_POST['user_id']);
        $score = intval($_POST['score']);

        // Check if a score record already exists for this user
        $checkSql = "SELECT * FROM score WHERE user_id = ?";
        $stmt = $conn->prepare($checkSql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            // Record exists; update it. Update high_score if the new score is higher.
            $row = $result->fetch_assoc();
            $existingHighScore = $row['high_score'];
            if ($score > $existingHighScore) {
                $updateSql = "UPDATE score SET score = ?, high_score = ? WHERE user_id = ?";
                $stmt = $conn->prepare($updateSql);
                $stmt->bind_param("iii", $score, $score, $user_id);
                if ($stmt->execute()) {
                    echo "New high score saved!";
                } else {
                    echo "Error updating score.";
                }
            } else {
                // Even if not a high score, update the current score
                $updateSql = "UPDATE score SET score = ? WHERE user_id = ?";
                $stmt = $conn->prepare($updateSql);
                $stmt->bind_param("ii", $score, $user_id);
                if ($stmt->execute()) {
                    echo "Score updated.";
                } else {
                    echo "Error updating score.";
                }
            }
        } else {
            // No record exists yet; insert a new one
            $insertSql = "INSERT INTO score (user_id, score, high_score) VALUES (?, ?, ?)";
            $stmt = $conn->prepare($insertSql);
            $stmt->bind_param("iii", $user_id, $score, $score);
            if ($stmt->execute()) {
                echo "Score saved successfully!";
            } else {
                echo "Error saving score.";
            }
        }
        $stmt->close();
    } else {
        echo "Missing user_id or score.";
    }
}
$conn->close();
