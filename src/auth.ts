import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import prisma from "./lib/prisma";
import { Lucia } from "lucia";
import { cache } from "react";
import { Session } from "@prisma/client";
import { cookies } from "next/headers";

const adaptor = new PrismaAdapter(prisma.session, prisma.user);
export const lucia = new Lucia(adaptor, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes(databaseUserAttributes) {
    return {
      id: databaseUserAttributes.id,
      username: databaseUserAttributes.username,
      bio: databaseUserAttributes.bio,
      fullName: databaseUserAttributes.fullName,
      email: databaseUserAttributes.email,
      profilePic: databaseUserAttributes.profilePic,
      createdAt: databaseUserAttributes.createdAt,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  id: string;
  username: string;
  fullName: string | null;
  bio: string | null;
  email: string;
  profilePic: string | null;
  createdAt: Date | null;
}

interface ExtendedSession extends Session {
  id: string;
  expiresAt: Date;
  fresh: boolean;
  userId: string;
}

export const validateRequest = cache(
  async (): Promise<{
    user: DatabaseUserAttributes | null;
    session: ExtendedSession | null;
  }> => {
    const sessionId =
      (await cookies()).get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }
    try {
      const result = await lucia.validateSession(sessionId);
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }

      const user = result.user
        ? {
            id: result.user.id,
            username: result.user.username,
            bio: result.user.bio,
            fullName: result.user.fullName,
            email: result.user.email,
            profilePic: result.user.profilePic,
            createdAt: result.user.createdAt,
          }
        : null;

      const session = result.session
        ? {
            id: result.session.id,
            expiresAt: result.session.expiresAt,
            fresh: result.session.fresh,
            userId: result.session.userId,
          }
        : null;

      return {
        user,
        session,
      };
    } catch (error) {
      console.log(error);
      return {
        user: null,
        session: null,
      };
    }
  }
);
