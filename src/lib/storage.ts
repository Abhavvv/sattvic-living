import fs from "fs/promises";
import path from "path";

// Define limit sizes
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PDF_SIZE = 20 * 1024 * 1024; // 20MB

// Define accepted MIME types
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_PDF_TYPES = ["application/pdf"];

/**
 * Saves a file to local storage in public/uploads directory.
 * Easily swappable for S3/Cloudinary in the future.
 * Returns the public access path to the file.
 */
export async function saveFile(
  file: File,
  subFolder: "images" | "covers" | "pdfs"
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Validate file size and type
  if (subFolder === "pdfs") {
    if (file.size > MAX_PDF_SIZE) {
      throw new Error(`PDF exceeds max size of 20MB (got ${Math.round(file.size / 1024 / 1024)}MB)`);
    }
    if (!ACCEPTED_PDF_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type for PDF. Got ${file.type}, expected application/pdf`);
    }
  } else {
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(`Image exceeds max size of 5MB (got ${Math.round(file.size / 1024 / 1024)}MB)`);
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      throw new Error(`Invalid image type. Got ${file.type}, expected jpeg, png, webp, or gif`);
    }
  }

  // Generate unique, sanitized name
  const originalName = file.name;
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-") // sanitize to alphanumeric and hyphens
    .replace(/-+/g, "-")        // compress multiple hyphens
    .replace(/^-|-$/g, "");      // trim leading/trailing hyphens

  const uniqueName = `${Date.now()}-${baseName}${ext}`;

  // Local uploads directory inside public
  const relativeUploadDir = path.join("uploads", subFolder);
  const absoluteUploadDir = path.join(process.cwd(), "public", relativeUploadDir);

  // Ensure directory exists
  await fs.mkdir(absoluteUploadDir, { recursive: true });

  // Write file to disk
  const absoluteFilePath = path.join(absoluteUploadDir, uniqueName);
  await fs.writeFile(absoluteFilePath, buffer);

  // Return public path starting with /
  return `/${relativeUploadDir.replace(/\\/g, "/")}/${uniqueName}`;
}
