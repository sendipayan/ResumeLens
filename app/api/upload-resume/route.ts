import { v2 as cloudinary } from "cloudinary";
import { NextResponse,NextRequest } from "next/server";
import type { ResumeUploadSource, UploadResumeActionResult } from "@/lib/resume-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ensureSource = (value: string): ResumeUploadSource => {
  if (value === "jdmatch") return "jdmatch";
  if (value === "ats") return "ats";
  return "analyze";
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const contentType = req.headers.get("content-type") ?? "";
    if (
      !contentType.includes("multipart/form-data") &&
      !contentType.includes("application/x-www-form-urlencoded")
    ) {
      const result: UploadResumeActionResult = {
        success: false,
        error: `Invalid content-type for upload: ${contentType || "none"}.`,
      };
      return NextResponse.json(result, { status: 415 });
    }


    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "resumelens";

    if (!cloudName || !apiKey || !apiSecret) {
      const result: UploadResumeActionResult = {
        success: false,
        error:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      };
      return NextResponse.json(result, { status: 500 });
    }

    const source = ensureSource(String(formData.get("source") ?? "analyze"));
    const file = formData.get("file") as File;

    if (!(file instanceof File)) {
      const result: UploadResumeActionResult = {
        success: false,
        error: "Missing file. Please upload a PDF resume.",
      };
      return NextResponse.json(result, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    const allowedTypes = new Set([
      "application/pdf",
      "application/x-pdf",
      "application/acrobat",
    ]);

    const isPdf = allowedTypes.has(type) || name.endsWith(".pdf");
    if (!isPdf) {
      const result: UploadResumeActionResult = {
        success: false,
        error: "Only PDF resumes are supported.",
      };
      return NextResponse.json(result, { status: 400 });
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const header = fileBuffer.subarray(0, 5).toString("utf8");
    if (header !== "%PDF-") {
      const result: UploadResumeActionResult = {
        success: false,
        error:
          "The selected file is not a valid PDF. Please export or download it as a PDF and try again.",
      };
      return NextResponse.json(result, { status: 400 });
    }

    const folder = `${uploadFolder}/${source}`;
    const uploadResult = await new Promise<{
      public_id: string;
      secure_url: string;
      original_filename?: string;
      bytes?: number;
      format?: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder,
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary upload failed."));
            return;
          }
          resolve(result);
        },
      );

      stream.end(fileBuffer);
    });

    const result: UploadResumeActionResult = {
      success: true,
      upload: {
        source,
        publicId: uploadResult.public_id,
        secureUrl: uploadResult.secure_url,
        originalFilename: uploadResult.original_filename ?? file.name,
        bytes: uploadResult.bytes ?? file.size,
        format: uploadResult.format ?? "pdf",
        uploadedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const result: UploadResumeActionResult = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unexpected error while uploading to Cloudinary.",
    };
    console.log(error)
    return NextResponse.json(result, { status: 500 });
  }
}
