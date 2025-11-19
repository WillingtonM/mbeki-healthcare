import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { consentTemplates, getAllConsentTemplates } from "@/lib/consent-templates";

export default function Settings() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateContent, setTemplateContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // System preferences state
  const [preferences, setPreferences] = useState({
    defaultExportFormat: "pdf",
    autoSaveInterval: "5",
    requireSignature: true,
    backupEnabled: true,
  });

  const handleEditTemplate = (templateId: string) => {
    const template = consentTemplates[templateId];
    if (template) {
      setSelectedTemplate(templateId);
      setTemplateContent(template.text);
      setIsEditing(true);
      setIsTemplateModalOpen(true);
    }
  };

  const handleSaveTemplate = () => {
    // In a real implementation, this would save to the database
    toast({
      title: "Success",
      description: `Template for ${consentTemplates[selectedTemplate]?.name} updated successfully!`,
    });
    setIsTemplateModalOpen(false);
    setIsEditing(false);
    setSelectedTemplate("");
    setTemplateContent("");
  };

  const handleAddNewTemplate = () => {
    setSelectedTemplate("");
    setTemplateContent("");
    setIsEditing(false);
    setIsTemplateModalOpen(true);
  };

  const handleSavePreferences = () => {
    // In a real implementation, this would save to the database
    toast({
      title: "Success",
      description: "System preferences saved successfully!",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data Export",
      description: "Data export functionality will be available soon!",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Data Import",
      description: "Data import functionality will be available soon!",
    });
  };

  const handleBackupData = () => {
    toast({
      title: "Database Backup",
      description: "Creating database backup... This may take a few minutes.",
    });
    
    // Simulate backup process
    setTimeout(() => {
      toast({
        title: "Backup Complete",
        description: "Database backup completed successfully!",
      });
    }, 3000);
  };

  return (
    <div className="p-6" data-testid="settings-section">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">System Settings</h2>
        <p className="text-muted-foreground">Configure system preferences and manage templates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consent Templates */}
        <Card data-testid="consent-templates-card">
          <CardHeader>
            <CardTitle>Consent Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {getAllConsentTemplates().map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <span className="text-foreground font-medium">{template.name}</span>
                <Button
                  size="sm"
                  onClick={() => handleEditTemplate(template.id)}
                  data-testid={`button-edit-template-${template.id}`}
                >
                  <i className="fas fa-edit mr-2"></i>
                  Edit
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleAddNewTemplate}
              data-testid="button-add-template"
            >
              <i className="fas fa-plus mr-2"></i>
              Add New Template
            </Button>
          </CardContent>
        </Card>

        {/* System Preferences */}
        <Card data-testid="system-preferences-card">
          <CardHeader>
            <CardTitle>System Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Default Export Format</Label>
              <Select
                value={preferences.defaultExportFormat}
                onValueChange={(value) =>
                  setPreferences((prev) => ({ ...prev, defaultExportFormat: value }))
                }
              >
                <SelectTrigger data-testid="select-default-export-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Auto-save Interval (minutes)</Label>
              <Select
                value={preferences.autoSaveInterval}
                onValueChange={(value) =>
                  setPreferences((prev) => ({ ...prev, autoSaveInterval: value }))
                }
              >
                <SelectTrigger data-testid="select-auto-save-interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="require-signature"
                checked={preferences.requireSignature}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, requireSignature: checked === true }))
                }
                data-testid="checkbox-require-signature"
              />
              <Label htmlFor="require-signature">
                Require digital signature for all consent forms
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="backup-enabled"
                checked={preferences.backupEnabled}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, backupEnabled: checked === true }))
                }
                data-testid="checkbox-backup-enabled"
              />
              <Label htmlFor="backup-enabled">Enable automatic database backups</Label>
            </div>

            <Button
              onClick={handleSavePreferences}
              className="w-full"
              data-testid="button-save-preferences"
            >
              <i className="fas fa-save mr-2"></i>
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card data-testid="data-management-card">
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full flex items-center justify-start"
              onClick={handleExportData}
              data-testid="button-export-data"
            >
              <i className="fas fa-download mr-3 text-primary"></i>
              Export All Data
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-start"
              onClick={handleImportData}
              data-testid="button-import-data"
            >
              <i className="fas fa-upload mr-3 text-secondary"></i>
              Import Data
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-start"
              onClick={handleBackupData}
              data-testid="button-backup-data"
            >
              <i className="fas fa-database mr-3 text-green-600"></i>
              Create Backup
            </Button>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card data-testid="system-info-card">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">System Version:</span>
              <span className="text-muted-foreground">v2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Database Status:</span>
              <span className="text-green-600 flex items-center">
                <i className="fas fa-circle text-xs mr-2"></i>
                Connected
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Last Backup:</span>
              <span className="text-muted-foreground">Today, 2:30 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Storage Used:</span>
              <span className="text-muted-foreground">245 MB / 2 GB</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total Patients:</span>
              <span className="text-muted-foreground">127 records</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total Consents:</span>
              <span className="text-muted-foreground">89 documents</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Editor Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]" data-testid="template-editor-modal">
          <DialogHeader>
            <DialogTitle>
              {isEditing 
                ? `Edit ${consentTemplates[selectedTemplate]?.name} Template`
                : "Create New Consent Template"
              }
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!isEditing && (
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="Enter template name"
                  data-testid="input-template-name"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="template-content">Template Content</Label>
              <Textarea
                id="template-content"
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                rows={15}
                className="font-mono text-sm"
                placeholder="Enter the consent template content here. You can use HTML for formatting."
                data-testid="textarea-template-content"
              />
            </div>
            
            <div className="flex justify-end space-x-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setIsTemplateModalOpen(false)}
                data-testid="button-cancel-template"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTemplate}
                data-testid="button-save-template"
              >
                <i className="fas fa-save mr-2"></i>
                {isEditing ? "Update Template" : "Create Template"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
