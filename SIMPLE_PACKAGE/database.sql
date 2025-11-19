-- Mbeki Healthcare Patient Management System Database Schema (Updated)
-- Developed by Champs Group - https://www.champsafrica.com
-- MySQL Database Schema with Medical Certificates, Visit Tracking & Payment Options

-- Create database (uncomment if creating new database)
-- CREATE DATABASE mbeki_healthcare;
-- USE mbeki_healthcare;

-- Patients Table (Updated with Payment Information)
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(36) PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    dateOfBirth DATE NOT NULL,
    gender ENUM('male', 'female', 'other') NULL,
    idNumber VARCHAR(50) NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NULL,
    address TEXT NULL,
    nextOfKin VARCHAR(255) NULL,
    nextOfKinPhone VARCHAR(20) NULL,
    relationship VARCHAR(100) NULL,
    allergies TEXT NULL,
    medicalHistory TEXT NULL,
    -- NEW: Payment Information
    paymentMethod ENUM('cash', 'card', 'eft', 'medical_aid') DEFAULT 'cash',
    medicalAidNumber VARCHAR(100) NULL,
    medicalAidProvider VARCHAR(255) NULL,
    medicalAidPrincipalMember VARCHAR(255) NULL,
    medicalAidDependentCode VARCHAR(50) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_patients_name (firstName, lastName),
    INDEX idx_patients_phone (phone),
    INDEX idx_patients_created (createdAt),
    INDEX idx_patients_payment (paymentMethod)
);

-- Consent Forms Table (Updated)
CREATE TABLE IF NOT EXISTS consent_forms (
    id VARCHAR(36) PRIMARY KEY,
    patientId VARCHAR(36) NOT NULL,
    nurseName VARCHAR(255) NOT NULL,
    treatmentType VARCHAR(100) NOT NULL,
    treatmentName VARCHAR(255) NULL,
    treatmentDate DATE NOT NULL,
    customTerms TEXT NULL,
    vitals JSON NULL,
    signature LONGTEXT NULL,
    consentGiven BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_consent_patient (patientId),
    INDEX idx_consent_treatment (treatmentType),
    INDEX idx_consent_date (treatmentDate),
    INDEX idx_consent_created (createdAt)
);

-- NEW: Patient Visits Table (Track up to 5 visits per patient)
CREATE TABLE IF NOT EXISTS patient_visits (
    id VARCHAR(36) PRIMARY KEY,
    patientId VARCHAR(36) NOT NULL,
    consentFormId VARCHAR(36) NOT NULL,
    visitNumber INT NOT NULL DEFAULT 1, -- 1 to 5
    visitDate DATE NOT NULL,
    nurseName VARCHAR(255) NOT NULL,
    progressNotes TEXT,
    nextAppointmentDate DATE NULL,
    -- Vitals for this specific visit
    vitals JSON NOT NULL DEFAULT '{}',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (consentFormId) REFERENCES consent_forms(id) ON DELETE CASCADE,
    UNIQUE KEY unique_patient_visit (patientId, consentFormId, visitNumber),
    INDEX idx_visits_patient (patientId),
    INDEX idx_visits_date (visitDate),
    INDEX idx_visits_next_appointment (nextAppointmentDate),
    
    CONSTRAINT chk_visit_number CHECK (visitNumber >= 1 AND visitNumber <= 5)
);

-- NEW: Medical Certificates Table
CREATE TABLE IF NOT EXISTS medical_certificates (
    id VARCHAR(36) PRIMARY KEY,
    patientId VARCHAR(36) NOT NULL,
    visitId VARCHAR(36) NULL, -- Optional link to specific visit
    nurseName VARCHAR(255) NOT NULL,
    nurseSignature LONGTEXT NULL,
    certificateDate DATE NOT NULL,
    issuedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Medical Certificate Details
    diagnosisOrCondition TEXT NOT NULL,
    recommendedRestDays INT DEFAULT 1,
    additionalRecommendations TEXT,
    workRestrictions TEXT,
    followUpRequired BOOLEAN DEFAULT FALSE,
    followUpDate DATE NULL,
    -- Certificate Status
    isValid BOOLEAN DEFAULT TRUE,
    emailSent BOOLEAN DEFAULT FALSE,
    downloadCount INT DEFAULT 0,
    -- Stamp Information
    officialStamp BOOLEAN DEFAULT TRUE,
    stampText VARCHAR(255) DEFAULT 'Mbeki Healthcare Official Stamp',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (visitId) REFERENCES patient_visits(id) ON DELETE SET NULL,
    INDEX idx_certificates_patient (patientId),
    INDEX idx_certificates_date (certificateDate),
    INDEX idx_certificates_valid (isValid),
    INDEX idx_certificates_nurse (nurseName)
);

