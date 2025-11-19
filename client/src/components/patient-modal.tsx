import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Patient, ConsentForm } from "@shared/schema";

interface PatientModalProps {
  patient: Patient | null;
  consentForms: ConsentForm[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (patient: Patient) => void;
  onCreateConsent: (patient: Patient) => void;
}

export default function PatientModal({
  patient,
  consentForms,
  isOpen,
  onClose,
  onEdit,
  onCreateConsent,
}: PatientModalProps) {
  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="patient-modal">
        <DialogHeader>
          <DialogTitle data-testid="text-patient-name">
            {patient.firstName} {patient.lastName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Personal Information
            </h3>
            
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Date of Birth:</span> {patient.dateOfBirth}</div>
              <div><span className="font-medium">Gender:</span> {patient.gender || 'Not specified'}</div>
              <div><span className="font-medium">ID Number:</span> {patient.idNumber || 'Not provided'}</div>
              <div><span className="font-medium">Phone:</span> {patient.phone}</div>
              <div><span className="font-medium">Email:</span> {patient.email || 'Not provided'}</div>
              {patient.address && (
                <div><span className="font-medium">Address:</span> {patient.address}</div>
              )}
            </div>

            <h4 className="text-md font-semibold text-foreground border-b border-border pb-2 mt-6">
              Payment Information
            </h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Payment Method:</span> {patient.paymentMethod || 'Cash'}</div>
              {patient.paymentMethod === "medical_aid" && (
                <>
                  {patient.medicalAidProvider && (
                    <div><span className="font-medium">Provider:</span> {patient.medicalAidProvider}</div>
                  )}
                  {patient.medicalAidNumber && (
                    <div><span className="font-medium">Number:</span> {patient.medicalAidNumber}</div>
                  )}
                  {patient.medicalAidPrincipalMember && (
                    <div><span className="font-medium">Principal Member:</span> {patient.medicalAidPrincipalMember}</div>
                  )}
                </>
              )}
            </div>

            {(patient.nextOfKin || patient.nextOfKinPhone) && (
              <>
                <h4 className="text-md font-semibold text-foreground border-b border-border pb-2 mt-6">
                  Emergency Contact
                </h4>
                <div className="space-y-2 text-sm">
                  {patient.nextOfKin && (
                    <div><span className="font-medium">Next of Kin:</span> {patient.nextOfKin}</div>
                  )}
                  {patient.nextOfKinPhone && (
                    <div><span className="font-medium">Phone:</span> {patient.nextOfKinPhone}</div>
                  )}
                  {patient.relationship && (
                    <div><span className="font-medium">Relationship:</span> {patient.relationship}</div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Treatment History
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {consentForms.length > 0 ? (
                consentForms.map((form) => (
                  <div key={form.id} className="p-3 border border-border rounded-lg bg-muted/30">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-foreground">
                        {form.treatmentName || form.treatmentType}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(form.treatmentDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><span className="font-medium">Nurse:</span> {form.nurseName}</div>
                      {form.vitals && typeof form.vitals === 'object' && (
                        <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                          {Object.entries(form.vitals as Record<string, string>).map(([key, value]) =>
                            value ? (
                              <span key={key}>
                                <strong>{key.toUpperCase()}:</strong> {String(value)}
                              </span>
                            ) : null
                          )}
                        </div>
                      )}
                      {form.medicalProfile && typeof form.medicalProfile === 'object' && Object.keys(form.medicalProfile).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs font-medium mb-1">Medical Profile:</p>
                          <div className="text-xs space-y-1">
                            {Object.entries(form.medicalProfile as Record<string, string>).map(([key, value]) =>
                              value ? (
                                <div key={key}>
                                  <strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong> {String(value)}
                                </div>
                              ) : null
                            )}
                          </div>
                        </div>
                      )}
                      {form.treatmentSpecifics && typeof form.treatmentSpecifics === 'object' && Object.keys(form.treatmentSpecifics).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs font-medium mb-1">Treatment Details:</p>
                          <div className="text-xs space-y-1">
                            {Object.entries(form.treatmentSpecifics as Record<string, any>).map(([key, value]) =>
                              value ? (
                                <div key={key}>
                                  <strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong> {Array.isArray(value) ? value.join(', ') : String(value)}
                                </div>
                              ) : null
                            )}
                          </div>
                        </div>
                      )}
                      <div className="mt-2 text-xs text-muted-foreground">
                        Consent: {form.consentGiven ? '✓ Signed' : '✗ Not signed'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No treatments recorded</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-border">
          <Button variant="outline" onClick={onClose} data-testid="button-close-modal">
            Close
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => onEdit(patient)}
            data-testid="button-edit-patient"
          >
            <i className="fas fa-edit mr-2"></i>
            Edit Patient
          </Button>
          <Button onClick={() => onCreateConsent(patient)} data-testid="button-create-consent">
            <i className="fas fa-file-signature mr-2"></i>
            Create Consent
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
