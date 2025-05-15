import { useQuery } from "@tanstack/react-query";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BookmarkIcon, Trash2Icon, VolumeIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { playAudio } from "@/lib/utils";

interface SavedWordsPageProps {
  user: {
    id: number;
    username: string;
    displayInitials: string;
  };
}

const SavedWordsPage = ({ user }: SavedWordsPageProps) => {
  const { toast } = useToast();

  const { data: savedWords = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/saved-words", user.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/saved-words?userId=${user.id}`);
      return await response.json();
    },
  });

  const handleRemoveWord = async (wordId: number) => {
    try {
      await apiRequest("DELETE", `/api/saved-words/${wordId}?userId=${user.id}`);
      toast({
        title: "Success",
        description: "Word removed from your saved collection",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove word",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto relative pb-16">
      <Header user={user} />
      
      <main className="pt-16 pb-4 px-4">
        <div className="mt-4">
          <h2 className="text-2xl font-semibold font-poppins text-neutral-800 mb-4">
            My Saved Words
          </h2>
          
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white rounded-xl shadow-md animate-pulse">
                  <CardContent className="p-4 h-32"></CardContent>
                </Card>
              ))}
            </div>
          ) : savedWords.length === 0 ? (
            <Card className="bg-white rounded-xl shadow-md">
              <CardContent className="p-6 text-center">
                <BookmarkIcon className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-neutral-800 mb-1">No saved words yet</h3>
                <p className="text-neutral-600 mb-4">
                  Start saving words to build your vocabulary collection.
                </p>
                <Button variant="default" className="bg-primary hover:bg-primary-dark text-white" onClick={() => window.location.href = "/"}>
                  Go to Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {savedWords.map((word: any) => (
                <Card key={word.id} className="bg-white rounded-xl shadow-md card-hover">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-neutral-800">{word.word}</h3>
                          {word.partOfSpeech && (
                            <span className="text-xs bg-neutral-200 rounded-full px-2 py-0.5">
                              {word.partOfSpeech}
                            </span>
                          )}
                        </div>
                        
                        {word.phonetic && (
                          <div className="flex items-center mt-1 text-neutral-600">
                            <p className="italic mr-2">{word.phonetic}</p>
                            {word.pronunciationUrl && (
                              <button 
                                className="p-1 text-primary hover:text-primary-dark"
                                onClick={() => playAudio(word.pronunciationUrl)}
                                aria-label="Play pronunciation"
                              >
                                <VolumeIcon size={16} />
                              </button>
                            )}
                          </div>
                        )}
                        
                        <Separator className="my-2" />
                        
                        <p className="text-neutral-700 mt-1">{word.definition}</p>
                        
                        {word.example && (
                          <p className="text-neutral-600 mt-2 italic">
                            "{word.example}"
                          </p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-neutral-400 hover:text-destructive"
                        onClick={() => handleRemoveWord(word.id)}
                      >
                        <Trash2Icon size={18} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Navigation currentPath="/saved" />
    </div>
  );
};

export default SavedWordsPage;
