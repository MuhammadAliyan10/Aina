import { Prisma } from "@prisma/client";

export function getUserDataSelect(loggedInUserId: string) {
  return {
    username: true,
    email: true,
  };
}

declare global {
  interface Window {
    FB: any;
  }
}
