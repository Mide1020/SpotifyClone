import { UserDetails } from "@/type";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const userService = {
  getCurrentUser: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) return null;
      const data = await response.json();
      
      return {
        id: data.id,
        email: data.email,
        user_metadata: {
          full_name: data.full_name || `${data.first_name || ""} ${data.last_name || ""}`.trim()
        }
      };
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
      return null;
    }
  },

  getUserDetails: async (userId: string, token: string): Promise<UserDetails | null> => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Error in getUserDetails:", error);
      return null;
    }
  },

  login: async (values: any) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: values.email,
        password: values.password
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to log in.");
    }
    return await response.json(); // returns { access_token, token_type }
  },

  signup: async (values: any) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
        full_name: values.fullName
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to sign up.");
    }
    return await response.json(); // returns UserOut
  }
};
