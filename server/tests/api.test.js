// Set test environment variables BEFORE importing app or env config
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
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

let mongoServer;

describe('CareerLens API Integration Test Suite', () => {
  before(async () => {
    try {
      // In-memory MongoDB instance exclusively. Never fall back to any external or configured database.
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
    // Clean collections before each test for total test isolation
    await User.deleteMany({});
    await Profile.deleteMany({});
  });

  // 1. Health Route
  describe('GET /api/health', () => {
    test('returns 200 with status ok', async () => {
      const res = await request(app).get('/api/health');
      assert.equal(res.status, 200);
      assert.deepEqual(res.body, { status: 'ok' });
    });
  });

  // 2. Authentication Routes
  describe('/api/auth', () => {
    test('POST /register - successfully registers user and returns token and user without passwordHash', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123!',
        });

      assert.equal(res.status, 201);
      assert.ok(res.body.token, 'Expected token to be returned');
      assert.equal(typeof res.body.token, 'string');
      assert.ok(res.body.user);
      assert.equal(res.body.user.name, 'Jane Doe');
      assert.equal(res.body.user.email, 'jane@example.com');
      assert.ok(res.body.user.id);
      assert.equal(res.body.user.passwordHash, undefined, 'passwordHash must never be returned');
      assert.equal(res.body.password, undefined);
    });

    test('POST /register - rejects duplicate email with 409 DUPLICATE_EMAIL', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'First User',
          email: 'duplicate@example.com',
          password: 'Password123!',
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          email: 'duplicate@example.com',
          password: 'DifferentPassword123!',
        });

      assert.equal(res.status, 409);
      assert.deepEqual(res.body, {
        error: {
          code: 'DUPLICATE_EMAIL',
          message: 'Email already registered',
        },
      });
    });

    test('POST /register - returns 400 VALIDATION_ERROR without exposing submitted values', async () => {
      const sensitivePassword = 'short';
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: '',
          email: 'not-an-email',
          password: sensitivePassword,
        });

      assert.equal(res.status, 400);
      assert.ok(res.body.error);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
      assert.equal(res.body.error.message, 'Validation failed');
      assert.ok(Array.isArray(res.body.error.details));
      assert.ok(res.body.error.details.length >= 2);

      // Verify no sensitive submitted password is leaked in the details
      const serialized = JSON.stringify(res.body);
      assert.ok(!serialized.includes(sensitivePassword), 'Submitted password must not be exposed in validation error details');

      // Verify safe detail shape
      for (const item of res.body.error.details) {
        assert.ok(typeof item.field === 'string');
        assert.ok(typeof item.message === 'string');
      }
    });

    test('POST /login - succeeds with correct credentials', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login User',
          email: 'login@example.com',
          password: 'ValidPassword123!',
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'ValidPassword123!',
        });

      assert.equal(res.status, 200);
      assert.ok(res.body.token);
      assert.equal(res.body.user.email, 'login@example.com');
      assert.equal(res.body.user.passwordHash, undefined);
    });

    test('POST /login - returns generic 401 INVALID_CREDENTIALS on non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nobody@example.com',
          password: 'SomePassword123!',
        });

      assert.equal(res.status, 401);
      assert.deepEqual(res.body, {
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    });

    test('POST /login - returns identical generic 401 INVALID_CREDENTIALS on wrong password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Wrong Pass User',
          email: 'wrongpass@example.com',
          password: 'CorrectPassword123!',
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrongpass@example.com',
          password: 'IncorrectPassword123!',
        });

      assert.equal(res.status, 401);
      assert.deepEqual(res.body, {
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    });

    test('GET /me - returns current user with valid Bearer token', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Me User',
          email: 'me@example.com',
          password: 'Password123!',
        });

      const token = registerRes.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      assert.equal(res.status, 200);
      assert.ok(res.body.user);
      assert.equal(res.body.user.email, 'me@example.com');
      assert.equal(res.body.user.passwordHash, undefined);
    });

    test('GET /me - rejects request with missing token (401 UNAUTHORIZED)', async () => {
      const res = await request(app).get('/api/auth/me');
      assert.equal(res.status, 401);
      assert.deepEqual(res.body, {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    });

    test('GET /me - rejects request with malformed Authorization header (401 UNAUTHORIZED)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Basic invalid_token_format');

      assert.equal(res.status, 401);
      assert.deepEqual(res.body, {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    });

    test('GET /me - rejects request with tampered/invalid token (401 UNAUTHORIZED)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature');

      assert.equal(res.status, 401);
      assert.deepEqual(res.body, {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    });
  });

  // 3. Profile Routes
  describe('/api/profile', () => {
    test('GET /profile - returns 200 with canonical empty default profile when user has no saved profile', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'Password123!',
        });

      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${reg.body.token}`);

      assert.equal(res.status, 200);
      assert.ok(res.body.profile);
      assert.deepEqual(res.body.profile, {
        headline: '',
        targetRole: '',
        skills: [],
        education: [],
        experience: [],
      });
      assert.notEqual(res.body.profile, null, 'Empty profile must not be null');
    });

    test('PUT /profile and GET /profile - upserts and reads back user profile', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Profile Tester',
          email: 'profile@example.com',
          password: 'Password123!',
        });

      const token = reg.body.token;

      const profilePayload = {
        headline: 'Senior Backend Engineer',
        targetRole: 'Full Stack Tech Lead',
        skills: ['Node.js', 'Express', 'MongoDB', 'TypeScript'],
        education: [
          {
            institution: 'State University',
            degree: 'B.S. Computer Science',
            year: '2024',
          },
        ],
        experience: [
          {
            company: 'Tech Corp',
            role: 'Software Engineer',
            duration: '2 years',
            description: 'Built scalable backend microservices and APIs.',
          },
        ],
      };

      const putRes = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(profilePayload);

      assert.equal(putRes.status, 200);
      assert.ok(putRes.body.profile);
      assert.equal(putRes.body.profile.headline, 'Senior Backend Engineer');
      assert.equal(putRes.body.profile.targetRole, 'Full Stack Tech Lead');
      assert.deepEqual(putRes.body.profile.skills, ['Node.js', 'Express', 'MongoDB', 'TypeScript']);
      assert.equal(putRes.body.profile.education.length, 1);
      assert.equal(putRes.body.profile.experience.length, 1);

      // Verify GET returns the updated profile
      const getRes = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`);

      assert.equal(getRes.status, 200);
      assert.equal(getRes.body.profile.headline, 'Senior Backend Engineer');
      assert.equal(getRes.body.profile.targetRole, 'Full Stack Tech Lead');
    });

    test('PUT /profile - rejects invalid inputs with 400 VALIDATION_ERROR', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Val User',
          email: 'val@example.com',
          password: 'Password123!',
        });

      const token = reg.body.token;

      // Create skills array exceeding 50 items limit
      const tooManySkills = Array.from({ length: 55 }, (_, i) => `Skill${i}`);

      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          skills: tooManySkills,
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok(Array.isArray(res.body.error.details));
      assert.ok(res.body.error.details.some((d) => d.field === 'skills'));
    });

    test('GET /profile - enforces user-to-user isolation (User B cannot see User A profile)', async () => {
      // User A creates profile
      const userAReg = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User A',
          email: 'usera@example.com',
          password: 'Password123!',
        });

      await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${userAReg.body.token}`)
        .send({
          headline: 'User A Secret Headline',
          targetRole: 'Architect',
          skills: ['C++', 'Rust'],
        });

      // User B checks profile
      const userBReg = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User B',
          email: 'userb@example.com',
          password: 'Password123!',
        });

      const userBProfile = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${userBReg.body.token}`);

      assert.equal(userBProfile.status, 200);
      // User B should get canonical empty default, NOT User A's data
      assert.equal(userBProfile.body.profile.headline, '');
      assert.equal(userBProfile.body.profile.targetRole, '');
      assert.deepEqual(userBProfile.body.profile.skills, []);
    });
  });
});
