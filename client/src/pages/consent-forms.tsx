import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertConsentFormSchema, type InsertConsentForm, type Patient } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import SignatureCanvas from "@/components/signature-canvas";
import { consentTemplates } from "@/lib/consent-templates";
import { generateConsentPDF } from "@/lib/pdf-utils";

export default function ConsentForms() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [signature, setSignature] = useState<string | null>(null);
  
  // Helper function to check if signature has actual content
  const isSignatureValid = (sig: string | null): boolean => {
    if (!sig) return false;
    
    // Create a temporary canvas to get empty canvas data URL
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 600;
    tempCanvas.height = 200;
    const emptyDataURL = tempCanvas.toDataURL();
    
    // Compare with empty canvas - if they're the same, no signature was drawn
    return sig !== emptyDataURL;
  };
  const [consentGiven, setConsentGiven] = useState(false);
  const [treatmentSpecificData, setTreatmentSpecificData] = useState<Record<string, any>>({});
  const [patientSearchQuery, setPatientSearchQuery] = useState("");

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const filteredPatients = (patients as Patient[]).filter((patient: Patient) => {
    if (!patientSearchQuery) return true;
    const query = patientSearchQuery.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(query) ||
      patient.lastName.toLowerCase().includes(query) ||
      patient.phone.includes(query) ||
      (patient.idNumber && patient.idNumber.toLowerCase().includes(query))
    );
  });

  const form = useForm<InsertConsentForm>({
    resolver: zodResolver(insertConsentFormSchema),
    defaultValues: {
      patientId: "",
      nurseName: "",
      treatmentType: "",
      treatmentName: "",
      treatmentDate: new Date().toISOString().split('T')[0],
      customTerms: "",
      vitals: {},
      treatmentSpecifics: {},
      medicalProfile: {},
      signature: "",
      consentGiven: false,
    },
  });

  const treatmentType = form.watch("treatmentType");
  const selectedTemplate = treatmentType ? consentTemplates[treatmentType] : null;

  const createConsentMutation = useMutation({
    mutationFn: async (data: InsertConsentForm) => {
      const response = await apiRequest("POST", "/api/consent-forms", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consent-forms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients/today"] });
      toast({
        title: "Success",
        description: "Consent form saved successfully!",
      });
      form.reset();
      setSignature(null);
      setConsentGiven(false);
      setTreatmentSpecificData({});
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save consent form",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertConsentForm) => {
    if (!isSignatureValid(signature)) {
      toast({
        title: "Error",
        description: "Please provide a signature",
        variant: "destructive",
      });
      return;
    }

    if (!consentGiven) {
      toast({
        title: "Error",
        description: "Patient consent must be confirmed",
        variant: "destructive",
      });
      return;
    }

    const vitalsData = {
      bp: (document.getElementById("vital-bp") as HTMLInputElement)?.value || "",
      pulse: (document.getElementById("vital-pulse") as HTMLInputElement)?.value || "",
      temp: (document.getElementById("vital-temp") as HTMLInputElement)?.value || "",
      weight: (document.getElementById("vital-weight") as HTMLInputElement)?.value || "",
      hgt: (document.getElementById("vital-hgt") as HTMLInputElement)?.value || "",
      hb: (document.getElementById("vital-hb") as HTMLInputElement)?.value || "",
    };

    const formData = {
      ...data,
      treatmentName: data.treatmentType === "other" ? data.treatmentName : selectedTemplate?.name || "",
      vitals: vitalsData,
      treatmentSpecifics: treatmentSpecificData,
      signature,
      consentGiven,
    };

    createConsentMutation.mutate(formData);
  };

  const handleExportPDF = () => {
    const patient = (patients as Patient[]).find((p: Patient) => p.id === form.watch("patientId"));
    if (!patient || !selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a patient and treatment first",
        variant: "destructive",
      });
      return;
    }

    const vitalsData = {
      bp: (document.getElementById("vital-bp") as HTMLInputElement)?.value || "",
      pulse: (document.getElementById("vital-pulse") as HTMLInputElement)?.value || "",
      temp: (document.getElementById("vital-temp") as HTMLInputElement)?.value || "",
      weight: (document.getElementById("vital-weight") as HTMLInputElement)?.value || "",
      hgt: (document.getElementById("vital-hgt") as HTMLInputElement)?.value || "",
      hb: (document.getElementById("vital-hb") as HTMLInputElement)?.value || "",
    };

    const pdfData = {
      patient: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        phone: patient.phone,
      },
      treatment: {
        type: treatmentType,
        name: selectedTemplate.name,
        date: form.watch("treatmentDate"),
        nurse: form.watch("nurseName"),
      },
      vitals: vitalsData,
      consentText: selectedTemplate.text.replace(/<[^>]*>/g, ''), // Strip HTML tags
      signature: signature || undefined,
    };

    generateConsentPDF(pdfData);
  };

  // Handle treatment-specific field changes
  useEffect(() => {
    if (treatmentType === "lipolytic") {
      const updateAreas = () => {
        const checkboxes = document.querySelectorAll('input[name="treatment-area"]:checked');
        const areas = Array.from(checkboxes).map((cb) => (cb as HTMLInputElement).value);
        setTreatmentSpecificData({ areas });
      };
      
      updateAreas();
      const checkboxes = document.querySelectorAll('input[name="treatment-area"]');
      checkboxes.forEach((cb) => cb.addEventListener('change', updateAreas));
      
      return () => {
        checkboxes.forEach((cb) => cb.removeEventListener('change', updateAreas));
      };
    } else if (treatmentType === "skin_removal") {
      const updateFields = () => {
        const fields = [
          "med_illnesses", "med_supplements", "med_keloids", "med_dermatologist",
          "med_previous_procedures", "med_allergies", "skin_location", "skin_number", "skin_changes"
        ];
        const data: Record<string, any> = {};
        fields.forEach((field) => {
          const element = document.getElementsByName(field)[0] as HTMLInputElement | HTMLTextAreaElement;
          if (element) data[field] = element.value;
        });
        setTreatmentSpecificData(data);
      };
      
      updateFields();
      const fields = [
        "med_illnesses", "med_supplements", "med_keloids", "med_dermatologist",
        "med_previous_procedures", "med_allergies", "skin_location", "skin_number", "skin_changes"
      ];
      const elements: Element[] = [];
      fields.forEach((field) => {
        const element = document.getElementsByName(field)[0];
        if (element) {
          elements.push(element);
          element.addEventListener('input', updateFields);
        }
      });
      
      return () => {
        elements.forEach((el) => el.removeEventListener('input', updateFields));
      };
    } else if (treatmentType === "tooth_whitening") {
      const updateGelConcentration = () => {
        const radioButton = document.querySelector('input[name="gel_concentration"]:checked') as HTMLInputElement;
        if (radioButton) {
          setTreatmentSpecificData({ gel_concentration: radioButton.value });
        } else {
          setTreatmentSpecificData({});
        }
      };
      
      updateGelConcentration();
      const radios = document.querySelectorAll('input[name="gel_concentration"]');
      radios.forEach((radio) => radio.addEventListener('change', updateGelConcentration));
      
      return () => {
        radios.forEach((radio) => radio.removeEventListener('change', updateGelConcentration));
      };
    } else {
      setTreatmentSpecificData({});
    }
  }, [treatmentType]);

  return (
    <div className="p-6" data-testid="consent-section">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">Consent Forms</h2>
        <p className="text-muted-foreground">Create and manage patient consent forms</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label>Select Patient *</Label>
                <Input
                  type="text"
                  placeholder="Search patients by name, phone, or ID..."
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                  className="mb-2"
                  data-testid="input-patient-search-consent"
                />
                <Select
                  value={form.watch("patientId")}
                  onValueChange={(value) => form.setValue("patientId", value)}
                >
                  <SelectTrigger data-testid="select-consent-patient">
                    <SelectValue placeholder="Select a patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient: Patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-results" disabled>
                        No patients found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.patientId && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.patientId.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="nurseName">Attending Nurse *</Label>
                <Input
                  id="nurseName"
                  placeholder="Enter nurse name"
                  {...form.register("nurseName")}
                  data-testid="input-nurse-name"
                />
                {form.formState.errors.nurseName && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.nurseName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label>Treatment Type *</Label>
                <Select
                  value={treatmentType}
                  onValueChange={(value) => form.setValue("treatmentType", value)}
                >
                  <SelectTrigger data-testid="select-treatment-type">
                    <SelectValue placeholder="Select treatment..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lipolytic">Lipolytic Injections</SelectItem>
                    <SelectItem value="ozempic_mounjaro">Ozempic/Mounjaro Weight Loss</SelectItem>
                    <SelectItem value="skin_removal">Skin Tag/Mole/Wart Removal</SelectItem>
                    <SelectItem value="iv_therapy">IV Therapy</SelectItem>
                    <SelectItem value="tooth_whitening">Tooth Whitening</SelectItem>
                    <SelectItem value="other">Other (Custom)</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.treatmentType && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.treatmentType.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="treatmentDate">Treatment Date *</Label>
                <Input
                  type="date"
                  id="treatmentDate"
                  {...form.register("treatmentDate")}
                  data-testid="input-treatment-date"
                />
                {form.formState.errors.treatmentDate && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.treatmentDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Custom Treatment Fields */}
            {treatmentType === "other" && (
              <Card className="border-border bg-muted/30">
                <CardHeader>
                  <CardTitle>Custom Treatment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="treatmentName">Treatment Name *</Label>
                    <Input
                      id="treatmentName"
                      placeholder="Enter custom treatment name"
                      {...form.register("treatmentName")}
                      data-testid="input-custom-treatment-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customTerms">Custom Terms and Conditions *</Label>
                    <Textarea
                      id="customTerms"
                      rows={8}
                      placeholder="Enter custom consent terms and conditions for this treatment..."
                      {...form.register("customTerms")}
                      data-testid="textarea-custom-terms"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medical Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 mb-4">
                Medical Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    rows={3}
                    placeholder="List any known allergies or write 'None'"
                    value={(form.watch("medicalProfile") as any)?.allergies || ""}
                    onChange={(e) => {
                      const currentMedicalProfile = (form.getValues("medicalProfile") as Record<string, any>) || {};
                      form.setValue("medicalProfile", {
                        ...currentMedicalProfile,
                        allergies: e.target.value
                      });
                    }}
                    data-testid="textarea-medical-allergies"
                  />
                </div>
                <div>
                  <Label htmlFor="medicalHistory">Medical History</Label>
                  <Textarea
                    id="medicalHistory"
                    rows={3}
                    placeholder="Brief relevant medical history or write 'None'"
                    value={(form.watch("medicalProfile") as any)?.medicalHistory || ""}
                    onChange={(e) => {
                      const currentMedicalProfile = (form.getValues("medicalProfile") as Record<string, any>) || {};
                      form.setValue("medicalProfile", {
                        ...currentMedicalProfile,
                        medicalHistory: e.target.value
                      });
                    }}
                    data-testid="textarea-medical-history"
                  />
                </div>
              </div>
            </div>

            {/* Vitals Section */}
            <div>
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 mb-4">
                Patient Vitals
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <Label htmlFor="vital-bp">BP</Label>
                  <Input id="vital-bp" placeholder="120/80" data-testid="input-vital-bp" />
                </div>
                <div>
                  <Label htmlFor="vital-pulse">Pulse</Label>
                  <Input id="vital-pulse" placeholder="72" data-testid="input-vital-pulse" />
                </div>
                <div>
                  <Label htmlFor="vital-temp">Temp (°C)</Label>
                  <Input id="vital-temp" placeholder="36.5" data-testid="input-vital-temp" />
                </div>
                <div>
                  <Label htmlFor="vital-weight">Weight (kg)</Label>
                  <Input id="vital-weight" placeholder="70" data-testid="input-vital-weight" />
                </div>
                <div>
                  <Label htmlFor="vital-hgt">HGT</Label>
                  <Input id="vital-hgt" placeholder="5.5" data-testid="input-vital-hgt" />
                </div>
                <div>
                  <Label htmlFor="vital-hb">HB</Label>
                  <Input id="vital-hb" placeholder="12.5" data-testid="input-vital-hb" />
                </div>
                <div>
                  <Label htmlFor="vital-blank1"> </Label>
                  <Input id="vital-blank1" data-testid="input-vital-blank1" />
                </div>
                <div>
                  <Label htmlFor="vital-blank2"> </Label>
                  <Input id="vital-blank2" data-testid="input-vital-blank2" />
                </div>
                <div>
                  <Label htmlFor="vital-blank3"> </Label>
                  <Input id="vital-blank3" data-testid="input-vital-blank3" />
                </div>
                <div>
                  <Label htmlFor="vital-blank4"> </Label>
                  <Input id="vital-blank4" data-testid="input-vital-blank4" />
                </div>
              </div>
            </div>

            {/* Treatment Specific Fields */}
            {selectedTemplate?.fields && (
              <div>
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 mb-4">
                  Treatment Specific Information
                </h3>
                <div dangerouslySetInnerHTML={{ __html: selectedTemplate.fields }} />
              </div>
            )}

            {/* Consent Text */}
            {(selectedTemplate || treatmentType === "other") && (
              <div data-testid="consent-text-section">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 mb-4">
                  Consent Document
                </h3>
                <div className="consent-text" data-testid="consent-text-display">
                  {treatmentType === "other" ? (
                    <div className="text-muted-foreground">
                      Custom consent terms will be shown here once entered above.
                    </div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: selectedTemplate?.text || "" }} />
                  )}
                </div>
              </div>
            )}

            {/* Digital Signature */}
            {(selectedTemplate || treatmentType === "other") && (
              <div data-testid="signature-section">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 mb-4">
                  Digital Signature
                </h3>
                <SignatureCanvas onSignatureChange={setSignature} value={signature || undefined} />
                <div className="flex items-center mt-4">
                  <Checkbox
                    id="patient-consent-checkbox"
                    checked={consentGiven}
                    onCheckedChange={(checked) => setConsentGiven(checked === true)}
                    data-testid="checkbox-patient-consent"
                  />
                  <Label htmlFor="patient-consent-checkbox" className="ml-2">
                    I confirm that the patient has read and consents to the above treatment
                  </Label>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/")}
                data-testid="button-cancel-consent"
              >
                Cancel
              </Button>
              {(selectedTemplate || treatmentType === "other") && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleExportPDF}
                  data-testid="button-export-consent-pdf"
                >
                  <i className="fas fa-file-pdf mr-2"></i>
                  Export PDF
                </Button>
              )}
              <Button
                type="submit"
                disabled={createConsentMutation.isPending}
                data-testid="button-save-consent"
              >
                <i className="fas fa-save mr-2"></i>
                {createConsentMutation.isPending ? "Saving..." : "Save Consent"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
