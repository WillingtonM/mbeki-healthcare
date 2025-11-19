<?php
require_once 'config.php';

try {
    // Get total patients
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM patients");
    $stmt->execute();
    $totalPatients = $stmt->fetch()['count'];
    
    // Get total consent forms
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM consent_forms");
    $stmt->execute();
    $consentForms = $stmt->fetch()['count'];
    
    // Get today's visits
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM patient_visits 
        WHERE DATE(visitDate) = CURDATE()
    ");
    $stmt->execute();
    $todayVisits = $stmt->fetch()['count'];
    
    // Get today's certificates
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM medical_certificates 
        WHERE DATE(certificateDate) = CURDATE()
    ");
    $stmt->execute();
    $todayCertificates = $stmt->fetch()['count'];
    
    // Get upcoming appointments
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM patient_visits 
        WHERE nextAppointmentDate >= CURDATE()
    ");
    $stmt->execute();
    $upcomingAppointments = $stmt->fetch()['count'];
    
    // Get valid certificates
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM medical_certificates 
        WHERE isValid = TRUE
    ");
    $stmt->execute();
    $validCertificates = $stmt->fetch()['count'];
    
    // Payment method breakdown
    $stmt = $pdo->prepare("
        SELECT paymentMethod, COUNT(*) as count 
        FROM patients 
        GROUP BY paymentMethod
    ");
    $stmt->execute();
    $paymentBreakdown = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    
    sendJsonResponse([
        'totalPatients' => (int)$totalPatients,
        'consentForms' => (int)$consentForms,
        'todayVisits' => (int)$todayVisits,
        'todayCertificates' => (int)$todayCertificates,
        'upcomingAppointments' => (int)$upcomingAppointments,
        'validCertificates' => (int)$validCertificates,
        'paymentBreakdown' => $paymentBreakdown
    ]);
    
} catch (Exception $e) {
    logError("Failed to fetch dashboard stats: " . $e->getMessage());
    sendErrorResponse("Failed to fetch dashboard stats", 500);
}
?>