import { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/lib/types";
import { auth } from "@/services/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<User | null>;
  signUp: (
    email: string,
    password: string,
    phone: string,
    username: string,
  ) => Promise<User | null>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const user = auth.getToken();
    if (user) {
      setUser(JSON.parse(user));
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await auth.signIn(email, password);
      if (response) {
        setUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
        const user: User = {
          id: response?.user.id,
          email: response?.user.email,
          username: response?.user.username,
          phone: response?.user.phone,
          token: response?.user.token,
        };
        return user;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign out");
    }
  };

  const signUp = async (
    email: string,
    password: string,
    phone: string,
    username: string,
  ) => {
    try {
      const response = await auth.signUp(email, password, phone, username);
      if (response) {
        setUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
        const user: User = {
          id: response?.user.id,
          email: response?.user.email,
          username: response?.user.username,
          phone: response?.user.phone,
          token: response?.user.token,
        };
        return user;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up");
      return null;
    }
  };

  const signInWithGoogle = async () => {
    try {
      await auth.signInWithGoogle();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in with Google",
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        signIn,
        signOut,
        signUp,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
