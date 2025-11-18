import { createContext, useContext, useState, type ReactNode } from 'react';

type DropdownType = 'notification' | 'profile' | null;

interface DropdownContextType {
  activeDropdown: DropdownType;
  setActiveDropdown: (dropdown: DropdownType) => void;
  closeAllDropdowns: () => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdown must be used within DropdownProvider');
  }
  return context;
};

interface DropdownProviderProps {
  children: ReactNode;
}

export const DropdownProvider = ({ children }: DropdownProviderProps) => {
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);

  const closeAllDropdowns = () => {
    setActiveDropdown(null);
  };

  return (
    <DropdownContext.Provider value={{ activeDropdown, setActiveDropdown, closeAllDropdowns }}>
      {children}
    </DropdownContext.Provider>
  );
};
