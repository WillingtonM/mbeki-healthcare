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
    
    $required_fields = ['patientId', 'nurseName', 'treatmentType', 'treatmentDate'];
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
    
    $stmt = $pdo->prepare("
        INSERT INTO consent_forms (
            id, patientId, nurseName, treatmentType, treatmentName, 
            treatmentDate, customTerms, vitals, signature, consentGiven, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $consentId = generateUUID();
    
    $result = $stmt->execute([
        $consentId,
        $data['patientId'],
        $data['nurseName'],
        $data['treatmentType'],
        $data['treatmentName'] ?? null,
        $data['treatmentDate'],
        $data['customTerms'] ?? null,
        $data['vitals'] ?? '{}',
        $data['signature'] ?? null,
        isset($data['consentGiven']) && $data['consentGiven'] === '1' ? 1 : 0
    ]);
    
    if ($result) {
        sendJsonResponse([
            'success' => true,
            'message' => 'Consent form saved successfully',
            'consentId' => $consentId
        ]);
    } else {
        sendErrorResponse("Failed to save consent form", 500);
    }
    
} catch (Exception $e) {
    logError("Failed to save consent form: " . $e->getMessage(), ['input' => $input ?? []]);
    sendErrorResponse("Failed to save consent form", 500);
}
?>