import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    const shifts = await prisma.shift.findMany({
      where: { clockInTime: { gte: oneWeekAgo } },
      include: { careWorker: true },
    });

    const dailyHours: Record<string, number[]> = {};
    shifts.forEach((shift) => {
      const date = shift.clockInTime.toISOString().split("T")[0];
      if (shift.clockOutTime) {
        const hours =
          (new Date(shift.clockOutTime).getTime() -
            new Date(shift.clockInTime).getTime()) /
          (1000 * 60 * 60);
        if (!dailyHours[date]) dailyHours[date] = [];
        dailyHours[date].push(hours);
      }
    });

    const avgHoursPerDay = Object.keys(dailyHours).map((date) => ({
      date,
      avgHours:
        dailyHours[date].reduce((sum, h) => sum + h, 0) /
        dailyHours[date].length,
    }));

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

    const totalHoursPerStaff: Record<string, number> = {};
    shifts.forEach((shift) => {
      const name = shift.careWorker.name;
      if (shift.clockOutTime) {
        const hours =
          (new Date(shift.clockOutTime).getTime() -
            new Date(shift.clockInTime).getTime()) /
          (1000 * 60 * 60);
        totalHoursPerStaff[name] = (totalHoursPerStaff[name] || 0) + hours;
      }
    });

    const totalHoursArray = Object.entries(totalHoursPerStaff).map(
      ([name, hours]) => ({
        name,
        totalHours: hours,
      })
    );

    return NextResponse.json(
      { avgHoursPerDay, numPeoplePerDay, totalHoursArray },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
