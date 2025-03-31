import { GraphQLClient } from "graphql-request";

const client = new GraphQLClient("/api/graphql", {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
});

export default client;
