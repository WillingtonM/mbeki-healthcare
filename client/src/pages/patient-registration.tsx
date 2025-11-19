import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPatientSchema, type InsertPatient } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function PatientRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const createPatientMutation = useMutation({
    mutationFn: async (data: InsertPatient) => {
      const response = await apiRequest("POST", "/api/patients", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Patient registered successfully!",
      });
      form.reset();
      setLocation("/lookup");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to register patient",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPatient) => {
    createPatientMutation.mutate(data);
  };

  return (
    <div className="p-6" data-testid="registration-section">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">Patient Registration</h2>
        <p className="text-muted-foreground">Register a new patient in the system</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      data-testid="input-first-name"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      data-testid="input-last-name"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      type="date"
                      id="dateOfBirth"
                      {...form.register("dateOfBirth")}
                      data-testid="input-date-of-birth"
                    />
                    {form.formState.errors.dateOfBirth && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select
                      value={form.watch("gender") || ""}
                      onValueChange={(value) => form.setValue("gender", value)}
                    >
                      <SelectTrigger data-testid="select-gender">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="idNumber">ID/Passport Number</Label>
                  <Input
                    id="idNumber"
                    {...form.register("idNumber")}
                    data-testid="input-id-number"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    rows={3}
                    {...form.register("address")}
                    data-testid="textarea-address"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Contact Information
                </h3>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    type="tel"
                    id="phone"
                    {...form.register("phone")}
                    data-testid="input-phone"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    type="email"
                    id="email"
                    {...form.register("email")}
                    data-testid="input-email"
                  />
                </div>

                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 mt-6">
                  Emergency Contact
                </h3>

                <div>
                  <Label htmlFor="nextOfKin">Next of Kin Name</Label>
                  <Input
                    id="nextOfKin"
                    {...form.register("nextOfKin")}
                    data-testid="input-next-of-kin"
                  />
                </div>

                <div>
                  <Label htmlFor="nextOfKinPhone">Next of Kin Phone</Label>
                  <Input
                    type="tel"
                    id="nextOfKinPhone"
                    {...form.register("nextOfKinPhone")}
                    data-testid="input-next-of-kin-phone"
                  />
                </div>

                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    placeholder="e.g., Spouse, Parent, Sibling"
                    {...form.register("relationship")}
                    data-testid="input-relationship"
                  />
                </div>


                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 mt-6">
                  Payment Information
                </h3>

                <div>
                  <Label>Payment Method *</Label>
                  <Select
                    value={form.watch("paymentMethod") || "cash"}
                    onValueChange={(value) => form.setValue("paymentMethod", value)}
                  >
                    <SelectTrigger data-testid="select-payment-method">
                      <SelectValue placeholder="Select Payment Method" />
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
                  <div className="space-y-4 p-4 border border-border rounded-md bg-muted/50">
                    <h4 className="text-md font-medium text-foreground">Medical Aid Details</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="medicalAidProvider">Medical Aid Provider *</Label>
                        <Input
                          id="medicalAidProvider"
                          placeholder="e.g., Discovery, Momentum, Bonitas"
                          {...form.register("medicalAidProvider")}
                          data-testid="input-medical-aid-provider"
                        />
                      </div>
                      <div>
                        <Label htmlFor="medicalAidNumber">Medical Aid Number *</Label>
                        <Input
                          id="medicalAidNumber"
                          placeholder="Medical aid scheme number"
                          {...form.register("medicalAidNumber")}
                          data-testid="input-medical-aid-number"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="medicalAidPrincipalMember">Principal Member Name</Label>
                        <Input
                          id="medicalAidPrincipalMember"
                          placeholder="Name of main member"
                          {...form.register("medicalAidPrincipalMember")}
                          data-testid="input-medical-aid-principal"
                        />
                      </div>
                      <div>
                        <Label htmlFor="medicalAidDependentCode">Dependent Code</Label>
                        <Input
                          id="medicalAidDependentCode"
                          placeholder="e.g., 01, 02, 03"
                          {...form.register("medicalAidDependentCode")}
                          data-testid="input-medical-aid-dependent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/")}
                data-testid="button-cancel-registration"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPatientMutation.isPending}
                data-testid="button-register-patient"
              >
                {createPatientMutation.isPending ? "Registering..." : "Register Patient"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
