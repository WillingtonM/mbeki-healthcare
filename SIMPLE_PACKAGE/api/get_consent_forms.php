<?php
require_once 'config.php';

try {
    $patientId = isset($_GET['patientId']) ? sanitizeInput($_GET['patientId']) : null;
    
    $sql = "SELECT 
                cf.id, cf.patientId, cf.nurseName, cf.treatmentType, 
                cf.treatmentName, cf.treatmentDate, cf.customTerms, 
                cf.vitals, cf.signature, cf.consentGiven, cf.createdAt,
                CONCAT(p.firstName, ' ', p.lastName) as patientName
            FROM consent_forms cf
            JOIN patients p ON cf.patientId = p.id";
    
    $params = [];
    
    if ($patientId) {
        $sql .= " WHERE cf.patientId = ?";
        $params[] = $patientId;
    }
    
    $sql .= " ORDER BY cf.createdAt DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $consentForms = $stmt->fetchAll();
    
    // Decode vitals JSON for each form
    foreach ($consentForms as &$form) {
        $form['vitals'] = json_decode($form['vitals'], true) ?: [];
    }
    
    sendJsonResponse($consentForms);
    
} catch (Exception $e) {
    logError("Failed to fetch consent forms: " . $e->getMessage(), ['patientId' => $patientId]);
    sendErrorResponse("Failed to fetch consent forms", 500);
}
?>