import { createContext } from "react";

// Create a context for the application to share state
export const GlobalContext = createContext({
  isOpen: window.innerWidth >= 1024,
  setIsOpen: (value: boolean) => {},
  currentCategory: 'all',
  setCurrentCategory: (category: string) => {}
});