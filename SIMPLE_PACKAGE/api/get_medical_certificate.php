<?php
require_once 'config.php';

try {
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        sendErrorResponse("Certificate ID is required");
    }
    
    $certificateId = sanitizeInput($_GET['id']);
    
    $stmt = $pdo->prepare("
        SELECT 
            mc.id, mc.patientId, mc.visitId, mc.nurseName, mc.nurseSignature,
            mc.certificateDate, mc.issuedDate, mc.diagnosisOrCondition,
            mc.recommendedRestDays, mc.additionalRecommendations, mc.workRestrictions,
            mc.followUpRequired, mc.followUpDate, mc.isValid, mc.emailSent,
            mc.downloadCount, mc.officialStamp, mc.stampText, mc.createdAt,
            CONCAT(p.firstName, ' ', p.lastName) as patientName,
            p.phone as patientPhone, p.email as patientEmail,
            p.dateOfBirth as patientDOB, p.address as patientAddress,
            pv.visitNumber, pv.visitDate, pv.progressNotes
        FROM medical_certificates mc
        JOIN patients p ON mc.patientId = p.id
        LEFT JOIN patient_visits pv ON mc.visitId = pv.id
        WHERE mc.id = ?
    ");
    
    $stmt->execute([$certificateId]);
    $certificate = $stmt->fetch();
    
    if (!$certificate) {
        sendErrorResponse("Medical certificate not found", 404);
    }
    
    // Increment download count
    $updateStmt = $pdo->prepare("UPDATE medical_certificates SET downloadCount = downloadCount + 1 WHERE id = ?");
    $updateStmt->execute([$certificateId]);
    
    sendJsonResponse($certificate);
    
} catch (Exception $e) {
    logError("Failed to fetch medical certificate: " . $e->getMessage(), ['id' => $_GET['id'] ?? null]);
    sendErrorResponse("Failed to fetch medical certificate", 500);
}
?>