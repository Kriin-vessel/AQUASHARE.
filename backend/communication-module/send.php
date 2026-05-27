<?php
require_once __DIR__ . "/../shared/config/config.php";
include __DIR__ . "/../shared/utilities/fxns.php";
include __DIR__ . "/../shared/database/advanceSQL.php";

authenticationCheck();


$requestId = (int) ($_POST['request_id'] ?? 0);
$type      = $_POST['type'] ?? 'text';
$body      = $_POST['body'] ?? null;

if (!$requestId) die(Error(5, "request_id is required"));
if (!in_array($type, ['text', 'image', 'location'])) die(Error(5, "Invalid message type"));

// verify sender is part of this request
[$err, $requests] = advanceSelect('request', 'id, resident_id, supplier_id, status', ['id' => $requestId]);
if ($err || !count($requests)) die(Error(1, "Request not found"));

$req    = $requests[0];
$userId = USER_INFO['id'];

if ($req['resident_id'] != $userId && $req['supplier_id'] != $userId) {
    die(Error(3, "Not part of this request"));
}
if ($req['status'] === 'completed' || $req['status'] === 'cancelled' || $req['status'] === 'rejected') {
    die(Error(1, "Cannot message on a closed request"));
}

// handle image upload
if ($type === 'image') {
    if (empty($_FILES['image']['tmp_name'])) die(Error(5, "No image uploaded"));
    $ext     = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
    $allowed = ['jpg', 'jpeg', 'png', 'webp'];
    if (!in_array(strtolower($ext), $allowed)) die(Error(1, "Invalid image type"));
    $filename = uniqid("msg_") . ".$ext";
    $dest     = UPLOAD_DIR . "/messages/" . $filename;
    if (!is_dir(UPLOAD_DIR . "/messages")) mkdir(UPLOAD_DIR . "/messages", 0755, true);
    if (!move_uploaded_file($_FILES['image']['tmp_name'], $dest)) die(Error(2, "Failed to save image"));
    $body = '/php/img.php?f=' . urlencode("messages/$filename");
}

// location: expect body as JSON {"lat":...,"lng":...}
if ($type === 'location') {
    $loc = json_decode($body, true);
    if (!isset($loc['lat'], $loc['lng'])) die(Error(5, "location body must be JSON with lat and lng"));
}

if (empty($body)) die(Error(5, "Message body is required"));

$data = [
    'request_id' => $requestId,
    'sender_id'  => $userId,
    'type'       => $type,
    'body'       => $body
];

[$err, $msgId] = advanceInsert('message', $data);

if ($err) die(Error(2, "Could not send message: $err"));

echo Result("Message sent", ['message_id' => $msgId, ...$data]);
