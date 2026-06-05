import { useState, useEffect, useCallback } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

export type User = {
  id: number;
  name: string;
  email?: string;
  role: string; // 'candidate', 'hr', 'recruiter', 'admin'
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserStr = localStorage.getItem("user");
    
    // Also support legacy candidateId if no full user object exists yet
    const candidateId = localStorage.getItem("candidateId");

    if (token) {
      setAuthTokenGetter(() => token);
      if (storedUserStr) {
        try {
          setUser(JSON.parse(storedUserStr));
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      } else if (candidateId) {
        setUser({ id: parseInt(candidateId), name: "Candidate", role: "candidate" });
      }
    } else {
      setAuthTokenGetter(null);
    }
    
    setIsLoading(false);
  }, []);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    if (userData.role === "candidate") {
      localStorage.setItem("candidateId", userData.id.toString());
    }
    
    setAuthTokenGetter(() => token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("candidateId");
    setAuthTokenGetter(null);
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
