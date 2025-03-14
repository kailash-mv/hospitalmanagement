import { NextResponse } from "next/server";
import prisma from "../../../../prisma";

export async function POST(req: Request) {
  try {
    const { userId, locationIn, note } = await req.json();

    console.log("Clock-in Payload:", userId);

    if (!userId || !locationIn) {
      return NextResponse.json(
        { error: "User ID and location are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const shift = await prisma.shift.create({
      data: {
        careWorkerId: userId,
        clockInTime: new Date(),
        locationIn: locationIn,
        note: note,
      },
    });

    console.log(shift);

    return NextResponse.json({ success: true, shift });
  } catch (error) {
    console.error("Clock-in error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
