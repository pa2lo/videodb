<?php

header("Access-Control-Allow-Origin: *");

// Check if URL and token are provided via POST
if (empty($_POST['url']) || empty($_POST['token'])) {
    http_response_code(400); // Bad Request
    echo 'Error: Missing parameters.';
    exit;
}

$url = $_POST['url'];
$uuid = isset($_POST['uuid']) ? $_POST['uuid'] : '';
$token = $_POST['token'];

$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
	CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_2_PRIOR_KNOWLEDGE,
    CURLOPT_HTTPHEADER => [
        "User-Agent: Kodi/21.0 (Macintosh; Intel Mac OS X 15_4) App_Bitness/64 Version/21.0-(21.0.0)-Git:20240406-60c4500054",
        "Accept: application/json",
        "X-Uuid: $uuid",
        "X-AUTH-TOKEN: $token"
    ],
]);

$content = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

if ($content == false) {
    http_response_code(500); // Internal Server Error
    echo "Error: Unable to download content from the URL.\n";
	echo "HTTP Status Code: $httpCode\n";
    echo $content ?: "cURL error: $error\n";
    exit;
}

header('Content-Type: application/json; charset=utf-8');
echo $content;