import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPatientVisitSchema, type InsertPatientVisit, type Patient, type ConsentForm, type PatientVisit } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, User, FileText, Heart, Plus, Edit, Search } from "lucide-react";

export default function VisitTracking() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedConsentForm, setSelectedConsentForm] = useState<ConsentForm | null>(null);
  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<PatientVisit | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch patients
  const { data: patients = [], isLoading: loadingPatients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Fetch consent forms for selected patient
  const { data: consentForms = [], isLoading: loadingConsentForms } = useQuery<ConsentForm[]>({
    queryKey: ["/api/patients", selectedPatient?.id, "consent-forms"],
    enabled: !!selectedPatient?.id,
  });

  // Fetch visits for selected consent form
  const { data: visits = [], isLoading: loadingVisits } = useQuery<PatientVisit[]>({
    queryKey: ["/api/consent-forms", selectedConsentForm?.id, "visits"],
    enabled: !!selectedConsentForm?.id,
  });

  const form = useForm<InsertPatientVisit>({
    resolver: zodResolver(insertPatientVisitSchema),
    defaultValues: {
      patientId: "",
      consentFormId: "",
      visitNumber: "1",
      visitDate: new Date().toISOString().split('T')[0],
      nurseName: "",
      progressNotes: "",
      nextAppointmentDate: "",
      vitals: {},
    },
  });

  const createVisitMutation = useMutation({
    mutationFn: async (data: InsertPatientVisit) => {
      const response = await apiRequest("POST", "/api/visits", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consent-forms", selectedConsentForm?.id, "visits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Visit recorded successfully!",
      });
      setIsAddVisitOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record visit",
        variant: "destructive",
      });
    },
  });

  const updateVisitMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPatientVisit> }) => {
      const response = await apiRequest("PUT", `/api/visits/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consent-forms", selectedConsentForm?.id, "visits"] });
      toast({
        title: "Success",
        description: "Visit updated successfully!",
      });
      setEditingVisit(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update visit",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPatientVisit) => {
    if (editingVisit) {
      updateVisitMutation.mutate({ id: editingVisit.id, data });
    } else {
      // Client-side validation for visit limit
      if (visits.length >= 5) {
        toast({
          title: "Visit Limit Reached",
          description: "Maximum of 5 visits per treatment. Please complete current treatment before adding more visits.",
          variant: "destructive",
        });
        return;
      }
      
      const nextVisitNumber = String(visits.length + 1);
      createVisitMutation.mutate({
        ...data,
        patientId: selectedPatient!.id,
        consentFormId: selectedConsentForm!.id,
        visitNumber: nextVisitNumber,
      });
    }
  };

  const canAddVisit = selectedConsentForm && visits.length < 5;

  const getVisitBadgeVariant = (visitNumber: string) => {
    const visitExists = visits.some(v => v.visitNumber === visitNumber);
    return visitExists ? "default" : "outline";
  };

  return (
    <div className="p-6" data-testid="visit-tracking-section">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">Visit Tracking</h2>
        <p className="text-muted-foreground">Track patient visits and treatment progress (up to 5 visits per treatment)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Patient
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-patients"
                />
              </div>

              {/* Patient List */}
              {loadingPatients ? (
                <div className="text-center py-4">Loading patients...</div>
              ) : (
                <div className="space-y-2">
                  {patients
                    .filter((patient: Patient) => {
                      const query = searchQuery.toLowerCase();
                      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
                      const phone = patient.phone?.toLowerCase() || "";
                      return fullName.includes(query) || phone.includes(query);
                    })
                    .map((patient: Patient) => (
                      <Button
                        key={patient.id}
                        variant={selectedPatient?.id === patient.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setSelectedConsentForm(null);
                        }}
                        data-testid={`button-select-patient-${patient.id}`}
                      >
                        {patient.firstName} {patient.lastName}
                      </Button>
                    ))}
                  {patients.filter((patient: Patient) => {
                    const query = searchQuery.toLowerCase();
                    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
                    const phone = patient.phone?.toLowerCase() || "";
                    return fullName.includes(query) || phone.includes(query);
                  }).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      {searchQuery ? "No patients match your search" : "No patients found"}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Treatment Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Select Treatment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedPatient ? (
              <p className="text-muted-foreground text-center py-4">Select a patient first</p>
            ) : loadingConsentForms ? (
              <div className="text-center py-4">Loading treatments...</div>
            ) : (
              <div className="space-y-2">
                {consentForms.map((form: ConsentForm) => (
                  <Button
                    key={form.id}
                    variant={selectedConsentForm?.id === form.id ? "default" : "outline"}
                    className="w-full justify-start text-left"
                    onClick={() => setSelectedConsentForm(form)}
                    data-testid={`button-select-treatment-${form.id}`}
                  >
                    <div>
                      <div className="font-medium">{form.treatmentType}</div>
                      <div className="text-sm text-muted-foreground">{form.treatmentDate}</div>
                    </div>
                  </Button>
                ))}
                {consentForms.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No treatments found</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visit Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Visit Progress
              </div>
              {canAddVisit && (
                <Dialog open={isAddVisitOpen} onOpenChange={setIsAddVisitOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" data-testid="button-add-visit">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Visit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Record New Visit</DialogTitle>
                    </DialogHeader>
                    <VisitForm
                      form={form}
                      onSubmit={onSubmit}
                      isSubmitting={createVisitMutation.isPending}
                      visitNumber={visits.length + 1}
                    />
                  </DialogContent>
                </Dialog>
              )}
              {!canAddVisit && visits.length >= 5 && (
                <Button 
                  size="sm" 
                  disabled 
                  data-testid="button-add-visit-disabled"
                  onClick={() => {
                    toast({
                      title: "Visit Limit Reached",
                      description: "Maximum of 5 visits per treatment has been reached.",
                      variant: "destructive",
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Visit (Limit Reached)
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedConsentForm ? (
              <p className="text-muted-foreground text-center py-4">Select a treatment first</p>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Badge
                      key={num}
                      variant={getVisitBadgeVariant(String(num))}
                      className="text-sm"
                    >
                      Visit {num}
                    </Badge>
                  ))}
                </div>
                
                {visits.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Visits:</h4>
                    {visits.slice(-3).map((visit: PatientVisit) => (
                      <div key={visit.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">Visit {visit.visitNumber} - {visit.visitDate}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingVisit(visit);
                            form.reset({
                              ...visit,
                              vitals: visit.vitals || {},
                            });
                          }}
                          data-testid={`button-edit-visit-${visit.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {visits.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No visits recorded yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Visit History */}
      {selectedConsentForm && visits.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Visit History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="1" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                {[1, 2, 3, 4, 5].map((num) => (
                  <TabsTrigger
                    key={num}
                    value={String(num)}
                    disabled={!visits.some(v => v.visitNumber === String(num))}
                    data-testid={`tab-visit-${num}`}
                  >
                    Visit {num}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {[1, 2, 3, 4, 5].map((num) => {
                const visit = visits.find(v => v.visitNumber === String(num));
                return (
                  <TabsContent key={num} value={String(num)} className="mt-4">
                    {visit ? (
                      <VisitDetails visit={visit} />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Visit {num} not recorded yet
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Edit Visit Dialog */}
      <Dialog open={!!editingVisit} onOpenChange={() => setEditingVisit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Visit {editingVisit?.visitNumber}</DialogTitle>
          </DialogHeader>
          {editingVisit && (
            <VisitForm
              form={form}
              onSubmit={onSubmit}
              isSubmitting={updateVisitMutation.isPending}
              visitNumber={parseInt(editingVisit.visitNumber)}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Visit Form Component
function VisitForm({
  form,
  onSubmit,
  isSubmitting,
  visitNumber,
  isEditing = false,
}: {
  form: any;
  onSubmit: (data: InsertPatientVisit) => void;
  isSubmitting: boolean;
  visitNumber: number;
  isEditing?: boolean;
}) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="visitDate">Visit Date *</Label>
          <Input
            type="date"
            id="visitDate"
            {...form.register("visitDate")}
            data-testid="input-visit-date"
          />
        </div>
        <div>
          <Label htmlFor="nurseName">Attending Nurse *</Label>
          <Input
            id="nurseName"
            placeholder="Nurse name"
            {...form.register("nurseName")}
            data-testid="input-nurse-name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="progressNotes">Progress Notes</Label>
        <Textarea
          id="progressNotes"
          rows={3}
          placeholder="Record patient progress and observations"
          {...form.register("progressNotes")}
          data-testid="textarea-progress-notes"
        />
      </div>

      <div>
        <Label htmlFor="nextAppointmentDate">Next Appointment Date</Label>
        <Input
          type="date"
          id="nextAppointmentDate"
          {...form.register("nextAppointmentDate")}
          data-testid="input-next-appointment"
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Vital Signs</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <Label htmlFor="bp">BP</Label>
            <Input
              id="bp"
              placeholder="120/80"
              {...form.register("vitals.bp")}
              data-testid="input-vital-bp"
            />
          </div>
          <div>
            <Label htmlFor="pulse">Pulse</Label>
            <Input
              id="pulse"
              placeholder="72"
              {...form.register("vitals.pulse")}
              data-testid="input-vital-pulse"
            />
          </div>
          <div>
            <Label htmlFor="temp">Temp (°C)</Label>
            <Input
              id="temp"
              placeholder="36.5"
              {...form.register("vitals.temp")}
              data-testid="input-vital-temp"
            />
          </div>
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              placeholder="70"
              {...form.register("vitals.weight")}
              data-testid="input-vital-weight"
            />
          </div>
          <div>
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              placeholder="170"
              {...form.register("vitals.height")}
              data-testid="input-vital-height"
            />
          </div>
          <div>
            <Label htmlFor="oxygen">Oxygen (%)</Label>
            <Input
              id="oxygen"
              placeholder="98"
              {...form.register("vitals.oxygen")}
              data-testid="input-vital-oxygen"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          data-testid="button-save-visit"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Visit" : "Record Visit"}
        </Button>
      </div>
    </form>
  );
}

// Visit Details Component
function VisitDetails({ visit }: { visit: PatientVisit }) {
  const vitals = visit.vitals as any || {};
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium">Visit Information</h4>
          <div className="space-y-1 text-sm">
            <div><strong>Date:</strong> {visit.visitDate}</div>
            <div><strong>Nurse:</strong> {visit.nurseName}</div>
            {visit.nextAppointmentDate && (
              <div><strong>Next Appointment:</strong> {visit.nextAppointmentDate}</div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">Vital Signs</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {vitals.bp && <div><strong>BP:</strong> {vitals.bp}</div>}
            {vitals.pulse && <div><strong>Pulse:</strong> {vitals.pulse}</div>}
            {vitals.temp && <div><strong>Temp:</strong> {vitals.temp}°C</div>}
            {vitals.weight && <div><strong>Weight:</strong> {vitals.weight}kg</div>}
            {vitals.height && <div><strong>Height:</strong> {vitals.height}cm</div>}
            {vitals.oxygen && <div><strong>Oxygen:</strong> {vitals.oxygen}%</div>}
          </div>
        </div>
      </div>
      
      {visit.progressNotes && (
        <div>
          <h4 className="font-medium">Progress Notes</h4>
          <p className="text-sm text-muted-foreground mt-1">{visit.progressNotes}</p>
        </div>
      )}
    </div>
  );
}