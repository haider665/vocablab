import { useState } from "react";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOutIcon, BellIcon, SettingsIcon, UserIcon, UserPlusIcon } from "lucide-react";

interface ProfilePageProps {
  user: {
    id: number;
    username: string;
    displayInitials: string;
  };
}

const ProfilePage = ({ user }: ProfilePageProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user settings
  const { data: userSettings, isLoading } = useQuery({
    queryKey: ["/api/user-settings", user.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/user-settings?userId=${user.id}`);
      return await response.json();
    },
  });

  const formSchema = z.object({
    weeklyGoal: z.number().min(1).max(100),
    notificationsEnabled: z.boolean(),
    displayName: z.string().min(1, "Display name is required"),
    email: z.string().email("Please enter a valid email"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weeklyGoal: userSettings?.weeklyGoal || 20,
      notificationsEnabled: userSettings?.notificationsEnabled || true,
      displayName: userSettings?.displayName || user.username,
      email: userSettings?.email || "user@example.com",
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return await apiRequest("PATCH", `/api/user-settings/${user.id}`, values);
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your profile settings have been updated successfully.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/user-settings", user.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateSettingsMutation.mutate(values);
  };

  return (
    <div className="max-w-screen-xl mx-auto relative pb-16">
      <Header user={user} />
      
      <main className="pt-16 pb-4 px-4">
        <div className="mt-4">
          <h2 className="text-2xl font-semibold font-poppins text-neutral-800 mb-4">
            Profile
          </h2>
          
          <Card className="bg-white rounded-xl shadow-md mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-semibold">
                  {user.displayInitials}
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-semibold text-neutral-800 mt-2">
                    {userSettings?.displayName || user.username}
                  </h3>
                  <p className="text-neutral-600">{userSettings?.email || "user@example.com"}</p>
                  
                  <div className="mt-4 flex justify-center sm:justify-start">
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <SettingsIcon size={16} />
                      {isEditing ? "Cancel Editing" : "Edit Profile"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isEditing ? (
            <Card className="bg-white rounded-xl shadow-md mb-6">
              <CardHeader>
                <CardTitle>Edit Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="weeklyGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weekly Word Goal</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Set your weekly goal for learning new words
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notificationsEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Notifications
                            </FormLabel>
                            <FormDescription>
                              Receive daily reminders to practice vocabulary
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full">
                      Save Changes
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white rounded-xl shadow-md mb-6">
              <CardHeader>
                <CardTitle>Learning Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-neutral-600 text-sm">Total Words Learned</p>
                    <p className="text-2xl font-semibold text-primary">
                      {isLoading ? "..." : userSettings?.totalWordsLearned || 15}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-secondary/10 rounded-lg">
                    <p className="text-neutral-600 text-sm">Current Streak</p>
                    <p className="text-2xl font-semibold text-secondary">
                      {isLoading ? "..." : userSettings?.streakDays || 7} days
                    </p>
                  </div>
                  
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <p className="text-neutral-600 text-sm">Words Saved</p>
                    <p className="text-2xl font-semibold text-accent">
                      {isLoading ? "..." : userSettings?.savedWordsCount || 12}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-neutral-600 text-sm">Avg. Quiz Score</p>
                    <p className="text-2xl font-semibold text-neutral-800">
                      {isLoading ? "..." : userSettings?.avgQuizScore || "75%"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className="bg-white rounded-xl shadow-md">
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <BellIcon className="mr-2 h-4 w-4" />
                  Notification Settings
                </Button>
                
                <Button variant="ghost" className="w-full justify-start">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Account Settings
                </Button>
                
                <Button variant="ghost" className="w-full justify-start">
                  <UserPlusIcon className="mr-2 h-4 w-4" />
                  Invite Friends
                </Button>
                
                <Separator className="my-2" />
                
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Navigation currentPath="/profile" />
    </div>
  );
};

export default ProfilePage;
