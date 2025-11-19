import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { insertPatientSchema, insertConsentFormSchema, insertPatientVisitSchema } from "@shared/schema";
import { z } from "zod";
import { sendErrorReport, createErrorReport } from "./lib/error-reporter";
import fs from "fs";
import path from "path";

// Middleware to check if user is authenticated
function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
}

// Ensure admin user exists
async function ensureAdminUser() {
  try {
    console.log('🔍 Checking for admin user...');
    const existingAdmin = await storage.getUserByUsername("admin");
    if (!existingAdmin) {
      console.log('👤 Creating admin user...');
      const newAdmin = await storage.createUser({ username: "admin", password: "pmbeki" });
      console.log('✅ Admin user created successfully:', { id: newAdmin.id, username: newAdmin.username });
    } else {
      console.log('✅ Admin user already exists:', { id: existingAdmin.id, username: existingAdmin.username });
    }
  } catch (error) {
    console.error('❌ CRITICAL: Error ensuring admin user exists:', error);
    console.error('This may prevent login functionality. Please check database connectivity.');
    throw error; // Re-throw to prevent server from starting without admin user
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure admin user exists on startup
  await ensureAdminUser();

  // Authentication routes
  app.post("/api/auth/login", (req, res, next) => {
    console.log('🔐 Login attempt for username:', req.body.username);
    
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error('❌ Authentication error:', err);
        return res.status(500).json({ error: "Authentication error: " + (err.message || 'Database connection failed') });
      }
      if (!user) {
        console.log('❌ Login failed:', info?.message || 'Invalid credentials');
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      
      console.log('✅ User authenticated:', { id: user.id, username: user.username });
      
      req.logIn(user, (err: any) => {
        if (err) {
          console.error('❌ Login session error:', err);
          return res.status(500).json({ error: "Login error: " + (err.message || 'Session creation failed') });
        }
        console.log('✅ Login successful for user:', user.username);
        return res.json({ user: { id: user.id, username: user.username }, message: "Login successful" });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err: any) => {
      if (err) {
        return res.status(500).json({ error: "Logout error" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: { id: (req.user as any).id, username: (req.user as any).username } });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // Patient routes (protected)
  app.get("/api/patients", requireAuth, async (req, res) => {
    try {
      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      await sendErrorReport(createErrorReport(error as Error, {
        url: req.url,
        userAgent: req.get('User-Agent'),
        additionalInfo: { endpoint: 'GET /api/patients' }
      }));
      res.status(500).json({ error: "Failed to fetch patients" });
    }
  });

  // Get today's patients (protected) - MUST come before /:id route
  app.get("/api/patients/today", requireAuth, async (req, res) => {
    try {
      const patients = await storage.getTodaysPatients();
      res.json(patients);
    } catch (error) {
      console.error('Error fetching today\'s patients:', error);
      res.status(500).json({ error: "Failed to fetch today's patients" });
    }
  });

  // Search patients (protected) - MUST come before /:id route
  app.get("/api/patients/search/:query", requireAuth, async (req, res) => {
    try {
      const patients = await storage.searchPatients(req.params.query);
      res.json(patients);
    } catch (error) {
      res.status(500).json({ error: "Failed to search patients" });
    }
  });

  app.get("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      console.error('Error fetching patient:', error);
      await sendErrorReport(createErrorReport(error as Error, {
        url: req.url,
        userAgent: req.get('User-Agent'),
        additionalInfo: { endpoint: 'GET /api/patients/:id', patientId: req.params.id }
      }));
      res.status(500).json({ error: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid patient data", details: error.errors });
      }
      console.error('Error creating patient:', error);
      await sendErrorReport(createErrorReport(error as Error, {
        url: req.url,
        userAgent: req.get('User-Agent'),
        additionalInfo: { endpoint: 'POST /api/patients', requestBody: req.body }
      }));
      res.status(500).json({ error: "Failed to create patient" });
    }
  });

  app.put("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.updatePatient(req.params.id, validatedData);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid patient data", details: error.errors });
      }
      console.error('Error updating patient:', error);
      await sendErrorReport(createErrorReport(error as Error, {
        url: req.url,
        userAgent: req.get('User-Agent'),
        additionalInfo: { endpoint: 'PUT /api/patients/:id', patientId: req.params.id, requestBody: req.body }
      }));
      res.status(500).json({ error: "Failed to update patient" });
    }
  });

  app.delete("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deletePatient(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Patient not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting patient:', error);
      await sendErrorReport(createErrorReport(error as Error, {
        url: req.url,
        userAgent: req.get('User-Agent'),
        additionalInfo: { endpoint: 'DELETE /api/patients/:id', patientId: req.params.id }
      }));
      res.status(500).json({ error: "Failed to delete patient" });
    }
  });

  // Consent form routes (protected)
  app.get("/api/consent-forms", requireAuth, async (req, res) => {
    try {
      const consentForms = await storage.getAllConsentForms();
      res.json(consentForms);
    } catch (error) {
      console.error('Error fetching consent forms:', error);
      await sendErrorReport(createErrorReport(error as Error, {
        url: req.url,
        userAgent: req.get('User-Agent'),
        additionalInfo: { endpoint: 'GET /api/consent-forms' }
      }));
      res.status(500).json({ error: "Failed to fetch consent forms" });
    }
  });

  app.get("/api/consent-forms/:id", requireAuth, async (req, res) => {
    try {
      const consentForm = await storage.getConsentForm(req.params.id);
      if (!consentForm) {
        return res.status(404).json({ error: "Consent form not found" });
      }
      res.json(consentForm);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consent form" });
    }
  });

  app.get("/api/patients/:patientId/consent-forms", requireAuth, async (req, res) => {
    try {
      const consentForms = await storage.getConsentFormsByPatient(req.params.patientId);
      res.json(consentForms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch patient consent forms" });
    }
  });

  app.post("/api/consent-forms", requireAuth, async (req, res) => {
    try {
      const validatedData = insertConsentFormSchema.parse(req.body);
      const consentForm = await storage.createConsentForm(validatedData);
      res.status(201).json(consentForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid consent form data", details: error.errors });
      }
      console.error('Error creating consent form:', error);
      await sendErrorReport(createErrorReport(error as Error, {
        url: req.url,
        userAgent: req.get('User-Agent'),
        additionalInfo: { endpoint: 'POST /api/consent-forms', requestBody: req.body }
      }));
      res.status(500).json({ error: "Failed to create consent form" });
    }
  });

  // Dashboard stats (protected)
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Treatments routes (protected)
  app.get("/api/treatments", requireAuth, async (req, res) => {
    try {
      const treatments = await storage.getAllTreatments();
      res.json(treatments);
    } catch (error) {
      console.error('Error fetching treatments:', error);
      await sendErrorReport(createErrorReport(error as Error, {
        url: req.url,
        userAgent: req.get('User-Agent'),
        additionalInfo: { endpoint: 'GET /api/treatments' }
      }));
      res.status(500).json({ error: "Failed to fetch treatments" });
    }
  });

  // Patient visit routes (protected)
  app.get("/api/patients/:patientId/visits", requireAuth, async (req, res) => {
    try {
      const visits = await storage.getPatientVisits(req.params.patientId);
      res.json(visits);
    } catch (error) {
      console.error('Error fetching patient visits:', error);
      await sendErrorReport(createErrorReport(error as Error, {
        url: req.url,
        userAgent: req.get('User-Agent'),
        additionalInfo: { endpoint: 'GET /api/patients/:patientId/visits', patientId: req.params.patientId }
      }));
      res.status(500).json({ error: "Failed to fetch patient visits" });
    }
  });

  app.get("/api/consent-forms/:consentFormId/visits", requireAuth, async (req, res) => {
    try {
      const visits = await storage.getVisitsByConsentForm(req.params.consentFormId);
      res.json(visits);
    } catch (error) {
      console.error('Error fetching consent form visits:', error);
      await sendErrorReport(createErrorReport(error as Error, {
        url: req.url,
        userAgent: req.get('User-Agent'),
        additionalInfo: { endpoint: 'GET /api/consent-forms/:consentFormId/visits', consentFormId: req.params.consentFormId }
      }));
      res.status(500).json({ error: "Failed to fetch consent form visits" });
    }
  });

  app.get("/api/visits/:id", requireAuth, async (req, res) => {
    try {
      const visit = await storage.getPatientVisit(req.params.id);
      if (!visit) {
        return res.status(404).json({ error: "Visit not found" });
      }
      res.json(visit);
    } catch (error) {
      console.error('Error fetching visit:', error);
      await sendErrorReport(createErrorReport(error as Error, {
        url: req.url,
        userAgent: req.get('User-Agent'),
        additionalInfo: { endpoint: 'GET /api/visits/:id', visitId: req.params.id }
      }));
      res.status(500).json({ error: "Failed to fetch visit" });
    }
  });

  app.post("/api/visits", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPatientVisitSchema.parse(req.body);
      
      // Check visit limit: maximum 5 visits per consent form
      if (validatedData.consentFormId) {
        const existingVisits = await storage.getVisitsByConsentForm(validatedData.consentFormId);
        if (existingVisits.length >= 5) {
          return res.status(400).json({ 
            error: "Visit limit exceeded", 
            message: "Maximum of 5 visits per treatment allowed" 
          });
        }
      }
      
      const visit = await storage.createPatientVisit(validatedData);
      res.status(201).json(visit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid visit data", details: error.errors });
      }
      console.error('Error creating visit:', error);
      await sendErrorReport(createErrorReport(error as Error, {
        url: req.url,
        userAgent: req.get('User-Agent'),
        additionalInfo: { endpoint: 'POST /api/visits', requestBody: req.body }
      }));
      res.status(500).json({ error: "Failed to create visit" });
    }
  });

  app.put("/api/visits/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPatientVisitSchema.partial().parse(req.body);
      const visit = await storage.updatePatientVisit(req.params.id, validatedData);
      if (!visit) {
        return res.status(404).json({ error: "Visit not found" });
      }
      res.json(visit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid visit data", details: error.errors });
      }
      console.error('Error updating visit:', error);
      await sendErrorReport(createErrorReport(error as Error, {
        url: req.url,
        userAgent: req.get('User-Agent'),
        additionalInfo: { endpoint: 'PUT /api/visits/:id', visitId: req.params.id, requestBody: req.body }
      }));
      res.status(500).json({ error: "Failed to update visit" });
    }
  });

  app.delete("/api/visits/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deletePatientVisit(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Visit not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting visit:', error);
      await sendErrorReport(createErrorReport(error as Error, {
        url: req.url,
        userAgent: req.get('User-Agent'),
        additionalInfo: { endpoint: 'DELETE /api/visits/:id', visitId: req.params.id }
      }));
      res.status(500).json({ error: "Failed to delete visit" });
    }
  });


  // Serve attached assets with proper content types (security: whitelist allowed files)
  app.get("/attached_assets/:filename", (req, res) => {
    try {
      // Decode the filename to handle URL encoded characters
      const filename = decodeURIComponent(req.params.filename);
      
      // Security: Whitelist only allowed files to prevent path traversal
      const allowedFiles = [
        'Medical Certificate_1758367657234.pdf',
        'Medical Certificate_1758361485953.pdf', // Legacy support
        'IMG-20250215-WA0000(1)_1758352498357.jpg',
        'Phindie_1758352292653.JPG',
        'Sazi_1758352292654.JPG', 
        'Sharmaine_1758352292654.JPG',
        'IMG-20250215-WA0002_1__-_Copy-removebg-preview_1762238384185.png' // Favicon
      ];
      
      if (!allowedFiles.includes(filename)) {
        console.error('File not in whitelist:', filename);
        return res.status(403).json({ error: "File access denied" });
      }
      
      const filePath = path.join(process.cwd(), 'attached_assets', filename);
      console.log('Serving whitelisted file:', filename, 'from path:', filePath);
      
      if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return res.status(404).json({ error: "File not found" });
      }
      
      // Set proper content type based on file extension
      const ext = path.extname(filename).toLowerCase();
      if (ext === '.pdf') {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (ext === '.jpg' || ext === '.jpeg') {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (ext === '.png') {
        res.setHeader('Content-Type', 'image/png');
      }
      
      // Send the file
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: "Failed to serve file" });
          }
        }
      });
      
    } catch (error) {
      console.error('Error serving attached asset:', error);
      res.status(500).json({ error: "Failed to serve file" });
    }
  });

  // Error reporting endpoint for frontend errors
  app.post("/api/report-error", async (req, res) => {
    try {
      await sendErrorReport(req.body);
      res.status(200).json({ message: "Error report sent successfully" });
    } catch (error) {
      console.error('Failed to send error report:', error);
      res.status(500).json({ error: "Failed to send error report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
