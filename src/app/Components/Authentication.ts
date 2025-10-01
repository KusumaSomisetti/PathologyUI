"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

let currentUser: any = null;

if (typeof window !== "undefined") {
  const userStr = localStorage.getItem("currentUser");
  if (userStr) {
    try {
      currentUser = JSON.parse(userStr);
    } catch {
      currentUser = null;
    }
  }
}

export const authenticationService = {
  get currentUserValue() {
    return currentUser;
  },

  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}authenticate.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authentication: { email, password } }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const user = await response.json();

      if (user.email === "anonymous@livo.ai") {
        user.test_account = true;
      }

      localStorage.setItem("currentUser", JSON.stringify(user));
      currentUser = user;

      return user;
    } catch (error: any) {
      throw error.message || "Login failed";
    }
  },

  logout() {
    localStorage.removeItem("currentUser");
    currentUser = null;
  },
};
