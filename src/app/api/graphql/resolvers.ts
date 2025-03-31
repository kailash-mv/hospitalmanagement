import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { GraphQLError } from "graphql";
import { authOptions } from "@/lib/auth";
import * as turf from "@turf/turf";

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, { session }: { session: any }) => {
      if (!session) throw new Error("Not authenticated");
      return prisma.user.findUnique({ where: { email: session.user.email } });
    },
    allUsers: async () => prisma.user.findMany(),
    shifts: async () => {
      try {
        const shifts = await prisma.shift.findMany({
          orderBy: { clockInTime: "desc" },
          include: {
            careWorker: {
              select: { name: true },
            },
          },
        });

        return shifts.map((shift) => ({
          id: shift.id,
          name: shift.careWorker?.name || "Unknown",
          clockInTime: shift.clockInTime.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          clockOutTime: shift.clockOutTime ? shift.clockOutTime.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }): null,
          locationIn: shift.locationIn,
          locationOut: shift.locationOut,
        }));
      } catch (error) {
        console.error("Error fetching shifts:", error);
        throw new Error("Failed to fetch shifts");
      }
    },

    shiftsByCareWorkerName: async (_: unknown, __: unknown, { session }: { session: any }) => {
      if (!session) throw new Error("Not authenticated");
      try {
        const shifts = await prisma.shift.findMany({
          where: {
            careWorkerId: session?.user?.id,
          },
          orderBy: { clockInTime: "desc" },
          include: {
            careWorker: {
              select: { name: true },
            },
          },
        });

        return shifts.map((shift) => ({
          id: shift.id,
          name: shift.careWorker?.name || "Unknown",
          clockInTime: shift.clockInTime.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          clockOutTime: shift.clockOutTime ? shift.clockOutTime.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }): null,
          locationIn: shift.locationIn,
          locationOut: shift.locationOut,
          note: shift.note,
        }));
      } catch (error) {
        console.error("Error fetching careworker shifts:", error);
        throw new Error("Failed to fetch careworker shifts");
      }
    },
    
    locationPerimeters: async () =>
      prisma.locationPerimeter.findMany({ include: { manager: true } }),
  },

  Mutation: {
    clockIn: async (
      _: unknown,
      { userId, lat, lng, note }: { userId: string; lat: number; lng: number; note?: string }
    ) => {
      try {
        if (!userId) {
          throw new Error("User ID is required");
        }

        const perimeter = await prisma.locationPerimeter.findFirst();
        if (!perimeter) {
          throw new Error("Perimeter not set");
        }

        const userPoint = turf.point([lng, lat]);
        const perimeterCircle = turf.circle(
          [perimeter.lng, perimeter.lat],
          perimeter.radius,
          { units: "kilometers" }
        );

        const isWithinPerimeter = turf.booleanPointInPolygon(
          userPoint,
          perimeterCircle
        );

        if (!isWithinPerimeter) {
          throw new Error("You are outside the allowed area!");
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          throw new Error("User not found");
        }

        const shift = await prisma.shift.create({
          data: {
            careWorkerId: userId,
            clockInTime: new Date(),
            clockOutTime: null,
            locationIn: `${lat}, ${lng}`,
            note,
          },
        });

        return shift;
      } catch (error) {
        console.error("Clock-in error:", error);
        throw new Error("Clock-in failed");
      }
    },

    clockOut: async (
      _: unknown,
      { userId, lat, lng, note }: { userId: string; lat: number; lng: number; note?: string }
    ) => {
      try {
        if (!userId || lat === undefined || lng === undefined) {
          throw new GraphQLError("User ID, latitude, and longitude are required", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const shift = await prisma.shift.findFirst({
          where: { careWorkerId: userId, clockOutTime: null },
          orderBy: { clockInTime: "desc" },
        });

        if (!shift) {
          throw new GraphQLError("No active shift found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        const updatedShift = await prisma.shift.update({
          where: { id: shift.id },
          data: {
            clockOutTime: new Date(),
            locationOut: `${lat}, ${lng}`,
            note: note || shift.note,
          },
        });

        return updatedShift;
      } catch (error) {
        console.error("Clock-out error:", error);
        throw new GraphQLError("Clock-out failed", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    setLocationPerimeter: async (
      _: unknown,
      args: { lat: number; lng: number; radius: number },
      { session }: { session: any }
    ) => {
      if (!session) throw new Error("Not authenticated");
    
      return prisma.locationPerimeter.upsert({
        where: { managerId: session.user.id },
        update: { lat: args.lat, lng: args.lng, radius: args.radius },
        create: {
          managerId: session.user.id,
          lat: args.lat,
          lng: args.lng,
          radius: args.radius,
        },
      });
    },
  },
};