-- System Settings Table (Enhanced)
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NULL,
    description TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert/Update default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('system_version', '2.0.0', 'System version number'),
('developer', 'Champs Group', 'System developer'),
('developer_website', 'https://www.champsafrica.com', 'Developer website'),
('error_email', 'info@champsafrica.com', 'Email for error reporting'),
('system_name', 'Mbeki Healthcare Patient Management System', 'System name'),
('last_backup', NULL, 'Last backup timestamp'),
('max_visits_per_patient', '5', 'Maximum visits per patient per treatment'),
('certificate_validity_days', '30', 'Default certificate validity in days'),
('smtp_enabled', 'false', 'Enable SMTP email sending'),
('smtp_host', '', 'SMTP server host'),
('smtp_port', '587', 'SMTP server port'),
('smtp_username', '', 'SMTP username'),
('smtp_password', '', 'SMTP password')
ON DUPLICATE KEY UPDATE 
    setting_value = VALUES(setting_value),
    description = VALUES(description),
    updatedAt = CURRENT_TIMESTAMP;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_search ON patients(firstName, lastName, phone, idNumber);
CREATE INDEX IF NOT EXISTS idx_consent_search ON consent_forms(patientId, treatmentType, treatmentDate);
CREATE INDEX IF NOT EXISTS idx_visits_search ON patient_visits(patientId, visitDate, visitNumber);
CREATE INDEX IF NOT EXISTS idx_certificates_search ON medical_certificates(patientId, certificateDate, isValid);

-- Enhanced Views for common queries
CREATE OR REPLACE VIEW patient_summary AS
SELECT 
    p.id,
    CONCAT(p.firstName, ' ', p.lastName) as fullName,
    p.phone,
    p.email,
    p.dateOfBirth,
    p.gender,
    p.paymentMethod,
    p.medicalAidProvider,
    p.createdAt,
    COUNT(DISTINCT cf.id) as consentFormsCount,
    COUNT(DISTINCT pv.id) as totalVisits,
    COUNT(DISTINCT mc.id) as medicalCertificatesCount,
    MAX(cf.treatmentDate) as lastTreatmentDate,
    MAX(pv.visitDate) as lastVisitDate,
    MAX(pv.nextAppointmentDate) as nextAppointmentDate
FROM patients p
LEFT JOIN consent_forms cf ON p.id = cf.patientId
LEFT JOIN patient_visits pv ON p.id = pv.patientId
LEFT JOIN medical_certificates mc ON p.id = mc.patientId
GROUP BY p.id, p.firstName, p.lastName, p.phone, p.email, p.dateOfBirth, p.gender, p.paymentMethod, p.medicalAidProvider, p.createdAt;

CREATE OR REPLACE VIEW consent_forms_with_patient AS
SELECT 
    cf.*,
    CONCAT(p.firstName, ' ', p.lastName) as patientName,
    p.phone as patientPhone,
    p.dateOfBirth as patientDOB,
    p.paymentMethod,
    COUNT(pv.id) as visitCount
FROM consent_forms cf
JOIN patients p ON cf.patientId = p.id
LEFT JOIN patient_visits pv ON cf.id = pv.consentFormId
GROUP BY cf.id, p.firstName, p.lastName, p.phone, p.dateOfBirth, p.paymentMethod;

-- NEW: View for patient visits with details
CREATE OR REPLACE VIEW patient_visits_detailed AS
SELECT 
    pv.*,
    CONCAT(p.firstName, ' ', p.lastName) as patientName,
    p.phone as patientPhone,
    cf.treatmentType,
    cf.treatmentName
FROM patient_visits pv
JOIN patients p ON pv.patientId = p.id
JOIN consent_forms cf ON pv.consentFormId = cf.id;

-- NEW: View for medical certificates with patient info
CREATE OR REPLACE VIEW medical_certificates_detailed AS
SELECT 
    mc.*,
    CONCAT(p.firstName, ' ', p.lastName) as patientName,
    p.phone as patientPhone,
    p.dateOfBirth as patientDOB,
    pv.visitNumber,
    pv.visitDate
FROM medical_certificates mc
JOIN patients p ON mc.patientId = p.id
LEFT JOIN patient_visits pv ON mc.visitId = pv.id;

-- Final setup message
SELECT 'Mbeki Healthcare Database Schema Updated Successfully!' as Message,
       'New Features: Medical Certificates, Visit Tracking (5 visits), Payment Options' as Features,
       'Developed by Champs Group - https://www.champsafrica.com' as Developer;