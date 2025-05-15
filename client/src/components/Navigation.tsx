import { Link, useLocation } from "wouter";
import { HomeIcon, BookmarkIcon, GraduationCapIcon, TrendingUpIcon, UserIcon } from "lucide-react";
import { motion } from "framer-motion";

interface NavigationProps {
  currentPath: string;
}

const Navigation = ({ currentPath }: NavigationProps) => {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", icon: HomeIcon, label: "Home" },
    { path: "/saved", icon: BookmarkIcon, label: "Saved" },
    { path: "/practice", icon: GraduationCapIcon, label: "Practice" },
    { path: "/progress", icon: TrendingUpIcon, label: "Progress" },
    { path: "/profile", icon: UserIcon, label: "Profile" },
  ];

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-2 py-1 z-10"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <div className="max-w-screen-xl mx-auto">
        <ul className="flex justify-between">
          {navItems.map((item) => {
            const isActive = location === item.path;
            
            return (
              <li key={item.path} className="nav-item relative flex-1">
                <Link href={item.path}>
                  <a className={`flex flex-col items-center py-2 ${isActive ? 'text-primary' : 'text-neutral-600 hover:text-primary'}`}>
                    <item.icon className="h-5 w-5" />
                    <span className="text-xs mt-1">{item.label}</span>
                    <span 
                      className={`nav-indicator absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg ${isActive ? 'h-1' : 'h-0'}`}
                    ></span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.nav>
  );
};

export default Navigation;
