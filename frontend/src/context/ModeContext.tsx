import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { apiClient } from "../services/apiClient";

interface ModeContextType {
  isLiveApi: boolean;
  setIsLiveApi: (live: boolean) => void;
  backendOnline: boolean;
  checkBackendHealth: () => Promise<boolean>;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLiveApi, setIsLiveApi] = useState<boolean>(true);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  const checkBackendHealth = useCallback(async (): Promise<boolean> => {
    try {
      const res = await apiClient.get<{ status: string }>("/api/health");
      const online = res?.status === "ok";
      setBackendOnline(online);
      return online;
    } catch {
      setBackendOnline(false);
      return false;
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  return (
    <ModeContext.Provider
      value={{
        isLiveApi,
        setIsLiveApi,
        backendOnline,
        checkBackendHealth,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = (): ModeContextType => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
};
