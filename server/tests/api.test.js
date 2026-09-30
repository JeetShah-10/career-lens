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
const { AUTH_COOKIE_NAME } = require('../src/utils/cookies');

let mongoServer;

describe('CareerLens API Integration Test Suite (Cookie Authentication)', () => {
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

  // Helper to extract cookie from set-cookie header array
  function getCookieHeader(res) {
    const rawCookies = res.headers['set-cookie'];
    if (!rawCookies) return null;
    return Array.isArray(rawCookies) ? rawCookies : [rawCookies];
  }

  // 1. Health Route
  describe('GET /api/health', () => {
    test('returns 200 with status ok', async () => {
      const res = await request(app).get('/api/health');
      assert.equal(res.status, 200);
      assert.deepEqual(res.body, { status: 'ok' });
    });
  });

  // 2. Authentication Routes (Cookie-based)
  describe('/api/auth', () => {
    test('POST /register - successfully registers user, sets HttpOnly cookie, and returns user without token in JSON', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123!',
        });

      assert.equal(res.status, 201);
      // Token must NEVER be returned in JSON
      assert.equal(res.body.token, undefined, 'JWT must not be in response body');
      assert.ok(res.body.user);
      assert.equal(res.body.user.name, 'Jane Doe');
      assert.equal(res.body.user.email, 'jane@example.com');
      assert.ok(res.body.user.id);
      assert.equal(res.body.user.passwordHash, undefined, 'passwordHash must never be returned');

      // Verify Set-Cookie header
      const cookies = getCookieHeader(res);
      assert.ok(cookies, 'Expected Set-Cookie header');
      const authCookie = cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
      assert.ok(authCookie, 'Expected auth token cookie to be set');
      assert.ok(authCookie.includes('HttpOnly'), 'Cookie must have HttpOnly flag');
      assert.ok(authCookie.includes('Path=/'), 'Cookie must have Path=/');
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

      for (const item of res.body.error.details) {
        assert.ok(typeof item.field === 'string');
        assert.ok(typeof item.message === 'string');
      }
    });

    test('POST /login - succeeds with correct credentials, sets HttpOnly cookie, and returns user without token in JSON', async () => {
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
      assert.equal(res.body.token, undefined, 'JWT must not be in response body');
      assert.equal(res.body.user.email, 'login@example.com');
      assert.equal(res.body.user.passwordHash, undefined);

      const cookies = getCookieHeader(res);
      assert.ok(cookies);
      const authCookie = cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
      assert.ok(authCookie);
      assert.ok(authCookie.includes('HttpOnly'));
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

    test('GET /me - returns current user with valid HttpOnly cookie', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Me User',
          email: 'me@example.com',
          password: 'Password123!',
        });

      const cookies = getCookieHeader(registerRes);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookies);

      assert.equal(res.status, 200);
      assert.ok(res.body.user);
      assert.equal(res.body.user.email, 'me@example.com');
      assert.equal(res.body.user.passwordHash, undefined);
    });

    test('GET /me - rejects request with missing cookie (401 UNAUTHORIZED)', async () => {
      const res = await request(app).get('/api/auth/me');
      assert.equal(res.status, 401);
      assert.deepEqual(res.body, {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    });

    test('GET /me - rejects request with tampered/invalid cookie (401 UNAUTHORIZED)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=invalid.tampered.token`]);

      assert.equal(res.status, 401);
      assert.deepEqual(res.body, {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    });

    test('POST /logout - clears HttpOnly cookie with matching options and revokes client access', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Logout User',
          email: 'logout@example.com',
          password: 'Password123!',
        });

      const authCookies = getCookieHeader(registerRes);

      // Verify authenticated before logout
      const beforeRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authCookies);
      assert.equal(beforeRes.status, 200);

      // Call logout
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', authCookies);

      assert.equal(logoutRes.status, 200);
      assert.deepEqual(logoutRes.body, { message: 'Logged out successfully' });

      // Verify clear cookie header was sent
      const clearCookies = getCookieHeader(logoutRes);
      assert.ok(clearCookies, 'Expected clear cookie header');
      const clearedCookie = clearCookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
      assert.ok(clearedCookie);
      assert.ok(
        clearedCookie.includes('Expires=Thu, 01 Jan 1970') || clearedCookie.includes('Max-Age=0'),
        'Cookie must be expired on logout'
      );

      // Subsequent request using cleared cookie must fail
      const afterRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', clearCookies);

      assert.equal(afterRes.status, 401);
      assert.equal(afterRes.body.error.code, 'UNAUTHORIZED');
    });
  });

  // 3. CSRF & CORS Protection
  describe('CSRF & CORS Security', () => {
    test('CORS - allows configured CLIENT_ORIGIN with credentials: true', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:5173');

      assert.equal(res.status, 200);
      assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:5173');
      assert.equal(res.headers['access-control-allow-credentials'], 'true');
    });

    test('CSRF - permits state-changing request from allowed CLIENT_ORIGIN', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Origin', 'http://localhost:5173')
        .send({
          name: 'CSRF Test User',
          email: 'csrf_allowed@example.com',
          password: 'Password123!',
        });

      assert.equal(res.status, 201);
    });

    test('CSRF - blocks state-changing request from unauthorized foreign Origin with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Origin', 'http://malicious-attacker-website.com')
        .send({
          name: 'Attacker User',
          email: 'attacker@example.com',
          password: 'Password123!',
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
      assert.ok(res.body.error.message.includes('origin mismatch'));
    });

    test('CSRF - blocks state-changing request with unauthorized Referer with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Referer', 'http://evil-phishing-page.com/steal')
        .send({
          name: 'Attacker User 2',
          email: 'attacker2@example.com',
          password: 'Password123!',
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    test('CSRF - blocks cookie-authenticated state-changing request when both Origin and Referer are absent with 403 FORBIDDEN', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Cookie CSRF User',
          email: 'cookie_csrf@example.com',
          password: 'Password123!',
        });
      const cookie = getCookieHeader(reg);

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookie);

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
      assert.equal(res.body.error.message, 'Cross-site request forgery protection: missing origin and referer');
    });

    test('CSRF - blocks state-changing request with malformed Origin with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Origin', 'not-a-valid-url')
        .send({
          name: 'Malformed Origin User',
          email: 'malformed_origin@example.com',
          password: 'Password123!',
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
      assert.equal(res.body.error.message, 'Cross-site request forgery protection: invalid origin');
    });

    test('CSRF - blocks state-changing request from prefix-matching but foreign Origin with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Origin', 'http://localhost.attacker-site.com:5173')
        .send({
          name: 'Prefix Attacker',
          email: 'prefix_attacker@example.com',
          password: 'Password123!',
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
      assert.equal(res.body.error.message, 'Cross-site request forgery protection: origin mismatch');
    });

    test('CSRF - blocks state-changing request with malformed Referer with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Referer', 'malformed-referer-url')
        .send({
          name: 'Malformed Referer User',
          email: 'malformed_ref@example.com',
          password: 'Password123!',
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.error.code, 'FORBIDDEN');
      assert.equal(res.body.error.message, 'Cross-site request forgery protection: invalid referer');
    });
  });

  // 4. Profile Routes with Cookie Auth
  describe('/api/profile', () => {
    test('GET /profile - returns 200 with canonical empty default profile when user has no saved profile', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'Password123!',
        });

      const cookies = getCookieHeader(reg);

      const res = await request(app)
        .get('/api/profile')
        .set('Cookie', cookies);

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

    test('PUT /profile and GET /profile - upserts and reads back user profile using cookie auth', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Profile Tester',
          email: 'profile@example.com',
          password: 'Password123!',
        });

      const cookies = getCookieHeader(reg);

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
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookies)
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
        .set('Cookie', cookies);

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

      const cookies = getCookieHeader(reg);

      // Create skills array exceeding 50 items limit
      const tooManySkills = Array.from({ length: 55 }, (_, i) => `Skill${i}`);

      const res = await request(app)
        .put('/api/profile')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', cookies)
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

      const userACookies = getCookieHeader(userAReg);

      await request(app)
        .put('/api/profile')
        .set('Origin', 'http://localhost:5173')
        .set('Cookie', userACookies)
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

      const userBCookies = getCookieHeader(userBReg);

      const userBProfile = await request(app)
        .get('/api/profile')
        .set('Cookie', userBCookies);

      assert.equal(userBProfile.status, 200);
      // User B should get canonical empty default, NOT User A's data
      assert.equal(userBProfile.body.profile.headline, '');
      assert.equal(userBProfile.body.profile.targetRole, '');
      assert.deepEqual(userBProfile.body.profile.skills, []);
    });
  });
});
