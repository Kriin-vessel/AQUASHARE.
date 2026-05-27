<?php

session_start();

include("../shared/database/db.php");

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    if (empty($email) || empty($password)) {
        die("Email and password are required");
    }

    // SECURE QUERY
    $stmt = mysqli_prepare(
        $conn,
        "SELECT id, full_name, password_hash, role FROM users WHERE email = ?"
    );

    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if (mysqli_num_rows($result) == 1) {

        $user = mysqli_fetch_assoc($result);

        // VERIFY PASSWORD
        if (password_verify($password, $user['password_hash'])) {

            // CREATE SESSION
            session_regenerate_id(true);
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['full_name'] = $user['full_name'];
            $_SESSION['role'] = $user['role'];

            mysqli_stmt_close($stmt);

            // CHECK ROLE
            if ($user['role'] == "resident") {
                header("Location: resident_dashboard.php");
            } else {
                header("Location: dashboard.php");
            }
            exit();

        } else {

            mysqli_stmt_close($stmt);
            echo "Invalid password";
        }

    } else {

        mysqli_stmt_close($stmt);
        echo "User not found";
    }
}

?>