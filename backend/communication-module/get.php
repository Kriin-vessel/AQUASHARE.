<?php
require_once __DIR__ . "/../shared/config/config.php";
include __DIR__ . "/../shared/utilities/fxns.php";
include __DIR__ . "/../shared/database/advanceSQL.php";

authenticationCheck();

$requestId = (int) ($_GET['request_id'] ?? 0);
if (!$requestId) die(Error(5, "request_id is required"));

// verify caller is part of this request
[$err, $requests] = advanceSelect('request', 'resident_id, supplier_id', ['id' => $requestId]);
if ($err || !count($requests)) die(Error(1, "Request not found"));

$req    = $requests[0];
// print_r(USER_INFO);
$userId = USER_INFO['id'];
$isAdmin = USER_INFO['role']=='admin';
$auth = ($req['resident_id'] == $userId || $req['supplier_id'] == $userId);

// making sure only authorised users can proceed
if (!$auth && !$isAdmin) {
    die(Error(3, "Not part of this request"));
}

[$err, $messages] = advanceSelect('message', '*', [
    'request_id'   => $requestId,
    '__ORDERBY'    => 'created_at',
    '__ASC'        => 'ASC'
]);

if ($err) die(Error(2, "Could not fetch messages: $err"));

if(!$isAdmin) {
// mark unread messages from the other party as read (exclude own messages)
    advanceUpdate('message', ['is_read' => 1], [
        'request_id' => $requestId,
        'is_read'    => 0,
        '__NOT'      => ['sender_id' => $userId]
    ]);
}

echo Result("Messages fetched", $messages);
