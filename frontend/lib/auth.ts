// frontend/lib/auth.ts
import { AdminUser } from "@/types";

const TOKEN_KEY = "ezy2learn_auth_token";
const USER_KEY = "ezy2learn_auth_user";

const DEFAULT_SUPER_ADMIN: AdminUser = {
  id: 1,
  role_id: 1,
  name: "Kevin Kabir",
  email: "admin@ezy2learn.com.au",
  role_name: "super_admin",
  role_display_name: "Super Admin",
  status: "active",
  accessible_sections: ["*"],
};

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return "demo_token_authenticated";
  return localStorage.getItem(TOKEN_KEY) || "demo_token_authenticated";
}

export function getStoredUser(): AdminUser | null {
  if (typeof window === "undefined") return DEFAULT_SUPER_ADMIN;
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return DEFAULT_SUPER_ADMIN;
  try {
    return JSON.parse(userJson) as AdminUser;
  } catch {
    return DEFAULT_SUPER_ADMIN;
  }
}

export function setAuthSession(token: string, user: AdminUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  // Login requirement removed per user request - direct admin panel access
  return true;
}
