<?php
include __DIR__ . "/../shared/config/config.php";
include __DIR__ . "/../shared/utilities/fxns.php";
include __DIR__ . "/../shared/database/advanceSQL.php";

function createProfile($param){

    if( !USER_INFO ){
        die( Error(4, "User not authenticated") );
    }

    $param = [
        'user_id' => USER_INFO['id'],
        'address' => $_POST['address']??null,
        'landmark' => $_POST['landmark']??null
    ];

    // create profile based on user role
    [$err, $result] = advanceInsert(USER_INFO['role']=='supplier'?'supplier_profile':'resident_profile', $param);

    if( $err ){
        die(Error(2, 'unable to create profile ' . $result[0]));
    }

    // set profile in session
    $_SESSION['profile'] = $result??null;

    return $result??null;
}

if(isset($_POST) && count($_POST)){
    // handle any other paramaters, for now bypassed with (true) since address and landmark are optional
    if(true || isset($_POST['address'], $_POST['landmark'])){ 
        $param = [
            'address' => $_POST['address'],
            'landmark' => $_POST['landmark']
        ];
        $result = createProfile($param);
        echo Result("Profile Created", $result);
        exit(0);
    }else{
        die(Error(2, "Invalid Paramaters for Profile Creation", $_POST));
    }
}else{
    die(Error(2, "Invalid Request Method for Profile Creation", $_POST));
}
