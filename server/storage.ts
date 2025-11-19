import { 
  users, type User, type InsertUser,
  patients, type Patient, type InsertPatient,
  consentForms, type ConsentForm, type InsertConsentForm,
  treatments, type Treatment,
  patientVisits, type PatientVisit, type InsertPatientVisit
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, gte, lt, count, desc, inArray } from "drizzle-orm";
import { sql } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Patient methods
  getAllPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | undefined>;
  createPatient(insertPatient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, insertPatient: InsertPatient): Promise<Patient | undefined>;
  deletePatient(id: string): Promise<boolean>;
  searchPatients(query: string): Promise<Patient[]>;
  getTodaysPatients(): Promise<Patient[]>;
  
  // Consent form methods
  getAllConsentForms(): Promise<ConsentForm[]>;
  getConsentForm(id: string): Promise<ConsentForm | undefined>;
  getConsentFormsByPatient(patientId: string): Promise<ConsentForm[]>;
  createConsentForm(insertConsentForm: InsertConsentForm): Promise<ConsentForm>;
  
  // Treatment methods
  getAllTreatments(): Promise<Treatment[]>;
  
  // Patient visit methods
  getPatientVisits(patientId: string): Promise<PatientVisit[]>;
  getVisitsByConsentForm(consentFormId: string): Promise<PatientVisit[]>;
  getPatientVisit(id: string): Promise<PatientVisit | undefined>;
  createPatientVisit(insertPatientVisit: InsertPatientVisit): Promise<PatientVisit>;
  updatePatientVisit(id: string, insertPatientVisit: Partial<InsertPatientVisit>): Promise<PatientVisit | undefined>;
  deletePatientVisit(id: string): Promise<boolean>;
  
  
  // Dashboard methods
  getDashboardStats(): Promise<{
    totalPatients: number;
    consentForms: number;
    todayVisits: number;
    pendingReports: number;
  }>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Patient methods
  async getAllPatients(): Promise<Patient[]> {
    return db.select().from(patients).orderBy(desc(patients.createdAt));
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db
      .insert(patients)
      .values(insertPatient)
      .returning();
    return patient;
  }

  async updatePatient(id: string, insertPatient: InsertPatient): Promise<Patient | undefined> {
    const [patient] = await db
      .update(patients)
      .set(insertPatient)
      .where(eq(patients.id, id))
      .returning();
    return patient || undefined;
  }

  async deletePatient(id: string): Promise<boolean> {
    const result = await db.delete(patients).where(eq(patients.id, id));
    return (result.rowCount || 0) > 0;
  }

  async searchPatients(query: string): Promise<Patient[]> {
    return db
      .select()
      .from(patients)
      .where(
        sql`${patients.firstName} ILIKE ${`%${query}%`} OR ${patients.lastName} ILIKE ${`%${query}%`} OR ${patients.phone} ILIKE ${`%${query}%`}`
      )
      .orderBy(desc(patients.createdAt));
  }

  async getTodaysPatients(): Promise<Patient[]> {
    const today = new Date().toISOString().split('T')[0];
    
    // Get all patients registered today with their registration time
    const registeredToday = await db
      .select()
      .from(patients)
      .where(sql`DATE(${patients.createdAt}) = ${today}`);
    
    // Get patient IDs and their latest consent form creation time for today
    const consentFormsToday = await db
      .select({
        patientId: consentForms.patientId,
        latestConsentTime: sql<string>`MAX(${consentForms.createdAt})`.as('latest_consent_time')
      })
      .from(consentForms)
      .where(sql`DATE(${consentForms.createdAt}) = ${today}`)
      .groupBy(consentForms.patientId);
    
    // Get full patient records for those with consent forms today
    const patientsWithConsentToday: Patient[] = [];
    if (consentFormsToday.length > 0) {
      const ids = consentFormsToday.map(p => p.patientId);
      const fetchedPatients = await db
        .select()
        .from(patients)
        .where(sql`${patients.id} IN (${sql.join(ids.map(id => sql`${id}`), sql`, `)})`);
      patientsWithConsentToday.push(...fetchedPatients);
    }
    
    // Create map to track activity times for each patient
    const patientActivityMap = new Map<string, { patient: Patient; activityTime: Date }>();
    
    // Add patients registered today (activity time = registration time)
    registeredToday.forEach(p => {
      patientActivityMap.set(p.id, {
        patient: p,
        activityTime: new Date(p.createdAt)
      });
    });
    
    // Add/update patients with consent forms today (activity time = latest consent time)
    patientsWithConsentToday.forEach(p => {
      const consentData = consentFormsToday.find(c => c.patientId === p.id);
      if (consentData) {
        const consentTime = new Date(consentData.latestConsentTime);
        const existing = patientActivityMap.get(p.id);
        
        if (!existing || consentTime > existing.activityTime) {
          // Use the most recent activity time
          patientActivityMap.set(p.id, {
            patient: p,
            activityTime: consentTime
          });
        }
      }
    });
    
    // Convert to array and sort by activity time (LIFO - most recent activity first)
    const allTodayPatients = Array.from(patientActivityMap.values());
    allTodayPatients.sort((a, b) => b.activityTime.getTime() - a.activityTime.getTime());
    
    // Return just the patient objects
    return allTodayPatients.map(entry => entry.patient);
  }

  // Consent form methods
  async getAllConsentForms(): Promise<ConsentForm[]> {
    return db.select().from(consentForms).orderBy(desc(consentForms.createdAt));
  }

  async getConsentForm(id: string): Promise<ConsentForm | undefined> {
    const [form] = await db.select().from(consentForms).where(eq(consentForms.id, id));
    return form || undefined;
  }

  async getConsentFormsByPatient(patientId: string): Promise<ConsentForm[]> {
    return db
      .select()
      .from(consentForms)
      .where(eq(consentForms.patientId, patientId))
      .orderBy(desc(consentForms.createdAt));
  }

  async createConsentForm(insertConsentForm: InsertConsentForm): Promise<ConsentForm> {
    const [form] = await db
      .insert(consentForms)
      .values(insertConsentForm)
      .returning();
    return form;
  }

  // Treatment methods
  async getAllTreatments(): Promise<Treatment[]> {
    return db.select().from(treatments).where(eq(treatments.isActive, true));
  }

  // Patient visit methods
  async getPatientVisits(patientId: string): Promise<PatientVisit[]> {
    return db
      .select()
      .from(patientVisits)
      .where(eq(patientVisits.patientId, patientId))
      .orderBy(patientVisits.visitDate);
  }

  async getVisitsByConsentForm(consentFormId: string): Promise<PatientVisit[]> {
    return db
      .select()
      .from(patientVisits)
      .where(eq(patientVisits.consentFormId, consentFormId))
      .orderBy(patientVisits.visitNumber);
  }

  async getPatientVisit(id: string): Promise<PatientVisit | undefined> {
    const [visit] = await db.select().from(patientVisits).where(eq(patientVisits.id, id));
    return visit || undefined;
  }

  async createPatientVisit(insertPatientVisit: InsertPatientVisit): Promise<PatientVisit> {
    const [visit] = await db
      .insert(patientVisits)
      .values(insertPatientVisit)
      .returning();
    return visit;
  }

  async updatePatientVisit(id: string, insertPatientVisit: Partial<InsertPatientVisit>): Promise<PatientVisit | undefined> {
    const [visit] = await db
      .update(patientVisits)
      .set(insertPatientVisit)
      .where(eq(patientVisits.id, id))
      .returning();
    return visit || undefined;
  }

  async deletePatientVisit(id: string): Promise<boolean> {
    const result = await db.delete(patientVisits).where(eq(patientVisits.id, id));
    return (result.rowCount || 0) > 0;
  }


  // Dashboard methods
  async getDashboardStats(): Promise<{
    totalPatients: number;
    consentForms: number;
    todayVisits: number;
    pendingReports: number;
  }> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const [totalPatients] = await db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(patients);
    const [totalConsentForms] = await db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(consentForms);
    
    // Count unique patients from both new registrations AND follow-ups (consent forms created today)
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Get count of patients registered today
    const [registeredToday] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(patients)
      .where(sql`DATE(${patients.createdAt}) = ${todayString}`);
    
    // Get count of unique patients with consent forms created today
    const [patientsWithConsentToday] = await db
      .select({ count: sql<number>`count(DISTINCT ${patients.id})`.mapWith(Number) })
      .from(patients)
      .innerJoin(consentForms, eq(consentForms.patientId, patients.id))
      .where(sql`DATE(${consentForms.createdAt}) = ${todayString}`);
    
    // For accurate count, we need to get the actual unique patient IDs from both sources
    const registeredTodayIds = await db
      .select({ id: patients.id })
      .from(patients)
      .where(sql`DATE(${patients.createdAt}) = ${todayString}`);
    
    const consentTodayIds = await db
      .selectDistinct({ id: patients.id })
      .from(patients)
      .innerJoin(consentForms, eq(consentForms.patientId, patients.id))
      .where(sql`DATE(${consentForms.createdAt}) = ${todayString}`);
    
    // Combine and deduplicate patient IDs
    const uniquePatientIds = new Set([
      ...registeredTodayIds.map(p => p.id),
      ...consentTodayIds.map(p => p.id)
    ]);
    
    return {
      totalPatients: totalPatients.count || 0,
      consentForms: totalConsentForms.count || 0,
      todayVisits: uniquePatientIds.size,
      pendingReports: 0, // Placeholder for future implementation
    };
  }
}

export const storage = new DatabaseStorage();