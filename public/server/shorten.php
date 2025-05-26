<?php

if ($_SERVER['HTTP_ORIGIN'] == 'http://localhost:5173') {
	header("Access-Control-Allow-Origin: http://localhost:5173");
}

require_once('helpers.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	return exitWError(405, 'Method Not Allowed');
}

if (!isset($_POST['link']) || $_POST['link'] == '') {
	return exitWError(400, "Missing 'url' in request");
}

if (!filter_var($_POST['link'], FILTER_VALIDATE_URL)) {
    return exitWError(400, "Invalid URL");
}

$response = [
	'success' => false
];

$localEnv = include '.env.php';

function generateRandomCode($length = 10) {
    $chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $code = '';
    for ($i = 0; $i < $length; $i++) {
        $code .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $code;
}

try {
	$db = dbConnect($localEnv);

	$newID = generateRandomCode();

	$sql = "INSERT INTO shortener (id, link, created)
			VALUES (:id, :link, :created)";

	$query = $db->prepare($sql);
	$exec = $query->execute([
		':id' => $newID,
		':link' => $_POST['link'],
		':created' => time()
	]);

	if ($exec) {
		$response['success'] = true;
		$response['id'] = $newID;
	} else return exitWError(500, "Failed to add id ($newID)");
} catch (Exception $e) {
	http_response_code(500);
	$response['error'] = $e->getMessage();
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($response);

// cleanup
$db = null;