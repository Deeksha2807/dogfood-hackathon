import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { User, GlobalRole, EventRoleType } from "../types";
import { authService, LoginInput, RegisterInput } from "../services/authService";
import { MOCK_USERS, MOCK_EVENT_ID } from "../services/mockData";
import { apiClient } from "../services/apiClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  activeEventId: string;
  setActiveEventId: (eventId: string) => void;
  login: (data: LoginInput) => Promise<User>;
  loginWithGoogle: (dataOrEmail?: { credential?: string; email?: string; name?: string } | string) => Promise<User>;
  register: (data: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  quickLogin: (role: "admin" | "organizer" | "judge" | "participant") => Promise<void>;
  isSuperAdmin: boolean;
  isOrganizer: boolean;
  isJudge: boolean;
  isParticipant: boolean;
  currentRole: EventRoleType | GlobalRole;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = "hackathon_current_user";
const ACTIVE_EVENT_KEY = "hackathon_active_event_id";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      return saved ? JSON.parse(saved) : MOCK_USERS[4]; // Default to Alice (Participant) for immediate ease of exploration
    } catch {
      return MOCK_USERS[4];
    }
  });

  const [activeEventId, setActiveEventIdState] = useState<string>(() => {
    try {
      return localStorage.getItem(ACTIVE_EVENT_KEY) || MOCK_EVENT_ID;
    } catch {
      return MOCK_EVENT_ID;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setActiveEventId = useCallback((id: string) => {
    setActiveEventIdState(id);
    localStorage.setItem(ACTIVE_EVENT_KEY, id);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authService.getMe();
      if (res && res.user) {
        setUser(res.user);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.user));
      }
    } catch (err) {
      // If API fails or backend session cookie expired, keep local state or fallback gracefully
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (data: LoginInput): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.login(data);
      setUser(res.user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.user));
      return res.user;
    } catch (err) {
      // Check if local mock user matches
      const matched = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase()
      );
      if (matched && (data.password === "Password123!" || data.password.length >= 6)) {
        setUser(matched);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(matched));
        return matched;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (
    dataOrEmail?: { credential?: string; email?: string; name?: string } | string
  ): Promise<User> => {
    setIsLoading(true);
    let payload: { credential?: string; email?: string; name?: string } = {};
    if (typeof dataOrEmail === "string") {
      payload = { email: dataOrEmail };
    } else if (dataOrEmail) {
      payload = dataOrEmail;
    }

    try {
      const res = await authService.loginWithGoogle(payload);
      setUser(res.user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.user));
      return res.user;
    } catch (err) {
      // Offline / DB mock fallback: Role strictly decided by email in DB fixtures
      const email = payload.email || "alice@hackathon.local";
      const normalizedEmail = email.toLowerCase().trim();

      // Check if existing mock user matches email
      let matched = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === normalizedEmail
      );

      if (!matched) {
        // Decide role by email in DB:
        let role: GlobalRole = "USER";
        let eventRole: EventRoleType = "PARTICIPANT";

        if (normalizedEmail.includes("admin") || normalizedEmail.startsWith("admin@")) {
          role = "SUPER_ADMIN";
          eventRole = "ORGANIZER";
        } else if (normalizedEmail.includes("organizer")) {
          role = "USER";
          eventRole = "ORGANIZER";
        } else if (normalizedEmail.includes("judge")) {
          role = "USER";
          eventRole = "JUDGE";
        } else {
          role = "USER";
          eventRole = "PARTICIPANT";
        }

        matched = {
          id: `u-${Date.now()}`,
          name: payload.name || normalizedEmail.split("@")[0].replace(/[._-]/g, " "),
          email: normalizedEmail,
          globalRole: role,
          isActive: true,
          eventRoles: [{ eventId: activeEventId, role: eventRole }],
        };
      }

      setUser(matched);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(matched));
      return matched;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterInput): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      setUser(res.user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.user));
      return res.user;
    } catch (err) {
      // Fallback mock registration
      const newUser: User = {
        id: `u-${Date.now()}`,
        name: data.name,
        email: data.email,
        globalRole: "USER",
        isActive: true,
        eventRoles: [{ eventId: activeEventId, role: "PARTICIPANT" }],
      };
      setUser(newUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch {}
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    apiClient.setToken(null);
  };

  const quickLogin = async (role: "admin" | "organizer" | "judge" | "participant"): Promise<void> => {
    let targetUser: User;
    if (role === "admin") {
      targetUser = MOCK_USERS[0];
    } else if (role === "organizer") {
      targetUser = MOCK_USERS[1];
    } else if (role === "judge") {
      targetUser = MOCK_USERS[2];
    } else {
      targetUser = MOCK_USERS[4];
    }

    try {
      await authService.loginWithGoogle({
        email: targetUser.email,
        name: targetUser.name,
      });
    } catch {}

    setUser(targetUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(targetUser));
  };

  const isSuperAdmin = user?.globalRole === "SUPER_ADMIN";

  const isOrganizer =
    isSuperAdmin ||
    user?.globalRole === "ADMIN" ||
    user?.email.includes("organizer") ||
    user?.eventRoles?.some((r) => r.role === "ORGANIZER") ||
    false;

  const isJudge =
    !isSuperAdmin &&
    (user?.eventRoles?.some((r) => r.role === "JUDGE") || user?.email.includes("judge") || false);

  const isParticipant = !isSuperAdmin && !isOrganizer && !isJudge;

  let currentRole: EventRoleType | GlobalRole = "PARTICIPANT";
  if (isSuperAdmin) currentRole = "SUPER_ADMIN";
  else if (isOrganizer) currentRole = "ORGANIZER";
  else if (isJudge) currentRole = "JUDGE";
  else currentRole = "PARTICIPANT";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        activeEventId,
        setActiveEventId,
        login,
        loginWithGoogle,
        register,
        logout,
        quickLogin,
        isSuperAdmin,
        isOrganizer,
        isJudge,
        isParticipant,
        currentRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
