<?php

session_start();

include("db.php");

if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

$user_id = $_SESSION['user_id'];

$stmt = mysqli_prepare($conn, "SELECT full_name, phone, email, address FROM users WHERE id = ?");
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (!$user) {
    die("User not found");
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $full_name = trim($_POST['full_name']);
    $phone = trim($_POST['phone']);
    $email = trim($_POST['email']);
    $address = trim($_POST['address']);

    if (empty($full_name) || empty($phone)) {
        die("Full name and phone are required");
    }

    if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("Invalid email address");
    }

    $check_stmt = mysqli_prepare($conn, "SELECT id FROM users WHERE phone = ? AND id != ?");
    mysqli_stmt_bind_param($check_stmt, "si", $phone, $user_id);
    mysqli_stmt_execute($check_stmt);
    mysqli_stmt_store_result($check_stmt);

    if (mysqli_stmt_num_rows($check_stmt) > 0) {
        mysqli_stmt_close($check_stmt);
        die("Phone number already in use");
    }

    mysqli_stmt_close($check_stmt);

    $update_stmt = mysqli_prepare(
        $conn,
        "UPDATE users SET full_name = ?, phone = ?, email = ?, address = ? WHERE id = ?"
    );
    mysqli_stmt_bind_param($update_stmt, "ssssi", $full_name, $phone, $email, $address, $user_id);

    if (mysqli_stmt_execute($update_stmt)) {
        mysqli_stmt_close($update_stmt);
        header("Location: profile.php");
        exit();
    } else {
        $error = mysqli_stmt_error($update_stmt);
        mysqli_stmt_close($update_stmt);
        echo "Update failed: " . $error;
    }
}

?>

<!DOCTYPE html>
<html>

<head>
    <title>Edit Profile</title>
</head>

<body>

    <h2>Edit Profile</h2>

    <form method="POST">

        <input type="text"
               name="full_name"
               value="<?php echo htmlspecialchars($user['full_name'], ENT_QUOTES, 'UTF-8'); ?>"
               required>

        <br><br>

        <input type="text"
               name="phone"
               value="<?php echo htmlspecialchars($user['phone'], ENT_QUOTES, 'UTF-8'); ?>"
               required>

        <br><br>

        <input type="email"
               name="email"
               value="<?php echo htmlspecialchars($user['email'], ENT_QUOTES, 'UTF-8'); ?>">

        <br><br>

        <input type="text"
               name="address"
               value="<?php echo htmlspecialchars($user['address'], ENT_QUOTES, 'UTF-8'); ?>">

        <br><br>

        <button type="submit">
            Update Profile
        </button>

    </form>

</body>

</html>