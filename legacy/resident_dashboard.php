<?php

session_start();

if (!isset($_SESSION['user_id'])) {

    header("Location: login.html");
    exit();
}

// CHECK ROLE

if ($_SESSION['role'] != "resident") {

    echo "Access denied";
    exit();
}

?>

<!DOCTYPE html>
<html>

<head>
    <title>Resident Dashboard</title>
</head>

<body>

    <h1>
        Welcome <?php echo $_SESSION['full_name']; ?>
    </h1>

    <p>Resident Dashboard</p>

    <br>

    <a href="profile.php">View Profile</a>

    <br><br>

    <a href="edit_profile.php">Edit Profile</a>

    <br><br>

    <a href="change_password.php">Change Password</a>

    <br><br>

    <a href="logout.php">Logout</a>

</body>

</html>