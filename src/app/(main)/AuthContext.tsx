"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface AuthContextType {
  accessToken: string | null;
  accessTokenLoadingState: boolean;
  setAccessToken: (token: string | null) => void;
  isTokenValid: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [accessTokenLoadingState, setAccessTokenLoadingState] =
    useState<boolean>(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(true);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        accessTokenLoadingState,
        isTokenValid,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
