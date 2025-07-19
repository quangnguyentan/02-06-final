import React, { createContext, useContext, useState } from "react";

interface UserInteractionContextType {
  hasUserInteracted: boolean;
  setHasUserInteracted: (value: boolean) => void;
}

const UserInteractionContext = createContext<
  UserInteractionContextType | undefined
>(undefined);

export const UserInteractionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  return (
    <UserInteractionContext.Provider
      value={{ hasUserInteracted, setHasUserInteracted }}
    >
      {children}
    </UserInteractionContext.Provider>
  );
};

export const useUserInteraction = () => {
  const context = useContext(UserInteractionContext);
  if (!context) {
    throw new Error(
      "useUserInteraction must be used within a UserInteractionProvider"
    );
  }
  return context;
};
