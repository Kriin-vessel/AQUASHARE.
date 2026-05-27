<?php

include("../shared/database/db.php");

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $full_name = trim($_POST['full_name']);
    $phone = trim($_POST['phone']);
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);
    $address = trim($_POST['address']);

    // DEFAULT ROLE
    $role = "resident";

    if (empty($full_name) || empty($phone) || empty($password)) {
        die("Required fields cannot be empty");
    }

    if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("Invalid email address");
    }

    // CHECK IF PHONE EXISTS
    $check_stmt = mysqli_prepare($conn, "SELECT id FROM users WHERE phone = ?");
    mysqli_stmt_bind_param($check_stmt, "s", $phone);
    mysqli_stmt_execute($check_stmt);
    mysqli_stmt_store_result($check_stmt);

    if (mysqli_stmt_num_rows($check_stmt) > 0) {
        mysqli_stmt_close($check_stmt);
        die("Phone number already registered");
    }

    mysqli_stmt_close($check_stmt);

    // HASH PASSWORD
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // INSERT USER
    $stmt = mysqli_prepare(
        $conn,
        "INSERT INTO users (full_name, phone, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?, ?)"
    );
    mysqli_stmt_bind_param(
        $stmt,
        "ssssss",
        $full_name,
        $phone,
        $email,
        $password_hash,
        $address,
        $role
    );

    if (mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        header("Location: login.html");
        exit();
    } else {
        $error = mysqli_stmt_error($stmt);
        mysqli_stmt_close($stmt);
        echo "Registration failed: " . $error;
    }
}

?>