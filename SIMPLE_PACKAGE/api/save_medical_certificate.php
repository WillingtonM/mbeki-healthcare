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
    
    $required_fields = ['patientId', 'nurseName', 'diagnosisOrCondition', 'recommendedRestDays'];
    $missing = validateRequired($input, $required_fields);
    
    if (!empty($missing)) {
        sendErrorResponse("Missing required fields: " . implode(', ', $missing));
    }
    
    $data = sanitizeInput($input);
    
    // Validate patient exists
    $stmt = $pdo->prepare("SELECT id, firstName, lastName FROM patients WHERE id = ?");
    $stmt->execute([$data['patientId']]);
    $patient = $stmt->fetch();
    if (!$patient) {
        sendErrorResponse("Invalid patient ID");
    }
    
    // Validate visit if provided
    $visitId = $data['visitId'] ?? null;
    if ($visitId) {
        $stmt = $pdo->prepare("SELECT id FROM patient_visits WHERE id = ? AND patientId = ?");
        $stmt->execute([$visitId, $data['patientId']]);
        if (!$stmt->fetch()) {
            sendErrorResponse("Invalid visit ID for this patient");
        }
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO medical_certificates (
            id, patientId, visitId, nurseName, nurseSignature, certificateDate, 
            diagnosisOrCondition, recommendedRestDays, additionalRecommendations, 
            workRestrictions, followUpRequired, followUpDate, isValid, 
            officialStamp, stampText, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $certificateId = generateUUID();
    $certificateDate = $data['certificateDate'] ?? date('Y-m-d');
    
    $result = $stmt->execute([
        $certificateId,
        $data['patientId'],
        $visitId,
        $data['nurseName'],
        $data['nurseSignature'] ?? null,
        $certificateDate,
        $data['diagnosisOrCondition'],
        (int)$data['recommendedRestDays'],
        $data['additionalRecommendations'] ?? null,
        $data['workRestrictions'] ?? null,
        isset($data['followUpRequired']) && $data['followUpRequired'] === '1' ? 1 : 0,
        $data['followUpDate'] ?? null,
        1, // isValid - default to true
        1, // officialStamp - default to true
        $data['stampText'] ?? 'Mbeki Healthcare Official Stamp'
    ]);
    
    if ($result) {
        sendJsonResponse([
            'success' => true,
            'message' => 'Medical certificate created successfully',
            'certificateId' => $certificateId,
            'patientName' => $patient['firstName'] . ' ' . $patient['lastName'],
            'certificateDate' => $certificateDate
        ]);
    } else {
        sendErrorResponse("Failed to create medical certificate", 500);
    }
    
} catch (Exception $e) {
    logError("Failed to create medical certificate: " . $e->getMessage(), ['input' => $input ?? []]);
    sendErrorResponse("Failed to create medical certificate", 500);
}
?>