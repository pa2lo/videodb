<?php

function exitWError($code, $message) {
	http_response_code($code);
	$response = ['success' => false, 'error' => $message];
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode($response);
	exit;
}

function dbConnect($localEnv) {
	$db = new PDO("mysql:host={$localEnv['DB_SERVER']};dbname={$localEnv['DB_NAME']}", $localEnv['DB_USER'], $localEnv['DB_PASS']);
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	return $db;
}

function sanitizeId($id) {
	if (!preg_match('/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i', $id)) return exitWError(400, "Invalid ID");
}