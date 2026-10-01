// Set test environment variables BEFORE importing app or env config
process.env.NODE_ENV = 'test';
process.env.PORT = '5002';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
process.env.JWT_SECRET = 'test_secret_that_is_at_least_32_characters_long_for_testing';
process.env.JWT_EXPIRES_IN = '1d';
process.env.GEMINI_API_KEY = 'test_dummy_gemini_key_for_testing_purposes';
process.env.GEMINI_MODEL = 'gemini-3.8-flash';
process.env.DAILY_ANALYSIS_LIMIT = '20';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:0/temp_will_be_replaced_by_memory_server';

const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../src/app');
const User = require('../src/models/User');
const Profile = require('../src/models/Profile');
const Analysis = require('../src/models/Analysis');
const aiService = require('../src/services/ai.service');

let mongoServer;

const validAnalysisResult = {
  overallScore: 82,
  scoreBreakdown: {
    skills: 85,
    experience: 80,
    formatting: 85,
    impact: 78,
  },
  summary: 'Strong candidate with extensive full-stack JavaScript experience and solid leadership, but missing specific cloud architecture certifications for senior level.',
  strengths: [
    'Demonstrated full-stack Node.js and React expertise',
    'Clear measurable metrics in past achievements',
    'Strong background in REST API and database modeling',
  ],
  weaknesses: [
    'Limited evidence of CI/CD pipeline ownership',
    'Missing cloud architecture certifications',
  ],
  missingSkills: [
    'Terraform',
    'Kubernetes',
    'AWS Cloud Architecture',
  ],
  recommendedSkills: [
    {
      skill: 'Kubernetes',
      priority: 'high',
      why: 'Required for container orchestration in senior infrastructure roles.',
    },
    {
      skill: 'Terraform',
      priority: 'medium',
      why: 'Critical for infrastructure as code best practices.',
    },
  ],
  careerSuggestions: [
    {
      role: 'Senior Full Stack Engineer',
      matchPercent: 88,
      reason: 'Direct match with React, Node.js and MongoDB background.',
    },
    {
      role: 'Backend Systems Engineer',
      matchPercent: 82,
      reason: 'Strong Express and database architecture skills.',
    },
    {
      role: 'Technical Lead',
      matchPercent: 75,
      reason: 'Demonstrated team mentorship and cross-functional project delivery.',
    },
  ],
};

const sampleResumeText = `John Doe
Senior Software Engineer with 6 years of experience building scalable web applications.
Skills: JavaScript, TypeScript, React, Node.js, Express, MongoDB, Docker, Git.
Experience:
- Senior Developer at TechCorp (2021-Present): Led frontend migration to React 18, improving page load speed by 35%.
- Software Engineer at DataInc (2018-2021): Built microservices handling 2M requests/day using Node.js and Redis.
Education:
- B.S. in Computer Science, State University, 2018.`;

