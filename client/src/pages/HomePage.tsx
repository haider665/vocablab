import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "../components/Header";
import SearchSection from "../components/SearchSection";
import WordDisplay from "../components/WordDisplay";
import RecentlySearched from "../components/RecentlySearched";
import QuickActions from "../components/QuickActions";
import WordOfTheDay from "../components/WordOfTheDay";
import LearningProgress from "../components/LearningProgress";
import { Word } from "@shared/schema";
import { fetchWordDefinition } from "@/lib/api";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface HomePageProps {
  user: {
    id: number;
    username: string;
    displayInitials: string;
  };
}

const HomePage = ({ user }: HomePageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentWord, setCurrentWord] = useState<Partial<Word> | null>(null);
  const { toast } = useToast();

  // Fetch recently searched words
  const { data: recentWords = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: ["/api/search-history", user.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/search-history?userId=${user.id}`);
      return await response.json();
    },
  });

  // Fetch word of the day
  const { data: wordOfTheDay, isLoading: isLoadingWOTD } = useQuery({
    queryKey: ["/api/word-of-the-day"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/word-of-the-day");
      return await response.json();
    },
  });

  // Fetch user progress
  const { data: userProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["/api/user-progress", user.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/user-progress?userId=${user.id}`);
      return await response.json();
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const wordData = await fetchWordDefinition(searchQuery.trim());
      
      // Save searched word to the backend
      await apiRequest("POST", "/api/words/search", { 
        userId: user.id,
        word: wordData
      });
      
      setCurrentWord(wordData);
    } catch (error) {
      toast({
        title: "Error",
        description: `Could not find definition for "${searchQuery}"`,
        variant: "destructive",
      });
    }
  };

  const handleSaveWord = async () => {
    if (!currentWord) return;
    
    try {
      await apiRequest("POST", "/api/words/save", {
        userId: user.id,
        word: currentWord
      });
      
      toast({
        title: "Success",
        description: `"${currentWord.word}" has been saved to your collection`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save word",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto">
      <Header user={user} />
      
      <main className="pt-6 px-4">
        <SearchSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
        />
        
        {currentWord && (
          <WordDisplay
            word={currentWord}
            onSave={handleSaveWord}
          />
        )}
        
        <RecentlySearched 
          words={recentWords} 
          isLoading={isLoadingRecent}
        />
        
        <QuickActions />
        
        {wordOfTheDay && (
          <WordOfTheDay 
            word={wordOfTheDay} 
            isLoading={isLoadingWOTD}
            userId={user.id}
          />
        )}
        
        <LearningProgress 
          progress={userProgress}
          isLoading={isLoadingProgress}
        />
      </main>
    </div>
  );
};

export default HomePage;
