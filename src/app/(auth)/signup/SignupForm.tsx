"use client";
import { signupSchema, signupValue } from "@/lib/validation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp } from "./action";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/PasswordInput";
import LoadingButton from "@/components/LoadingButton";
import { IconBrandGoogle } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import React from "react";

interface SignUpFormProps {
  isOnline: boolean;
}

interface SignUpResponse {
  error?: string;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ isOnline }) => {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const form = useForm<signupValue>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: signupValue): Promise<void> => {
    if (!isOnline) {
      setError("You are offline. Please check your internet connection.");
      return;
    }

    setError(undefined);
    startTransition(async () => {
      try {
        const result: SignUpResponse = await signUp(values);
        if (result.error) {
          setError(result.error);
        }
      } catch (err) {
        setError("An error occurred during sign up. Please try again.");
      }
    });
  };

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const handleGoogleSignIn = (): void => {
    if (!isOnline) {
      setError("You are offline. Please check your internet connection.");
      return;
    }
    // Implement Google sign-in logic
    alert("Google sign-up functionality to be implemented");
  };

  return (
    <Form {...form}>
      <motion.div initial="hidden" animate="visible" variants={formVariants}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-destructive/10 text-destructive p-3 rounded-md text-center"
            >
              <p>{error}</p>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your username"
                      {...field}
                      autoComplete="username"
                      className="border-input/60 focus:border-primary transition-colors duration-200"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      {...field}
                      autoComplete="email"
                      className="border-input/60 focus:border-primary transition-colors duration-200"
                      disabled={isPending}
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Create a password"
                      {...field}
                      className="border-input/60 focus:border-primary transition-colors duration-200"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="pt-2">
            <LoadingButton
              loading={isPending}
              className="w-full font-medium"
              type="submit"
              size="lg"
              disabled={!isOnline || isPending}
            >
              Create Account
            </LoadingButton>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-2">
            <Button
              variant="outline"
              type="button"
              className="w-full font-medium"
              size="lg"
              disabled={!isOnline || isPending}
              onClick={handleGoogleSignIn}
            >
              <IconBrandGoogle className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </Form>
  );
};

export default SignUpForm;
