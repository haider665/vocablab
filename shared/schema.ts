import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayInitials: text("display_initials").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayInitials: true,
});

export const words = pgTable("words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull().unique(),
  phonetic: text("phonetic"),
  partOfSpeech: text("part_of_speech"),
  definition: text("definition").notNull(),
  example: text("example"),
  imageUrl: text("image_url"),
  synonyms: text("synonyms").array(),
  antonyms: text("antonyms").array(),
  pronunciationUrl: text("pronunciation_url"),
  userId: integer("user_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow(),
  isWordOfTheDay: boolean("is_word_of_the_day").default(false),
});

export const insertWordSchema = createInsertSchema(words).omit({
  id: true,
  timestamp: true,
});

export const savedWords = pgTable("saved_words", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  wordId: integer("word_id").references(() => words.id).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertSavedWordSchema = createInsertSchema(savedWords).omit({
  id: true,
  timestamp: true,
});

export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  wordId: integer("word_id").references(() => words.id).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true, 
  timestamp: true,
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  timestamp: true,
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  wordsLearned: integer("words_learned").notNull().default(0),
  weeklyGoal: integer("weekly_goal").notNull().default(20),
  streakDays: integer("streak_days").notNull().default(0),
  lastActive: timestamp("last_active").defaultNow(),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  lastActive: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWord = z.infer<typeof insertWordSchema>;
export type Word = typeof words.$inferSelect;

export type InsertSavedWord = z.infer<typeof insertSavedWordSchema>;
export type SavedWord = typeof savedWords.$inferSelect;

export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;

export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;

export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
