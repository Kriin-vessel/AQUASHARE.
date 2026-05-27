<?php
$sqlFile = __DIR__ . '/../aquashare.sql';
$error   = null;
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $host = trim($_POST['host'] ?? '127.0.0.1');
    $user = trim($_POST['user'] ?? '');
    $pass = $_POST['pass'] ?? '';

    $conn = @mysqli_connect($host, $user, $pass);
    if (!$conn) {
        $error = 'Connection failed: ' . mysqli_connect_error();
    } else {
        $sql     = file_get_contents($sqlFile);
        // Strip delimiter changes (not supported by mysqli multi_query)
        $sql     = preg_replace('/DELIMITER\s+\S+\s*/i', '', $sql);
        $queries = array_filter(array_map('trim', explode(';', $sql)));

        foreach ($queries as $query) {
            if (!mysqli_query($conn, $query)) {
                $error = 'Query failed: ' . mysqli_error($conn) . '<br><code>' . htmlspecialchars($query) . '</code>';
                break;
            }
        }

        mysqli_close($conn);
        if (!$error) $success = true;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AquaShare — DB Setup</title>
  <style>
    body { font-family: sans-serif; max-width: 480px; margin: 60px auto; padding: 0 16px; }
    h2   { margin-bottom: 24px; }
    label { display: block; margin-bottom: 4px; font-size: .9rem; }
    input { width: 100%; padding: 8px; margin-bottom: 16px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
    button { padding: 10px 24px; background: #2563eb; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
    .msg  { padding: 12px; border-radius: 4px; margin-bottom: 16px; }
    .ok   { background: #d1fae5; color: #065f46; }
    .err  { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <h2>AquaShare — Database Setup</h2>

  <?php if ($success): ?>
    <div class="msg ok">✓ Database installed successfully.</div>
  <?php elseif ($error): ?>
    <div class="msg err"><?= $error ?></div>
  <?php endif; ?>

  <?php if (!$success): ?>
  <form method="POST">
    <label>Host</label>
    <input name="host" value="<?= htmlspecialchars($_POST['host'] ?? '127.0.0.1') ?>">
    <label>MySQL User</label>
    <input name="user" value="<?= htmlspecialchars($_POST['user'] ?? 'root') ?>">
    <label>MySQL Password</label>
    <input name="pass" type="password">
    <button type="submit">Install Database</button>
  </form>
  <?php endif; ?>
</body>
</html>
