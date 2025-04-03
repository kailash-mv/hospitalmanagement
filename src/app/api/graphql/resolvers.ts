import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { GraphQLError } from "graphql";
import { authOptions } from "@/lib/auth";
import * as turf from "@turf/turf";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

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
          note:shift.note,
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

    analytics: async () => {
      try {
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);

        const shifts = await prisma.shift.findMany({
          where: { clockInTime: { gte: oneWeekAgo } },
          include: { careWorker: true },
        });

        // Calculate Average Hours per Day
        const dailyHours: Record<string, number[]> = {};
        shifts.forEach((shift) => {
          const date = shift.clockInTime.toISOString().split("T")[0];
          if (shift.clockOutTime) {
            const hours =
              (new Date(shift.clockOutTime).getTime() - new Date(shift.clockInTime).getTime()) /
              (1000 * 60 * 60);
            if (!dailyHours[date]) dailyHours[date] = [];
            dailyHours[date].push(hours);
          }
        });

        const avgHoursPerDay = Object.keys(dailyHours).map((date) => ({
          date,
          avgHours:
            dailyHours[date].reduce((sum, h) => sum + h, 0) / dailyHours[date].length,
        }));

        // Count Number of People per Day
        const peoplePerDay: Record<string, Set<string>> = {};
        shifts.forEach((shift) => {
          const date = shift.clockInTime.toISOString().split("T")[0];
          if (!peoplePerDay[date]) peoplePerDay[date] = new Set();
          peoplePerDay[date].add(shift.careWorker.name);
        });

        const numPeoplePerDay = Object.keys(peoplePerDay).map((date) => ({
          date,
          count: peoplePerDay[date].size,
        }));

        // Calculate Total Hours per Staff
        const totalHoursPerStaff: Record<string, number> = {};
        shifts.forEach((shift) => {
          const name = shift.careWorker.name;
          if (shift.clockOutTime) {
            const hours =
              (new Date(shift.clockOutTime).getTime() - new Date(shift.clockInTime).getTime()) /
              (1000 * 60 * 60);
            totalHoursPerStaff[name] = (totalHoursPerStaff[name] || 0) + hours;
          }
        });

        const totalHoursArray = Object.entries(totalHoursPerStaff).map(([name, hours]) => ({
          name,
          totalHours: hours,
        }));

        return { avgHoursPerDay, numPeoplePerDay, totalHoursArray };
      } catch (error) {
        console.error("Error fetching analytics:", error);
        throw new Error("Failed to fetch analytics");
      }
    },
  },

  Mutation: {
    register: async (_: any, { name, email, password, role }: any) => {
      try {
        if (!name || !email || !password || !role) {
          throw new Error("Invalid data provided");
        }

        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
          data: {
            email,
            name,
            hashedPassword,
            role: role.toUpperCase() as Role,
          },
        });

        const token = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET as string,
          { expiresIn: "7d" }
        );

        return { user, token };
      } catch (error) {
        console.error("Error registering user:", error);
        throw new Error("Server error");
      } finally {
        await prisma.$disconnect();
      }
    },

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

    setUserRole: async (_: any, { role }: { role: string }) => {
      try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
          throw new Error("Unauthorized");
        }

        if (role !== "MANAGER" && role !== "CAREWORKER") {
          throw new Error("Invalid role");
        }

        await prisma.user.update({
          where: { email: session.user.email },
          data: { role },
        });

        return "Role updated successfully";
      } catch (error) {
        console.error("Error setting role:", error);
        throw new Error("Internal Server Error");
      }
    },

    managerClockOut: async (
      _: unknown,
      { careWorkerName }: { careWorkerName: string },
      { session }: { session: any }
    ) => {
      if (!session || session.user.role !== "MANAGER") {
        throw new Error("Unauthorized");
      }
    
     
      const careWorker = await prisma.user.findFirst({
        where: { name: careWorkerName, role: "CAREWORKER" },
      });
    
      if (!careWorker) {
        throw new Error("Care worker not found");
      }
    
      const shift = await prisma.shift.findFirst({
        where: { careWorkerId: careWorker.id, clockOutTime: null },
        orderBy: { clockInTime: "desc" },
      });
    
      if (!shift) {
        throw new Error("No active shift found for this care worker");
      }
    
   
      return prisma.shift.update({
        where: { id: shift.id },
        data: {
          clockOutTime: new Date(),
          locationOut: "Manager Clocked Out",
        },
      });
    },    

  },
};
