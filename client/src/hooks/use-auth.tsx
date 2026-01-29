import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { User, InsertUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfessions: (professions: string[]) => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper for authenticated fetch
export async function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  // Ensure we send JSON if body is present and not FormData
  if (options.body && typeof options.body === 'string') {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/auth";
    throw new Error("Unauthorized");
  }
  return res;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  // Fetch current user if token exists
  const { data: user, isLoading: isLoadingUser, error } = useQuery({
    queryKey: [api.auth.user.path],
    queryFn: async () => {
      if (!token) return null;
      try {
        const res = await authFetch(api.auth.user.path);
        if (!res.ok) throw new Error("Failed to fetch user");
        return await res.json() as User;
      } catch (e) {
        setToken(null);
        return null;
      }
    },
    enabled: !!token,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await fetch(api.auth.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      queryClient.setQueryData([api.auth.user.path], data.user);
      toast({ title: "Hoş geldiniz", description: "Başarıyla giriş yapıldı" });
    },
    onError: (error: Error) => {
      toast({ title: "Giriş başarısız", description: error.message, variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      console.log("Registering with data:", data);
      const res = await fetch(api.auth.register.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        console.error("Registration error from server:", error);
        throw new Error(error.message || "Kayıt başarısız");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      queryClient.setQueryData([api.auth.user.path], data.user);
      toast({ title: "Hesap oluşturuldu", description: "Kamu İlan Takip sistemine hoş geldiniz" });
    },
    onError: (error: Error) => {
      toast({ title: "Kayıt başarısız", description: error.message, variant: "destructive" });
    },
  });

  const updateProfessionsMutation = useMutation({
    mutationFn: async (professions: string[]) => {
      const res = await authFetch(api.auth.updateProfessions.path, {
        method: "PUT",
        body: JSON.stringify({ professions }),
      });
      if (!res.ok) throw new Error("Meslekler güncellenemedi");
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData([api.auth.user.path], updatedUser);
      toast({ title: "Tercihler kaydedildi", description: "Meslek akışınız güncellendi." });
    },
  });

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    queryClient.setQueryData([api.auth.user.path], null);
    toast({ title: "Çıkış yapıldı" });
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: isLoadingUser,
        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        logout,
        updateProfessions: updateProfessionsMutation.mutateAsync,
        token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
