<?php
require_once 'config.php';

try {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
    $search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : '';
    
    $sql = "SELECT 
                id, firstName, lastName, dateOfBirth, gender, idNumber, 
                phone, email, address, nextOfKin, nextOfKinPhone, 
                relationship, allergies, medicalHistory, paymentMethod,
                medicalAidNumber, medicalAidProvider, medicalAidPrincipalMember,
                medicalAidDependentCode, createdAt 
            FROM patients";
    
    $params = [];
    
    if (!empty($search)) {
        $sql .= " WHERE firstName LIKE ? OR lastName LIKE ? OR phone LIKE ? OR idNumber LIKE ? OR medicalAidNumber LIKE ?";
        $searchTerm = "%{$search}%";
        $params = [$searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm];
    }
    
    $sql .= " ORDER BY createdAt DESC";
    
    if ($limit) {
        $sql .= " LIMIT ?";
        $params[] = $limit;
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $patients = $stmt->fetchAll();
    
    sendJsonResponse($patients);
    
} catch (Exception $e) {
    logError("Failed to fetch patients: " . $e->getMessage(), ['query' => $_GET]);
    sendErrorResponse("Failed to fetch patients", 500);
}
?>