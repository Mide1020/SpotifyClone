import { useEffect, useState, createContext, useContext } from 'react';
import { UserDetails } from '@/type';
import { userService } from '@/services/userService';

type User = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  }
};

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  login: (values: any) => Promise<void>;
  signup: (values: any) => Promise<void>;
  logout: () => void;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export interface Props {
  [propName: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingData, setIsloadingData] = useState(false);

  // Core helper to retrieve user profile and user details using JWT token
  const loadUserData = async (token: string) => {
    try {
      setIsloadingData(true);
      const currentUser = await userService.getCurrentUser(token);
      if (currentUser) {
        setUser(currentUser as User);
        const details = await userService.getUserDetails(currentUser.id, token);
        setUserDetails(details);
      } else {
        // Clear expired or invalid token
        localStorage.removeItem("spotify_clone_token");
        setAccessToken(null);
        setUser(null);
        setUserDetails(null);
      }
    } catch (err) {
      console.error("Failed to load user credentials:", err);
    } finally {
      setIsloadingData(false);
    }
  };

  // Check on first mount if a cached JWT token exists in local storage
  useEffect(() => {
    const checkToken = async () => {
      setIsLoadingUser(true);
      const token = localStorage.getItem("spotify_clone_token");
      if (token) {
        setAccessToken(token);
        await loadUserData(token);
      }
      setIsLoadingUser(false);
    };

    checkToken();
  }, []);

  const login = async (values: any) => {
    setIsLoadingUser(true);
    try {
      const data = await userService.login(values);
      localStorage.setItem("spotify_clone_token", data.access_token);
      setAccessToken(data.access_token);
      await loadUserData(data.access_token);
    } catch (err) {
      throw err;
    } finally {
      setIsLoadingUser(false);
    }
  };

  const signup = async (values: any) => {
    setIsLoadingUser(true);
    try {
      await userService.signup(values);
      // Auto-log the user in immediately upon successful registration
      await login({ email: values.email, password: values.password });
    } catch (err) {
      throw err;
    } finally {
      setIsLoadingUser(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("spotify_clone_token");
    setAccessToken(null);
    setUser(null);
    setUserDetails(null);
  };

  const value = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingData,
    login,
    signup,
    logout
  };

  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a MyUserContextProvider.`);
  }
  return context;
};