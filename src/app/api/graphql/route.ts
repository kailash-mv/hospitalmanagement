import { NextRequest } from "next/server";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import prisma from "../../../../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type AuthPayload {
    token: String!
    role: String!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!, role: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }
`;

const resolvers = {
  Mutation: {
    register: async (_, { name, email, password, role }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role },
      });
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        "SECRET_KEY",
        { expiresIn: "7d" }
      );
      return { token, role: user.role };
    },
    login: async (_, { email, password }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error("Invalid credentials");
      }
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        "SECRET_KEY",
        { expiresIn: "7d" }
      );
      return { token, role: user.role };
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
export const { GET, POST } = startServerAndCreateNextHandler(server);
