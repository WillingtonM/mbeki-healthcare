import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: text("gender"),
  idNumber: text("id_number"),
  address: text("address"),
  phone: text("phone").notNull(),
  email: text("email"),
  nextOfKin: text("next_of_kin"),
  nextOfKinPhone: text("next_of_kin_phone"),
  relationship: text("relationship"),
  // Payment Information
  paymentMethod: text("payment_method").default("cash"), // cash, card, eft, medical_aid
  medicalAidNumber: text("medical_aid_number"),
  medicalAidProvider: text("medical_aid_provider"),
  medicalAidPrincipalMember: text("medical_aid_principal_member"),
  medicalAidDependentCode: text("medical_aid_dependent_code"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const consentForms = pgTable("consent_forms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  nurseName: text("nurse_name").notNull(),
  treatmentType: text("treatment_type").notNull(),
  treatmentName: text("treatment_name"),
  treatmentDate: text("treatment_date").notNull(),
  customTerms: text("custom_terms"),
  vitals: jsonb("vitals").notNull(),
  treatmentSpecifics: jsonb("treatment_specifics"),
  medicalProfile: jsonb("medical_profile").notNull().default('{}'),
  signature: text("signature"),
  consentGiven: boolean("consent_given").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const treatments = pgTable("treatments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  consentTemplate: text("consent_template"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Patient Visits Table (Track up to 5 visits per patient per consent form)
export const patientVisits = pgTable("patient_visits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  consentFormId: varchar("consent_form_id").notNull().references(() => consentForms.id),
  visitNumber: text("visit_number").notNull(), // 1, 2, 3, 4, 5
  visitDate: text("visit_date").notNull(),
  nurseName: text("nurse_name").notNull(),
  progressNotes: text("progress_notes"),
  nextAppointmentDate: text("next_appointment_date"),
  vitals: jsonb("vitals").notNull().default('{}'),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});


// Relations
export const patientsRelations = relations(patients, ({ many }) => ({
  consentForms: many(consentForms),
  visits: many(patientVisits),
}));

export const consentFormsRelations = relations(consentForms, ({ one, many }) => ({
  patient: one(patients, {
    fields: [consentForms.patientId],
    references: [patients.id],
  }),
  visits: many(patientVisits),
}));

export const patientVisitsRelations = relations(patientVisits, ({ one }) => ({
  patient: one(patients, {
    fields: [patientVisits.patientId],
    references: [patients.id],
  }),
  consentForm: one(consentForms, {
    fields: [patientVisits.consentFormId],
    references: [consentForms.id],
  }),
}));


// Insert schemas
export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConsentFormSchema = createInsertSchema(consentForms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTreatmentSchema = createInsertSchema(treatments).omit({
  id: true,
  createdAt: true,
});

export const insertPatientVisitSchema = createInsertSchema(patientVisits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});


// Types
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type ConsentForm = typeof consentForms.$inferSelect;
export type InsertConsentForm = z.infer<typeof insertConsentFormSchema>;
export type Treatment = typeof treatments.$inferSelect;
export type InsertTreatment = z.infer<typeof insertTreatmentSchema>;
export type PatientVisit = typeof patientVisits.$inferSelect;
export type InsertPatientVisit = z.infer<typeof insertPatientVisitSchema>;

// Legacy user schema (keeping for compatibility)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
