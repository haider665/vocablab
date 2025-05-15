import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "../components/Header";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchoolIcon, StickyNoteIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface PracticePageProps {
  user: {
    id: number;
    username: string;
    displayInitials: string;
  };
}

const PracticePage = ({ user }: PracticePageProps) => {
  const [activeTab, setActiveTab] = useState("flashcards");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const { toast } = useToast();

  // Fetch saved words for practice
  const { data: savedWords = [], isLoading } = useQuery({
    queryKey: ["/api/saved-words", user.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/saved-words?userId=${user.id}`);
      return await response.json();
    },
  });

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev < savedWords.length - 1 ? prev + 1 : prev));
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setQuizScore(0);
    setCurrentQuestion(0);
  };

  const handleQuizAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      toast({
        title: "Correct!",
        description: "Good job!",
        variant: "default",
      });
    } else {
      toast({
        title: "Incorrect",
        description: `The correct answer was: ${savedWords[currentQuestion].word}`,
        variant: "destructive",
      });
    }

    // Move to next question or end quiz
    if (currentQuestion < savedWords.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // End of quiz
      const finalScore = isCorrect ? quizScore + 1 : quizScore;
      const percent = Math.round((finalScore / savedWords.length) * 100);
      
      // Save quiz result
      apiRequest("POST", "/api/quizzes", {
        userId: user.id,
        score: finalScore,
        totalQuestions: savedWords.length,
      });
      
      toast({
        title: "Quiz Completed!",
        description: `Your score: ${finalScore}/${savedWords.length} (${percent}%)`,
        variant: "default",
      });
      
      setQuizStarted(false);
    }
  };

  const renderFlashcards = () => {
    if (isLoading) {
      return (
        <Card className="bg-white rounded-xl shadow-md animate-pulse">
          <CardContent className="p-4 h-64"></CardContent>
        </Card>
      );
    }

    if (savedWords.length === 0) {
      return (
        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-6 text-center">
            <StickyNoteIcon className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-neutral-800 mb-1">No flashcards available</h3>
            <p className="text-neutral-600 mb-4">
              Save some words first to practice with flashcards.
            </p>
            <Button variant="default" className="bg-primary hover:bg-primary-dark text-white" onClick={() => window.location.href = "/"}>
              Go to Search
            </Button>
          </CardContent>
        </Card>
      );
    }

    const currentWord = savedWords[currentCardIndex];
    
    return (
      <div className="flex flex-col items-center">
        <div className="w-full max-w-md mb-4">
          <p className="text-center text-neutral-600 mb-2">
            Card {currentCardIndex + 1} of {savedWords.length}
          </p>
          
          <div 
            className="cursor-pointer h-64 w-full rounded-xl shadow-lg relative"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={isFlipped ? "back" : "front"}
                initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-white rounded-xl flex flex-col items-center justify-center p-6 text-center"
              >
                {isFlipped ? (
                  // Card back - Definition
                  <div>
                    <p className="text-neutral-700 text-lg leading-relaxed">{currentWord.definition}</p>
                    {currentWord.example && (
                      <p className="text-neutral-600 mt-4 italic">"{currentWord.example}"</p>
                    )}
                  </div>
                ) : (
                  // Card front - Word
                  <div>
                    <h3 className="text-3xl font-bold text-neutral-800 mb-2">{currentWord.word}</h3>
                    <p className="text-neutral-600 italic">{currentWord.phonetic}</p>
                    {currentWord.partOfSpeech && (
                      <span className="inline-block bg-neutral-200 text-neutral-700 rounded-full px-3 py-1 text-sm font-medium mt-2">
                        {currentWord.partOfSpeech}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          <p className="text-center text-neutral-600 mt-2">Tap card to flip</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrevCard}
            disabled={currentCardIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="default"
            onClick={handleNextCard}
            disabled={currentCardIndex === savedWords.length - 1}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    if (isLoading) {
      return (
        <Card className="bg-white rounded-xl shadow-md animate-pulse">
          <CardContent className="p-4 h-64"></CardContent>
        </Card>
      );
    }
    
    if (savedWords.length === 0) {
      return (
        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-6 text-center">
            <SchoolIcon className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-neutral-800 mb-1">No quiz available</h3>
            <p className="text-neutral-600 mb-4">
              Save some words first to take a quiz.
            </p>
            <Button variant="default" className="bg-primary hover:bg-primary-dark text-white" onClick={() => window.location.href = "/"}>
              Go to Search
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    if (!quizStarted) {
      return (
        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-6 text-center">
            <SchoolIcon className="h-12 w-12 text-accent mx-auto mb-3" />
            <h3 className="text-lg font-medium text-neutral-800 mb-1">Ready for a Quiz?</h3>
            <p className="text-neutral-600 mb-4">
              Test your knowledge on {savedWords.length} saved words.
            </p>
            <Button variant="default" className="bg-accent hover:bg-accent-dark text-white" onClick={handleStartQuiz}>
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    // Build a quiz using a random selection of saved words
    const currentWord = savedWords[currentQuestion];
    
    // Create options for multiple choice (1 correct, 3 incorrect)
    const correctAnswer = currentWord.definition;
    
    // Get 3 random definitions that are not the correct one
    const incorrectOptions = savedWords
      .filter((w: any) => w.id !== currentWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((w: any) => w.definition);
    
    // Combine and shuffle options
    const options = [correctAnswer, ...incorrectOptions].sort(() => 0.5 - Math.random());
    
    return (
      <div className="flex flex-col">
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-neutral-600">Question {currentQuestion + 1} of {savedWords.length}</p>
            <p className="text-neutral-600">Score: {quizScore}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">
              What does "{currentWord.word}" mean?
            </h3>
            
            {currentWord.phonetic && (
              <p className="text-neutral-600 italic">{currentWord.phonetic}</p>
            )}
          </div>
          
          <div className="flex flex-col gap-3">
            {options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-left py-4 h-auto"
                onClick={() => handleQuizAnswer(option === correctAnswer)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-screen-xl mx-auto">
      <Header user={user} />
      
      <main className="pt-6 px-4">
        <div className="mt-4">
          <h2 className="text-2xl font-semibold font-poppins text-neutral-800 mb-4">
            Practice
          </h2>
          
          <Tabs defaultValue="flashcards" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>
            
            <TabsContent value="flashcards" className="mt-0">
              {renderFlashcards()}
            </TabsContent>
            
            <TabsContent value="quiz" className="mt-0">
              {renderQuiz()}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default PracticePage;
