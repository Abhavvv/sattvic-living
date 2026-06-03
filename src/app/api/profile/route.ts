import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().nullable().optional(),
  bio: z.string().max(300, "Bio must be 300 characters or less").nullable().optional(),
  image: z.string().nullable().optional(),
});

export async function PUT(req: Request) {
  try {
    // Authenticate the user session on the server
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized access. Please log in first." },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate request body
    const result = profileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, phone, bio, image } = result.data;

    // Update the user profile in the database
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone: phone || null,
        bio: bio || null,
        image: image || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        bio: true,
        role: true,
      },
    });

    return NextResponse.json(
      { message: "Profile updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Profile Update API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating your profile." },
      { status: 500 }
    );
  }
}
