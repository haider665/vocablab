import { useQuery } from "@tanstack/react-query";
import Header from "../components/Header";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { calculateCircleProgress } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import LearningProgress from "@/components/LearningProgress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProgressPageProps {
  user: {
    id: number;
    username: string;
    displayInitials: string;
  };
}

const ProgressPage = ({ user }: ProgressPageProps) => {
  // Fetch user progress
  const { data: userProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["/api/user-progress", user.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/user-progress?userId=${user.id}`);
      return await response.json();
    },
  });

  // Fetch quiz history
  const { data: quizHistory = [], isLoading: isLoadingQuizzes } = useQuery({
    queryKey: ["/api/quizzes", user.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/quizzes?userId=${user.id}`);
      return await response.json();
    },
  });

  // Fetch words learned over time
  const { data: wordsOverTime = [], isLoading: isLoadingWords } = useQuery({
    queryKey: ["/api/words-over-time", user.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/words-over-time?userId=${user.id}`);
      return await response.json();
    },
  });

  const formatQuizData = (quizzes: any[]) => {
    return quizzes.map((quiz, index) => ({
      name: `Quiz ${index + 1}`,
      score: Math.round((quiz.score / quiz.totalQuestions) * 100),
    })).slice(-7); // Show only last 7 quizzes
  };

  const formatWordsOverTime = (data: any[]) => {
    return data.map(item => ({
      name: item.date,
      words: item.count,
    })).slice(-7); // Show only last 7 days
  };

  return (
    <div className="max-w-screen-xl mx-auto">
      <Header user={user} />
      
      <main className="pt-6 px-4">
        <div className="mt-4">
          <h2 className="text-2xl font-semibold font-poppins text-neutral-800 mb-4">
            My Progress
          </h2>
          
          <LearningProgress 
            progress={userProgress}
            isLoading={isLoadingProgress}
          />
          
          <div className="mt-6">
            <Tabs defaultValue="quizzes">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="quizzes">Quiz Performance</TabsTrigger>
                <TabsTrigger value="words">Words Learned</TabsTrigger>
              </TabsList>
              
              <TabsContent value="quizzes">
                <Card className="bg-white rounded-xl shadow-md">
                  <CardContent className="p-4">
                    {isLoadingQuizzes ? (
                      <div className="h-64 animate-pulse bg-neutral-100 rounded-lg"></div>
                    ) : quizHistory.length === 0 ? (
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-neutral-600">No quiz data available yet. Take quizzes to see your performance.</p>
                      </div>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={formatQuizData(quizHistory)}
                            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                            <Bar 
                              dataKey="score" 
                              fill="hsl(var(--primary))" 
                              radius={[4, 4, 0, 0]} 
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="words">
                <Card className="bg-white rounded-xl shadow-md">
                  <CardContent className="p-4">
                    {isLoadingWords ? (
                      <div className="h-64 animate-pulse bg-neutral-100 rounded-lg"></div>
                    ) : wordsOverTime.length === 0 ? (
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-neutral-600">No word learning data available yet. Search and save words to track your progress.</p>
                      </div>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={formatWordsOverTime(wordsOverTime)}
                            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar 
                              dataKey="words" 
                              fill="hsl(var(--secondary))" 
                              radius={[4, 4, 0, 0]} 
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="mt-6">
            <Card className="bg-white rounded-xl shadow-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                  Learning Insights
                </h3>
                
                <div className="text-neutral-700 space-y-3">
                  <p>
                    {userProgress?.streakDays > 3 
                      ? `🔥 Amazing! You've maintained a learning streak of ${userProgress.streakDays} days.` 
                      : "🎯 Aim to learn new words consistently to build your streak!"}
                  </p>
                  
                  <p>
                    {userProgress?.wordsLearned >= userProgress?.weeklyGoal 
                      ? "🏆 You've reached your weekly goal. Great work!" 
                      : `📚 Keep going! You're making progress toward your weekly goal.`}
                  </p>
                  
                  {quizHistory.length > 0 && (
                    <p>
                      {(quizHistory[quizHistory.length - 1].score / quizHistory[quizHistory.length - 1].totalQuestions) > 0.7 
                        ? "✨ Your recent quiz scores are impressive!" 
                        : "💪 Keep practicing to improve your quiz scores."}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProgressPage;
