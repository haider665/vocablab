// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  words;
  savedWords;
  searchHistory;
  quizzes;
  userProgress;
  currentUserId = 1;
  currentWordId = 1;
  currentSavedWordId = 1;
  currentSearchHistoryId = 1;
  currentQuizId = 1;
  currentUserProgressId = 1;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.words = /* @__PURE__ */ new Map();
    this.savedWords = /* @__PURE__ */ new Map();
    this.searchHistory = /* @__PURE__ */ new Map();
    this.quizzes = /* @__PURE__ */ new Map();
    this.userProgress = /* @__PURE__ */ new Map();
    this.createUser({
      username: "demouser",
      password: "password",
      displayInitials: "JD"
    });
    this.createUserProgress({
      userId: 1,
      wordsLearned: 15,
      weeklyGoal: 20,
      streakDays: 7
    });
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(user) {
    const id = this.currentUserId++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
  // Word methods
  async getWordByWord(word) {
    return Array.from(this.words.values()).find(
      (w) => w.word.toLowerCase() === word.toLowerCase()
    );
  }
  async getWordById(id) {
    return this.words.get(id);
  }
  async createWord(word) {
    const id = this.currentWordId++;
    const timestamp2 = /* @__PURE__ */ new Date();
    const newWord = { ...word, id, timestamp: timestamp2 };
    this.words.set(id, newWord);
    return newWord;
  }
  async getWordOfTheDay() {
    return Array.from(this.words.values()).find(
      (word) => word.isWordOfTheDay
    );
  }
  // Saved words methods
  async saveWord(savedWord) {
    const existing = Array.from(this.savedWords.values()).find(
      (sw) => sw.userId === savedWord.userId && sw.wordId === savedWord.wordId
    );
    if (existing) {
      return existing;
    }
    const id = this.currentSavedWordId++;
    const timestamp2 = /* @__PURE__ */ new Date();
    const newSavedWord = { ...savedWord, id, timestamp: timestamp2 };
    this.savedWords.set(id, newSavedWord);
    return newSavedWord;
  }
  async getSavedWords(userId) {
    const savedWordEntries = Array.from(this.savedWords.values()).filter((sw) => sw.userId === userId);
    return Promise.all(
      savedWordEntries.map(async (sw) => {
        const word = await this.getWordById(sw.wordId);
        if (!word) throw new Error(`Word with id ${sw.wordId} not found`);
        return word;
      })
    );
  }
  async removeSavedWord(userId, wordId) {
    const savedWordEntry = Array.from(this.savedWords.values()).find(
      (sw) => sw.userId === userId && sw.wordId === wordId
    );
    if (savedWordEntry) {
      this.savedWords.delete(savedWordEntry.id);
    }
  }
  // Search history methods
  async addToSearchHistory(userId, wordId) {
    const id = this.currentSearchHistoryId++;
    const timestamp2 = /* @__PURE__ */ new Date();
    const newSearchHistory = { userId, wordId, id, timestamp: timestamp2 };
    this.searchHistory.set(id, newSearchHistory);
    return newSearchHistory;
  }
  async getSearchHistory(userId) {
    const wordIds = Array.from(this.searchHistory.values()).filter((sh) => sh.userId === userId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map((sh) => sh.wordId);
    const uniqueWordIds = [...new Set(wordIds)];
    const words2 = await Promise.all(
      uniqueWordIds.slice(0, 5).map(async (id) => {
        const word = await this.getWordById(id);
        if (!word) throw new Error(`Word with id ${id} not found`);
        return word;
      })
    );
    return words2;
  }
  // Quiz methods
  async createQuiz(quiz) {
    const id = this.currentQuizId++;
    const timestamp2 = /* @__PURE__ */ new Date();
    const newQuiz = { ...quiz, id, timestamp: timestamp2 };
    this.quizzes.set(id, newQuiz);
    return newQuiz;
  }
  async getQuizzes(userId) {
    return Array.from(this.quizzes.values()).filter((quiz) => quiz.userId === userId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  // User progress methods
  async getUserProgress(userId) {
    return Array.from(this.userProgress.values()).find(
      (progress) => progress.userId === userId
    );
  }
  async createUserProgress(progress) {
    const id = this.currentUserProgressId++;
    const lastActive = /* @__PURE__ */ new Date();
    const newProgress = { ...progress, id, lastActive };
    this.userProgress.set(id, newProgress);
    return newProgress;
  }
  async updateUserProgress(userId) {
    let progress = await this.getUserProgress(userId);
    if (!progress) {
      progress = await this.createUserProgress({
        userId,
        wordsLearned: 1,
        weeklyGoal: 20,
        streakDays: 1
      });
      return progress;
    }
    progress.wordsLearned += 1;
    const now = /* @__PURE__ */ new Date();
    const lastActive = progress.lastActive;
    const dayDifference = Math.floor((now.getTime() - lastActive.getTime()) / (1e3 * 60 * 60 * 24));
    if (dayDifference === 1) {
      progress.streakDays += 1;
    } else if (dayDifference > 1) {
      progress.streakDays = 1;
    }
    progress.lastActive = now;
    this.userProgress.set(progress.id, progress);
    return progress;
  }
  async updateWeeklyGoal(userId, weeklyGoal) {
    let progress = await this.getUserProgress(userId);
    if (!progress) {
      progress = await this.createUserProgress({
        userId,
        wordsLearned: 0,
        weeklyGoal,
        streakDays: 0
      });
      return progress;
    }
    progress.weeklyGoal = weeklyGoal;
    this.userProgress.set(progress.id, progress);
    return progress;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayInitials: text("display_initials").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayInitials: true
});
var words = pgTable("words", {
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
  isWordOfTheDay: boolean("is_word_of_the_day").default(false)
});
var insertWordSchema = createInsertSchema(words).omit({
  id: true,
  timestamp: true
});
var savedWords = pgTable("saved_words", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  wordId: integer("word_id").references(() => words.id).notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});
var insertSavedWordSchema = createInsertSchema(savedWords).omit({
  id: true,
  timestamp: true
});
var searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  wordId: integer("word_id").references(() => words.id).notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});
var insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  timestamp: true
});
var quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});
var insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  timestamp: true
});
var userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  wordsLearned: integer("words_learned").notNull().default(0),
  weeklyGoal: integer("weekly_goal").notNull().default(20),
  streakDays: integer("streak_days").notNull().default(0),
  lastActive: timestamp("last_active").defaultNow()
});
var insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  lastActive: true
});

