import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const shifts = await prisma.shift.findMany({
      where: { clockOutTime: null },
      orderBy: { clockInTime: "desc" },
      include: {
        careWorker: {
          select: {
            name: true,
          },
        },
      },
    });
    const formattedShifts = shifts.map((shift) => ({
      ...shift,
      name: shift.careWorker?.name || "Unknown",
      clockInTime: shift.clockInTime.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      clockOutTime: shift.clockOutTime?.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    }));

    return NextResponse.json(formattedShifts, { status: 200 });
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return NextResponse.json(
      { error: "Failed to fetch shifts" },
      { status: 500 }
    );
  }
}
