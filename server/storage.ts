import {
  users,
  coverLetters,
  type User,
  type UpsertUser,
  type CoverLetter,
  type InsertCoverLetter,
  type UpdateUser,
  type InsertUser,
  type LoginUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: UpdateUser): Promise<User>;
  updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User>;
  
  // Auth operations
  verifyUser(email: string, password: string): Promise<User | null>;
  
  // Cover letter operations
  createCoverLetter(coverLetter: InsertCoverLetter): Promise<CoverLetter>;
  getCoverLettersByUser(userId: string): Promise<CoverLetter[]>;
  getCoverLetter(id: string): Promise<CoverLetter | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: UpdateUser): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        isPremium: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Auth operations
  async verifyUser(email: string, password: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user || user.password !== password) {
      return null;
    }
    
    return user;
  }

  // Cover letter operations
  async createCoverLetter(coverLetter: InsertCoverLetter): Promise<CoverLetter> {
    const [letter] = await db
      .insert(coverLetters)
      .values(coverLetter)
      .returning();
    return letter;
  }

  async getCoverLettersByUser(userId: string): Promise<CoverLetter[]> {
    return await db
      .select()
      .from(coverLetters)
      .where(eq(coverLetters.userId, userId))
      .orderBy(desc(coverLetters.createdAt));
  }

  async getCoverLetter(id: string): Promise<CoverLetter | undefined> {
    const [letter] = await db
      .select()
      .from(coverLetters)
      .where(eq(coverLetters.id, id));
    return letter;
  }
}

export const storage = new DatabaseStorage();
