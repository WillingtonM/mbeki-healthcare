<?php
require_once 'config.php';

try {
    $patientId = isset($_GET['patientId']) ? sanitizeInput($_GET['patientId']) : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
    
    $sql = "SELECT 
                mc.id, mc.patientId, mc.visitId, mc.nurseName, mc.nurseSignature,
                mc.certificateDate, mc.issuedDate, mc.diagnosisOrCondition,
                mc.recommendedRestDays, mc.additionalRecommendations, mc.workRestrictions,
                mc.followUpRequired, mc.followUpDate, mc.isValid, mc.emailSent,
                mc.downloadCount, mc.officialStamp, mc.stampText, mc.createdAt,
                CONCAT(p.firstName, ' ', p.lastName) as patientName,
                p.phone as patientPhone,
                pv.visitNumber, pv.visitDate
            FROM medical_certificates mc
            JOIN patients p ON mc.patientId = p.id
            LEFT JOIN patient_visits pv ON mc.visitId = pv.id";
    
    $params = [];
    
    if ($patientId) {
        $sql .= " WHERE mc.patientId = ?";
        $params[] = $patientId;
    }
    
    $sql .= " ORDER BY mc.certificateDate DESC, mc.createdAt DESC";
    
    if ($limit) {
        $sql .= " LIMIT ?";
        $params[] = $limit;
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $certificates = $stmt->fetchAll();
    
    sendJsonResponse($certificates);
    
} catch (Exception $e) {
    logError("Failed to fetch medical certificates: " . $e->getMessage(), ['patientId' => $patientId]);
    sendErrorResponse("Failed to fetch medical certificates", 500);
}
?>