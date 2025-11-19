<?php
require_once 'config.php';

try {
    // Test database connection
    $stmt = $pdo->prepare("SELECT 1 as test");
    $stmt->execute();
    $result = $stmt->fetch();
    
    if ($result && $result['test'] == 1) {
        sendJsonResponse([
            'status' => 'connected',
            'message' => 'Database connection successful',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } else {
        sendErrorResponse("Database test query failed", 500);
    }
    
} catch (Exception $e) {
    logError("Database connection test failed: " . $e->getMessage());
    sendErrorResponse("Database connection failed", 500);
}
?>