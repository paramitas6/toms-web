// src/lib/nextAuthAdapter.ts

import { Adapter } from "next-auth/adapters";
import { User } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import db from "@/db/db";



const nextAuthAdapter: Adapter = {
  // User methods
  async createUser(user:User) {
    const newUser = await db.user.create({
      data: {
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
    return newUser;
  },

  async getUser(id) {
    const user = await db.user.findUnique({
      where: { id },
    });
    if (user) {
      return {
        ...user,
        email: user.email ?? "",
      };
    }
    return null;
  },

  async getUserByEmail(email: string) {
    const user = await db.user.findUnique({
      where: { email },
    });
    if (user) {
      return {
        ...user,
        email: user.email ?? "",
      };
    }
    return null;
  },

  async getUserByAccount(provider_providerAccountId) {
    // Since we merged Account into User, handle accordingly
    // Assuming provider and providerAccountId correspond to magicLinkToken or similar
    const { provider, providerAccountId } = provider_providerAccountId;
    // Customize this based on how you map provider and providerAccountId
    if (provider === "email") {
      const user = await db.user.findUnique({
        where: { email: providerAccountId },
      });
      if (user) {
        return {
          ...user,
          email: user.email ?? "",
        };
      }
      return null;
    }
    return null;
  },

  async updateUser(user) {
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
    return {
      ...updatedUser,
      email: updatedUser.email ?? "",
    };
  },

  async deleteUser(userId) {
    await db.user.delete({
      where: { id: userId },
    });
  },

  // Account methods are skipped since we merged them into User
  async linkAccount() {
    // No-op
    return null;
  },

  async unlinkAccount() {
    // No-op
    return null;
  },

  // Session methods
  async createSession(session) {
    const newSession = await db.session.create({
      data: {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      },
    });
    return newSession;
  },

  async getSessionAndUser(sessionToken) {
    const session = await db.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });
    if (session && session.user) {
      return {
        session,
        user: {
          ...session.user,
          email: session.user.email ?? "",
        },
      };
    }
    return null;
  },

  async updateSession(session) {
    return db.session.update({
      where: { sessionToken: session.sessionToken },
      data: { expires: session.expires },
    });
  },

  async deleteSession(sessionToken) {
    return db.session.delete({
      where: { sessionToken },
    });
  },

  // VerificationToken methods
  async createVerificationToken(token) {
    return db.verificationToken.create({
      data: token,
    });
  },

  async useVerificationToken(identifier_token) {
    const { identifier, token } = identifier_token;
    const verificationToken = await db.verificationToken.findUnique({
      where: { identifier_token },
    });
    if (!verificationToken) return null;
    await db.verificationToken.delete({
      where: { identifier, token },
    });
    return verificationToken;
  },
};

export default nextAuthAdapter;
