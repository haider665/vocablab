import { 
  User, InsertUser, 
  Word, InsertWord, 
  SavedWord, InsertSavedWord,
  SearchHistory, InsertSearchHistory,
  Quiz, InsertQuiz,
  UserProgress, InsertUserProgress
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Word methods
  getWordByWord(word: string): Promise<Word | undefined>;
  getWordById(id: number): Promise<Word | undefined>;
  createWord(word: InsertWord): Promise<Word>;
  getWordOfTheDay(): Promise<Word | undefined>;
  
  // Saved words methods
  saveWord(savedWord: InsertSavedWord): Promise<SavedWord>;
  getSavedWords(userId: number): Promise<Word[]>;
  removeSavedWord(userId: number, wordId: number): Promise<void>;
  
  // Search history methods
  addToSearchHistory(userId: number, wordId: number): Promise<SearchHistory>;
  getSearchHistory(userId: number): Promise<Word[]>;
  
  // Quiz methods
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuizzes(userId: number): Promise<Quiz[]>;
  
  // User progress methods
  getUserProgress(userId: number): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(userId: number): Promise<UserProgress>;
  updateWeeklyGoal(userId: number, weeklyGoal: number): Promise<UserProgress>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private words: Map<number, Word>;
  private savedWords: Map<number, SavedWord>;
  private searchHistory: Map<number, SearchHistory>;
  private quizzes: Map<number, Quiz>;
  private userProgress: Map<number, UserProgress>;
  
  private currentUserId: number = 1;
  private currentWordId: number = 1;
  private currentSavedWordId: number = 1;
  private currentSearchHistoryId: number = 1;
  private currentQuizId: number = 1;
  private currentUserProgressId: number = 1;

  constructor() {
    this.users = new Map();
    this.words = new Map();
    this.savedWords = new Map();
    this.searchHistory = new Map();
    this.quizzes = new Map();
    this.userProgress = new Map();
    
    // Initialize with demo user
    this.createUser({
      username: "demouser",
      password: "password",
      displayInitials: "JD"
    });
    
    // Initialize with user progress
    this.createUserProgress({
      userId: 1,
      wordsLearned: 15,
      weeklyGoal: 20,
      streakDays: 7
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Word methods
  async getWordByWord(word: string): Promise<Word | undefined> {
    return Array.from(this.words.values()).find(
      (w) => w.word.toLowerCase() === word.toLowerCase(),
    );
  }
  
  async getWordById(id: number): Promise<Word | undefined> {
    return this.words.get(id);
  }
  
  async createWord(word: InsertWord): Promise<Word> {
    const id = this.currentWordId++;
    const timestamp = new Date();
    const newWord: Word = { ...word, id, timestamp };
    this.words.set(id, newWord);
    return newWord;
  }
  
  async getWordOfTheDay(): Promise<Word | undefined> {
    return Array.from(this.words.values()).find(
      (word) => word.isWordOfTheDay,
    );
  }
  
  // Saved words methods
  async saveWord(savedWord: InsertSavedWord): Promise<SavedWord> {
    // Check if already saved
    const existing = Array.from(this.savedWords.values()).find(
      (sw) => sw.userId === savedWord.userId && sw.wordId === savedWord.wordId,
    );
    
    if (existing) {
      return existing;
    }
    
    const id = this.currentSavedWordId++;
    const timestamp = new Date();
    const newSavedWord: SavedWord = { ...savedWord, id, timestamp };
    this.savedWords.set(id, newSavedWord);
    return newSavedWord;
  }
  
  async getSavedWords(userId: number): Promise<Word[]> {
    const savedWordEntries = Array.from(this.savedWords.values())
      .filter(sw => sw.userId === userId);
    
    return Promise.all(
      savedWordEntries.map(async sw => {
        const word = await this.getWordById(sw.wordId);
        if (!word) throw new Error(`Word with id ${sw.wordId} not found`);
        return word;
      })
    );
  }
  
  async removeSavedWord(userId: number, wordId: number): Promise<void> {
    const savedWordEntry = Array.from(this.savedWords.values()).find(
      sw => sw.userId === userId && sw.wordId === wordId
    );
    
    if (savedWordEntry) {
      this.savedWords.delete(savedWordEntry.id);
    }
  }
  
  // Search history methods
  async addToSearchHistory(userId: number, wordId: number): Promise<SearchHistory> {
    const id = this.currentSearchHistoryId++;
    const timestamp = new Date();
    const newSearchHistory: SearchHistory = { userId, wordId, id, timestamp };
    this.searchHistory.set(id, newSearchHistory);
    return newSearchHistory;
  }
  
  async getSearchHistory(userId: number): Promise<Word[]> {
    // Get unique wordIds in reverse chronological order (most recent first)
    const wordIds = Array.from(this.searchHistory.values())
      .filter(sh => sh.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .map(sh => sh.wordId);
    
    // Get unique wordIds (remove duplicates)
    const uniqueWordIds = [...new Set(wordIds)];
    
    // Get the words
    const words = await Promise.all(
      uniqueWordIds.slice(0, 5).map(async id => {
        const word = await this.getWordById(id);
        if (!word) throw new Error(`Word with id ${id} not found`);
        return word;
      })
    );
    
    return words;
  }
  
  // Quiz methods
  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const id = this.currentQuizId++;
    const timestamp = new Date();
    const newQuiz: Quiz = { ...quiz, id, timestamp };
    this.quizzes.set(id, newQuiz);
    return newQuiz;
  }
  
  async getQuizzes(userId: number): Promise<Quiz[]> {
    return Array.from(this.quizzes.values())
      .filter(quiz => quiz.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  // User progress methods
  async getUserProgress(userId: number): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values()).find(
      (progress) => progress.userId === userId,
    );
  }
  
  async createUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentUserProgressId++;
    const lastActive = new Date();
    const newProgress: UserProgress = { ...progress, id, lastActive };
    this.userProgress.set(id, newProgress);
    return newProgress;
  }
  
  async updateUserProgress(userId: number): Promise<UserProgress> {
    // Get existing progress
    let progress = await this.getUserProgress(userId);
    
    if (!progress) {
      // Create new progress if it doesn't exist
      progress = await this.createUserProgress({
        userId,
        wordsLearned: 1,
        weeklyGoal: 20,
        streakDays: 1
      });
      return progress;
    }
    
    // Update words learned
    progress.wordsLearned += 1;
    
    // Update streak days if necessary
    const now = new Date();
    const lastActive = progress.lastActive;
    const dayDifference = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDifference === 1) {
      // Perfect streak - increment
      progress.streakDays += 1;
    } else if (dayDifference > 1) {
      // Reset streak if more than 1 day has passed
      progress.streakDays = 1;
    }
    
    // Update last active time
    progress.lastActive = now;
    
    // Update in storage
    this.userProgress.set(progress.id, progress);
    
    return progress;
  }
  
  async updateWeeklyGoal(userId: number, weeklyGoal: number): Promise<UserProgress> {
    // Get existing progress
    let progress = await this.getUserProgress(userId);
    
    if (!progress) {
      // Create new progress if it doesn't exist
      progress = await this.createUserProgress({
        userId,
        wordsLearned: 0,
        weeklyGoal,
        streakDays: 0
      });
      return progress;
    }
    
    // Update weekly goal
    progress.weeklyGoal = weeklyGoal;
    
    // Update in storage
    this.userProgress.set(progress.id, progress);
    
    return progress;
  }
}

export const storage = new MemStorage();
