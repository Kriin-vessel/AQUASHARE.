<?php
$file = $_GET['f'] ?? '';

// strip any directory traversal
$file = ltrim(str_replace(['../', '..\\'], '', $file), '/');
$path = __DIR__ . '/assets/uploads/' . $file;

if (!$file || !file_exists($path)) {
    http_response_code(404);
    exit('Not found');
}

$mime = mime_content_type($path);
if (!str_starts_with($mime, 'image/')) {
    http_response_code(403);
    exit('Forbidden');
}

header("Content-Type: $mime");
header("Content-Length: " . filesize($path));
readfile($path);
