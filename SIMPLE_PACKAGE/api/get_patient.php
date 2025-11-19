<?php
require_once 'config.php';

try {
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        sendErrorResponse("Patient ID is required");
    }
    
    $patientId = sanitizeInput($_GET['id']);
    
    $stmt = $pdo->prepare("
        SELECT 
            id, firstName, lastName, dateOfBirth, gender, idNumber, 
            phone, email, address, nextOfKin, nextOfKinPhone, 
            relationship, allergies, medicalHistory, createdAt 
        FROM patients 
        WHERE id = ?
    ");
    
    $stmt->execute([$patientId]);
    $patient = $stmt->fetch();
    
    if (!$patient) {
        sendErrorResponse("Patient not found", 404);
    }
    
    sendJsonResponse($patient);
    
} catch (Exception $e) {
    logError("Failed to fetch patient: " . $e->getMessage(), ['id' => $_GET['id'] ?? null]);
    sendErrorResponse("Failed to fetch patient", 500);
}
?>