// mobile/context/AuthContext.tsx

/*
 * React & Core
 */
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage"; // <--- IMPORT THIS

/*
 * Project Imports
 */
import { useToast } from "@/context/ToastContext";

/*
 * Types
 */
type User = { id: string; name: string; email: string };

type AuthContextData = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (name: string, email: string, pass: string) => Promise<void>;
  signOut: () => void;
};

/*
 * Context Creation
 */
const AuthContext = createContext<AuthContextData>({} as AuthContextData);
const API_URL = process.env.EXPO_PUBLIC_API_URL;

/*
 * Provider Component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  /*
   * States
   */
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  /*
   * Effects - Load Session on Startup
   */
  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedUser = await AsyncStorage.getItem("@invito:user");
        const storedToken = await AsyncStorage.getItem("@invito:token");

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (error) {
        console.log("Error loading session:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  /*
   * Auth Methods
   */
  async function signIn(email: string, pass: string) {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setUser(data.user);
      setToken(data.token);

      await AsyncStorage.setItem("@invito:user", JSON.stringify(data.user));
      await AsyncStorage.setItem("@invito:token", data.token);

      showToast("Entrou com sucesso", "success");
    } catch (error: any) {
      showToast(error.message || "Falha ao entrar", "error");
      throw error;
    }
  }

  async function signUp(name: string, email: string, pass: string) {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: pass }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setUser(data.user);
      setToken(data.token);

      await AsyncStorage.setItem("@invito:user", JSON.stringify(data.user));
      await AsyncStorage.setItem("@invito:token", data.token);

      showToast("Conta criada com sucesso!", "success");
    } catch (error: any) {
      showToast(error.message || "Falha ao registar", "error");
      throw error;
    }
  }

  async function signOut() {
    setUser(null);
    setToken(null);

    await AsyncStorage.removeItem("@invito:user");
    await AsyncStorage.removeItem("@invito:token");
  }

  /*
   * Render
   */
  return (
    <AuthContext.Provider
      value={{ user, token, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/*
 * Hook Export
 */
export const useAuth = () => useContext(AuthContext);
