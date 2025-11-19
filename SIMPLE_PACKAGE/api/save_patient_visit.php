<?php
require_once 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendErrorResponse("Only POST method allowed", 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }
    
    $required_fields = ['patientId', 'consentFormId', 'visitNumber', 'visitDate', 'nurseName'];
    $missing = validateRequired($input, $required_fields);
    
    if (!empty($missing)) {
        sendErrorResponse("Missing required fields: " . implode(', ', $missing));
    }
    
    $data = sanitizeInput($input);
    
    // Validate patient exists
    $stmt = $pdo->prepare("SELECT id FROM patients WHERE id = ?");
    $stmt->execute([$data['patientId']]);
    if (!$stmt->fetch()) {
        sendErrorResponse("Invalid patient ID");
    }
    
    // Validate consent form exists and belongs to patient
    $stmt = $pdo->prepare("SELECT id FROM consent_forms WHERE id = ? AND patientId = ?");
    $stmt->execute([$data['consentFormId'], $data['patientId']]);
    if (!$stmt->fetch()) {
        sendErrorResponse("Invalid consent form ID for this patient");
    }
    
    // Validate visit number (1-5)
    $visitNumber = (int)$data['visitNumber'];
    if ($visitNumber < 1 || $visitNumber > 5) {
        sendErrorResponse("Visit number must be between 1 and 5");
    }
    
    // Check if visit already exists
    $stmt = $pdo->prepare("SELECT id FROM patient_visits WHERE patientId = ? AND consentFormId = ? AND visitNumber = ?");
    $stmt->execute([$data['patientId'], $data['consentFormId'], $visitNumber]);
    if ($stmt->fetch()) {
        sendErrorResponse("Visit number {$visitNumber} already exists for this patient and treatment");
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO patient_visits (
            id, patientId, consentFormId, visitNumber, visitDate, nurseName, 
            progressNotes, nextAppointmentDate, vitals, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $visitId = generateUUID();
    
    $result = $stmt->execute([
        $visitId,
        $data['patientId'],
        $data['consentFormId'],
        $visitNumber,
        $data['visitDate'],
        $data['nurseName'],
        $data['progressNotes'] ?? null,
        $data['nextAppointmentDate'] ?? null,
        $data['vitals'] ?? '{}'
    ]);
    
    if ($result) {
        sendJsonResponse([
            'success' => true,
            'message' => 'Patient visit recorded successfully',
            'visitId' => $visitId,
            'visitNumber' => $visitNumber
        ]);
    } else {
        sendErrorResponse("Failed to record patient visit", 500);
    }
    
} catch (Exception $e) {
    logError("Failed to record patient visit: " . $e->getMessage(), ['input' => $input ?? []]);
    sendErrorResponse("Failed to record patient visit", 500);
}
?>