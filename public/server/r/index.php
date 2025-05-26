<?php

if (!isset($_GET['path']) || $_GET['path'] == '' || !preg_match('/^[0-9a-zA-Z]{10}$/', $_GET['path'])) {
	http_response_code(400);
	exit('Bad request');
}

$localEnv = include '../.env.php';

$id = $_GET['path'];
$db = new PDO("mysql:host={$localEnv['DB_SERVER']};dbname={$localEnv['DB_NAME']}", $localEnv['DB_USER'], $localEnv['DB_PASS']);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$sql = "SELECT link FROM shortener WHERE id = :id LIMIT 1";
$query = $db->prepare($sql);
$query->execute([
	'id' => $id
]);

$link = $query->fetchColumn();

if ($link && filter_var($link, FILTER_VALIDATE_URL)) {
	header("Location: $link");
	exit;
} else {
	http_response_code(404);
	exit('Not exist');
}

$db = null;
exit;