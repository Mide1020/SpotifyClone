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
  subscription: any | null; // Removed Stripe Subscription type
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
  const [isLoadingData, setIsloadingData] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoadingUser(true);
      const currentUser = await userService.getCurrentUser();
      setUser(currentUser as User);
      setIsLoadingUser(false);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (user && !isLoadingData && !userDetails) {
      setIsloadingData(true);
      userService.getUserDetails(user.id).then((details) => {
        setUserDetails(details);
        setIsloadingData(false);
      });
    } else if (!user && !isLoadingUser && !isLoadingData) {
      setUserDetails(null);
    }
  }, [user, isLoadingUser]);

  const value = {
    accessToken: "mock-access-token",
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingData,
    subscription: null // Stripe integration removed
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