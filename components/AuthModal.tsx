"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";

import Modal from './Modal';
import Button from './Button';

const AuthModal = () => {
  const { user } = useUser();
  const router = useRouter();
  const { onClose, isOpen } = useAuthModal();

  useEffect(() => {
    if (user) {
      router.refresh();
      onClose();
    }
  }, [user, router, onClose]);

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  }

  const onMockLogin = () => {
    // This is just a placeholder since useUser is already mocked to return a user
    toast.success("Log in successful (Mock)");
    onClose();
  }

  return (
    <Modal 
      title="Welcome back" 
      description="Login to your account." 
      isOpen={isOpen} 
      onChange={onChange} 
    >
      <div className="flex flex-col gap-y-4">
        <p className="text-neutral-400 text-sm text-center">
          Authentication is currently mocked for development.
        </p>
        <Button onClick={onMockLogin}>
          Sign in with Github (Mock)
        </Button>
      </div>
    </Modal>
  );
}

export default AuthModal;