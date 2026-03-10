"use client";

import { create } from "zustand";

export type JobLinks = {
  optimized_query: string;
  google_jobs: string;
  linkedin: string;
  unstop: string;
  wellfound: string;
};

export type JobRecommendation = {
  title: string;
  links: JobLinks;
};

export type StoredSkillCoverage = {
  coverage_score?: number | null;
  matched_count?: number | null;
  total_role_skills?: number | null;
  matched?: string[] | null;
  missing_skills?: string[] | null;
} | null;

export type StoredProjectFeedback = {
  semantic_score?: number | null;
  skills?: string[] | null;
  missing?: string[] | null;
  match_score?: number | null;
  final_score?: number | null;
} | null;

export type StoredExperience = {
  score?: number | null;
} | null;

export type StoredAchievement = {
  final_score?: number | null;
  semantic_impact?: number | null;
  relevance?: number | null;
  leadership?: number | null;
  prestige?: number | null;
  comp_bonus?: number | null;
  quant_bonus?: number | null;
} | null;

export type StoredCertificates = {
  final_score?: number | null;
} | null;

export type StoredRecommendation = {
  Title: string;
  score: number;
  Responsibilities?: string[] | null;
  missing_sections?: string[] | null;
  primary_skill?: StoredSkillCoverage;
  secondry_skill?: StoredSkillCoverage;
  projects?: StoredProjectFeedback;
  project?: StoredProjectFeedback;
  experience?: StoredExperience;
  achievment?: StoredAchievement;
  certificates?: StoredCertificates;
  [key: string]: unknown;
};

type RecommendationJobsState = {
  recommendations: StoredRecommendation[];
  jobs: JobRecommendation[];
  jdMatchRecommendation: StoredRecommendation | null;
  analyzeMissingSections: string[];
  jdMatchMissingSections: string[];
  setRecommendationJobs: (payload: {
    recommendations: StoredRecommendation[];
    jobs: JobRecommendation[];
    missingSections?: string[];
  }) => void;
  setJDMatchRecommendation: (recommendation: StoredRecommendation | null) => void;
  setJDMatchMissingSections: (sections: string[]) => void;
  clearRecommendationJobs: () => void;
};

export const useRecommendationJobsStore = create<RecommendationJobsState>(
  (set) => ({
    recommendations: [],
    jobs: [],
    jdMatchRecommendation: null,
    analyzeMissingSections: [],
    jdMatchMissingSections: [],
    setRecommendationJobs: (payload) =>
      set({
        recommendations: payload.recommendations,
        jobs: payload.jobs,
        analyzeMissingSections: payload.missingSections ?? [],
      }),
    setJDMatchRecommendation: (recommendation) =>
      set({ jdMatchRecommendation: recommendation }),
    setJDMatchMissingSections: (sections) =>
      set({ jdMatchMissingSections: sections }),
    clearRecommendationJobs: () =>
      set({ recommendations: [], jobs: [], analyzeMissingSections: [] }),
  }),
);
