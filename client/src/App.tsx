import { Switch, Route, useLocation } from "wouter";
import HomePage from "./pages/HomePage";
import SavedWordsPage from "./pages/SavedWordsPage";
import PracticePage from "./pages/PracticePage";
import ProgressPage from "./pages/ProgressPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/not-found";
import { useState, useEffect } from "react";
import { useIsMobile } from "./hooks/use-mobile";
import Navigation from "./components/Navigation";

function App() {
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    username: "demouser",
    displayInitials: "JD"
  });
  
  const [location] = useLocation();
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-neutral-100">
      <Navigation currentPath={location} />
      
      <div className={`
        ${isMobile ? 'pt-40 pb-4' : 'ml-16 sm:ml-64 pt-16 pb-4'}
      `}>
        <Switch>
          <Route path="/" component={() => <HomePage user={currentUser} />} />
          <Route path="/saved" component={() => <SavedWordsPage user={currentUser} />} />
          <Route path="/practice" component={() => <PracticePage user={currentUser} />} />
          <Route path="/progress" component={() => <ProgressPage user={currentUser} />} />
          <Route path="/profile" component={() => <ProfilePage user={currentUser} />} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

export default App;
