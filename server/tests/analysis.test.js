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
