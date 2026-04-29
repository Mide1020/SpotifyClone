import { UserDetails } from "@/type";
import usersMock from "@/mock-data/users.json";

export const userService = {
  getUserDetails: async (userId: string): Promise<UserDetails | null> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const user = usersMock.find((u) => u.id === userId);
    return (user as any) || null;
  },

  getCurrentUser: async () => {
    // Return a default mock user
    return {
      id: "user1",
      email: "test@example.com",
      user_metadata: {
        full_name: "Test User"
      }
    };
  }
};
