import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Patient } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  const { data: stats, isLoading } = useQuery<{
    totalPatients: number;
    consentForms: number;
    todayVisits: number;
    pendingReports: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentPatients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: todaysPatients } = useQuery<Patient[]>({
    queryKey: ["/api/patients/today"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="dashboard-section">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to the Mbeki Healthcare Patient Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="stats-total-patients">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary/10 rounded-lg">
                <i className="fas fa-users text-primary text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.totalPatients ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stats-consent-forms">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <i className="fas fa-file-signature text-secondary text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Consent Forms</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.consentForms ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stats-today-visits">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <i className="fas fa-calendar-check text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Today's Visits</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.todayVisits ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stats-pending-reports">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-lg">
                <i className="fas fa-clipboard-list text-amber-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending Reports</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.pendingReports ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card data-testid="todays-patients-card">
          <CardHeader>
            <CardTitle>Today's Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysPatients && todaysPatients.length > 0 ? (
                todaysPatients.map((patient: Patient) => (
                  <div 
                    key={patient.id} 
                    className={`flex items-center justify-between p-2 rounded ${
                      patient.paymentMethod === "medical_aid" 
                        ? "bg-blue-50 dark:bg-blue-950/20" 
                        : ""
                    }`}
                    data-testid={`today-patient-${patient.id}`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-primary"></i>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-foreground">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Phone: {patient.phone}
                        </p>
                        {patient.paymentMethod === "medical_aid" && patient.medicalAidProvider && (
                          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                            {patient.medicalAidProvider}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No patients visited today</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="recent-patients-card">
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPatients && recentPatients.length > 0 ? (
                recentPatients.slice(0, 5).map((patient: Patient) => (
                  <div 
                    key={patient.id} 
                    className={`flex items-center justify-between p-2 rounded ${
                      patient.paymentMethod === "medical_aid" 
                        ? "bg-blue-50 dark:bg-blue-950/20" 
                        : ""
                    }`}
                    data-testid={`recent-patient-${patient.id}`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-primary"></i>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-foreground">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Phone: {patient.phone}
                        </p>
                        {patient.paymentMethod === "medical_aid" && patient.medicalAidProvider && (
                          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                            {patient.medicalAidProvider}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No patients registered yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="quick-actions-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                onClick={() => setLocation("/registration")}
                className="w-full flex items-center justify-start px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                data-testid="button-register-patient"
              >
                <i className="fas fa-user-plus mr-3"></i>
                Register New Patient
              </Button>
              <Button
                onClick={() => setLocation("/consent")}
                className="w-full flex items-center justify-start px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
                data-testid="button-create-consent"
              >
                <i className="fas fa-file-signature mr-3"></i>
                Create Consent Form
              </Button>
              <Button
                onClick={() => setLocation("/reports")}
                variant="outline"
                className="w-full flex items-center justify-start px-4 py-3 rounded-lg"
                data-testid="button-generate-report"
              >
                <i className="fas fa-chart-bar mr-3"></i>
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
