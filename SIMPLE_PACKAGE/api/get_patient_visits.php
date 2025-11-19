<?php
require_once 'config.php';

try {
    $patientId = isset($_GET['patientId']) ? sanitizeInput($_GET['patientId']) : null;
    $consentFormId = isset($_GET['consentFormId']) ? sanitizeInput($_GET['consentFormId']) : null;
    
    if (!$patientId && !$consentFormId) {
        sendErrorResponse("Either patientId or consentFormId is required");
    }
    
    $sql = "SELECT 
                pv.id, pv.patientId, pv.consentFormId, pv.visitNumber, pv.visitDate,
                pv.nurseName, pv.progressNotes, pv.nextAppointmentDate, pv.vitals,
                pv.createdAt, pv.updatedAt,
                CONCAT(p.firstName, ' ', p.lastName) as patientName,
                p.phone as patientPhone,
                cf.treatmentType, cf.treatmentName
            FROM patient_visits pv
            JOIN patients p ON pv.patientId = p.id
            JOIN consent_forms cf ON pv.consentFormId = cf.id";
    
    $params = [];
    $conditions = [];
    
    if ($patientId) {
        $conditions[] = "pv.patientId = ?";
        $params[] = $patientId;
    }
    
    if ($consentFormId) {
        $conditions[] = "pv.consentFormId = ?";
        $params[] = $consentFormId;
    }
    
    if (!empty($conditions)) {
        $sql .= " WHERE " . implode(' AND ', $conditions);
    }
    
    $sql .= " ORDER BY pv.visitNumber ASC, pv.visitDate DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $visits = $stmt->fetchAll();
    
    // Decode vitals JSON for each visit
    foreach ($visits as &$visit) {
        $visit['vitals'] = json_decode($visit['vitals'], true) ?: [];
    }
    
    sendJsonResponse($visits);
    
} catch (Exception $e) {
    logError("Failed to fetch patient visits: " . $e->getMessage(), ['patientId' => $patientId, 'consentFormId' => $consentFormId]);
    sendErrorResponse("Failed to fetch patient visits", 500);
}
?>