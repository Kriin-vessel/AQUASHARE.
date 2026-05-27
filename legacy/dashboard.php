<?php

session_start();

if (!isset($_SESSION['user_id'])) {

    header("Location: login.html");
    exit();
}

?>

<!DOCTYPE html>
<html>

<head>
    <title>AquaShare Dashboard</title>
</head>

<body>

    <h2>
        Welcome <?php echo $_SESSION['full_name']; ?>
    </h2>

    <p>You are successfully logged in.</p>

    <a href="logout.php">Logout</a>

</body>

</html>