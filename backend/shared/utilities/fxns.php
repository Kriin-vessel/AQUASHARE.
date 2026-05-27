<?php
session_status() == PHP_SESSION_NONE && session_start();

// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

/**
 * -1: server paused
 * 0: Database server error
 * 1: unable to process, ur fault
 * 2: unable to process, server fault
 * 3: not allowed
 * 4: delete session
 * 5: unable to process, param error (check request from client Side)
 * 6: commit action
 */

// include __DIR__ . "/../assets/config.php";
// include __DIR__ . "/../assets/misc.php";
/* include "document.php";
include "scheduler.php";
include "accounts.php"; */

define("LOGDIR", __DIR__ . "/../logs");

function Error(int $code, string $msg, $detail = null) {
    if (!is_dir(LOGDIR)) mkdir(LOGDIR, 0755, true);

    $data = date('Y-m-d H:i:s') . " ---- " . ($detail ? json_encode($detail) : $msg) . " \n";
    file_put_contents(LOGDIR."/error_logs.txt", $data, FILE_APPEND);
    return json_encode(array('error' => array('code' => $code, 'message' => $msg)));
    // return $data;
}
function Result(string $msg, $data) {
    if (!is_dir(LOGDIR)) mkdir(LOGDIR, 0755, true);
    
    $dat = date('Y-m-d H:i:s') . "---" . "$msg" . " ---- " . json_encode($data) . " \n";
    file_put_contents(LOGDIR."/message_logs.txt", $dat, FILE_APPEND);
    return json_encode(array('data' => $data, 'message' => $msg));
}



function personalisedAccess() {
    if(isset($_SERVER['HTTP_REFERER'])){
        $refer = $_SERVER['HTTP_REFERER'];
        $allowed = false;
        
        foreach (ALLOWED_REF as $key => $value) {
            if(strpos($refer, $value)!==false){
                $allowed = true;
                break;
                // return;
            }
        }
    
        if(!$allowed) die( Error(3, "Unauthorised access detected") );
    
    }else Error(0, "referrer not set");
}

function connect()
{
    $con = mysqli_connect(DB_HOST, DB_USER, DB_PASS);
    // die("sas");
    if (!$con) {
        die(Error(-1, "Database Server Connection failed: " . mysqli_connect_error()));
    }
    return $con;
}

function connectDB() {
    $conn = connect();
    $query = "USE ".DB_NAME;
    $sql = mysqli_query($conn, $query);
    if (!$sql) {
        die (Error(0, "Database Connection Error: " . mysqli_error($conn)) );
    }
    return $conn;
}

function present($arg){
    return (isset($arg) && $arg && !empty($arg)) ? true : false;
}

function authenticationCheck(){
    if(!USER_INFO){
        logout();
        die( Error(4, "user authentication not found, please login") );
    }
    return USER_INFO;
}

function infoCheck(string $param, $value=false){
    $data = USER_INFO[$param]??false;
    return ($value!=false)?$data==$value:$data; 
}


/* 

|    |  /~~~~\  |\   
|\  /| ( |__| ) | \  
| \/ |  \____/  |__\ 

*/



function logout(){
    unset($_SESSION['user']);
    unset($_SESSION['permission']);
    session_unset();
    session_destroy();
    return true;
}
