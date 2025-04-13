"use client";
import { useForm } from "react-hook-form";
import { loginSchema, loginValue } from "../../../lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "./action";
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
import { useState, useTransition, useEffect } from "react";
import { IconBrandGoogle } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginForm() {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const [savedUsername, setSavedUsername] = useState<string>("");

  useEffect(() => {
    // Check if there's a saved username in localStorage
    const username = localStorage.getItem("savedUsername");
    if (username) {
      setSavedUsername(username);
      form.setValue("username", username);
    }
  }, []);

  const form = useForm<loginValue>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: savedUsername || "",
      password: "",
    },
  });

  async function onSubmit(values: loginValue) {
    setError(undefined);

    // Save username to localStorage if remember me is checked
    if (values.username) {
      localStorage.setItem("savedUsername", values.username);
    }

    startTransition(async () => {
      const { error } = await login(values);
      if (error) setError(error);
    });
  }

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
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-foreground">Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      placeholder="Enter your password"
                      {...field}
                      className="border-input/60 focus:border-primary transition-colors duration-200"
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
            >
              Log In
            </LoadingButton>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-2">
            <Button
              variant="outline"
              type="button"
              className="w-full font-medium"
              size="lg"
            >
              <IconBrandGoogle className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </Form>
  );
}
