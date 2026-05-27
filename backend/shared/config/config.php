<?php
session_status() == PHP_SESSION_NONE && session_start();
header('Content-type: application/json');
header('Access-Control-Allow-Origin: *');


const DB_HOST = '127.0.0.1',
DB_USER = 'root',
DB_PASS = '',
DB_NAME = 'aquashare',

UPLOAD_DIR =  __DIR__ . DIRECTORY_SEPARATOR . 'uploads',
DEFAULT_TIMEZONE = "Africa/Douala";
// DEFAULT_TIMEZONE = "UTC";
// define('UPLOAD_DIR', 'uploads/');
define("ALLOWED_REF", ['localhost']);
define("BANNED_IP", []);

define("USER_INFO",  $_SESSION['user']??null);
define("USER_PROFILE",  $_SESSION['profile']??null);

date_default_timezone_set(DEFAULT_TIMEZONE);



