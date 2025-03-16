import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const perimeter = await prisma.locationPerimeter.findUnique({
      where: { managerId: session.user.id },
    });

    if (!perimeter) {
      return NextResponse.json(
        { message: "No location perimeter set" },
        { status: 404 }
      );
    }

    return NextResponse.json(perimeter);
  } catch (error) {
    console.error("Error fetching location perimeter:", error);
    return NextResponse.json(
      { error: "Failed to fetch location perimeter" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { radius } = await req.json();

    // Retrieve existing location perimeter
    let existingPerimeter = await prisma.locationPerimeter.findUnique({
      where: { managerId: session.user.id },
    });

    let lat = existingPerimeter?.lat ?? 0;
    let lng = existingPerimeter?.lng ?? 0;

    const perimeter = await prisma.locationPerimeter.upsert({
      where: { managerId: session.user.id },
      update: { lat, lng, radius },
      create: {
        managerId: session.user.id,
        lat,
        lng,
        radius,
      },
    });

    return NextResponse.json(perimeter);
  } catch (error) {
    console.error("Error updating location perimeter:", error);
    return NextResponse.json(
      { error: "Failed to update location perimeter" },
      { status: 500 }
    );
  }
}
