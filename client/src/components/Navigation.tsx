import { Link, useLocation } from "wouter";
import { HomeIcon, BookmarkIcon, GraduationCapIcon, TrendingUpIcon, UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavigationProps {
  currentPath: string;
}

const Navigation = ({ currentPath }: NavigationProps) => {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  
  const navItems = [
    { path: "/", icon: HomeIcon, label: "Home" },
    { path: "/saved", icon: BookmarkIcon, label: "Saved" },
    { path: "/practice", icon: GraduationCapIcon, label: "Practice" },
    { path: "/progress", icon: TrendingUpIcon, label: "Progress" },
    { path: "/profile", icon: UserIcon, label: "Profile" },
  ];

  return (
    <motion.nav 
      className={`
        fixed z-10 bg-white shadow-md
        ${isMobile 
          ? "top-16 left-0 right-0 border-b border-neutral-200" 
          : "top-0 left-0 bottom-0 w-16 sm:w-64 border-r border-neutral-200"
        }
      `}
      initial={isMobile ? { y: -50 } : { x: -50 }}
      animate={isMobile ? { y: 0 } : { x: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <div className="h-full">
        <ul className={`
          ${isMobile 
            ? "flex justify-between px-2 py-1" 
            : "flex flex-col py-6 h-full"
          }
        `}>
          {navItems.map((item) => {
            const isActive = location === item.path;
            
            return (
              <li 
                key={item.path} 
                className={`
                  nav-item relative
                  ${isMobile ? "flex-1" : "mb-4"}
                `}
              >
                <Link href={item.path}>
                  <a className={`
                    ${isActive ? 'text-primary' : 'text-neutral-600 hover:text-primary'}
                    ${isMobile 
                      ? 'flex flex-col items-center py-2' 
                      : 'flex items-center px-4 py-3'
                    }
                  `}>
                    <item.icon className={`
                      ${isMobile ? 'h-5 w-5' : 'h-5 w-5'}
                    `} />
                    
                    <span className={`
                      ${isMobile 
                        ? 'text-xs mt-1' 
                        : 'ml-4 text-sm font-medium hidden sm:block'
                      }
                    `}>
                      {item.label}
                    </span>
                    
                    {isMobile ? (
                      <span 
                        className={`nav-indicator absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg ${isActive ? 'h-1' : 'h-0'}`}
                      ></span>
                    ) : (
                      <span 
                        className={`nav-indicator absolute left-0 top-0 bottom-0 bg-primary rounded-r-lg ${isActive ? 'w-1' : 'w-0'}`}
                      ></span>
                    )}
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
