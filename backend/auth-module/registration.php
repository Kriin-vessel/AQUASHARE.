<?php
include __DIR__ . "/../shared/config/config.php";
include __DIR__ . "/../shared/utilities/fxns.php";
include __DIR__ . "/../shared/database/advanceSQL.php";

function signUp($param){
    if( !isset($param['email']) || !isset($param['password_hash'])){
        die( Error(2, "Invalid Paramaters for Authentication", $param) );
    }

    // default role is resident
    $param['role'] = $param['role']=='supplier'?'supplier':'resident';
    /* $username = $param['email'];
    $pass = $param['PasswordHash']; */

    $param['password_hash'] = password_hash($param['password_hash'], PASSWORD_DEFAULT);

    $result = advanceInsert('user', $param);

    if( $result[0] ){
        die(Error(2, 'unable to perform registration ' . $result[0]));
    }

    return $result[1]??null;
}

if(isset($_POST) && count($_POST)){

    if (isset($_POST['name'], $_POST['phone'], $_POST['email'], $_POST['password_hash'], $_POST['role'])) {
        $param = [
            'full_name' => $_POST['name'],
            'phone' => $_POST['phone'],
            'email' => $_POST['email'],
            'password_hash' => $_POST['password_hash'],
            'role' => $_POST['role']
        ];
        //register user
        $result = signUp($param);
        echo Result("Registration Sucessful", $result);
        exit(0);
    }else{
        die(Error(2, "Invalid Paramaters for Registration", $_POST));
    }
}else{
    die(Error(2, "Invalid Request Method for Registration", $_POST));
}