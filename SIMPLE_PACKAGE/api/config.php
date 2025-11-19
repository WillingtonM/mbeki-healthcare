<?php
/**
 * Mbeki Healthcare Patient Management System
 * Database Configuration
 * Developed by Champs Group - https://www.champsafrica.com
 */

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Database Configuration
$db_config = [
    'host' => 'localhost',
    'dbname' => 'mbeki_healthcare',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4'
];

// Load environment variables if .env file exists
if (file_exists('../.env')) {
    $env = parse_ini_file('../.env');
    if ($env && isset($env['DB_HOST'])) {
        $db_config['host'] = $env['DB_HOST'];
        $db_config['dbname'] = $env['DB_NAME'];
        $db_config['username'] = $env['DB_USER'];
        $db_config['password'] = $env['DB_PASS'];
    }
}

// Create database connection
try {
    $dsn = "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset={$db_config['charset']}";
    $pdo = new PDO($dsn, $db_config['username'], $db_config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Email configuration for error reporting
$email_config = [
    'to' => 'info@champsafrica.com',
    'from' => 'system@mbeki-healthcare.com',
    'subject_prefix' => '[Mbeki Healthcare System Error]'
];

// Utility Functions
function sendJsonResponse($data, $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function sendErrorResponse($message, $status_code = 400) {
    sendJsonResponse(['error' => $message], $status_code);
}

function validateRequired($data, $required_fields) {
    $missing = [];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $missing[] = $field;
        }
    }
    return $missing;
}

function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function generateUUID() {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

function logError($error, $context = []) {
    $log_entry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'error' => $error,
        'context' => $context,
        'url' => $_SERVER['REQUEST_URI'] ?? '',
        'method' => $_SERVER['REQUEST_METHOD'] ?? '',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
        'ip' => $_SERVER['REMOTE_ADDR'] ?? ''
    ];
    
    error_log("Mbeki Healthcare Error: " . json_encode($log_entry));
    
    // Send email to Champs Group
    sendErrorEmail($log_entry);
}

function sendErrorEmail($error_data) {
    global $email_config;
    
    $subject = $email_config['subject_prefix'] . ' ' . date('Y-m-d H:i:s');
    $body = "
    <html>
    <body>
        <h2>🚨 Mbeki Healthcare System Error Report</h2>
        <hr>
        
        <h3>Error Details:</h3>
        <p><strong>Timestamp:</strong> {$error_data['timestamp']}</p>
        <p><strong>Error:</strong> {$error_data['error']}</p>
        <p><strong>URL:</strong> {$error_data['url']}</p>
        <p><strong>Method:</strong> {$error_data['method']}</p>
        <p><strong>IP Address:</strong> {$error_data['ip']}</p>
        <p><strong>User Agent:</strong> {$error_data['user_agent']}</p>
        
        <h3>Context:</h3>
        <pre>" . json_encode($error_data['context'], JSON_PRETTY_PRINT) . "</pre>
        
        <hr>
        <p><small>This error was automatically reported by the Mbeki Healthcare System.</small></p>
        <p><small>Developed by <a href='https://www.champsafrica.com'>Champs Group</a></small></p>
    </body>
    </html>
    ";
    
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . $email_config['from'],
        'Reply-To: ' . $email_config['from'],
        'X-Mailer: PHP/' . phpversion()
    ];
    
    @mail($email_config['to'], $subject, $body, implode("\r\n", $headers));
}

// Set timezone
date_default_timezone_set('UTC');
?>