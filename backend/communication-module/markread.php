<?php
require_once __DIR__ . "/../shared/config/config.php";
include __DIR__ . "/../shared/utilities/fxns.php";
include __DIR__ . "/../shared/database/advanceSQL.php";

authenticationCheck();

$requestId = (int) ($_POST['request_id'] ?? 0);
if (!$requestId) die(Error(5, "request_id is required"));

// verify caller is part of this request
[$err, $requests] = advanceSelect('request', 'resident_id, supplier_id', ['id' => $requestId]);
if ($err || !count($requests)) die(Error(1, "Request not found"));

$req     = $requests[0];
$userId  = USER_INFO['id'];
// $isAdmin = USER_INFO['role'] === 'admin';
$auth = ($req['resident_id'] == $userId || $req['supplier_id'] == $userId);

if (!$auth) {
    die(Error(3, "Not part of this request"));
}


// mark messages from the other party as read (not the caller's own)
[$err, $affected] = advanceUpdate(
    'message',
    ['is_read' => 1],
    ['request_id' => $requestId, 'is_read' => 0,
    '__NOT' => ['sender_id' => $userId]]
);

if ($err) die(Error(2, "Could not mark messages as read: $err"));


echo Result("Messages marked as read", ['updated' => $affected]);
