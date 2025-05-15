import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useRef, useEffect } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Word } from "@shared/schema";
import { motion } from "framer-motion";
import { truncate } from "@/lib/utils";

interface RecentlySearchedProps {
  words: Partial<Word>[];
  isLoading: boolean;
}

const RecentlySearched = ({ words, isLoading }: RecentlySearchedProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftScroll(scrollLeft > 0);
    setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollLeft = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  useEffect(() => {
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
      
      // Check initial scroll state
      handleScroll();
      
      return () => {
        currentRef.removeEventListener('scroll', handleScroll);
      };
    }
  }, [words]);

  return (
    <motion.section 
      className="mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold font-poppins text-neutral-800">Recently Searched</h2>
        <a href="#" className="text-primary text-sm font-medium hover:underline">View All</a>
      </div>
      
      <div className="relative">
        {showLeftScroll && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 shadow-md rounded-full"
            onClick={scrollLeft}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
        )}
        
        {showRightScroll && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 shadow-md rounded-full"
            onClick={scrollRight}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        )}
        
        <div
          ref={scrollRef}
          className="scroll-container overflow-x-auto -mx-4 px-4"
          onScroll={handleScroll}
        >
          <div className="flex space-x-4 pb-2">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="min-w-[200px] sm:min-w-[240px]">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-5 w-10 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                    <Skeleton className="h-24 w-full mt-2 rounded-lg" />
                  </CardContent>
                </Card>
              ))
            ) : words.length === 0 ? (
              <Card className="min-w-[200px] sm:min-w-[240px]">
                <CardContent className="p-4 text-center">
                  <p className="text-neutral-600">No recently searched words</p>
                </CardContent>
              </Card>
            ) : (
              words.map((word, index) => (
                <Card key={index} className="card-hover bg-white rounded-xl shadow-md min-w-[200px] sm:min-w-[240px] flex flex-col">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-neutral-800">{word.word}</h3>
                      <span className="text-xs bg-neutral-200 rounded-full px-2 py-0.5">
                        {truncate(word.partOfSpeech || "n/a", 4)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                      {truncate(word.definition || "", 60)}
                    </p>
                    <div className="h-24 bg-neutral-200 rounded-lg mt-2 overflow-hidden">
                      {word.imageUrl ? (
                        <img 
                          src={word.imageUrl} 
                          alt={`Visual representation of ${word.word}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          No image
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default RecentlySearched;
