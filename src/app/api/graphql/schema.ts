import { gql } from "graphql-tag";

export const typeDefs = gql`

  enum Role {
    CAREWORKER
    MANAGER
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    shifts: [Shift!]!
    perimeter: LocationPerimeter
  }

  type Shift {
    id: ID!
    careWorker: User!
    name: String!
    clockInTime: String!
    clockOutTime: String
    note: String
    locationIn: String!
    locationOut: String
  }

  type LocationPerimeter {
    id: ID!
    manager: User!
    lat: Float!
    lng: Float!
    radius: Float!
  }

  type Query {
    me: User
    allUsers: [User!]!
    shifts: [Shift!]!
    shiftsByCareWorkerName: [Shift!]
    locationPerimeters: [LocationPerimeter!]!
  }

  type Mutation {
    clockIn(userId: String!, lat: Float!, lng: Float!, note: String): Shift!
    clockOut(userId: String!, lat: Float!, lng: Float!, note: String): Shift
    setLocationPerimeter(lat: Float!, lng: Float!, radius: Float!): LocationPerimeter!
  }
`;
