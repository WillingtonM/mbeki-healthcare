<?php
require_once 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendErrorResponse("Only POST method allowed", 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        sendErrorResponse("Invalid JSON input");
    }
    
    $error_data = [
        'message' => $input['message'] ?? 'Unknown error',
        'stack' => $input['stack'] ?? '',
        'url' => $input['url'] ?? '',
        'userAgent' => $input['userAgent'] ?? '',
        'timestamp' => $input['timestamp'] ?? date('Y-m-d H:i:s'),
        'context' => $input['context'] ?? []
    ];
    
    // Log the error
    logError("Frontend Error: " . $error_data['message'], $error_data);
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Error report sent successfully'
    ]);
    
} catch (Exception $e) {
    error_log("Failed to process error report: " . $e->getMessage());
    sendErrorResponse("Failed to process error report", 500);
}
?>