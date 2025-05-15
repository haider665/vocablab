import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWordSchema, insertSavedWordSchema, insertQuizSchema } from "@shared/schema";
import { fetchWordDefinition, fetchRandomWord } from "../client/src/lib/api";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get user progress
  app.get("/api/user-progress", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  // Get search history
  app.get("/api/search-history", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const history = await storage.getSearchHistory(userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch search history" });
    }
  });

  // Get word of the day
  app.get("/api/word-of-the-day", async (_req, res) => {
    try {
      let word = await storage.getWordOfTheDay();
      
      if (!word) {
        // Fetch a random word if there's no word of the day
        const randomWord = await fetchRandomWord();
        const createdWord = await storage.createWord({
          ...randomWord as any,
          isWordOfTheDay: true
        });
        word = createdWord;
      }
      
      res.json(word);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch word of the day" });
    }
  });

  // Get saved words
  app.get("/api/saved-words", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const savedWords = await storage.getSavedWords(userId);
      res.json(savedWords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saved words" });
    }
  });

  // Delete saved word
  app.delete("/api/saved-words/:wordId", async (req, res) => {
    const wordId = parseInt(req.params.wordId);
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(wordId) || isNaN(userId)) {
      return res.status(400).json({ message: "Invalid word ID or user ID" });
    }
    
    try {
      await storage.removeSavedWord(userId, wordId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove saved word" });
    }
  });

  // Search for a word
  app.post("/api/words/search", async (req, res) => {
    const { userId, word } = req.body;
    
    if (!userId || !word || !word.word) {
      return res.status(400).json({ message: "Invalid request data" });
    }
    
    try {
      // Check if word exists in database
      let existingWord = await storage.getWordByWord(word.word);
      
      if (!existingWord) {
        // Create word if it doesn't exist
        const validatedWord = insertWordSchema.parse(word);
        existingWord = await storage.createWord(validatedWord);
      }
      
      // Add to search history
      await storage.addToSearchHistory(userId, existingWord.id);
      
      // Update user progress
      await storage.updateUserProgress(userId);
      
      res.json(existingWord);
    } catch (error) {
      res.status(500).json({ message: "Failed to process search" });
    }
  });

  // Save a word
  app.post("/api/words/save", async (req, res) => {
    const { userId, word } = req.body;
    
    if (!userId || !word || !word.word) {
      return res.status(400).json({ message: "Invalid request data" });
    }
    
    try {
      // Check if word exists in database
      let existingWord = await storage.getWordByWord(word.word);
      
      if (!existingWord) {
        // Create word if it doesn't exist
        const validatedWord = insertWordSchema.parse(word);
        existingWord = await storage.createWord(validatedWord);
      }
      
      // Save word for user
      const savedWordData = {
        userId,
        wordId: existingWord.id,
      };
      
      const validatedSavedWord = insertSavedWordSchema.parse(savedWordData);
      const savedWord = await storage.saveWord(validatedSavedWord);
      
      res.json(savedWord);
    } catch (error) {
      res.status(500).json({ message: "Failed to save word" });
    }
  });

  // Get quizzes
  app.get("/api/quizzes", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const quizzes = await storage.getQuizzes(userId);
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  // Save quiz result
  app.post("/api/quizzes", async (req, res) => {
    const { userId, score, totalQuestions } = req.body;
    
    if (!userId || score === undefined || !totalQuestions) {
      return res.status(400).json({ message: "Invalid request data" });
    }
    
    try {
      const quizData = {
        userId,
        score,
        totalQuestions,
      };
      
      const validatedQuiz = insertQuizSchema.parse(quizData);
      const quiz = await storage.createQuiz(validatedQuiz);
      
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ message: "Failed to save quiz" });
    }
  });

  // Get words learned over time
  app.get("/api/words-over-time", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      // In a real app, this would be fetched from a database
      // Here we're returning mock data for this demo
      const today = new Date();
      const data = Array(7).fill(0).map((_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: Math.floor(Math.random() * 10) + 1 // 1-10 words per day
        };
      }).reverse();
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch word learning data" });
    }
  });

  // Get user settings
  app.get("/api/user-settings", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's progress and other stats
      const progress = await storage.getUserProgress(userId);
      const savedWords = await storage.getSavedWords(userId);
      const quizzes = await storage.getQuizzes(userId);
      
      // Calculate average quiz score
      const avgQuizScore = quizzes.length > 0
        ? quizzes.reduce((sum, quiz) => sum + (quiz.score / quiz.totalQuestions * 100), 0) / quizzes.length
        : 0;
      
      res.json({
        displayName: user.username,
        email: `${user.username}@example.com`,
        weeklyGoal: progress?.weeklyGoal || 20,
        streakDays: progress?.streakDays || 7,
        totalWordsLearned: progress?.wordsLearned || 15,
        savedWordsCount: savedWords.length,
        avgQuizScore: `${Math.round(avgQuizScore)}%`,
        notificationsEnabled: true,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });

  // Update user settings
  app.patch("/api/user-settings/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { weeklyGoal, notificationsEnabled, displayName, email } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      // Update weekly goal
      if (weeklyGoal) {
        await storage.updateWeeklyGoal(userId, weeklyGoal);
      }
      
      // In a real app, we would update other settings too
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
