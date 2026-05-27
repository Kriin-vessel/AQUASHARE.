<?php

session_start();

include("db.php");

if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

$user_id = $_SESSION['user_id'];

$stmt = mysqli_prepare($conn, "SELECT full_name, phone, email, address, created_at FROM users WHERE id = ?");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (!$user) {
    die("User not found");
}

?>

<!DOCTYPE html>
<html>

<head>
    <title>User Profile</title>
</head>

<body>

    <h2>User Profile</h2>

    <p><strong>Full Name:</strong> <?php echo htmlspecialchars($user['full_name'], ENT_QUOTES, 'UTF-8'); ?></p>

    <p><strong>Phone:</strong> <?php echo htmlspecialchars($user['phone'], ENT_QUOTES, 'UTF-8'); ?></p>

    <p><strong>Email:</strong> <?php echo htmlspecialchars($user['email'], ENT_QUOTES, 'UTF-8'); ?></p>

    <p><strong>Address:</strong> <?php echo htmlspecialchars($user['address'], ENT_QUOTES, 'UTF-8'); ?></p>

    <p><strong>Account Created:</strong> <?php echo htmlspecialchars($user['created_at'], ENT_QUOTES, 'UTF-8'); ?></p>

    <br>

    <a href="dashboard.php">Back to Dashboard</a>

</body>

</html>