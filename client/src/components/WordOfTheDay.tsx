import { PlusIcon, VolumeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Word } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { useState } from "react";
import { playAudio } from "@/lib/utils";

interface WordOfTheDayProps {
  word: Partial<Word>;
  isLoading: boolean;
  userId: number;
}

const WordOfTheDay = ({ word, isLoading, userId }: WordOfTheDayProps) => {
  const [isAdded, setIsAdded] = useState(false);
  const { toast } = useToast();

  const handleAddToWords = async () => {
    try {
      await apiRequest("POST", "/api/words/save", {
        userId,
        word
      });
      
      setIsAdded(true);
      toast({
        title: "Success",
        description: `"${word.word}" has been added to your collection`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add word to your collection",
        variant: "destructive",
      });
    }
  };

  const handlePlayPronunciation = () => {
    if (word.pronunciationUrl) {
      playAudio(word.pronunciationUrl);
    }
  };

  if (isLoading) {
    return (
      <motion.section 
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        <Skeleton className="h-64 w-full rounded-xl" />
      </motion.section>
    );
  }

  return (
    <motion.section 
      className="mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.8 }}
    >
      <div className="bg-gradient-to-r from-primary/90 to-primary rounded-xl shadow-lg overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
          <div className="sm:w-2/3">
            <div className="flex items-center">
              <span className="bg-white/20 text-white text-xs font-semibold rounded-full px-3 py-1">WORD OF THE DAY</span>
            </div>
            
            <div className="flex items-center mt-2">
              <h3 className="text-2xl sm:text-3xl font-bold font-poppins text-white">{word.word}</h3>
              {word.pronunciationUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 text-white/80 hover:text-white hover:bg-white/10"
                  onClick={handlePlayPronunciation}
                >
                  <VolumeIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-white/80 italic text-sm mt-1">{word.phonetic}</p>
            
            <div className="mt-3">
              <p className="text-white leading-relaxed">
                {word.definition}
              </p>
            </div>
            
            {word.example && (
              <div className="mt-3">
                <p className="text-white/90">
                  <span className="font-medium">Example:</span> {word.example}
                </p>
              </div>
            )}
            
            <Button
              className="mt-4 bg-white text-primary font-medium px-4 py-2 hover:bg-white/90 transition-colors flex items-center"
              onClick={handleAddToWords}
              disabled={isAdded}
            >
              {isAdded ? (
                "Added to My Words"
              ) : (
                <>
                  <PlusIcon className="mr-1 h-4 w-4" />
                  Add to My Words
                </>
              )}
            </Button>
          </div>
          
          <div className="sm:w-1/3">
            <div className="h-40 sm:h-full bg-white/10 rounded-lg overflow-hidden">
              {word.imageUrl ? (
                <img 
                  src={word.imageUrl} 
                  alt={`Visual representation of ${word.word}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/70">
                  No image available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default WordOfTheDay;
