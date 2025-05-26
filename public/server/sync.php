<?php

if ($_SERVER['HTTP_ORIGIN'] == 'http://localhost:5173') {
	header("Access-Control-Allow-Origin: http://localhost:5173");
}

require_once('helpers.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	return exitWError(405, 'Method Not Allowed');
}

if (!isset($_GET['action'])) {
	return exitWError(400, "Missing 'action' in request");
}

$response = [
	'success' => false,
	'action' => $_GET['action']
];

$localEnv = include '.env.php';

define('SYNC_FIELDS', ['history', 'favs', 'bookmarks']);

function decodeFields($arr, $fields) {
	foreach ($fields as $field) {
		if (isset($arr[$field])) $arr[$field] = json_decode($arr[$field], true);
	}
	return $arr;
}

function sanitizeFields($fields) {
	foreach ($fields as $field) {
		if (isset($_POST[$field])) {
			$decoded = json_decode($_POST[$field]);
			if (!is_array($decoded)) return exitWError(400, "Invalid parameter type - $field");
		}
	}
}

try {
	if ($_GET['action'] == 'create') {
		sanitizeFields(SYNC_FIELDS);
		$db = dbConnect($localEnv);

		$now = round(microtime(true) * 1000);

		$sql = "INSERT INTO sync_data (history, favs, bookmarks, created, updated)
				VALUES (:history, :favs, :bookmarks, :created, :updated)
				RETURNING *";

		$query = $db->prepare($sql);
		$query->execute([
			':history' => $_POST['history'] ?? json_encode([]),
			':favs' => $_POST['favs'] ?? json_encode([]),
			':bookmarks' => $_POST['bookmarks'] ?? json_encode([]),
			':created' => $now,
			':updated' => $now
		]);

		$row = $query->fetch(PDO::FETCH_ASSOC);

		if (isset($row['id'])) {
			$response['success'] = true;
			$response['data'] = decodeFields($row, SYNC_FIELDS);
		} else {
			$response['error'] = "no ID in new record";
			$response['row'] = $row;
		}
	} elseif ($_GET['action'] == 'update') {
		if (!isset($_POST['param'])) return exitWError(400, "Missing 'param' in request");

		$param = $_POST['param'];

		if (!in_array($param, SYNC_FIELDS)) return exitWError(400, "Invalid 'param' value");

		sanitizeFields(['data']);
		sanitizeId($_POST['id'] ?? '');

		$db = dbConnect($localEnv);

		$now = round(microtime(true) * 1000);

		$column = SYNC_FIELDS[array_search($param, SYNC_FIELDS)];

		$sql = "UPDATE sync_data SET $column = :param_val, updated = :updated WHERE id = :id";

		$query = $db->prepare($sql);
		$exec = $query->execute([
			"param_val" => $_POST['data'],
			"updated" => $now,
			"id" => $_POST['id']
		]);

		if ($query->rowCount() > 0) {
			$response['success'] = true;
			$response['data'] = [ "ts" => $now ];
		} else {
			$response['error'] = 'No rows updated (maybe ID not found or data unchanged)';
		}
	} elseif ($_GET['action'] == 'connect') {
		sanitizeId($_POST['id'] ?? '');

		$db = dbConnect($localEnv);

		$sql = "SELECT * FROM sync_data WHERE id = :id";

		$query = $db->prepare($sql);
		$query->execute([
			'id' => $_POST['id']
		]);

		$row = $query->fetch(PDO::FETCH_ASSOC);

		if ($row) {
			$response['success'] = true;
			$response['data'] = decodeFields($row, SYNC_FIELDS);
		} else {
			$response['error'] = 'Row not found';
		}
	} elseif ($_GET['action'] == 'check') {
		sanitizeId($_POST['id'] ?? '');

		$db = dbConnect($localEnv);

		$sql = "SELECT updated FROM sync_data WHERE id = :id";

		$query = $db->prepare($sql);
		$query->execute([
			'id' => $_POST['id']
		]);

		$row = $query->fetch(PDO::FETCH_ASSOC);

		if ($row) {
			$response['success'] = true;
			$response['data'] = $row;
		} else {
			$response['error'] = 'Row not found';
		}
	} else return exitWError(400, "Invalid 'action' value");
} catch (Exception $e) {
	http_response_code(500);
	$response['error'] = $e->getMessage();
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($response);

// cleanup
$db = null;
exit;