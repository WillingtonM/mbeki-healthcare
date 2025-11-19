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
    
    if (!isset($input['patients']) || !isset($input['consent_forms'])) {
        sendErrorResponse("Invalid backup file format");
    }
    
    $pdo->beginTransaction();
    
    try {
        $importedPatients = 0;
        $importedConsentForms = 0;
        
        // Import patients
        $stmt = $pdo->prepare("
            INSERT INTO patients (
                id, firstName, lastName, dateOfBirth, gender, idNumber, 
                phone, email, address, nextOfKin, nextOfKinPhone, 
                relationship, allergies, medicalHistory, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                firstName = VALUES(firstName),
                lastName = VALUES(lastName),
                phone = VALUES(phone),
                email = VALUES(email),
                updatedAt = NOW()
        ");
        
        foreach ($input['patients'] as $patient) {
            $stmt->execute([
                $patient['id'],
                $patient['firstName'],
                $patient['lastName'],
                $patient['dateOfBirth'],
                $patient['gender'] ?? null,
                $patient['idNumber'] ?? null,
                $patient['phone'],
                $patient['email'] ?? null,
                $patient['address'] ?? null,
                $patient['nextOfKin'] ?? null,
                $patient['nextOfKinPhone'] ?? null,
                $patient['relationship'] ?? null,
                $patient['allergies'] ?? null,
                $patient['medicalHistory'] ?? null,
                $patient['createdAt']
            ]);
            $importedPatients++;
        }
        
        // Import consent forms
        $stmt = $pdo->prepare("
            INSERT INTO consent_forms (
                id, patientId, nurseName, treatmentType, treatmentName, 
                treatmentDate, customTerms, vitals, signature, consentGiven, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                nurseName = VALUES(nurseName),
                treatmentType = VALUES(treatmentType),
                updatedAt = NOW()
        ");
        
        foreach ($input['consent_forms'] as $form) {
            $stmt->execute([
                $form['id'],
                $form['patientId'],
                $form['nurseName'],
                $form['treatmentType'],
                $form['treatmentName'] ?? null,
                $form['treatmentDate'],
                $form['customTerms'] ?? null,
                is_string($form['vitals']) ? $form['vitals'] : json_encode($form['vitals']),
                $form['signature'] ?? null,
                $form['consentGiven'] ?? 0,
                $form['createdAt']
            ]);
            $importedConsentForms++;
        }
        
        $pdo->commit();
        
        sendJsonResponse([
            'success' => true,
            'message' => 'Data imported successfully',
            'imported' => [
                'patients' => $importedPatients,
                'consent_forms' => $importedConsentForms
            ]
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    logError("Failed to import data: " . $e->getMessage(), ['input_size' => strlen(json_encode($input ?? []))]);
    sendErrorResponse("Failed to import data: " . $e->getMessage(), 500);
}
?>