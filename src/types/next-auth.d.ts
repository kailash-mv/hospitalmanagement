import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    role: "MANAGER" | "CAREWORKER";
  }

  interface Session {
    user: User;
  }
}
