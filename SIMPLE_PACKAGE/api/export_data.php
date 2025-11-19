<?php
require_once 'config.php';

try {
    // Export all patients
    $stmt = $pdo->prepare("SELECT * FROM patients ORDER BY createdAt");
    $stmt->execute();
    $patients = $stmt->fetchAll();
    
    // Export all consent forms
    $stmt = $pdo->prepare("SELECT * FROM consent_forms ORDER BY createdAt");
    $stmt->execute();
    $consentForms = $stmt->fetchAll();
    
    // Export system settings
    $stmt = $pdo->prepare("SELECT * FROM system_settings");
    $stmt->execute();
    $settings = $stmt->fetchAll();
    
    $exportData = [
        'export_info' => [
            'system' => 'Mbeki Healthcare Patient Management System',
            'developer' => 'Champs Group',
            'website' => 'https://www.champsafrica.com',
            'export_date' => date('Y-m-d H:i:s'),
            'version' => '1.0.0'
        ],
        'patients' => $patients,
        'consent_forms' => $consentForms,
        'system_settings' => $settings,
        'statistics' => [
            'total_patients' => count($patients),
            'total_consent_forms' => count($consentForms),
            'total_settings' => count($settings)
        ]
    ];
    
    header('Content-Type: application/json');
    header('Content-Disposition: attachment; filename="mbeki-healthcare-backup-' . date('Y-m-d-H-i-s') . '.json"');
    
    echo json_encode($exportData, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    logError("Failed to export data: " . $e->getMessage());
    sendErrorResponse("Failed to export data", 500);
}
?>