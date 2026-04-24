import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGetCurrentUser, useLogout, CurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: CurrentUser | null;
  isLoading: boolean;
  login: (token: string, user: CurrentUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("lf_token"));
  const [localUser, setLocalUser] = useState<CurrentUser | null>(() => {
    const saved = localStorage.getItem("lf_user");
    return saved ? JSON.parse(saved) : null;
  });

  const { data: serverUser, isLoading: isQueryLoading } = useGetCurrentUser({
    query: {
      queryKey: getGetCurrentUserQueryKey(),
      enabled: !!token,
      retry: false,
    },
  });

  const logoutMutation = useLogout();

  const user = serverUser || localUser;
  const isAuthenticated = !!token && !!user;

  // We are loading if we have a token but haven't resolved the user query yet (either success or error)
  const isLoading = !!token && isQueryLoading && !serverUser;

  const login = (newToken: string, newUser: CurrentUser) => {
    localStorage.setItem("lf_token", newToken);
    localStorage.setItem("lf_user", JSON.stringify(newUser));
    setToken(newToken);
    setLocalUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("lf_token");
    localStorage.removeItem("lf_user");
    setToken(null);
    setLocalUser(null);
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        queryClient.clear();
        window.location.href = "/";
      },
    });
  };

  useEffect(() => {
    if (serverUser) {
      setLocalUser(serverUser);
      localStorage.setItem("lf_user", JSON.stringify(serverUser));
    }
  }, [serverUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
