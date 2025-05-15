import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { BookmarkIcon, VolumeIcon, GraduationCapIcon, Layers3Icon } from "lucide-react";
import { Word } from "@shared/schema";
import { motion } from "framer-motion";
import { playAudio } from "@/lib/utils";

interface WordDisplayProps {
  word: Partial<Word>;
  onSave: () => void;
}

const WordDisplay = ({ word, onSave }: WordDisplayProps) => {
  const [isSaved, setIsSaved] = useState(false);
  
  const handleSave = () => {
    setIsSaved(true);
    onSave();
  };
  
  const handlePlayPronunciation = () => {
    if (word.pronunciationUrl) {
      playAudio(word.pronunciationUrl);
    }
  };

  return (
    <motion.section 
      className="mt-6 sm:mt-8 bg-white rounded-xl shadow-lg p-4 sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Word Information */}
        <div className="md:w-1/2">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl sm:text-4xl font-bold font-poppins text-neutral-800">{word.word}</h2>
            <Button
              variant="ghost"
              size="icon"
              className={`text-neutral-400 hover:text-primary ${isSaved ? 'text-primary' : ''}`}
              onClick={handleSave}
              aria-label="Save Word"
            >
              <BookmarkIcon className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center mt-2 text-neutral-600">
            <p className="italic mr-3">{word.phonetic}</p>
            {word.pronunciationUrl && (
              <Button
                variant="ghost"
                size="icon"
                className="p-1 text-primary hover:text-primary-dark"
                onClick={handlePlayPronunciation}
                aria-label="Play pronunciation"
              >
                <VolumeIcon className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <div className="mt-4">
            <span className="inline-block bg-neutral-200 text-neutral-700 rounded-full px-3 py-1 text-sm font-medium">
              {word.partOfSpeech || "noun"}
            </span>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium text-lg text-neutral-800">Definition:</h3>
            <p className="mt-1 text-neutral-700 leading-relaxed">
              {word.definition}
            </p>
          </div>
          
          {word.example && (
            <div className="mt-4">
              <h3 className="font-medium text-lg text-neutral-800">Example Sentences:</h3>
              <ul className="mt-1 space-y-2">
                <li className="text-neutral-700 leading-relaxed">
                  <span className="material-icons text-accent text-sm mr-1">→</span>
                  {word.example}
                </li>
              </ul>
            </div>
          )}
          
          {word.synonyms && word.synonyms.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-neutral-800">Synonyms:</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {word.synonyms.map((synonym, index) => (
                  <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-lg text-sm">
                    {synonym}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {word.antonyms && word.antonyms.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-neutral-800">Antonyms:</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {word.antonyms.map((antonym, index) => (
                  <span key={index} className="bg-accent/10 text-accent px-2 py-1 rounded-lg text-sm">
                    {antonym}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Word Visualization */}
        <div className="md:w-1/2 flex flex-col items-center">
          <div className="rounded-xl overflow-hidden shadow-md w-full max-w-md h-64 bg-neutral-200">
            {word.imageUrl ? (
              <AspectRatio ratio={16/9}>
                <img 
                  src={word.imageUrl} 
                  alt={`Visual representation of the word ${word.word}`} 
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                No image available
              </div>
            )}
          </div>
          
          <div className="w-full mt-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-700 py-2">
                <GraduationCapIcon className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">Quiz Me</span>
              </Button>
              <Button variant="outline" className="flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-700 py-2">
                <Layers3Icon className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">Flashcard</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default WordDisplay;
