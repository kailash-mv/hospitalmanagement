import { NextResponse } from "next/server";
import prisma from "../../../../prisma";

export async function POST(req: Request) {
  try {
    const { userId, locationOut, note } = await req.json();

    if (!userId || !locationOut) {
      return NextResponse.json(
        { error: "User ID and location are required" },
        { status: 400 }
      );
    }

    const shift = await prisma.shift.findFirst({
      where: { careWorkerId: userId },
      orderBy: { clockInTime: "desc" },
    });

    if (!shift) {
      return NextResponse.json(
        { error: "No active shift found" },
        { status: 404 }
      );
    }

    const updatedShift = await prisma.shift.update({
      where: { id: shift.id },
      data: {
        clockOutTime: new Date(),
        locationOut,
        note: note,
      },
    });

    return NextResponse.json({ success: true, shift: updatedShift });
  } catch (error) {
    console.error("Clock-out error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
