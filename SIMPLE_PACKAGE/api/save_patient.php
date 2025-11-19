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
    
    $required_fields = ['firstName', 'lastName', 'dateOfBirth', 'phone'];
    $missing = validateRequired($input, $required_fields);
    
    if (!empty($missing)) {
        sendErrorResponse("Missing required fields: " . implode(', ', $missing));
    }
    
    $data = sanitizeInput($input);
    
    // Validate payment method
    $validPaymentMethods = ['cash', 'card', 'eft', 'medical_aid'];
    $paymentMethod = $data['paymentMethod'] ?? 'cash';
    if (!in_array($paymentMethod, $validPaymentMethods)) {
        sendErrorResponse("Invalid payment method. Must be one of: " . implode(', ', $validPaymentMethods));
    }
    
    // If medical aid payment, validate medical aid information
    if ($paymentMethod === 'medical_aid') {
        if (empty($data['medicalAidProvider']) || empty($data['medicalAidNumber'])) {
            sendErrorResponse("Medical aid provider and number are required for medical aid payment");
        }
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO patients (
            id, firstName, lastName, dateOfBirth, gender, idNumber, 
            phone, email, address, nextOfKin, nextOfKinPhone, 
            relationship, allergies, medicalHistory, 
            paymentMethod, medicalAidNumber, medicalAidProvider, 
            medicalAidPrincipalMember, medicalAidDependentCode, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $patientId = generateUUID();
    
    $result = $stmt->execute([
        $patientId,
        $data['firstName'],
        $data['lastName'],
        $data['dateOfBirth'],
        $data['gender'] ?? null,
        $data['idNumber'] ?? null,
        $data['phone'],
        $data['email'] ?? null,
        $data['address'] ?? null,
        $data['nextOfKin'] ?? null,
        $data['nextOfKinPhone'] ?? null,
        $data['relationship'] ?? null,
        $data['allergies'] ?? null,
        $data['medicalHistory'] ?? null,
        $paymentMethod,
        $paymentMethod === 'medical_aid' ? ($data['medicalAidNumber'] ?? null) : null,
        $paymentMethod === 'medical_aid' ? ($data['medicalAidProvider'] ?? null) : null,
        $paymentMethod === 'medical_aid' ? ($data['medicalAidPrincipalMember'] ?? null) : null,
        $paymentMethod === 'medical_aid' ? ($data['medicalAidDependentCode'] ?? null) : null
    ]);
    
    if ($result) {
        sendJsonResponse([
            'success' => true,
            'message' => 'Patient registered successfully',
            'patientId' => $patientId,
            'paymentMethod' => $paymentMethod
        ]);
    } else {
        sendErrorResponse("Failed to save patient", 500);
    }
    
} catch (Exception $e) {
    logError("Failed to save patient: " . $e->getMessage(), ['input' => $input ?? []]);
    sendErrorResponse("Failed to save patient", 500);
}
?>