import { Switch, Route } from "wouter";
import HomePage from "./pages/HomePage";
import SavedWordsPage from "./pages/SavedWordsPage";
import PracticePage from "./pages/PracticePage";
import ProgressPage from "./pages/ProgressPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/not-found";
import { useState, useEffect } from "react";

function App() {
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    username: "demouser",
    displayInitials: "JD"
  });
  
  return (
    <div className="min-h-screen bg-neutral-100 pb-16">
      <Switch>
        <Route path="/" component={() => <HomePage user={currentUser} />} />
        <Route path="/saved" component={() => <SavedWordsPage user={currentUser} />} />
        <Route path="/practice" component={() => <PracticePage user={currentUser} />} />
        <Route path="/progress" component={() => <ProgressPage user={currentUser} />} />
        <Route path="/profile" component={() => <ProfilePage user={currentUser} />} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default App;
