"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useForm, FieldValues, SubmitHandler } from 'react-hook-form';

import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";

import Modal from './Modal';
import Button from './Button';
import Input from './Input';

const AuthModal = () => {
  const { user, login, signup } = useUser();
  const router = useRouter();
  const { onClose, isOpen } = useAuthModal();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FieldValues>({
    defaultValues: {
      email: '',
      password: '',
      fullName: ''
    }
  });

  // Automatically close modal and refresh route if user is successfully authenticated
  useEffect(() => {
    if (user) {
      router.refresh();
      onClose();
    }
  }, [user, router, onClose]);

  const onChange = (open: boolean) => {
    if (!open) {
      reset();
      onClose();
    }
  }

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    reset();
  }

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      setIsLoading(true);
      if (isSignUp) {
        // Sign Up Flow
        await signup({
          email: data.email,
          password: data.password,
          fullName: data.fullName
        });
        toast.success("Account created successfully!");
      } else {
        // Log In Flow
        await login({
          email: data.email,
          password: data.password
        });
        toast.success("Logged in successfully!");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || "An authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal 
      title={isSignUp ? "Create an account" : "Welcome back"} 
      description={isSignUp ? "Sign up to start listening." : "Login to your account."} 
      isOpen={isOpen} 
      onChange={onChange} 
    >
      <form 
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4"
      >
        {isSignUp && (
          <div>
            <label className="text-sm font-medium text-neutral-300 block mb-1">Full Name</label>
            <Input
              id="fullName"
              disabled={isLoading}
              placeholder="John Doe"
              {...register('fullName', { required: isSignUp })}
            />
            {errors.fullName && <span className="text-red-500 text-xs mt-1 block">Full name is required</span>}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-neutral-300 block mb-1">Email Address</label>
          <Input
            id="email"
            type="email"
            disabled={isLoading}
            placeholder="name@domain.com"
            {...register('email', { required: true })}
          />
          {errors.email && <span className="text-red-500 text-xs mt-1 block">Email is required</span>}
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-300 block mb-1">Password</label>
          <Input
            id="password"
            type="password"
            disabled={isLoading}
            placeholder="••••••••"
            {...register('password', { required: true, minLength: 6 })}
          />
          {errors.password && <span className="text-red-500 text-xs mt-1 block">Password must be at least 6 characters</span>}
        </div>

        <Button 
          disabled={isLoading} 
          type="submit"
          className="mt-2 bg-green-500 hover:bg-green-600 text-black py-3 font-semibold transition"
        >
          {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
        </Button>

        <div className="border-t border-neutral-700 my-2"></div>

        <p 
          onClick={toggleMode}
          className="text-neutral-400 hover:text-white text-sm text-center cursor-pointer transition select-none"
        >
          {isSignUp 
            ? "Already have an account? Log in" 
            : "First time using Spotify? Create an account"
          }
        </p>
      </form>
    </Modal>
  );
}

export default AuthModal;