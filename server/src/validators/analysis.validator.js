const { z } = require('zod');

const scoreBreakdownSchema = z
  .object({
    skills: z.number().int().min(0).max(100),
    experience: z.number().int().min(0).max(100),
    formatting: z.number().int().min(0).max(100),
    impact: z.number().int().min(0).max(100),
  })
  .strict();

const recommendedSkillSchema = z
  .object({
    skill: z.string().trim().min(1),
    priority: z.enum(['high', 'medium', 'low']),
    why: z.string().trim().min(1),
  })
  .strict();

const careerSuggestionSchema = z
  .object({
    role: z.string().trim().min(1),
    matchPercent: z.number().int().min(0).max(100),
    reason: z.string().trim().min(1),
  })
  .strict();

const jobMatchSchema = z
  .object({
    matchPercent: z.number().int().min(0).max(100),
    matchedKeywords: z.array(z.string().trim().min(1)),
    missingKeywords: z.array(z.string().trim().min(1)),
  })
  .strict();

const roadmapStepSchema = z
  .object({
    step: z.number().int(),
    skill: z.string().trim().min(1),
    action: z.string().trim().min(1),
    timeframe: z.string().trim().min(1),
  })
  .strict();

// AI output schema matching Section 6 of AGENTS.md exactly
const aiOutputSchema = z
  .object({
    overallScore: z.number().int().min(0).max(100),
    scoreBreakdown: scoreBreakdownSchema,
    summary: z.string().trim().max(600),
    strengths: z.array(z.string().trim().min(1)).min(1).max(8),
    weaknesses: z.array(z.string().trim().min(1)).min(1).max(8),
    missingSkills: z.array(z.string().trim().min(1)).max(15),
    recommendedSkills: z.array(recommendedSkillSchema).min(1).max(10),
    careerSuggestions: z.array(careerSuggestionSchema).min(3).max(5),
    jobMatch: jobMatchSchema.optional(),
    roadmap: z.array(roadmapStepSchema).optional(),
  })
  .strict();

// Request body validation schema for creating an analysis
const createAnalysisSchema = z
  .object({
    resumeText: z
      .string({ required_error: 'Resume text is required' })
      .trim()
      .min(50, 'Resume text must be at least 50 characters')
      .max(20000, 'Resume text must not exceed 20,000 characters'),
    targetRole: z
      .string({ required_error: 'Target role is required' })
      .trim()
      .min(2, 'Target role must be at least 2 characters')
      .max(100, 'Target role must not exceed 100 characters'),
    jobDescription: z
      .string()
      .trim()
      .max(10000, 'Job description must not exceed 10,000 characters')
      .optional()
      .default(''),
  })
  .strict();

// Query parameter validation schema for history filtering and pagination
const queryAnalysesSchema = z
  .object({
    role: z.string().trim().max(100).optional(),
    minScore: z.coerce.number().int().min(0).max(100).optional(),
    maxScore: z.coerce.number().int().min(0).max(100).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    sort: z.enum(['newest', 'oldest', 'score_desc', 'score_asc']).optional().default('newest'),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  })
  .strict();

// Request body validation schema for analyzing saved profile
const analyzeProfileSchema = z
  .object({
    targetRole: z
      .string()
      .trim()
      .min(2, 'Target role must be at least 2 characters')
      .max(100, 'Target role must not exceed 100 characters')
      .optional(),
    jobDescription: z
      .string()
      .trim()
      .max(10000, 'Job description must not exceed 10,000 characters')
      .optional()
      .default(''),
  })
  .strict();

module.exports = {
  aiOutputSchema,
  createAnalysisSchema,
  analyzeProfileSchema,
  queryAnalysesSchema,
};
