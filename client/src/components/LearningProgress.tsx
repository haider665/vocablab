import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateCircleProgress } from "@/lib/utils";
import { UserProgress } from "@shared/schema";
import { motion } from "framer-motion";

interface LearningProgressProps {
  progress?: UserProgress;
  isLoading: boolean;
}

const ProgressRing = ({ value, max, color }: { value: number, max: number, color: string }) => {
  const { dashArray, dashOffset } = calculateCircleProgress(value, max);
  
  return (
    <div className="w-16 h-16 relative">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="none" stroke="#E9ECEF" strokeWidth="2"></circle>
        <circle 
          className="progress-ring-circle" 
          cx="18" 
          cy="18" 
          r="16" 
          fill="none" 
          stroke={color} 
          strokeWidth="2" 
          strokeDasharray={dashArray} 
          strokeDashoffset={dashOffset}
        ></circle>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold" style={{ color }}>
          {Math.round((value / max) * 100)}%
        </span>
      </div>
    </div>
  );
};

const LearningProgress = ({ progress, isLoading }: LearningProgressProps) => {
  if (isLoading) {
    return (
      <motion.section 
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 1.0 }}
      >
        <h2 className="text-xl font-semibold font-poppins text-neutral-800 mb-3">Your Learning Progress</h2>
        <Skeleton className="h-40 w-full rounded-xl" />
      </motion.section>
    );
  }

  // Default values if progress is not available
  const wordsLearned = progress?.wordsLearned || 15;
  const weeklyGoal = progress?.weeklyGoal || 20;
  const quizScore = 50;
  const streakDays = progress?.streakDays || 7;

  return (
    <motion.section 
      className="mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 1.0 }}
    >
      <h2 className="text-xl font-semibold font-poppins text-neutral-800 mb-3">Your Learning Progress</h2>
      
      <Card className="bg-white rounded-xl shadow-md">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="flex items-center">
              <ProgressRing 
                value={wordsLearned} 
                max={weeklyGoal} 
                color="hsl(var(--primary))" 
              />
              <div className="ml-4">
                <h3 className="font-medium text-neutral-800">Weekly Goal</h3>
                <p className="text-sm text-neutral-600">{wordsLearned} of {weeklyGoal} words</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <ProgressRing 
                value={quizScore} 
                max={100} 
                color="hsl(var(--secondary))" 
              />
              <div className="ml-4">
                <h3 className="font-medium text-neutral-800">Quiz Score</h3>
                <p className="text-sm text-neutral-600">Last attempt</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <ProgressRing 
                value={streakDays} 
                max={10} 
                color="hsl(var(--accent))" 
              />
              <div className="ml-4">
                <h3 className="font-medium text-neutral-800">Streak</h3>
                <p className="text-sm text-neutral-600">{streakDays} days</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-5 border-t border-neutral-200">
            <div className="text-center">
              <p className="text-neutral-700">
                <span className="font-medium text-secondary">Great job!</span> You've learned {wordsLearned} new words this week.
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                Practice daily to maintain your learning streak!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
};

export default LearningProgress;
