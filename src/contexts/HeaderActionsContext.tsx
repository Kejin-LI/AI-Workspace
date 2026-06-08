import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CustomSpace {
  id: string;
  name: string;
}

interface HeaderActionsContextType {
  actions: ReactNode;
  setActions: (actions: ReactNode) => void;
  title: ReactNode | null;
  setTitle: (title: ReactNode | null) => void;
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  customSpaces: CustomSpace[];
  setCustomSpaces: React.Dispatch<React.SetStateAction<CustomSpace[]>>;
}

const HeaderActionsContext = createContext<HeaderActionsContextType | undefined>(undefined);

export function HeaderActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode>(null);
  const [title, setTitle] = useState<ReactNode | null>(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [customSpaces, setCustomSpaces] = useState<CustomSpace[]>([
    { id: 'proj_demo1', name: 'Demo: NVIDIA Blackwell Architecture Analysis' },
    { id: 'proj_demo2', name: 'Demo: Research Paper Summarization' },
    { id: 'proj_111', name: '111' },
    { id: 'proj_demo3', name: 'Demo: Introduction to Quantum Computing' }
  ]);

  return (
    <HeaderActionsContext.Provider value={{ actions, setActions, title, setTitle, isRightPanelOpen, setIsRightPanelOpen, customSpaces, setCustomSpaces }}>
      {children}
    </HeaderActionsContext.Provider>
  );
}

export function useHeaderActions() {
  const context = useContext(HeaderActionsContext);
  if (context === undefined) {
    throw new Error('useHeaderActions must be used within a HeaderActionsProvider');
  }
  return context;
}