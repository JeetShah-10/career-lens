'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const {
  validateSeedGuards,
  generateDemoPassword,
  getSyntheticDemoData,
  SYNTHETIC_DEMO_EMAIL,
  SYNTHETIC_DEMO_NAME,
} = require('../scripts/seedDemo');
const { aiOutputSchema } = require('../src/validators/analysis.validator');
const { registerSchema } = require('../src/validators/auth.validator');

describe('CareerLens Demo Seeder Safety Guards & Fixtures', () => {
  test('importing seedDemo module does not connect to database or trigger Gemini', () => {
    // MongoDB connection must be in disconnected state (0)
    assert.equal(mongoose.connection.readyState, 0);
  });

  describe('Safety Guard Validations (Pre-Connection Refusal)', () => {
    test('refuses when NODE_ENV is production', () => {
      assert.throws(
        () => {
          validateSeedGuards({
            nodeEnv: 'production',
            allowDemoSeed: 'true',
            mongoUri: 'mongodb://127.0.0.1:27017/careerlens',
          });
        },
        {
          name: 'Error',
          message: /production environment/i,
        }
      );
    });

    test('refuses when ALLOW_DEMO_SEED is not explicitly "true"', () => {
      for (const val of [undefined, '', 'false', '0', 'yes', 'TRUE']) {
        assert.throws(
          () => {
            validateSeedGuards({
              nodeEnv: 'development',
              allowDemoSeed: val,
              mongoUri: 'mongodb://127.0.0.1:27017/careerlens',
            });
          },
          {
            name: 'Error',
            message: /ALLOW_DEMO_SEED=true/i,
          }
        );
      }
    });

    test('refuses when MONGODB_URI is missing or empty', () => {
      for (const val of [undefined, null, '', '   ']) {
        assert.throws(
          () => {
            validateSeedGuards({
              nodeEnv: 'development',
              allowDemoSeed: 'true',
              mongoUri: val,
            });
          },
          {
            name: 'Error',
            message: /MONGODB_URI is required/i,
          }
        );
      }
    });

    test('refuses SRV connection strings (Atlas)', () => {
      assert.throws(
        () => {
          validateSeedGuards({
            nodeEnv: 'development',
            allowDemoSeed: 'true',
            mongoUri: 'mongodb+srv://user:pass@cluster0.abcde.mongodb.net/careerlens',
          });
        },
        {
          name: 'Error',
          message: /Remote, Atlas, or SRV connection string detected/i,
        }
      );
    });

    test('refuses standard URIs pointing to MongoDB Atlas (.mongodb.net)', () => {
      assert.throws(
        () => {
          validateSeedGuards({
            nodeEnv: 'development',
            allowDemoSeed: 'true',
            mongoUri: 'mongodb://user:pass@cluster0.abcde.mongodb.net:27017/careerlens',
          });
        },
        {
          name: 'Error',
          message: /Remote, Atlas, or SRV connection string detected/i,
        }
      );
    });

    test('refuses non-mongodb protocols', () => {
      for (const protocol of ['http://localhost:27017', 'https://localhost:27017', 'postgres://localhost:5432']) {
        assert.throws(
          () => {
            validateSeedGuards({
              nodeEnv: 'development',
              allowDemoSeed: 'true',
              mongoUri: protocol,
            });
          },
          {
            name: 'Error',
            message: /Protocol must be 'mongodb:'/i,
          }
        );
      }
    });

    test('refuses remote hostnames and non-loopback IP addresses', () => {
      const remoteUris = [
        'mongodb://example.com:27017/careerlens',
        'mongodb://192.168.1.100:27017/careerlens',
        'mongodb://10.0.0.5:27017/careerlens',
        'mongodb://172.16.0.2:27017/careerlens',
        'mongodb://db.internal.company.com:27017/careerlens',
      ];

      for (const uri of remoteUris) {
        assert.throws(
          () => {
            validateSeedGuards({
              nodeEnv: 'development',
              allowDemoSeed: 'true',
              mongoUri: uri,
            });
          },
          {
            name: 'Error',
            message: /Non-loopback host detected/i,
          }
        );
      }
    });

    test('refuses malformed URIs cleanly without unhandled crashes', () => {
      assert.throws(
        () => {
          validateSeedGuards({
            nodeEnv: 'development',
            allowDemoSeed: 'true',
            mongoUri: ':::not-a-valid-uri:::',
          });
        },
        {
          name: 'Error',
          message: /Invalid MONGODB_URI format/i,
        }
      );
    });

    test('refuses execution when requireTTY is true and isTTY is false', () => {
      assert.throws(
        () => {
          validateSeedGuards({
            nodeEnv: 'development',
            allowDemoSeed: 'true',
            mongoUri: 'mongodb://127.0.0.1:27017/careerlens',
            isTTY: false,
            requireTTY: true,
          });
        },
        {
          name: 'Error',
          message: /Standard output is not an interactive terminal \(TTY\)/i,
        }
      );
    });

    test('accepts valid loopback MongoDB URIs (127.0.0.1 and localhost)', () => {
      const validUris = [
        'mongodb://127.0.0.1:27017/careerlens',
        'mongodb://localhost:27017/careerlens',
        'mongodb://localhost/careerlens',
      ];

      for (const uri of validUris) {
        const passed = validateSeedGuards({
          nodeEnv: 'development',
          allowDemoSeed: 'true',
          mongoUri: uri,
          isTTY: true,
          requireTTY: true,
        });
        assert.equal(passed, true);
      }
    });
  });

  describe('Synthetic Data & Password Generation', () => {
    test('generateDemoPassword produces valid password conforming to auth rules', () => {
      for (let i = 0; i < 10; i++) {
        const password = generateDemoPassword();
        assert.ok(typeof password === 'string');
        assert.ok(password.length >= 8 && password.length <= 72);

        // Validate directly against auth register password schema
        const validation = registerSchema.shape.password.safeParse(password);
        assert.equal(validation.success, true);
      }
    });

    test('synthetic demo fixtures conform to models and Section 6 AI output contract', () => {
      assert.equal(SYNTHETIC_DEMO_EMAIL, 'alex.demo@example.test');
      assert.equal(SYNTHETIC_DEMO_NAME, 'Alex Demo-Rivera');

      const { syntheticProfile, syntheticAnalyses } = getSyntheticDemoData();

      // Profile verification
      assert.ok(syntheticProfile);
      assert.ok(syntheticProfile.headline.startsWith('[DEMO]'));
      assert.ok(syntheticProfile.targetRole.startsWith('[DEMO]'));
      assert.ok(Array.isArray(syntheticProfile.skills) && syntheticProfile.skills.length > 0);
      assert.ok(Array.isArray(syntheticProfile.experience) && syntheticProfile.experience.length > 0);
      assert.ok(Array.isArray(syntheticProfile.education) && syntheticProfile.education.length > 0);

      // Analyses verification (all 3 must be present and varied)
      assert.equal(syntheticAnalyses.length, 3);
      const sources = syntheticAnalyses.map((a) => a.resumeSource);
      assert.ok(sources.includes('paste'));
      assert.ok(sources.includes('pdf'));
      assert.ok(sources.includes('profile'));

      for (const analysis of syntheticAnalyses) {
        assert.ok(analysis.targetRole.startsWith('[DEMO]'));
        assert.ok(analysis.overallScore >= 0 && analysis.overallScore <= 100);
        assert.ok(analysis.result.summary.startsWith('[OFFLINE EXHIBITION FIXTURE]'));

        // Validate strictly through the production Zod AI output schema
        const parsed = aiOutputSchema.safeParse(analysis.result);
        assert.equal(
          parsed.success,
          true,
          `Failed Zod validation for ${analysis.targetRole}: ${JSON.stringify(parsed.error?.issues)}`
        );
      }
    });
  });
});
