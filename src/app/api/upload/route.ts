import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-utils";
import { saveFile } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user as ADMIN
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized access. Admin privileges required." },
        { status: 403 }
      );
    }

    // 2. Parse request body as form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as "images" | "covers" | "pdfs" | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided in form data." }, { status: 400 });
    }

    if (!type || !["images", "covers", "pdfs"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid upload type. Expected 'images', 'covers', or 'pdfs'." },
        { status: 400 }
      );
    }

    // 3. Save the file to disk using the storage library
    const fileUrl = await saveFile(file, type);

    // 4. Return success path
    return NextResponse.json({
      message: "File uploaded successfully.",
      url: fileUrl,
    });
  } catch (error) {
    console.error("❌ File Upload API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during upload.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