// client/src/lib/api.ts
var getWordImage = async (word) => {
  try {
    const randomIndex = Math.floor(Math.random() * 5);
    return `https://source.unsplash.com/featured/?${encodeURIComponent(word)}&sig=${randomIndex}`;
  } catch (error) {
    console.error("Error fetching word image:", error);
    return "";
  }
};
var getAudioUrl = (phonetics) => {
  if (!phonetics || phonetics.length === 0) return "";
  const phoneticsWithAudio = phonetics.filter((p) => p.audio && p.audio.length > 0);
  if (phoneticsWithAudio.length === 0) return "";
  return phoneticsWithAudio[0].audio || "";
};
var mapDictionaryResponseToWord = async (response) => {
  const firstMeaning = response.meanings.find((m) => m.definitions.length > 0);
  if (!firstMeaning) throw new Error("No definitions found");
  const firstDefinition = firstMeaning.definitions[0];
  const partOfSpeech = firstMeaning.partOfSpeech;
  const allSynonyms = [
    .../* @__PURE__ */ new Set([
      ...firstMeaning.synonyms || [],
      ...response.meanings.flatMap((m) => m.synonyms || [])
    ])
  ].slice(0, 5);
  const allAntonyms = [
    .../* @__PURE__ */ new Set([
      ...firstMeaning.antonyms || [],
      ...response.meanings.flatMap((m) => m.antonyms || [])
    ])
  ].slice(0, 5);
  const imageUrl = await getWordImage(response.word);
  return {
    word: response.word,
    phonetic: response.phonetic || response.phonetics && response.phonetics[0]?.text || "",
    partOfSpeech,
    definition: firstDefinition.definition,
    example: firstDefinition.example || response.meanings.flatMap((m) => m.definitions).find((d) => d.example)?.example || "",
    imageUrl,
    synonyms: allSynonyms,
    antonyms: allAntonyms,
    pronunciationUrl: getAudioUrl(response.phonetics)
  };
};
var fetchWordDefinition = async (word) => {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch definition for "${word}"`);
    }
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`No definition found for "${word}"`);
    }
    const wordData = await mapDictionaryResponseToWord(data[0]);
    return wordData;
  } catch (error) {
    console.error("Error fetching word definition:", error);
    throw error;
  }
};
var fetchRandomWord = async () => {
  try {
    const randomWords = [
      "ephemeral",
      "serendipity",
      "ubiquitous",
      "luminescence",
      "mellifluous",
      "eloquent",
      "pernicious",
      "esoteric",
      "quintessential",
      "surreptitious"
    ];
    const randomIndex = Math.floor(Math.random() * randomWords.length);
    const randomWord = randomWords[randomIndex];
    return await fetchWordDefinition(randomWord);
  } catch (error) {
    console.error("Error fetching random word:", error);
    throw error;
  }
};

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/user-progress", async (req, res) => {
    const userId = parseInt(req.query.userId);
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
  app2.get("/api/search-history", async (req, res) => {
    const userId = parseInt(req.query.userId);
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
  app2.get("/api/word-of-the-day", async (_req, res) => {
    try {
      let word = await storage.getWordOfTheDay();
      if (!word) {
        const randomWord = await fetchRandomWord();
        const createdWord = await storage.createWord({
          ...randomWord,
          isWordOfTheDay: true
        });
        word = createdWord;
      }
      res.json(word);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch word of the day" });
    }
  });
  app2.get("/api/saved-words", async (req, res) => {
    const userId = parseInt(req.query.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    try {
      const savedWords2 = await storage.getSavedWords(userId);
      res.json(savedWords2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saved words" });
    }
  });
  app2.delete("/api/saved-words/:wordId", async (req, res) => {
    const wordId = parseInt(req.params.wordId);
    const userId = parseInt(req.query.userId);
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
  app2.post("/api/words/search", async (req, res) => {
    const { userId, word } = req.body;
    if (!userId || !word || !word.word) {
      return res.status(400).json({ message: "Invalid request data" });
    }
    try {
      let existingWord = await storage.getWordByWord(word.word);
      if (!existingWord) {
        const validatedWord = insertWordSchema.parse(word);
        existingWord = await storage.createWord(validatedWord);
      }
      await storage.addToSearchHistory(userId, existingWord.id);
      await storage.updateUserProgress(userId);
      res.json(existingWord);
    } catch (error) {
      res.status(500).json({ message: "Failed to process search" });
    }
  });
  app2.post("/api/words/save", async (req, res) => {
    const { userId, word } = req.body;
    if (!userId || !word || !word.word) {
      return res.status(400).json({ message: "Invalid request data" });
    }
    try {
      let existingWord = await storage.getWordByWord(word.word);
      if (!existingWord) {
        const validatedWord = insertWordSchema.parse(word);
        existingWord = await storage.createWord(validatedWord);
      }
      const savedWordData = {
        userId,
        wordId: existingWord.id
      };
      const validatedSavedWord = insertSavedWordSchema.parse(savedWordData);
      const savedWord = await storage.saveWord(validatedSavedWord);
      res.json(savedWord);
    } catch (error) {
      res.status(500).json({ message: "Failed to save word" });
    }
  });
  app2.get("/api/quizzes", async (req, res) => {
    const userId = parseInt(req.query.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    try {
      const quizzes2 = await storage.getQuizzes(userId);
      res.json(quizzes2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });
  app2.post("/api/quizzes", async (req, res) => {
    const { userId, score, totalQuestions } = req.body;
    if (!userId || score === void 0 || !totalQuestions) {
      return res.status(400).json({ message: "Invalid request data" });
    }
    try {
      const quizData = {
        userId,
        score,
        totalQuestions
      };
      const validatedQuiz = insertQuizSchema.parse(quizData);
      const quiz = await storage.createQuiz(validatedQuiz);
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ message: "Failed to save quiz" });
    }
  });
  app2.get("/api/words-over-time", async (req, res) => {
    const userId = parseInt(req.query.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    try {
      const today = /* @__PURE__ */ new Date();
      const data = Array(7).fill(0).map((_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        return {
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          count: Math.floor(Math.random() * 10) + 1
          // 1-10 words per day
        };
      }).reverse();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch word learning data" });
    }
  });
  app2.get("/api/user-settings", async (req, res) => {
    const userId = parseInt(req.query.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const progress = await storage.getUserProgress(userId);
      const savedWords2 = await storage.getSavedWords(userId);
      const quizzes2 = await storage.getQuizzes(userId);
      const avgQuizScore = quizzes2.length > 0 ? quizzes2.reduce((sum, quiz) => sum + quiz.score / quiz.totalQuestions * 100, 0) / quizzes2.length : 0;
      res.json({
        displayName: user.username,
        email: `${user.username}@example.com`,
        weeklyGoal: progress?.weeklyGoal || 20,
        streakDays: progress?.streakDays || 7,
        totalWordsLearned: progress?.wordsLearned || 15,
        savedWordsCount: savedWords2.length,
        avgQuizScore: `${Math.round(avgQuizScore)}%`,
        notificationsEnabled: true
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });
  app2.patch("/api/user-settings/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { weeklyGoal, notificationsEnabled, displayName, email } = req.body;
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    try {
      if (weeklyGoal) {
        await storage.updateWeeklyGoal(userId, weeklyGoal);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user settings" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
