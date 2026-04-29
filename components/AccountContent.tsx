"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/hooks/useUser";

const AccountContent = () => {
  const router = useRouter();
  const { isLoading, user } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

  return ( 
    <div className="mb-7 px-6 mt-7">
      <div className="flex flex-col gap-y-4">
        <p>Account settings are currently being refactored.</p>
        <p>Welcome, <b>{user?.email}</b>!</p>
      </div>
    </div>
  );
}
 
export default AccountContent;