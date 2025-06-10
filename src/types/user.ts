import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { users, patients, doctors } from '../db/schema'

export type SelectUser = InferSelectModel<typeof users>
export type InsertUser = InferInsertModel<typeof users>

export type SelectPatient = InferSelectModel<typeof patients>
export type InsertPatient = InferInsertModel<typeof patients>

export type SelectDoctor = InferSelectModel<typeof doctors>
export type InsertDoctor = InferInsertModel<typeof doctors>
