"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "@/utils/axiosInstance";

export interface AuthUser {
  userId: number;
  username: string;
  email: string;
  profileImage: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  // React.SetStateAction<AuthUser null |> -> บอกค่า format ที่รับได้ 2 อย่าง setUser(value), setUser((prev) =>)
  // React.Dispatch<...> บอกว่ามันเป็นคำสั่ง update return void
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}   

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูล User ครั้งเดียวตอนเปิดเว็บ / รีเฟรชหน้า
  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get("/api/auth/me");
      if (res.data?.success) {
        setUser(res.data.data);
      } else {
        setUser(null);
      }
    } catch {
      // กรณี 401 (ยังไม่ล็อกอิน) ให้ตั้งค่า user เป็น null เงียบๆ
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = async () => {
    try {
      await axiosInstance.post("/api/auth/logout");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook สำหรับเรียกใช้ในหน้าต่างๆ
export function useAuth() {
  // ตัวต่อตรงกลับมาที่ Authconetxt ผ่าน context ที่ return ไป
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}