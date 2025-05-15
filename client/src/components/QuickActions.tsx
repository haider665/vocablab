import { Card, CardContent } from "@/components/ui/card";
import { BookmarkIcon, Layers3Icon, GraduationCapIcon, TrendingUpIcon } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const QuickActions = () => {
  return (
    <motion.section 
      className="mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.6 }}
    >
      <h2 className="text-xl font-semibold font-poppins text-neutral-800 mb-3">Quick Actions</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          className="card-hover bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center cursor-pointer"
          onClick={() => window.location.href = "/saved"}
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <BookmarkIcon className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-medium text-neutral-800">My Saved Words</h3>
          <p className="text-sm text-neutral-600 mt-1">Access your vocabulary collection</p>
        </div>
        
        <div 
          className="card-hover bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center cursor-pointer"
          onClick={() => window.location.href = "/practice"}
        >
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-2">
            <Layers3Icon className="h-5 w-5 text-secondary" />
          </div>
          <h3 className="font-medium text-neutral-800">Flashcards</h3>
          <p className="text-sm text-neutral-600 mt-1">Review words with flashcards</p>
        </div>
        
        <div 
          className="card-hover bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center cursor-pointer"
          onClick={() => window.location.href = "/practice?tab=quiz"}
        >
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-2">
            <GraduationCapIcon className="h-5 w-5 text-accent" />
          </div>
          <h3 className="font-medium text-neutral-800">Take a Quiz</h3>
          <p className="text-sm text-neutral-600 mt-1">Test your vocabulary knowledge</p>
        </div>
        
        <div 
          className="card-hover bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center cursor-pointer"
          onClick={() => window.location.href = "/progress"}
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <TrendingUpIcon className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-medium text-neutral-800">My Progress</h3>
          <p className="text-sm text-neutral-600 mt-1">Track your learning journey</p>
        </div>
      </div>
    </motion.section>
  );
};

export default QuickActions;
