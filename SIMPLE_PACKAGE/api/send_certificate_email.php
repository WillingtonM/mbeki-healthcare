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
    
    $required_fields = ['certificateId', 'recipientEmail'];
    $missing = validateRequired($input, $required_fields);
    
    if (!empty($missing)) {
        sendErrorResponse("Missing required fields: " . implode(', ', $missing));
    }
    
    $data = sanitizeInput($input);
    
    // Get certificate details
    $stmt = $pdo->prepare("
        SELECT 
            mc.*, 
            CONCAT(p.firstName, ' ', p.lastName) as patientName,
            p.email as patientEmail, p.phone as patientPhone
        FROM medical_certificates mc
        JOIN patients p ON mc.patientId = p.id
        WHERE mc.id = ?
    ");
    
    $stmt->execute([$data['certificateId']]);
    $certificate = $stmt->fetch();
    
    if (!$certificate) {
        sendErrorResponse("Medical certificate not found", 404);
    }
    
    // Prepare email content
    $subject = "Medical Certificate from Mbeki Healthcare for " . $certificate['patientName'];
    
    $emailBody = generateCertificateEmailBody($certificate, $data['recipientEmail']);
    
    // Send email
    $emailSent = sendCertificateEmail($data['recipientEmail'], $subject, $emailBody, $certificate);
    
    if ($emailSent) {
        // Update certificate email status
        $updateStmt = $pdo->prepare("UPDATE medical_certificates SET emailSent = 1, updatedAt = NOW() WHERE id = ?");
        $updateStmt->execute([$data['certificateId']]);
        
        sendJsonResponse([
            'success' => true,
            'message' => 'Medical certificate emailed successfully',
            'recipient' => $data['recipientEmail'],
            'certificateId' => $data['certificateId']
        ]);
    } else {
        sendErrorResponse("Failed to send email", 500);
    }
    
} catch (Exception $e) {
    logError("Failed to send certificate email: " . $e->getMessage(), ['input' => $input ?? []]);
    sendErrorResponse("Failed to send certificate email", 500);
}

function generateCertificateEmailBody($certificate, $recipientEmail) {
    $restDaysText = $certificate['recommendedRestDays'] == 1 ? '1 day' : $certificate['recommendedRestDays'] . ' days';
    
    return "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .certificate { border: 2px solid #2563eb; padding: 20px; margin: 20px 0; background: #f8fafc; }
            .stamp { text-align: center; margin: 20px 0; }
            .signature { margin-top: 30px; }
            .footer { background: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h1>🏥 MBEKI HEALTHCARE</h1>
            <h2>MEDICAL CERTIFICATE</h2>
        </div>
        
        <div class='content'>
            <div class='certificate'>
                <h3>MEDICAL CERTIFICATE</h3>
                <p><strong>Patient:</strong> {$certificate['patientName']}</p>
                <p><strong>Date of Issue:</strong> " . date('d F Y', strtotime($certificate['certificateDate'])) . "</p>
                <p><strong>Attending Nurse:</strong> {$certificate['nurseName']}</p>
                
                <hr style='margin: 20px 0;'>
                
                <h4>MEDICAL FINDINGS:</h4>
                <p>{$certificate['diagnosisOrCondition']}</p>
                
                <h4>MEDICAL RECOMMENDATION:</h4>
                <p>This is to certify that the above-named patient requires <strong>{$restDaysText}</strong> of rest from work/activities.</p>
                
                " . ($certificate['workRestrictions'] ? "<h4>WORK RESTRICTIONS:</h4><p>{$certificate['workRestrictions']}</p>" : "") . "
                
                " . ($certificate['additionalRecommendations'] ? "<h4>ADDITIONAL RECOMMENDATIONS:</h4><p>{$certificate['additionalRecommendations']}</p>" : "") . "
                
                " . ($certificate['followUpRequired'] ? "<p><strong>Follow-up Required:</strong> " . ($certificate['followUpDate'] ? "on " . date('d F Y', strtotime($certificate['followUpDate'])) : "Yes") . "</p>" : "") . "
                
                <div class='stamp'>
                    <p><strong>📋 {$certificate['stampText']}</strong></p>
                </div>
                
                <div class='signature'>
                    <p><strong>Nurse:</strong> {$certificate['nurseName']}</p>
                    <p><strong>Date:</strong> " . date('d F Y', strtotime($certificate['certificateDate'])) . "</p>
                    " . ($certificate['nurseSignature'] ? "<p><em>Digitally signed</em></p>" : "") . "
                </div>
            </div>
            
            <p><strong>Important:</strong> This medical certificate is valid and has been issued by Mbeki Healthcare. For verification, please contact our office.</p>
        </div>
        
        <div class='footer'>
            <p>© 2024 Mbeki Healthcare Patient Management System</p>
            <p>Developed & Owned by <a href='https://www.champsafrica.com'>Champs Group</a></p>
            <p>This is an automated email. Please do not reply directly to this email.</p>
        </div>
    </body>
    </html>
    ";
}

function sendCertificateEmail($to, $subject, $body, $certificate) {
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: Mbeki Healthcare <noreply@mbeki-healthcare.com>',
        'Reply-To: info@champsafrica.com',
        'X-Mailer: PHP/' . phpversion(),
        'X-Priority: 3',
        'Return-Path: noreply@mbeki-healthcare.com'
    ];
    
    // Attempt to send email
    $result = @mail($to, $subject, $body, implode("\r\n", $headers));
    
    if (!$result) {
        // Log email failure but don't expose details to client
        logError("Email sending failed", [
            'to' => $to,
            'subject' => $subject,
            'certificate_id' => $certificate['id'],
            'patient_name' => $certificate['patientName']
        ]);
    }
    
    return $result;
}
?>