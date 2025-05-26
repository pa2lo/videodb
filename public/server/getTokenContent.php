<?php

if ($_SERVER['HTTP_ORIGIN'] == 'http://localhost:5173') {
	header("Access-Control-Allow-Origin: http://localhost:5173");
}

// Check if URL is provided via POST
if (empty($_POST['url'])) {
    http_response_code(400); // Bad Request
    echo 'Error: Missing URL parameter.';
    exit;
}

$url = $_POST['url'];

// Validate URL format
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo 'Error: Invalid URL format.';
    exit;
}

// Download content
$content = @file_get_contents($url);

if ($content === false) {
    http_response_code(500); // Internal Server Error
    echo 'Error: Unable to download content from the URL.';
    exit;
}

// Return content
header('Content-Type: text/plain; charset=utf-8');
echo $content;