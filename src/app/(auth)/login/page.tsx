import { Metadata } from "next";
import React from "react";
import logInImage from "@/assets/Login.jpg";
import Image from "next/image";
import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login",
};
const page = () => {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="flex h-full max-h-[40rem] w-full max-w-[64rem] overflow-hidden rounded-2xl bg-card shadow-2xl">
        <Image
          src={logInImage}
          alt="Login image"
          className="hidden w-1/2 object-cover md:block"
        />
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <div className="space-y-1 text-center">
            <h1 className="text-3xl font-bold">Log In</h1>
            <p className="text-muted-foreground">
              A place where <span className="italic">you</span> can&apos;'t be
              alone.
            </p>
          </div>
          <LoginForm />
          <div className="space-y-5">
            <Link
              href={"/signup"}
              className="block text-center hover:underline"
            >
              New here? Click to create account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;
