import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface ConsentPDFData {
  patient: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone: string;
  };
  treatment: {
    type: string;
    name: string;
    date: string;
    nurse: string;
  };
  vitals: Record<string, string>;
  consentText: string;
  signature?: string;
}

export async function generateConsentPDF(data: ConsentPDFData): Promise<void> {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 30;

  // Header
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("MBEKI HEALTHCARE", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  pdf.setFontSize(14);
  pdf.text("PATIENT CONSENT FORM", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 20;

  // Patient Information
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("PATIENT INFORMATION", margin, yPosition);
  yPosition += 10;

  pdf.setFont("helvetica", "normal");
  pdf.text(`Name: ${data.patient.firstName} ${data.patient.lastName}`, margin, yPosition);
  yPosition += 8;
  pdf.text(`Date of Birth: ${data.patient.dateOfBirth}`, margin, yPosition);
  yPosition += 8;
  pdf.text(`Phone: ${data.patient.phone}`, margin, yPosition);
  yPosition += 15;

  // Treatment Information
  pdf.setFont("helvetica", "bold");
  pdf.text("TREATMENT INFORMATION", margin, yPosition);
  yPosition += 10;

  pdf.setFont("helvetica", "normal");
  pdf.text(`Treatment: ${data.treatment.name}`, margin, yPosition);
  yPosition += 8;
  pdf.text(`Date: ${data.treatment.date}`, margin, yPosition);
  yPosition += 8;
  pdf.text(`Attending Nurse: ${data.treatment.nurse}`, margin, yPosition);
  yPosition += 15;

  // Vitals
  if (Object.keys(data.vitals).length > 0) {
    pdf.setFont("helvetica", "bold");
    pdf.text("VITALS", margin, yPosition);
    yPosition += 10;

    pdf.setFont("helvetica", "normal");
    Object.entries(data.vitals).forEach(([key, value]) => {
      if (value) {
        pdf.text(`${key.toUpperCase()}: ${value}`, margin, yPosition);
        yPosition += 8;
      }
    });
    yPosition += 10;
  }

  // Consent Text
  pdf.setFont("helvetica", "bold");
  pdf.text("CONSENT TERMS", margin, yPosition);
  yPosition += 10;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  
  // Split consent text into lines that fit the page width
  const textWidth = pageWidth - (margin * 2);
  const lines = pdf.splitTextToSize(data.consentText, textWidth);
  
  lines.forEach((line: string) => {
    if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
      pdf.addPage();
      yPosition = 30;
    }
    pdf.text(line, margin, yPosition);
    yPosition += 6;
  });

  yPosition += 15;

  // Signature
  if (data.signature) {
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("PATIENT SIGNATURE", margin, yPosition);
    yPosition += 10;

    // Add signature image
    try {
      pdf.addImage(data.signature, "PNG", margin, yPosition, 100, 30);
      yPosition += 40;
    } catch (error) {
      console.error("Error adding signature to PDF:", error);
      pdf.setFont("helvetica", "normal");
      pdf.text("Signature on file", margin, yPosition);
      yPosition += 10;
    }
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "italic");
  pdf.text(
    `Generated on ${new Date().toLocaleString()} - Mbeki Healthcare Patient Management System`,
    pageWidth / 2,
    pdf.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  // Save the PDF
  const fileName = `consent-${data.patient.firstName}-${data.patient.lastName}-${data.treatment.date}.pdf`;
  pdf.save(fileName);
}

export async function generatePatientReportPDF(
  patient: any,
  consentForms: any[]
): Promise<void> {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 30;

  // Header
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("MBEKI HEALTHCARE", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  pdf.setFontSize(14);
  pdf.text("PATIENT COMPREHENSIVE REPORT", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 20;

  // Patient Information
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("PATIENT INFORMATION", margin, yPosition);
  yPosition += 10;

  pdf.setFont("helvetica", "normal");
  const patientInfo = [
    `Name: ${patient.firstName} ${patient.lastName}`,
    `Date of Birth: ${patient.dateOfBirth}`,
    `Phone: ${patient.phone}`,
    `Email: ${patient.email || 'Not provided'}`,
    `Address: ${patient.address || 'Not provided'}`,
  ];

  patientInfo.forEach((info) => {
    pdf.text(info, margin, yPosition);
    yPosition += 8;
  });

  yPosition += 10;

  // Treatment History
  pdf.setFont("helvetica", "bold");
  pdf.text("TREATMENT HISTORY", margin, yPosition);
  yPosition += 10;

  if (consentForms.length === 0) {
    pdf.setFont("helvetica", "normal");
    pdf.text("No treatments recorded", margin, yPosition);
  } else {
    consentForms.forEach((form, index) => {
      if (yPosition > pdf.internal.pageSize.getHeight() - 50) {
        pdf.addPage();
        yPosition = 30;
      }

      pdf.setFont("helvetica", "bold");
      pdf.text(`Treatment ${index + 1}`, margin, yPosition);
      yPosition += 8;

      pdf.setFont("helvetica", "normal");
      pdf.text(`Type: ${form.treatmentName || form.treatmentType}`, margin + 10, yPosition);
      yPosition += 6;
      pdf.text(`Date: ${form.treatmentDate}`, margin + 10, yPosition);
      yPosition += 6;
      pdf.text(`Nurse: ${form.nurseName}`, margin + 10, yPosition);
      yPosition += 6;

      if (form.vitals && typeof form.vitals === 'object') {
        pdf.text("Vitals:", margin + 10, yPosition);
        yPosition += 6;
        
        Object.entries(form.vitals as Record<string, any>).forEach(([key, value]) => {
          if (value) {
            pdf.text(`  ${key.toUpperCase()}: ${value}`, margin + 15, yPosition);
            yPosition += 5;
          }
        });
      }

      yPosition += 10;
    });
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "italic");
  pdf.text(
    `Generated on ${new Date().toLocaleString()} - Mbeki Healthcare Patient Management System`,
    pageWidth / 2,
    pdf.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  // Save the PDF
  const fileName = `patient-report-${patient.firstName}-${patient.lastName}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}
