export type ResumeUploadSource = "analyze" | "jdmatch" | "ats";

export type UploadedResume = {
  source: ResumeUploadSource;
  publicId: string;
  secureUrl: string;
  originalFilename: string;
  bytes: number;
  format: string;
  uploadedAt: string;
};

export type UploadResumeActionResult =
  | {
      success: true;
      upload: UploadedResume;
    }
  | {
      success: false;
      error: string;
    };
