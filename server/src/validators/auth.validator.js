const { z } = require('zod');

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Invalid email address')
  .max(254, 'Email must be at most 254 characters');

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(80, 'Name must be at most 80 characters'),
    email: emailSchema,
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters'),
  })
  .strict();

const loginSchema = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .min(1, 'Password is required')
      .max(72, 'Password must be at most 72 characters'),
  })
  .strict();

module.exports = {
  registerSchema,
  loginSchema,
};
