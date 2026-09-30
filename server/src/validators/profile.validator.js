const { z } = require('zod');

const educationItemSchema = z
  .object({
    institution: z.string().trim().min(1, 'Institution is required').max(100, 'Institution max 100 chars'),
    degree: z.string().trim().min(1, 'Degree is required').max(100, 'Degree max 100 chars'),
    year: z.string().trim().max(20, 'Year max 20 chars').optional().default(''),
  })
  .strict();

const experienceItemSchema = z
  .object({
    company: z.string().trim().min(1, 'Company is required').max(100, 'Company max 100 chars'),
    role: z.string().trim().min(1, 'Role is required').max(100, 'Role max 100 chars'),
    duration: z.string().trim().max(50, 'Duration max 50 chars').optional().default(''),
    description: z.string().trim().max(1000, 'Description max 1000 chars').optional().default(''),
  })
  .strict();

const profileUpdateSchema = z
  .object({
    headline: z.string().trim().max(150, 'Headline must be at most 150 characters').optional().default(''),
    targetRole: z.string().trim().max(80, 'Target role must be at most 80 characters').optional().default(''),
    skills: z
      .array(z.string().trim().max(40, 'Skill must be at most 40 characters'))
      .max(50, 'Skills array cannot exceed 50 items')
      .optional()
      .default([]),
    education: z
      .array(educationItemSchema)
      .max(10, 'Education array cannot exceed 10 entries')
      .optional()
      .default([]),
    experience: z
      .array(experienceItemSchema)
      .max(10, 'Experience array cannot exceed 10 entries')
      .optional()
      .default([]),
  })
  .strict();

module.exports = {
  profileUpdateSchema,
};
