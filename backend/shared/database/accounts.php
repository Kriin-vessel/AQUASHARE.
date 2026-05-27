<?php

require_once __DIR__ . "/../config/config.php";

function Users(array $param = [], array $filters = []){
    $userId = USER_INFO['id'];
    $isAdmin = USER_INFO['role']=='admin';

    $id = (int) ( $param['id']??0 );
    $isMine = ($id == $userId);

    if(!$isAdmin && !$isMine) {
        die( Error(3, "Unauthorized Action", "id=" . (USER_INFO['id']??null)) );
    }
    /* if(!$auth && !$isMaster){
        die( Error(3, "Una") );
    } */
    
    $offset = (int) ( $filters['step'] ?? null) * (int) ( $filters['size'] ?? null);
    $search = $filters['search']??null;
    // $searchin = 't.name';
    $size = $filters['size']??30;
    [$from, $to] = [$filters['from']??null, $filters['to']??null];
    $order = [$filters['orderby']??null, $filters['asc']??true];

    if($id) {
        [$err, $users] = advanceSelect('user', '*', ["id"=>$id]);
        $count = count($users);
    }else{
        [$err, $users] = advanceSelect('user', "id, role, name, email, created_at, updated_at", [
            "__SEARCH"=> ["name"=>$search, "email"=>$search],
            "__LESSER"=>["DateCreated"=>$to],
            "__GREATER"=>["DateCreated"=>$from],
            "__ORDER"=>$order[0],
            "__ASC"=>$order[1]?"ASC":"DESC",
            "__LIMIT"=>$size,
            "__OFFSET"=>$offset,
            ...$param
        ]);

        [$err, $result] = advanceSelect('user', "COUNT(*) as count", [
            "__SEARCH"=> ["name"=>$search, "email"=>$search],
            "__LESSER"=>["DateCreated"=>$to],
            "__GREATER"=>["DateCreated"=>$from],
            // "__ORDER"=>$order[0],
            // "__ASC"=>$order[1]?"ASC":"DESC",
            // "__LIMIT"=>$size,
            // "__OFFSET"=>$offset,
            ...$param

        ]);
        $count = $result[0]['count'];
        // die(print_r($result));

    }
    return ["users"=>$users, "count"=>$count];

}




function getSuppliers($filter){
    return Users([
        "accType" => 'supplier'
    ], $filter);
}

function getResidents($filter){
    return Users([
        "role" => 'resident'
    ], $filter);
}

