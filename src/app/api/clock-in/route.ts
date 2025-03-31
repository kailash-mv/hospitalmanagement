import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as turf from "@turf/turf";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, lat, lng, note } = await req.json();

    // console.log("Clock-in Payload:", userId);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const perimeter = await prisma.locationPerimeter.findFirst();

    if (!perimeter) {
      return NextResponse.json({ error: "Perimeter not set" }, { status: 400 });
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
      return NextResponse.json(
        { error: "You are outside the allowed area!" },
        { status: 403 }
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
        clockOutTime: null,
        locationIn: `${lat}, ${lng}`,
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
