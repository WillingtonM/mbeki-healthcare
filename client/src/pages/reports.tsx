import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery } from "@tanstack/react-query";
import type { Patient, ConsentForm } from "@shared/schema";
import { generatePatientReportPDF } from "@/lib/pdf-utils";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [treatmentFilter, setTreatmentFilter] = useState("");
  const [exportFormat, setExportFormat] = useState("pdf");

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: consentForms = [] } = useQuery<ConsentForm[]>({
    queryKey: ["/api/consent-forms"],
  });

  const handleGeneratePatientReport = () => {
    toast({
      title: "Individual Patient Report",
      description: "Please select a patient from the Patient Lookup section to generate their detailed report.",
    });
  };

  const handleGenerateAllPatientsReport = async () => {
    try {
      // Generate a comprehensive report for all patients
      const reportData = {
        id: "all-patients",
        firstName: "All",
        lastName: "Patients",
        dateOfBirth: "",
        phone: "",
        email: "",
        address: "",
        createdAt: new Date().toISOString(),
      };

      await generatePatientReportPDF(reportData, consentForms as ConsentForm[]);
      toast({
        title: "Success",
        description: "All patients summary report generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  const handleGenerateTreatmentReport = () => {
    toast({
      title: "Treatment Analytics",
      description: "Treatment analytics report functionality coming soon!",
    });
  };

  const handleGenerateConsentReport = () => {
    toast({
      title: "Consent Forms Report",
      description: "Consent forms report functionality coming soon!",
    });
  };

  const handleGenerateCustomReport = () => {
    if (!reportType) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Custom Report",
      description: `Generating ${reportType} report in ${exportFormat.toUpperCase()} format...`,
    });
  };

  return (
    <div className="p-6" data-testid="reports-section">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">Reports & Analytics</h2>
        <p className="text-muted-foreground">Generate comprehensive patient and treatment reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card data-testid="patient-reports-card">
          <CardHeader>
            <CardTitle>Patient Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full flex items-center justify-start"
              onClick={handleGeneratePatientReport}
              data-testid="button-generate-patient-report"
            >
              <i className="fas fa-user mr-3 text-primary"></i>
              Individual Patient Report
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-start"
              onClick={handleGenerateAllPatientsReport}
              data-testid="button-generate-all-patients-report"
            >
              <i className="fas fa-users mr-3 text-primary"></i>
              All Patients Summary
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="treatment-reports-card">
          <CardHeader>
            <CardTitle>Treatment Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full flex items-center justify-start"
              onClick={handleGenerateTreatmentReport}
              data-testid="button-generate-treatment-report"
            >
              <i className="fas fa-syringe mr-3 text-secondary"></i>
              Treatment Analytics
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-start"
              onClick={handleGenerateConsentReport}
              data-testid="button-generate-consent-report"
            >
              <i className="fas fa-file-signature mr-3 text-secondary"></i>
              Consent Forms Report
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="financial-reports-card">
          <CardHeader>
            <CardTitle>Financial Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full flex items-center justify-start"
              data-testid="button-generate-revenue-report"
            >
              <i className="fas fa-chart-line mr-3 text-green-600"></i>
              Revenue Analysis
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-start"
              data-testid="button-generate-billing-report"
            >
              <i className="fas fa-receipt mr-3 text-green-600"></i>
              Billing Summary
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="custom-report-generator">
        <CardHeader>
          <CardTitle>Custom Report Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger data-testid="select-report-type">
                    <SelectValue placeholder="Select report type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient Data</SelectItem>
                    <SelectItem value="treatment">Treatment History</SelectItem>
                    <SelectItem value="consent">Consent Forms</SelectItem>
                    <SelectItem value="vitals">Vitals Tracking</SelectItem>
                    <SelectItem value="nurse">Nurse Activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="report-date-from">Date From</Label>
                  <Input
                    type="date"
                    id="report-date-from"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    data-testid="input-report-date-from"
                  />
                </div>
                <div>
                  <Label htmlFor="report-date-to">Date To</Label>
                  <Input
                    type="date"
                    id="report-date-to"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    data-testid="input-report-date-to"
                  />
                </div>
              </div>

              <div>
                <Label>Filter by Treatment</Label>
                <Select value={treatmentFilter} onValueChange={setTreatmentFilter}>
                  <SelectTrigger data-testid="select-report-treatment-filter">
                    <SelectValue placeholder="All treatments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All treatments</SelectItem>
                    <SelectItem value="lipolytic">Lipolytic Injections</SelectItem>
                    <SelectItem value="ozempic_mounjaro">Ozempic/Mounjaro</SelectItem>
                    <SelectItem value="skin_removal">Skin Removal</SelectItem>
                    <SelectItem value="iv_therapy">IV Therapy</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Export Format</Label>
                <RadioGroup
                  value={exportFormat}
                  onValueChange={setExportFormat}
                  className="space-y-2 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="format-pdf" />
                    <Label htmlFor="format-pdf">PDF Report</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excel" id="format-excel" />
                    <Label htmlFor="format-excel">Excel Spreadsheet</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="format-csv" />
                    <Label htmlFor="format-csv">CSV File</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex flex-col space-y-3 pt-4">
                <Button
                  onClick={handleGenerateCustomReport}
                  className="w-full"
                  data-testid="button-generate-custom-report"
                >
                  <i className="fas fa-chart-bar mr-2"></i>
                  Generate Report
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  data-testid="button-schedule-report"
                >
                  <i className="fas fa-clock mr-2"></i>
                  Schedule Report
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
