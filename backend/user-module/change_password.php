<?php

session_start();

include("db.php");

if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

$user_id = $_SESSION['user_id'];

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $current_password = trim($_POST['current_password']);
    $new_password = trim($_POST['new_password']);
    $confirm_password = trim($_POST['confirm_password']);

    if (empty($current_password) || empty($new_password) || empty($confirm_password)) {
        die("All fields are required");
    }

    if ($new_password !== $confirm_password) {
        die("New passwords do not match");
    }

    $stmt = mysqli_prepare($conn, "SELECT password_hash FROM users WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $user = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);

    if (!$user) {
        die("User not found");
    }

    if (!password_verify($current_password, $user['password_hash'])) {
        die("Current password is incorrect");
    }

    $new_password_hash = password_hash($new_password, PASSWORD_DEFAULT);

    $update_stmt = mysqli_prepare($conn, "UPDATE users SET password_hash = ? WHERE id = ?");
    mysqli_stmt_bind_param($update_stmt, "si", $new_password_hash, $user_id);

    if (mysqli_stmt_execute($update_stmt)) {
        mysqli_stmt_close($update_stmt);
        if (isset($_SESSION['role']) && $_SESSION['role'] === "resident") {
            header("Location: resident_dashboard.php");
        } else {
            header("Location: dashboard.php");
        }
        exit();
    } else {
        $error = mysqli_stmt_error($update_stmt);
        mysqli_stmt_close($update_stmt);
        echo "Password update failed: " . $error;
    }
}

?>

<!DOCTYPE html>
<html>

<head>
    <title>Change Password</title>
</head>

<body>

    <h2>Change Password</h2>

    <form method="POST">

        <input type="password"
               name="current_password"
               placeholder="Current Password"
               required>

        <br><br>

        <input type="password"
               name="new_password"
               placeholder="New Password"
               required>

        <br><br>

        <input type="password"
               name="confirm_password"
               placeholder="Confirm New Password"
               required>

        <br><br>

        <button type="submit">
            Change Password
        </button>

    </form>

</body>

</html>