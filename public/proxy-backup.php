<?php

header("Access-Control-Allow-Origin: *");

// Check if URL is provided via POST
if (empty($_POST['url']) || empty($_POST['token'])) {
    http_response_code(400); // Bad Request
    echo 'Error: Missing parameters.';
    exit;
}

$url = $_POST['url'];

$options = [
    'http' => [
        'method' => 'GET',
        'header' => [
            "User-Agent: Kodi/21.0 (Macintosh; Intel Mac OS X 15_4) App_Bitness/64 Version/21.0-(21.0.0)-Git:20240406-60c4500054",
            "Accept: application/json",
			"X-Uuid: {$_POST['uuid']}",
            "X-AUTH-TOKEN: {$_POST['token']}"
        ],
        'timeout' => 10, // seconds (optional)
    ],
];

$context = stream_context_create($options);

$content = file_get_contents($url, false, $context);

if (isset($_POST['debug'])) {
	print_r($http_response_header);
	echo $content;
	exit;
}

if ($content === false) {
	http_response_code(500); // Internal Server Error
    echo 'Error: Unable to download content from the URL.';
    exit;
}

header('Content-Type: application/json; charset=utf-8');
echo $content;