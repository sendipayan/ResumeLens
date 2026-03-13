"use server";

import { v2 as cloudinary } from "cloudinary";
import type {
  ResumeUploadSource,
  UploadResumeActionResult,
} from "@/lib/resume-upload";

const ensureSource = (value: string): ResumeUploadSource => {
  if (value === "jdmatch") return "jdmatch";
  if (value === "ats") return "ats";
  return "analyze";
};

export async function uploadResumeWithCloudinary(
  formData: FormData,
): Promise<UploadResumeActionResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "resumelens";

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      success: false,
      error:
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    };
  }

  const source = ensureSource(String(formData.get("source") ?? "analyze"));
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return {
      success: false,
      error: "Missing file. Please upload a PDF resume.",
    };
  }

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  const allowedTypes = new Set([
    "application/pdf",
    "application/x-pdf",
    "application/acrobat",
    "application/octet-stream",
  ]);

  const isPdf =
    name.endsWith(".pdf") ||
    (allowedTypes.has(type) &&
      (type !== "application/octet-stream" || name.endsWith(".pdf")));
  if (!isPdf) {
    return { success: false, error: "Only PDF resumes are supported." };
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const folder = `${uploadFolder}/${source}`;

    const result = await new Promise<{
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
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error ?? new Error("Cloudinary upload failed."));
            return;
          }
          resolve(uploadResult);
        },
      );

      stream.end(fileBuffer);
    });

    return {
      success: true,
      upload: {
        source,
        publicId: result.public_id,
        secureUrl: result.secure_url,
        originalFilename: result.original_filename ?? file.name,
        bytes: result.bytes ?? file.size,
        format: result.format ?? "pdf",
        uploadedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unexpected error while uploading to Cloudinary.",
    };
  }
}
