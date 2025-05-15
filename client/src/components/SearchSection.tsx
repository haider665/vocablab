import { useState, useEffect } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SearchSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
}

const SearchSection = ({ searchQuery, setSearchQuery, handleSearch }: SearchSectionProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <motion.section 
      className="mt-4 sm:mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="search-animation transition-all duration-300 relative bg-white rounded-xl shadow-md hover:shadow-lg flex items-center border border-neutral-300 focus-within:border-primary overflow-hidden">
        <Input 
          type="text"
          placeholder="Search for a word..."
          className="py-3 sm:py-4 px-4 sm:px-6 w-full text-neutral-800 focus:outline-none text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="button"
          className="bg-primary hover:bg-primary-dark text-white p-3 sm:p-4 rounded-none"
          onClick={handleSearch}
          aria-label="Search"
        >
          <SearchIcon className="h-5 w-5" />
        </Button>
      </div>
    </motion.section>
  );
};

export default SearchSection;
