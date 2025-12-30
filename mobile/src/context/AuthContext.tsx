import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import apiClient, { setToken, removeToken, getToken } from "../api/apiClient";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  businessId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    phone: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  restoreToken: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(true);

  // Restore token on mount
  useEffect(() => {
    restoreToken();
  }, []);

  const restoreToken = useCallback(async () => {
    console.log("🔄 Starting token restoration...");
    setIsLoading(true);
    setIsRestoring(true);

    try {
      // Adiciona delay mínimo para evitar flash
      const [token] = await Promise.all([
        getToken(),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);

      console.log("📦 Token found:", !!token);

      if (token) {
        // Token existe, validar fazendo uma request ao backend
        try {
          // ✅ CORRIGIDO - removido /api/
          const response = await apiClient.get("/auth/me");
          const userData = response.data;
          setUser(userData);
          console.log("✅ Token válido, usuário autenticado:", userData.email);
        } catch (error) {
          console.log("❌ Token inválido, removendo...");
          await removeToken();
          setUser(null);
        }
      } else {
        console.log("ℹ️ No stored token found");
      }
    } catch (error) {
      console.error("❌ Failed to restore token:", error);
      await removeToken();
    } finally {
      // Delay adicional para garantir transição suave
      setTimeout(() => {
        setIsLoading(false);
        setIsRestoring(false);
        console.log("✅ Token restoration complete");
      }, 300);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("📤 Attempting login...");
      // ✅ CORRIGIDO - removido /api/
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });

      const { access_token, user: userData } = response.data;

      await setToken(access_token);
      setUser(userData);
      console.log("✅ Login successful");
    } catch (error: any) {
      console.error("❌ Login error:", error);
      throw {
        statusCode: error.statusCode || 500,
        message: error.message || "Erro ao fazer login",
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string, phone: string) => {
      setIsLoading(true);
      try {
        console.log("📤 Attempting signup...");
        const response = await apiClient.post("/auth/register", {
          email,
          password,
          name,
          phone,
        });

        const { access_token, user: userData } = response.data;

        await setToken(access_token);
        setUser(userData);
        console.log("✅ Signup successful");
      } catch (error: any) {
        console.error("❌ Signup error:", error);
        throw {
          statusCode: error.statusCode || 500,
          message: error.message || "Erro ao criar conta",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("📤 Signing out...");
      await removeToken();
      setUser(null);
      console.log("✅ Signed out successfully");
    } catch (error) {
      console.error("❌ Error signing out:", error);
      // Mesmo com erro, limpa as credenciais locais
      await removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      // ✅ CORRIGIDO - removido /api/
      await apiClient.post("/auth/forgot-password", { email });
      console.log("Solicitação de recuperação de senha enviada");
    } catch (error) {
      console.error("Erro ao solicitar recuperação de senha:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading: isLoading || isRestoring,
    isSignedIn: Boolean(user),
    signIn,
    signUp,
    signOut,
    restoreToken,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