describe('CareerLens Analysis & History Integration Test Suite', () => {
  before(async () => {
    try {
      mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      process.env.MONGODB_URI = inMemoryUri;
      await mongoose.connect(inMemoryUri);
    } catch (err) {
      if (mongoServer) {
        await mongoServer.stop().catch(() => {});
      }
      throw new Error(`Failed to start isolated in-memory test database: ${err.message}`);
    }
  });

  after(async () => {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      if (mongoServer) {
        await mongoServer.stop();
      }
    } catch (err) {
      console.error('Error during test database teardown:', err);
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Analysis.deleteMany({});
  });

  // Helper to create and authenticate a user
  async function createTestUser(email = 'user@example.com', name = 'Test User') {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name, email, password: 'StrongPassword123!' });
    const rawCookies = res.headers["set-cookie"]; const cookie = Array.isArray(rawCookies) ? rawCookies : [rawCookies]; return { cookie, user: res.body.user };
  }

  describe('POST /api/analyses (Resume Analysis Creation)', () => {
    test('successfully analyzes resume and persists result with user ownership', async () => {
      const { cookie, user } = await createTestUser();

      // Configure mock AI to return valid result
      aiService._setGenAiClient({
        models: {
          generateContent: async () => ({
            text: JSON.stringify(validAnalysisResult),
          }),
        },
      });

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({
          resumeText: sampleResumeText,
          targetRole: 'Senior Full Stack Engineer',
        });

      assert.equal(res.status, 201);
      assert.ok(res.body.analysis);
      assert.ok(res.body.analysis.id);
      assert.equal(res.body.analysis._id, undefined);
      assert.equal(res.body.analysis.userId, undefined); // userId omitted from JSON output
      assert.equal(res.body.analysis.targetRole, 'Senior Full Stack Engineer');
      assert.equal(res.body.analysis.overallScore, 82);
      assert.equal(res.body.analysis.resumeSource, 'paste');
      assert.deepEqual(res.body.analysis.result, validAnalysisResult);

      // Verify DB persistence and ownership scoping
      const savedDoc = await Analysis.findById(res.body.analysis.id);
      assert.ok(savedDoc);
      assert.equal(savedDoc.userId.toString(), user.id);
      assert.equal(savedDoc.overallScore, 82);
    });

    test('rejects unauthenticated request with 401 UNAUTHORIZED', async () => {
      const res = await request(app)
        .post('/api/analyses')
        .send({
          resumeText: sampleResumeText,
          targetRole: 'Senior Full Stack Engineer',
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.error.code, 'UNAUTHORIZED');
    });

    test('rejects input with resume text shorter than 50 characters (400 VALIDATION_ERROR)', async () => {
      const { cookie } = await createTestUser();

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({
          resumeText: 'Too short resume',
          targetRole: 'Senior Full Stack Engineer',
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.details.some((d) => d.field === 'resumeText'));
    });

    test('rejects input with missing targetRole (400 VALIDATION_ERROR)', async () => {
      const { cookie } = await createTestUser();

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({
          resumeText: sampleResumeText,
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(res.body.error.details.some((d) => d.field === 'targetRole'));
    });

    test('succeeds when first attempt returns malformed JSON but retry succeeds', async () => {
      const { cookie } = await createTestUser();
      let callCount = 0;

      aiService._setGenAiClient({
        models: {
          generateContent: async () => {
            callCount++;
            if (callCount === 1) {
              return { text: 'Here is your analysis: { invalid json...' };
            }
            return { text: JSON.stringify(validAnalysisResult) };
          },
        },
      });

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({
          resumeText: sampleResumeText,
          targetRole: 'Senior Full Stack Engineer',
        });

      assert.equal(callCount, 2);
      assert.equal(res.status, 201);
      assert.equal(res.body.analysis.overallScore, 82);
    });

    test('returns 502 AI_SERVICE_UNAVAILABLE when both attempts fail schema validation', async () => {
      const { cookie } = await createTestUser();

      aiService._setGenAiClient({
        models: {
          generateContent: async () => ({
            text: JSON.stringify({ overallScore: 'invalid_score_type' }),
          }),
        },
      });

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({
          resumeText: sampleResumeText,
          targetRole: 'Senior Full Stack Engineer',
        });

      assert.equal(res.status, 502);
      assert.equal(res.body.error.code, 'AI_SERVICE_UNAVAILABLE');
      assert.equal(res.body.error.message, 'Analysis service is temporarily unavailable, please try again');

      // Verify no broken analysis record was saved in DB
      const count = await Analysis.countDocuments({});
      assert.equal(count, 0);
    });

    test('returns 502 AI_SERVICE_UNAVAILABLE when Gemini API throws an error', async () => {
      const { cookie } = await createTestUser();

      aiService._setGenAiClient({
        models: {
          generateContent: async () => {
            throw new Error('503 Service Unavailable / Model Overloaded');
          },
        },
      });

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({
          resumeText: sampleResumeText,
          targetRole: 'Senior Full Stack Engineer',
        });

      assert.equal(res.status, 502);
      assert.equal(res.body.error.code, 'AI_SERVICE_UNAVAILABLE');
    });

    test('triggers single bounded fallback to GEMINI_FALLBACK_MODEL on 503 spike and succeeds', async () => {
      const { cookie } = await createTestUser();
      const modelsCalled = [];

      aiService._setGenAiClient({
        models: {
          generateContent: async ({ model }) => {
            modelsCalled.push(model);
            if (model === 'gemini-3.8-flash') {
              throw new Error('503 Service Unavailable - model is overloaded due to high demand');
            }
            return { text: JSON.stringify(validAnalysisResult) };
          },
        },
      });

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({
          resumeText: sampleResumeText,
          targetRole: 'Senior Full Stack Engineer',
        });

      assert.equal(res.status, 201);
      assert.deepEqual(modelsCalled, ['gemini-3.8-flash', 'gemini-3.5-flash']);
      assert.equal(res.body.analysis.overallScore, 82);
      assert.ok(res.body.analysis.result);
      assert.equal(res.body.analysis.resumeText, undefined);
      assert.equal(res.body.analysis.jobDescription, undefined);
    });

    test('triggers single bounded fallback to GEMINI_FALLBACK_MODEL on 429 quota/rate limit and succeeds', async () => {
      const { cookie } = await createTestUser('user429@example.com');
      const modelsCalled = [];

      aiService._setGenAiClient({
        models: {
          generateContent: async ({ model }) => {
            modelsCalled.push(model);
            if (model === 'gemini-3.8-flash') {
              const quotaErr = new Error('Quota exceeded for quota metric GenerateRequestsPerDayPerProjectPerModel-FreeTier');
              quotaErr.status = 429;
              throw quotaErr;
            }
            return { text: JSON.stringify(validAnalysisResult) };
          },
        },
      });

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({
          resumeText: sampleResumeText,
          targetRole: 'Senior Full Stack Engineer',
        });

      assert.equal(res.status, 201);
      assert.deepEqual(modelsCalled, ['gemini-3.8-flash', 'gemini-3.5-flash']);
      assert.equal(res.body.analysis.overallScore, 82);
    });

    test('does NOT attempt fallback on 401 unauthorized / invalid API key and returns 502 without calling fallback model', async () => {
      const { cookie } = await createTestUser('user401@example.com');
      const modelsCalled = [];

      aiService._setGenAiClient({
        models: {
          generateContent: async ({ model }) => {
            modelsCalled.push(model);
            const authErr = new Error('API_KEY_INVALID: API key not valid. Please pass a valid API key.');
            authErr.status = 401;
            throw authErr;
          },
        },
      });

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({
          resumeText: sampleResumeText,
          targetRole: 'Senior Full Stack Engineer',
        });

      assert.equal(res.status, 502);
      assert.equal(res.body.error.code, 'AI_SERVICE_UNAVAILABLE');
      // Must NOT attempt fallback model on non-retryable 401 error
      assert.deepEqual(modelsCalled, ['gemini-3.8-flash']);
    });

    test('does NOT attempt fallback on 404 model not found and returns 502 without calling fallback model', async () => {
      const { cookie } = await createTestUser('user404@example.com');
      const modelsCalled = [];

      aiService._setGenAiClient({
        models: {
          generateContent: async ({ model }) => {
            modelsCalled.push(model);
            const notFoundErr = new Error('NOT_FOUND: models/gemini-3.8-flash is not found');
            notFoundErr.status = 404;
            throw notFoundErr;
          },
        },
      });

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({
          resumeText: sampleResumeText,
          targetRole: 'Senior Full Stack Engineer',
        });

      assert.equal(res.status, 502);
      assert.equal(res.body.error.code, 'AI_SERVICE_UNAVAILABLE');
      // Must NOT attempt fallback model on 404
      assert.deepEqual(modelsCalled, ['gemini-3.8-flash']);
    });

    test('does NOT attempt fallback on 400 invalid request / argument and returns 502 without calling fallback model', async () => {
      const { cookie } = await createTestUser('user400@example.com');
      const modelsCalled = [];

      aiService._setGenAiClient({
        models: {
          generateContent: async ({ model }) => {
            modelsCalled.push(model);
            const badReqErr = new Error('INVALID_ARGUMENT: contents cannot be empty');
            badReqErr.status = 400;
            throw badReqErr;
          },
        },
      });

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({
          resumeText: sampleResumeText,
          targetRole: 'Senior Full Stack Engineer',
        });

      assert.equal(res.status, 502);
      assert.equal(res.body.error.code, 'AI_SERVICE_UNAVAILABLE');
      assert.deepEqual(modelsCalled, ['gemini-3.8-flash']);
    });

    test('returns safe 502 AI_SERVICE_UNAVAILABLE when fallback model also fails with exactly 2 attempts total', async () => {
      const { cookie } = await createTestUser('userDualFail@example.com');
      const modelsCalled = [];

      aiService._setGenAiClient({
        models: {
          generateContent: async ({ model }) => {
            modelsCalled.push(model);
            const err = new Error('503 Service Unavailable');
            err.status = 503;
            throw err;
          },
        },
      });

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({
          resumeText: sampleResumeText,
          targetRole: 'Senior Full Stack Engineer',
        });

      assert.equal(res.status, 502);
      assert.equal(res.body.error.code, 'AI_SERVICE_UNAVAILABLE');
      // Exactly primary + one fallback attempt, never cascades through unconfigured models
      assert.deepEqual(modelsCalled, ['gemini-3.8-flash', 'gemini-3.5-flash']);
    });

    test('does NOT fabricate replacement placeholders when model returns too few array items (2 career suggestions) and rejects after bounded retry without saving to DB', async () => {
      const { cookie } = await createTestUser('userTooFew@example.com');
      let callCount = 0;

      const tooFewSuggestionsResult = {
        ...validAnalysisResult,
        careerSuggestions: [
          { role: 'Backend Developer', matchPercent: 85, reason: 'Good backend skills' },
          { role: 'Full Stack Engineer', matchPercent: 80, reason: 'Good web skills' },
        ], // Only 2 items; schema requires min(3)
      };

      aiService._setGenAiClient({
        models: {
          generateContent: async () => {
            callCount++;
            return { text: JSON.stringify(tooFewSuggestionsResult) };
          },
        },
      });

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({
          resumeText: sampleResumeText,
          targetRole: 'Senior Full Stack Engineer',
        });

      // Must fail with 502 because it must NOT fabricate fake 3rd suggestion
      assert.equal(res.status, 502);
      assert.equal(res.body.error.code, 'AI_SERVICE_UNAVAILABLE');

      // Exactly 2 attempts: 1 initial attempt + 1 bounded schema-repair retry
      assert.equal(callCount, 2);

      // Verify no broken or fabricated analysis record was persisted to DB
      const userAnalyses = await Analysis.find({});
      assert.equal(userAnalyses.length, 0);
    });

    test('isRetryableError unit tests distinguish retryable vs non-retryable errors accurately', () => {
      // Retryable
      assert.equal(aiService.isRetryableError({ status: 429 }), true);
      assert.equal(aiService.isRetryableError({ status: 503 }), true);
      assert.equal(aiService.isRetryableError({ message: '503 Service Unavailable' }), true);
      assert.equal(aiService.isRetryableError({ message: 'RESOURCE_EXHAUSTED' }), true);
      assert.equal(aiService.isRetryableError({ message: 'Quota exceeded for quota metric' }), true);
      assert.equal(aiService.isRetryableError({ message: 'overloaded due to high demand' }), true);
      assert.equal(aiService.isRetryableError({ message: 'fetch failed' }), true);

      // Non-retryable
      assert.equal(aiService.isRetryableError({ status: 400 }), false);
      assert.equal(aiService.isRetryableError({ status: 401 }), false);
      assert.equal(aiService.isRetryableError({ status: 403 }), false);
      assert.equal(aiService.isRetryableError({ status: 404 }), false);
      assert.equal(aiService.isRetryableError({ message: 'API_KEY_INVALID' }), false);
      assert.equal(aiService.isRetryableError({ message: 'PERMISSION_DENIED' }), false);
      assert.equal(aiService.isRetryableError({ message: 'INVALID_ARGUMENT' }), false);
      assert.equal(aiService.isRetryableError(null), false);
    });

    test('makes exactly 1 call to primary model on primary success without calling fallback', async () => {
      const { cookie } = await createTestUser('primarySuccess@example.com');
      const modelsCalled = [];

      aiService._setGenAiClient({
        models: {
          generateContent: async ({ model }) => {
            modelsCalled.push(model);
            return { text: JSON.stringify(validAnalysisResult) };
          },
        },
      });

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({
          resumeText: sampleResumeText,
          targetRole: 'Senior Full Stack Engineer',
        });

      assert.equal(res.status, 201);
      assert.deepEqual(modelsCalled, ['gemini-3.8-flash']);
      assert.equal(res.body.analysis.overallScore, 82);
    });

    test('recovers from initial schema validation error via single schema repair retry on same model (2 calls total)', async () => {
      const { cookie } = await createTestUser('schemaRepairSuccess@example.com');
      const modelsCalled = [];
      let callCount = 0;

      const invalidSchemaResult = {
        ...validAnalysisResult,
        careerSuggestions: [
          { role: 'Backend Engineer', matchPercent: 80, reason: 'Good' },
        ], // only 1 suggestion, schema requires min 3
      };

      aiService._setGenAiClient({
        models: {
          generateContent: async ({ model }) => {
            modelsCalled.push(model);
            callCount++;
            if (callCount === 1) {
              return { text: JSON.stringify(invalidSchemaResult) };
            }
            return { text: JSON.stringify(validAnalysisResult) };
          },
        },
      });

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({
          resumeText: sampleResumeText,
          targetRole: 'Senior Full Stack Engineer',
        });

      assert.equal(res.status, 201);
      assert.equal(callCount, 2);
      assert.deepEqual(modelsCalled, ['gemini-3.8-flash', 'gemini-3.8-flash']);
      assert.equal(res.body.analysis.overallScore, 82);
    });

    test('normalizeAiParsedJson rounds finite in-range floats to integers, preserves out-of-range values for Zod rejection, and does not invent missing fields', () => {
      const input = {
        overallScore: 82.6,
        scoreBreakdown: {
          skills: 85.2,
          experience: 79.9,
          formatting: 84.5,
          impact: 77.1,
        },
      };

      const normalized = aiService.normalizeAiParsedJson(input);
      assert.equal(normalized.overallScore, 83);
      assert.equal(normalized.scoreBreakdown.skills, 85);
      assert.equal(normalized.scoreBreakdown.experience, 80);
      assert.equal(normalized.scoreBreakdown.formatting, 85);
      assert.equal(normalized.scoreBreakdown.impact, 77);

      // Out-of-range scores (> 100 or < 0) are left unrounded so aiOutputSchema strictly catches and rejects them
      const outOfRangeInput = {
        overallScore: 105.4,
        scoreBreakdown: {
          skills: -2.3,
          experience: 80,
          formatting: 85,
          impact: 75,
        },
      };
      const normalizedOutOfRange = aiService.normalizeAiParsedJson(outOfRangeInput);
      assert.equal(normalizedOutOfRange.overallScore, 105.4);
      assert.equal(normalizedOutOfRange.scoreBreakdown.skills, -2.3);

      // Missing field is NOT invented
      const missingInput = { overallScore: 70 };
      const normalizedMissing = aiService.normalizeAiParsedJson(missingInput);
      assert.equal(normalizedMissing.scoreBreakdown, undefined);
    });

    test('SDK configuration with retryOptions.attempts: 1 prevents internal HTTP retries on 429 quota exhaustion', async () => {
      const { GoogleGenAI } = require('@google/genai');
      let fetchAttempts = 0;
      const fetchHistory = [];

      const mockFetch = async (url) => {
        fetchAttempts++;
        const urlStr = url.toString();
        const model = urlStr.includes('gemini-3.8-flash')
          ? 'gemini-3.8-flash'
          : urlStr.includes('gemini-3.5-flash')
          ? 'gemini-3.5-flash'
          : 'unknown';
        fetchHistory.push({ attempt: fetchAttempts, model });

        // Simulate 429 quota exhaustion
        return new Response(
          JSON.stringify({
            error: {
              code: 429,
              message: 'RESOURCE_EXHAUSTED: Quota exceeded for quota metric GenerateRequestsPerDayPerProjectPerModel-FreeTier',
              status: 'RESOURCE_EXHAUSTED',
            },
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      };

      // Client configured identically to ai.service.js getGenAiClient
      const client = new GoogleGenAI({
        apiKey: 'test_key',
        httpOptions: {
          retryOptions: { attempts: 1 },
          fetch: mockFetch,
        },
      });

      // Call primary model
      let primaryErr;
      try {
        await client.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: 'Analyze this resume',
        });
      } catch (err) {
        primaryErr = err;
      }

      // Assert that exactly 1 HTTP transport attempt was made (not 5)
      assert.ok(primaryErr);
      assert.equal(fetchAttempts, 1);
      assert.equal(fetchHistory[0].model, 'gemini-3.8-flash');
      assert.equal(aiService.isRetryableError(primaryErr), true);

      // Verify that after catching 429, invoking fallback model makes exactly 1 HTTP transport attempt
      let fallbackErr;
      try {
        await client.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: 'Analyze this resume',
        });
      } catch (err) {
        fallbackErr = err;
      }

      assert.ok(fallbackErr);
      assert.equal(fetchAttempts, 2);
      assert.equal(fetchHistory[1].model, 'gemini-3.5-flash');

      // Proves: Total HTTP network attempts across primary 429 failure + fallback model = exactly 2!
    });

    test('35-second abort signal cancels pending fetch immediately without waiting for backoff or hanging', async () => {
      const { GoogleGenAI } = require('@google/genai');
      const controller = new AbortController();
      const startTime = Date.now();

      // Trigger abort after 100ms
      setTimeout(() => controller.abort(), 100);

      const client = new GoogleGenAI({
        apiKey: 'test_key',
        httpOptions: {
          retryOptions: { attempts: 1 },
          fetch: async (_url, opts) => {
            return new Promise((_, reject) => {
              opts.signal.addEventListener('abort', () => {
                reject(new Error('AbortError: signal timed out'));
              });
            });
          },
        },
      });

      let caughtErr;
      try {
        await client.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: 'Long running prompt',
          config: {
            abortSignal: controller.signal,
          },
        });
      } catch (err) {
        caughtErr = err;
      }

      const elapsed = Date.now() - startTime;
      assert.ok(caughtErr);
      // Confirms abort stopped the call immediately (~100-300ms, well below 35s)
      assert.ok(elapsed < 1000, `Expected abort in <1000ms, took ${elapsed}ms`);
    });
  });

  describe('POST /api/analyses (PDF File Upload Support)', () => {
    const validPdfBuffer = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 55 >>\nstream\nBT /F1 12 Tf 100 700 Td (John Doe Senior Full Stack Engineer with 6 years experience) Tj ET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000350 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n428\n%%EOF',
      'utf-8'
    );

    const shortPdfBuffer = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 15 >>\nstream\nBT /F1 12 Tf 100 700 Td (Short) Tj ET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000310 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n388\n%%EOF',
      'utf-8'
    );

    const corruptPdfBuffer = Buffer.from(
      '%PDF-1.4\n<< /Corrupted /Stream /Malformed >>\nstream\n%%InvalidContent%%%\nendstream\nstartxref\n999\n%%EOF',
      'utf-8'
    );

    function createSyntheticMultiPagePdf(pageCount) {
      let objects = [];
      let kids = [];
      const fontObjId = pageCount * 2 + 3;
      for (let i = 1; i <= pageCount; i++) {
        const pageId = 2 + (i - 1) * 2 + 1;
        kids.push(pageId + ' 0 R');
      }
      objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
      objects.push('2 0 obj\n<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + pageCount + ' >>\nendobj');
      for (let i = 1; i <= pageCount; i++) {
        const pageId = 2 + (i - 1) * 2 + 1;
        const contentId = pageId + 1;
        objects.push(pageId + ' 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ' + contentId + ' 0 R /Resources << /Font << /F1 ' + fontObjId + ' 0 R >> >> >>\nendobj');
        const text = 'BT /F1 12 Tf 100 700 Td (Page ' + i + ' Content of candidate resume experience) Tj ET';
        objects.push(contentId + ' 0 obj\n<< /Length ' + text.length + ' >>\nstream\n' + text + '\nendstream\nendobj');
      }
      objects.push(fontObjId + ' 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');

      let body = '%PDF-1.4\n';
      let xref = ['xref', '0 ' + (objects.length + 1), '0000000000 65535 f '];
      for (let i = 0; i < objects.length; i++) {
        let offset = Buffer.byteLength(body, 'utf-8');
        xref.push(String(offset).padStart(10, '0') + ' 00000 n ');
        body += objects[i] + '\n';
      }
      let startxref = Buffer.byteLength(body, 'utf-8');
      body += xref.join('\n') + '\n';
      body += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + startxref + '\n%%EOF';
      return Buffer.from(body, 'utf-8');
    }

    test('successfully extracts text from valid PDF and records resumeSource: "pdf"', async () => {
      const { cookie, user } = await createTestUser();

      aiService._setGenAiClient({
        models: {
          generateContent: async () => ({
            text: JSON.stringify(validAnalysisResult),
          }),
        },
      });

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .field('targetRole', 'Cloud Infrastructure Engineer')
        .attach('file', validPdfBuffer, 'resume.pdf');

      assert.equal(res.status, 201);
      assert.ok(res.body.analysis);
      assert.equal(res.body.analysis.targetRole, 'Cloud Infrastructure Engineer');
      assert.equal(res.body.analysis.resumeSource, 'pdf');
      assert.equal(res.body.analysis.overallScore, 82);

      // Verify DB persistence has resumeSource: 'pdf'
      const savedDoc = await Analysis.findById(res.body.analysis.id);
      assert.ok(savedDoc);
      assert.equal(savedDoc.userId.toString(), user.id);
      assert.equal(savedDoc.resumeSource, 'pdf');
      assert.ok(savedDoc.resumeText.includes('John Doe Senior Full Stack Engineer'));
    });

    test('rejects non-PDF file upload with 400 INVALID_FILE_TYPE and does not call AI or persist record', async () => {
      const { cookie } = await createTestUser();
      let aiCalled = false;
      aiService._setGenAiClient({
        models: {
          generateContent: async () => {
            aiCalled = true;
            return { text: JSON.stringify(validAnalysisResult) };
          },
        },
      });

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .field('targetRole', 'Backend Developer')
        .attach('file', Buffer.from('plain text resume'), 'resume.txt');

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'INVALID_FILE_TYPE');
      assert.equal(aiCalled, false);
      const count = await Analysis.countDocuments({});
      assert.equal(count, 0);
    });

    test('rejects file disguised as .pdf but missing %PDF magic bytes with 400 INVALID_FILE_TYPE and does not call AI or persist record', async () => {
      const { cookie } = await createTestUser();
      let aiCalled = false;
      aiService._setGenAiClient({
        models: {
          generateContent: async () => {
            aiCalled = true;
            return { text: JSON.stringify(validAnalysisResult) };
          },
        },
      });

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .field('targetRole', 'Backend Developer')
        .attach('file', Buffer.from('fake pdf content without magic bytes'), 'fake.pdf');

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'INVALID_FILE_TYPE');
      assert.ok(res.body.error.message.includes('%PDF signature'));
      assert.equal(aiCalled, false);
      const count = await Analysis.countDocuments({});
      assert.equal(count, 0);
    });

    test('rejects oversized file exceeding 5MB limit with 400 FILE_TOO_LARGE and does not call AI or persist record', async () => {
      const { cookie } = await createTestUser();
      let aiCalled = false;
      aiService._setGenAiClient({
        models: {
          generateContent: async () => {
            aiCalled = true;
            return { text: JSON.stringify(validAnalysisResult) };
          },
        },
      });
      const oversizedBuffer = Buffer.alloc(5.1 * 1024 * 1024);

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .field('targetRole', 'Backend Developer')
        .attach('file', oversizedBuffer, 'oversized.pdf');

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'FILE_TOO_LARGE');
      assert.equal(aiCalled, false);
      const count = await Analysis.countDocuments({});
      assert.equal(count, 0);
    });

    test('rejects empty or scanned PDF containing less than 50 characters with 422 EMPTY_OR_SCANNED_PDF and does not call AI or persist record', async () => {
      const { cookie } = await createTestUser();
      let aiCalled = false;
      aiService._setGenAiClient({
        models: {
          generateContent: async () => {
            aiCalled = true;
            return { text: JSON.stringify(validAnalysisResult) };
          },
        },
      });

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .field('targetRole', 'Backend Developer')
        .attach('file', shortPdfBuffer, 'short.pdf');

      assert.equal(res.status, 422);
      assert.equal(res.body.error.code, 'EMPTY_OR_SCANNED_PDF');
      assert.ok(res.body.error.message.includes('paste your resume text instead'));
      assert.equal(aiCalled, false);
      const count = await Analysis.countDocuments({});
      assert.equal(count, 0);
    });

    test('rejects corrupt PDF with valid %PDF signature with 422 UNREADABLE_PDF and does not call AI or persist record', async () => {
      const { cookie } = await createTestUser();
      let aiCalled = false;
      aiService._setGenAiClient({
        models: {
          generateContent: async () => {
            aiCalled = true;
            return { text: JSON.stringify(validAnalysisResult) };
          },
        },
      });

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .field('targetRole', 'Backend Developer')
        .attach('file', corruptPdfBuffer, 'corrupt.pdf');

      assert.equal(res.status, 422);
      assert.equal(res.body.error.code, 'UNREADABLE_PDF');
      assert.ok(res.body.error.message.includes('corrupted, encrypted, or password-protected'));
      assert.equal(aiCalled, false);
      const count = await Analysis.countDocuments({});
      assert.equal(count, 0);
    });

    test('rejects PDF exceeding 10-page limit with 400 PAGE_LIMIT_EXCEEDED and does not call AI or persist record', async () => {
      const { cookie } = await createTestUser();
      let aiCalled = false;
      aiService._setGenAiClient({
        models: {
          generateContent: async () => {
            aiCalled = true;
            return { text: JSON.stringify(validAnalysisResult) };
          },
        },
      });
      const elevenPagePdfBuffer = createSyntheticMultiPagePdf(11);

      const res = await request(app)
        .post('/api/analyses')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .field('targetRole', 'Backend Developer')
        .attach('file', elevenPagePdfBuffer, 'eleven_pages.pdf');

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'PAGE_LIMIT_EXCEEDED');
      assert.ok(res.body.error.message.includes('maximum limit of 10 pages'));
      assert.equal(aiCalled, false);
      const count = await Analysis.countDocuments({});
      assert.equal(count, 0);
    });
  });

  describe('POST /api/analyses/profile (Analyze My Profile Support)', () => {
    test('successfully analyzes saved profile using profile.targetRole and records resumeSource: "profile"', async () => {
      const { cookie, user } = await createTestUser();

      // Seed valid profile
      await Profile.create({
        userId: user.id,
        headline: 'Lead Cloud Architect',
        targetRole: 'Cloud Solutions Architect',
        skills: ['AWS', 'Kubernetes', 'Terraform', 'Node.js'],
        experience: [
          {
            company: 'Cloud Corp',
            role: 'Senior Architect',
            duration: '2021-Present',
            description: 'Designed multi-region Kubernetes clusters with zero downtime.',
          },
        ],
        education: [
          {
            institution: 'Tech University',
            degree: 'M.S. Software Engineering',
            year: '2020',
          },
        ],
      });

      let aiCalled = false;
      aiService._setGenAiClient({
        models: {
          generateContent: async () => {
            aiCalled = true;
            return { text: JSON.stringify(validAnalysisResult) };
          },
        },
      });

      const res = await request(app)
        .post('/api/analyses/profile')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({});

      assert.equal(res.status, 201);
      assert.equal(aiCalled, true);
      assert.ok(res.body.analysis);
      assert.equal(res.body.analysis.targetRole, 'Cloud Solutions Architect');
      assert.equal(res.body.analysis.resumeSource, 'profile');
      assert.equal(res.body.analysis.overallScore, 82);
      assert.equal(res.body.analysis.resumeText, undefined);
      assert.equal(res.body.analysis.jobDescription, undefined);

      // Verify DB persistence
      const savedDoc = await Analysis.findById(res.body.analysis.id);
      assert.ok(savedDoc);
      assert.equal(savedDoc.userId.toString(), user.id);
      assert.equal(savedDoc.resumeSource, 'profile');
      assert.ok(savedDoc.resumeText.includes('Lead Cloud Architect'));
      assert.ok(savedDoc.resumeText.includes('Kubernetes'));
    });

    test('overrides targetRole for analysis without mutating saved profile', async () => {
      const { cookie, user } = await createTestUser();

      await Profile.create({
        userId: user.id,
        headline: 'Full Stack Engineer',
        targetRole: 'Full Stack Engineer',
        skills: ['React', 'Node.js'],
        experience: [
          {
            company: 'Startup Inc',
            role: 'Full Stack Engineer',
            duration: '2022-Present',
            description: 'Built full stack web application features.',
          },
        ],
      });

      aiService._setGenAiClient({
        models: {
          generateContent: async () => ({
            text: JSON.stringify(validAnalysisResult),
          }),
        },
      });

      const res = await request(app)
        .post('/api/analyses/profile')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({ targetRole: 'VP of Engineering' });

      assert.equal(res.status, 201);
      assert.equal(res.body.analysis.targetRole, 'VP of Engineering');

      // Crucial: verify saved profile was NOT mutated by the override
      const savedProfile = await Profile.findOne({ userId: user.id });
      assert.equal(savedProfile.targetRole, 'Full Stack Engineer');
    });

    test('enforces strict ownership: User A analysis analyzes User A profile, not User B profile', async () => {
      const userA = await createTestUser('alice@example.com', 'Alice Smith');
      const userB = await createTestUser('bob@example.com', 'Bob Jones');

      // Profile A
      await Profile.create({
        userId: userA.user.id,
        headline: 'Alpha Specialist',
        targetRole: 'Alpha Lead',
        skills: ['SkillAlphaOne', 'SkillAlphaTwo'],
        experience: [
          {
            company: 'AlphaCorp',
            role: 'Alpha Engineer',
            duration: '2020-2023',
            description: 'Alpha proprietary systems development and deployment.',
          },
        ],
      });

      // Profile B
      await Profile.create({
        userId: userB.user.id,
        headline: 'Beta Specialist',
        targetRole: 'Beta Lead',
        skills: ['SkillBetaOne', 'SkillBetaTwo'],
        experience: [
          {
            company: 'BetaCorp',
            role: 'Beta Engineer',
            duration: '2021-2024',
            description: 'Beta proprietary systems development and deployment.',
          },
        ],
      });

      aiService._setGenAiClient({
        models: {
          generateContent: async () => ({
            text: JSON.stringify(validAnalysisResult),
          }),
        },
      });

      // User A runs analysis from profile
      const res = await request(app)
        .post('/api/analyses/profile')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', userA.cookie)
        .send({});

      assert.equal(res.status, 201);

      // Verify DB record strictly belongs to User A and contains only User A's data
      const savedDoc = await Analysis.findById(res.body.analysis.id);
      assert.equal(savedDoc.userId.toString(), userA.user.id);
      assert.ok(savedDoc.resumeText.includes('Alpha Specialist'));
      assert.ok(savedDoc.resumeText.includes('SkillAlphaOne'));
      assert.equal(savedDoc.resumeText.includes('Beta Specialist'), false);
      assert.equal(savedDoc.resumeText.includes('SkillBetaOne'), false);
    });

    test('rejects with 400 PROFILE_INCOMPLETE when user has no saved profile', async () => {
      const { cookie } = await createTestUser();
      let aiCalled = false;
      aiService._setGenAiClient({
        models: {
          generateContent: async () => {
            aiCalled = true;
            return { text: JSON.stringify(validAnalysisResult) };
          },
        },
      });

      const res = await request(app)
        .post('/api/analyses/profile')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'PROFILE_INCOMPLETE');
      assert.equal(aiCalled, false);
      const count = await Analysis.countDocuments({});
      assert.equal(count, 0);
    });

    test('rejects with 400 PROFILE_INCOMPLETE when profile has no skills and no experience', async () => {
      const { cookie, user } = await createTestUser();
      let aiCalled = false;
      aiService._setGenAiClient({
        models: {
          generateContent: async () => {
            aiCalled = true;
            return { text: JSON.stringify(validAnalysisResult) };
          },
        },
      });

      // Profile has headline and education, but ZERO skills and ZERO experience
      await Profile.create({
        userId: user.id,
        headline: 'Student aspiring to be a developer',
        targetRole: 'Junior Developer',
        skills: [],
        experience: [],
        education: [
          {
            institution: 'State University',
            degree: 'B.S. in Computer Science',
            year: '2024',
          },
        ],
      });

      const res = await request(app)
        .post('/api/analyses/profile')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'PROFILE_INCOMPLETE');
      assert.ok(res.body.error.message.includes('skill or work experience'));
      assert.equal(aiCalled, false);
      const count = await Analysis.countDocuments({});
      assert.equal(count, 0);
    });

    test('rejects with 400 VALIDATION_ERROR when neither request body nor profile specifies a targetRole', async () => {
      const { cookie, user } = await createTestUser();
      let aiCalled = false;
      aiService._setGenAiClient({
        models: {
          generateContent: async () => {
            aiCalled = true;
            return { text: JSON.stringify(validAnalysisResult) };
          },
        },
      });

      // Profile has skills and experience, but empty targetRole
      await Profile.create({
        userId: user.id,
        headline: 'Software Engineer',
        targetRole: '',
        skills: ['JavaScript', 'Node.js', 'React'],
        experience: [
          {
            company: 'Tech Co',
            role: 'Developer',
            duration: '2 years',
            description: 'Building web applications and REST APIs.',
          },
        ],
      });

      const res = await request(app)
        .post('/api/analyses/profile')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie)
        .send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
      assert.equal(aiCalled, false);
      const count = await Analysis.countDocuments({});
      assert.equal(count, 0);
    });
  });

  describe('GET /api/analyses (History, Filters & Pagination)', () => {
    test('enforces user isolation: User B cannot see User A analyses', async () => {
      const userA = await createTestUser('usera@example.com', 'User A');
      const userB = await createTestUser('userb@example.com', 'User B');

      // Create an analysis for User A
      await Analysis.create({
        userId: userA.user.id,
        resumeText: sampleResumeText,
        resumeSource: 'paste',
        targetRole: 'Backend Engineer',
        overallScore: 75,
        result: validAnalysisResult,
      });

      // User B fetches analyses
      const res = await request(app)
        .get('/api/analyses')
        .set('Cookie', userB.cookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.total, 0);
      assert.equal(res.body.items.length, 0);
    });

    test('returns lightweight summary items, projecting out result and omitting raw text', async () => {
      const { cookie, user } = await createTestUser();

      await Analysis.create({
        userId: user.id,
        resumeText: sampleResumeText,
        resumeSource: 'paste',
        targetRole: 'Summary Test Role',
        jobDescription: 'Confidential target company requirements',
        overallScore: 90,
        result: validAnalysisResult,
      });

      const res = await request(app)
        .get('/api/analyses')
        .set('Cookie', cookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.total, 1);
      const item = res.body.items[0];
      assert.ok(item.id);
      assert.equal(item.targetRole, 'Summary Test Role');
      assert.equal(item.resumeSource, 'paste');
      assert.equal(item.overallScore, 90);
      assert.ok(item.createdAt);
      assert.ok(item.updatedAt);

      // Verify heavy result and private input fields are NOT in list items
      assert.equal(item.result, undefined);
      assert.equal(item.resumeText, undefined);
      assert.equal(item.jobDescription, undefined);
    });

    test('filters analyses by role (case-insensitive and escaped)', async () => {
      const { cookie, user } = await createTestUser();

      await Analysis.create([
        {
          userId: user.id,
          resumeText: sampleResumeText,
          resumeSource: 'paste',
          targetRole: 'Senior Backend Engineer',
          overallScore: 85,
          result: validAnalysisResult,
        },
        {
          userId: user.id,
          resumeText: sampleResumeText,
          resumeSource: 'paste',
          targetRole: 'Frontend Developer',
          overallScore: 70,
          result: validAnalysisResult,
        },
      ]);

      const res = await request(app)
        .get('/api/analyses?role=backend')
        .set('Cookie', cookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.total, 1);
      assert.equal(res.body.items[0].targetRole, 'Senior Backend Engineer');
    });

    test('filters analyses by score range (minScore and maxScore)', async () => {
      const { cookie, user } = await createTestUser();

      await Analysis.create([
        {
          userId: user.id,
          resumeText: sampleResumeText,
          resumeSource: 'paste',
          targetRole: 'Role Low',
          overallScore: 40,
          result: validAnalysisResult,
        },
        {
          userId: user.id,
          resumeText: sampleResumeText,
          resumeSource: 'paste',
          targetRole: 'Role Mid',
          overallScore: 70,
          result: validAnalysisResult,
        },
        {
          userId: user.id,
          resumeText: sampleResumeText,
          resumeSource: 'paste',
          targetRole: 'Role High',
          overallScore: 95,
          result: validAnalysisResult,
        },
      ]);

      const res = await request(app)
        .get('/api/analyses?minScore=60&maxScore=80')
        .set('Cookie', cookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.total, 1);
      assert.equal(res.body.items[0].targetRole, 'Role Mid');
    });

    test('sorts analyses correctly by score_desc and score_asc', async () => {
      const { cookie, user } = await createTestUser();

      await Analysis.create([
        {
          userId: user.id,
          resumeText: sampleResumeText,
          resumeSource: 'paste',
          targetRole: 'Role Low',
          overallScore: 50,
          result: validAnalysisResult,
        },
        {
          userId: user.id,
          resumeText: sampleResumeText,
          resumeSource: 'paste',
          targetRole: 'Role High',
          overallScore: 90,
          result: validAnalysisResult,
        },
      ]);

      const descRes = await request(app)
        .get('/api/analyses?sort=score_desc')
        .set('Cookie', cookie);

      assert.equal(descRes.body.items[0].overallScore, 90);
      assert.equal(descRes.body.items[1].overallScore, 50);

      const ascRes = await request(app)
        .get('/api/analyses?sort=score_asc')
        .set('Cookie', cookie);

      assert.equal(ascRes.body.items[0].overallScore, 50);
      assert.equal(ascRes.body.items[1].overallScore, 90);
    });

    test('paginates analyses with page and limit parameters', async () => {
      const { cookie, user } = await createTestUser();

      for (let i = 1; i <= 5; i++) {
        await Analysis.create({
          userId: user.id,
          resumeText: sampleResumeText,
          resumeSource: 'paste',
          targetRole: `Role ${i}`,
          overallScore: 60 + i,
          result: validAnalysisResult,
        });
      }

      const page1 = await request(app)
        .get('/api/analyses?page=1&limit=2')
        .set('Cookie', cookie);

      assert.equal(page1.status, 200);
      assert.equal(page1.body.total, 5);
      assert.equal(page1.body.pages, 3);
      assert.equal(page1.body.items.length, 2);
    });
  });

  describe('GET /api/analyses/:id (Single Analysis Detail)', () => {
    test('returns analysis detail for the owner', async () => {
      const { cookie, user } = await createTestUser();

      const doc = await Analysis.create({
        userId: user.id,
        resumeText: sampleResumeText,
        resumeSource: 'paste',
        targetRole: 'DevOps Engineer',
        overallScore: 88,
        result: validAnalysisResult,
      });

      const res = await request(app)
        .get(`/api/analyses/${doc.id}`)
        .set('Cookie', cookie);

      assert.equal(res.status, 200);
      assert.ok(res.body.analysis);
      assert.equal(res.body.analysis.id, doc.id);
      assert.equal(res.body.analysis.targetRole, 'DevOps Engineer');
      assert.equal(res.body.analysis.overallScore, 88);
      assert.ok(res.body.analysis.result);
      assert.equal(res.body.analysis.result.overallScore, 82);
      assert.equal(res.body.analysis.resumeText, undefined);
      assert.equal(res.body.analysis.jobDescription, undefined);
    });

    test('returns 404 NOT_FOUND when User B attempts to access User A analysis (no IDOR)', async () => {
      const userA = await createTestUser('owner@example.com', 'Owner User');
      const userB = await createTestUser('attacker@example.com', 'Attacker User');

      const doc = await Analysis.create({
        userId: userA.user.id,
        resumeText: sampleResumeText,
        resumeSource: 'paste',
        targetRole: 'Private Architect Role',
        overallScore: 92,
        result: validAnalysisResult,
      });

      const res = await request(app)
        .get(`/api/analyses/${doc.id}`)
        .set('Cookie', userB.cookie);

      assert.equal(res.status, 404);
      assert.equal(res.body.error.code, 'NOT_FOUND');
    });

    test('returns 400 INVALID_ID for malformed ObjectId', async () => {
      const { cookie } = await createTestUser();

      const res = await request(app)
        .get('/api/analyses/invalid-id-format')
        .set('Cookie', cookie);

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'INVALID_ID');
    });
  });

  describe('DELETE /api/analyses/:id (Delete Analysis)', () => {
    test('owner can delete analysis, returning 204 No Content', async () => {
      const { cookie, user } = await createTestUser();

      const doc = await Analysis.create({
        userId: user.id,
        resumeText: sampleResumeText,
        resumeSource: 'paste',
        targetRole: 'To Be Deleted',
        overallScore: 60,
        result: validAnalysisResult,
      });

      const deleteRes = await request(app)
        .delete(`/api/analyses/${doc.id}`)
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie);

      assert.equal(deleteRes.status, 204);

      // Verify it is gone
      const getRes = await request(app)
        .get(`/api/analyses/${doc.id}`)
        .set('Cookie', cookie);

      assert.equal(getRes.status, 404);
      assert.equal(getRes.body.error.code, 'NOT_FOUND');
    });

    test('returns 404 NOT_FOUND when User B attempts to delete User A analysis', async () => {
      const userA = await createTestUser('owner2@example.com', 'Owner Two');
      const userB = await createTestUser('attacker2@example.com', 'Attacker Two');

      const doc = await Analysis.create({
        userId: userA.user.id,
        resumeText: sampleResumeText,
        resumeSource: 'paste',
        targetRole: 'Protected Role',
        overallScore: 85,
        result: validAnalysisResult,
      });

      const res = await request(app)
        .delete(`/api/analyses/${doc.id}`)
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', userB.cookie);

      assert.equal(res.status, 404);
      assert.equal(res.body.error.code, 'NOT_FOUND');

      // Verify the record was not deleted
      const checkDoc = await Analysis.findById(doc.id);
      assert.ok(checkDoc);
    });

    test('returns 400 INVALID_ID for malformed ObjectId on delete', async () => {
      const { cookie } = await createTestUser();

      const res = await request(app)
        .delete('/api/analyses/not-an-objectid')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookie);

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'INVALID_ID');
    });
  });
});
