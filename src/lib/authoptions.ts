import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import db from "@/lib/db/db";
import { usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const existing = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, user.email!));

      if (existing.length === 0) {
        await db.insert(usersTable).values({
          name: user.name ?? "",
          email: user.email!,
          image: user.image,
        });
      }

      return true;
    },
  },
};