import { z } from "zod";

const required = z.string().trim().min(1, "Required");
export const signupSchema = z.object({
  email: required.email("Invalid Email"),
  username: required.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, numbers, and dashes are allowed"
  ),
  password: required.min(8, "Password must be at least 8 characters long"),
});

export type signupValue = z.infer<typeof signupSchema>;
export const loginSchema = z.object({
  username: required,
  password: required,
});

export type loginValue = z.infer<typeof loginSchema>;
