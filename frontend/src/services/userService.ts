import { User, GlobalRole } from "../types";
import { MOCK_USERS } from "./mockData";

const USERS_STORAGE_KEY = "hackathon_system_users";

export const userService = {
  async listUsers(): Promise<User[]> {
    const custom = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]");
    const merged = [...MOCK_USERS];
    custom.forEach((u: User) => {
      const idx = merged.findIndex((m) => m.id === u.id);
      if (idx >= 0) {
        merged[idx] = u;
      } else {
        merged.push(u);
      }
    });
    return merged;
  },

  async updateUserRole(userId: string, role: GlobalRole): Promise<User> {
    const users = await this.listUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) throw new Error("User not found.");
    target.globalRole = role;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return target;
  },

  async toggleUserStatus(userId: string): Promise<User> {
    const users = await this.listUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) throw new Error("User not found.");
    target.isActive = !target.isActive;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return target;
  },
};
