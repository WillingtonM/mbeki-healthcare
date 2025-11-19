import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Patient, ConsentForm, InsertPatient } from "@shared/schema";
import { insertPatientSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PatientModal from "@/components/patient-modal";
import { Heart } from "lucide-react";

export default function PatientLookup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const { data: patients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: patientConsentForms = [] } = useQuery<ConsentForm[]>({
    queryKey: ["/api/patients", selectedPatient?.id, "consent-forms"],
    enabled: !!selectedPatient?.id,
  });

  const filteredPatients = patients.filter((patient: Patient) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(query) ||
      patient.lastName.toLowerCase().includes(query) ||
      patient.phone.includes(query) ||
      (patient.idNumber && patient.idNumber.toLowerCase().includes(query))
    );
  });

  const form = useForm<InsertPatient>({
    resolver: zodResolver(insertPatientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      idNumber: "",
      address: "",
      phone: "",
      email: "",
      nextOfKin: "",
      nextOfKinPhone: "",
      relationship: "",
      paymentMethod: "cash",
      medicalAidNumber: "",
      medicalAidProvider: "",
      medicalAidPrincipalMember: "",
      medicalAidDependentCode: "",
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertPatient }) => {
      const response = await apiRequest("PUT", `/api/patients/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients/today"] });
      toast({
        title: "Success",
        description: "Patient information updated successfully",
      });
      setIsEditModalOpen(false);
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update patient",
        variant: "destructive",
      });
    },
  });

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    form.reset({
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender || "",
      idNumber: patient.idNumber || "",
      address: patient.address || "",
      phone: patient.phone,
      email: patient.email || "",
      nextOfKin: patient.nextOfKin || "",
      nextOfKinPhone: patient.nextOfKinPhone || "",
      relationship: patient.relationship || "",
      paymentMethod: patient.paymentMethod || "cash",
      medicalAidNumber: patient.medicalAidNumber || "",
      medicalAidProvider: patient.medicalAidProvider || "",
      medicalAidPrincipalMember: patient.medicalAidPrincipalMember || "",
      medicalAidDependentCode: patient.medicalAidDependentCode || "",
    });
    setIsModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleCreateConsent = (patient: Patient) => {
    setLocation("/consent");
    setIsModalOpen(false);
  };

  const onSubmitEdit = (data: InsertPatient) => {
    if (editingPatient) {
      updatePatientMutation.mutate({ id: editingPatient.id, data });
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="lookup-section">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">Patient Lookup</h2>
        <p className="text-muted-foreground">Search and manage existing patients</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by name, phone, or ID number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-patient-search"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearSearch}
                data-testid="button-clear-search"
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Date of Birth</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Registration Date</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient: Patient) => (
                    <tr
                      key={patient.id}
                      className={`border-b border-border hover:bg-accent/50 ${
                        patient.paymentMethod === "medical_aid" 
                          ? "bg-blue-50 dark:bg-blue-950/20" 
                          : ""
                      }`}
                      data-testid={`row-patient-${patient.id}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <i className="fas fa-user text-primary text-sm"></i>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">
                                {patient.firstName} {patient.lastName}
                              </p>
                              {patient.paymentMethod === "medical_aid" && (
                                <Badge 
                                  variant="secondary" 
                                  className="bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1"
                                  data-testid={`badge-medical-aid-${patient.id}`}
                                >
                                  <Heart className="h-3 w-3" aria-hidden="true" />
                                  Medical Aid
                                </Badge>
                              )}
                            </div>
                            {patient.idNumber && (
                              <p className="text-sm text-muted-foreground">
                                ID: {patient.idNumber}
                              </p>
                            )}
                            {patient.paymentMethod === "medical_aid" && patient.medicalAidProvider && (
                              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 font-medium">
                                {patient.medicalAidProvider}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {patient.dateOfBirth}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {patient.phone}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleViewPatient(patient)}
                            data-testid={`button-view-${patient.id}`}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditPatient(patient)}
                            data-testid={`button-edit-${patient.id}`}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleCreateConsent(patient)}
                            data-testid={`button-consent-${patient.id}`}
                          >
                            Consent
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      {searchQuery ? "No patients found matching your search." : "No patients registered yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredPatients.length > 0 && (
            <div className="mt-6 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Showing {filteredPatients.length} of {(patients as Patient[]).length} patients
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <PatientModal
        patient={selectedPatient}
        consentForms={patientConsentForms}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEdit={handleEditPatient}
        onCreateConsent={handleCreateConsent}
      />

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="edit-patient-dialog">
          <DialogHeader>
            <DialogTitle>
              Edit Patient: {editingPatient?.firstName} {editingPatient?.lastName}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="edit-firstName">First Name *</Label>
                <Input
                  id="edit-firstName"
                  {...form.register("firstName")}
                  data-testid="input-edit-firstName"
                />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.firstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-lastName">Last Name *</Label>
                <Input
                  id="edit-lastName"
                  {...form.register("lastName")}
                  data-testid="input-edit-lastName"
                />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.lastName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-dateOfBirth">Date of Birth *</Label>
                <Input
                  type="date"
                  id="edit-dateOfBirth"
                  {...form.register("dateOfBirth")}
                  data-testid="input-edit-dateOfBirth"
                />
                {form.formState.errors.dateOfBirth && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-gender">Gender</Label>
                <Select
                  value={form.watch("gender") || undefined}
                  onValueChange={(value) => form.setValue("gender", value)}
                >
                  <SelectTrigger data-testid="select-edit-gender">
                    <SelectValue placeholder="Select gender..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-phone">Phone Number *</Label>
                <Input
                  id="edit-phone"
                  {...form.register("phone")}
                  data-testid="input-edit-phone"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  type="email"
                  id="edit-email"
                  {...form.register("email")}
                  data-testid="input-edit-email"
                />
              </div>

              <div>
                <Label htmlFor="edit-paymentMethod">Payment Method *</Label>
                <Select
                  value={form.watch("paymentMethod") || undefined}
                  onValueChange={(value) => form.setValue("paymentMethod", value)}
                >
                  <SelectTrigger data-testid="select-edit-paymentMethod">
                    <SelectValue placeholder="Select payment method..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="eft">EFT</SelectItem>
                    <SelectItem value="medical_aid">Medical Aid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.watch("paymentMethod") === "medical_aid" && (
                <>
                  <div>
                    <Label htmlFor="edit-medicalAidProvider">Medical Aid Provider *</Label>
                    <Input
                      id="edit-medicalAidProvider"
                      {...form.register("medicalAidProvider")}
                      data-testid="input-edit-medicalAidProvider"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-medicalAidNumber">Medical Aid Number *</Label>
                    <Input
                      id="edit-medicalAidNumber"
                      {...form.register("medicalAidNumber")}
                      data-testid="input-edit-medicalAidNumber"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updatePatientMutation.isPending}
                data-testid="button-save-patient"
              >
                {updatePatientMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
