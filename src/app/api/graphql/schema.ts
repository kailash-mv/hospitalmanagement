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

   type AuthPayload {
  user: User!
  token: String!
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

   type AvgHoursPerDay {
    date: String
    avgHours: Float
  }

  type NumPeoplePerDay {
    date: String
    count: Int
  }

  type TotalHoursPerStaff {
    name: String
    totalHours: Float
  }

  type Analytics {
    avgHoursPerDay: [AvgHoursPerDay]
    numPeoplePerDay: [NumPeoplePerDay]
    totalHoursArray: [TotalHoursPerStaff]
  }

 
    
  type Query {
    me: User
    allUsers: [User!]!
    shifts: [Shift!]!
    shiftsByCareWorkerName: [Shift!]
    locationPerimeters: [LocationPerimeter!]! 
    analytics: Analytics
  }

  type Mutation {
    register(name: String!, email: String!, password: String!, role: Role!): AuthPayload!
    clockIn(userId: String!, lat: Float!, lng: Float!, note: String): Shift!
    clockOut(userId: String!, lat: Float!, lng: Float!, note: String): Shift
    setLocationPerimeter(lat: Float!, lng: Float!, radius: Float!): LocationPerimeter!
    setUserRole(role: String!): String!
    managerClockOut(careWorkerName: String!): Shift!
  }
`;
