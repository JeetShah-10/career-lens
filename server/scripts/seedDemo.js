'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../src/models/User');
const Profile = require('../src/models/Profile');
const Analysis = require('../src/models/Analysis');
const { aiOutputSchema } = require('../src/validators/analysis.validator');

const SYNTHETIC_DEMO_EMAIL = 'alex.demo@example.test';
const SYNTHETIC_DEMO_NAME = 'Alex Demo-Rivera';

/**
 * Validates safety constraints before any connection or database operation occurs.
 *
 * Rules:
 * 1. Refuses if NODE_ENV === 'production'
 * 2. Requires ALLOW_DEMO_SEED === 'true'
 * 3. Requires valid MONGODB_URI with protocol 'mongodb:'
 * 4. Requires hostname to be strictly '127.0.0.1' or 'localhost'
 * 5. Refuses Atlas (+srv), remote hosts, or cloud URIs
 * 6. Never echoes or prints the URI
 * 7. When checkTTY is true, requires process.stdout.isTTY
 *
 * @param {Object} options
 * @param {string} [options.nodeEnv]
 * @param {string} [options.allowDemoSeed]
 * @param {string} [options.mongoUri]
 * @param {boolean} [options.isTTY]
 * @param {boolean} [options.requireTTY=true]
 * @returns {boolean} true if all guards pass
 */
function validateSeedGuards({
  nodeEnv = process.env.NODE_ENV,
  allowDemoSeed = process.env.ALLOW_DEMO_SEED,
  mongoUri = process.env.MONGODB_URI,
  isTTY = process.stdout ? Boolean(process.stdout.isTTY) : false,
  requireTTY = false,
} = {}) {
  if (nodeEnv === 'production') {
    throw new Error('DEMO_SEED_REFUSAL: Refusing to seed demo data in production environment.');
  }

  if (allowDemoSeed !== 'true') {
    throw new Error(
      'DEMO_SEED_REFUSAL: Refusing to seed demo data without explicit opt-in. Set ALLOW_DEMO_SEED=true to proceed.'
    );
  }

  if (!mongoUri || typeof mongoUri !== 'string' || !mongoUri.trim()) {
    throw new Error('DEMO_SEED_REFUSAL: MONGODB_URI is required.');
  }

  const trimmedUri = mongoUri.trim();

  // Reject SRV and Atlas patterns immediately without leaking the connection string
  if (trimmedUri.startsWith('mongodb+srv://') || trimmedUri.includes('.mongodb.net')) {
    throw new Error(
      'DEMO_SEED_REFUSAL: Remote, Atlas, or SRV connection string detected. Seeding is strictly forbidden on non-local databases.'
    );
  }

  let parsed;
  try {
    parsed = new URL(trimmedUri);
  } catch {
    throw new Error('DEMO_SEED_REFUSAL: Invalid MONGODB_URI format.');
  }

  if (parsed.protocol !== 'mongodb:') {
    throw new Error(`DEMO_SEED_REFUSAL: Protocol must be 'mongodb:', received '${parsed.protocol}'.`);
  }

  const allowedHosts = new Set(['127.0.0.1', 'localhost']);
  if (!allowedHosts.has(parsed.hostname)) {
    throw new Error(
      'DEMO_SEED_REFUSAL: Non-loopback host detected. Seeding is permitted only on 127.0.0.1 or localhost.'
    );
  }

  if (requireTTY && !isTTY) {
    throw new Error(
      'DEMO_SEED_REFUSAL: Standard output is not an interactive terminal (TTY). Interactive terminal required to display one-time credentials securely.'
    );
  }

  return true;
}

/**
 * Generates a cryptographically strong one-time random password.
 * Format satisfies auth password schema (min 8, max 72 characters).
 *
 * @returns {string} One-time password
 */
function generateDemoPassword() {
  const randomPart = crypto.randomBytes(9).toString('base64url');
  return `Demo-${randomPart}1!`;
}

/**
 * Builds the synthetic profile and 3 precomputed analysis records.
 * All target roles are prefixed with '[DEMO]'.
 * All summaries begin with '[OFFLINE EXHIBITION FIXTURE]'.
 * Every analysis result is strictly validated against aiOutputSchema before returning.
 *
 * @returns {Object} { syntheticProfile, syntheticAnalyses }
 */
function getSyntheticDemoData() {
  const syntheticProfile = {
    headline: '[DEMO] Full Stack Engineer | React & Node.js Specialist',
    targetRole: '[DEMO] Full Stack Engineer',
    skills: [
      'JavaScript',
      'TypeScript',
      'React',
      'Node.js',
      'Express.js',
      'MongoDB',
      'REST APIs',
      'Docker',
      'Git',
    ],
    education: [
      {
        institution: 'Metropolitan Polytechnic Institute',
        degree: 'B.S. in Computer Science',
        year: '2023',
      },
    ],
    experience: [
      {
        company: 'Apex Cloud Solutions',
        role: 'Full Stack Developer',
        duration: '2023 - Present',
        description:
          'Developed performant web application components using React and built backend REST APIs in Express.',
      },
    ],
  };

  const syntheticAnalyses = [
    {
      resumeSource: 'paste',
      targetRole: '[DEMO] Full Stack Engineer',
      overallScore: 88,
      resumeText:
        'Alex Demo-Rivera\n[DEMO Candidate Resume]\nFull Stack Engineer with 3+ years experience building web applications with React, Node.js, and MongoDB. Proven track record developing responsive UIs and robust backend APIs.',
      jobDescription:
        'Seeking an experienced Full Stack Engineer proficient in React, Node.js, and cloud containerization.',
      result: {
        overallScore: 88,
        scoreBreakdown: {
          skills: 90,
          experience: 85,
          formatting: 90,
          impact: 87,
        },
        summary:
          '[OFFLINE EXHIBITION FIXTURE] Strong full-stack profile with demonstrated capabilities in React component architecture, modern JavaScript, and Node.js REST services. Well suited for mid-to-senior full stack roles.',
        strengths: [
          'Demonstrated production React 18 and state management experience',
          'Solid backend REST API design and database query optimization',
          'Clean modular code structure and consistent formatting',
        ],
        weaknesses: [
          'Limited documented Kubernetes orchestration experience',
          'Few references to automated end-to-end integration testing suites',
        ],
        missingSkills: ['Kubernetes', 'GraphQL', 'AWS ECS'],
        recommendedSkills: [
          {
            skill: 'Kubernetes',
            priority: 'high',
            why: 'Critical for enterprise-grade container orchestration and scalable cloud deployment.',
          },
          {
            skill: 'GraphQL',
            priority: 'medium',
            why: 'Frequently requested alternative to REST for flexible frontend data querying.',
          },
        ],
        careerSuggestions: [
          {
            role: 'Senior Frontend Engineer',
            matchPercent: 92,
            reason: 'Direct match with extensive production React UI development foundation.',
          },
          {
            role: 'Full Stack Systems Engineer',
            matchPercent: 88,
            reason: 'Balanced background spanning server-side services and interactive client state.',
          },
          {
            role: 'Backend API Developer',
            matchPercent: 82,
            reason: 'Solid grasp of Node.js, Express middleware, and database access layers.',
          },
        ],
        jobMatch: {
          matchPercent: 88,
          matchedKeywords: ['React', 'Node.js', 'MongoDB', 'REST APIs', 'Docker'],
          missingKeywords: ['Kubernetes', 'AWS'],
        },
        roadmap: [
          {
            step: 1,
            skill: 'Kubernetes',
            action: 'Containerize multi-container app and deploy to minikube',
            timeframe: '2 weeks',
          },
        ],
      },
    },
    {
      resumeSource: 'pdf',
      targetRole: '[DEMO] Cloud Infrastructure Architect',
      overallScore: 72,
      resumeText:
        'Alex Demo-Rivera\n[DEMO Candidate Resume]\nSoftware developer transitioning into cloud infrastructure. Experience with Docker, basic AWS EC2, and Linux server management.',
      jobDescription:
        'Looking for a Cloud Architect to design multi-region resilient infrastructure using Terraform and AWS.',
      result: {
        overallScore: 72,
        scoreBreakdown: {
          skills: 70,
          experience: 74,
          formatting: 76,
          impact: 68,
        },
        summary:
          '[OFFLINE EXHIBITION FIXTURE] Solid software engineering foundation with emerging cloud knowledge. Strong candidate for mid-level cloud transitions with further depth in infrastructure as code.',
        strengths: [
          'Proficient Linux environments and shell automation',
          'Working knowledge of Docker containerization and build pipelines',
        ],
        weaknesses: [
          'Lacks enterprise multi-region Terraform deployment experience',
          'Minimal documentation of cloud cost optimization and security hardening',
        ],
        missingSkills: ['Terraform', 'AWS IAM', 'CloudFormation', 'Prometheus'],
        recommendedSkills: [
          {
            skill: 'Terraform',
            priority: 'high',
            why: 'Essential industry standard for declarative infrastructure-as-code management.',
          },
          {
            skill: 'AWS IAM',
            priority: 'high',
            why: 'Fundamental requirement for least-privilege cloud security and policy architecture.',
          },
        ],
        careerSuggestions: [
          {
            role: 'DevOps Systems Engineer',
            matchPercent: 78,
            reason: 'Practical combination of containerization and Linux systems administration.',
          },
          {
            role: 'Cloud Support Specialist',
            matchPercent: 75,
            reason: 'Strong debugging foundations applicable to cloud workload diagnostics.',
          },
          {
            role: 'Solutions Architect (Associate)',
            matchPercent: 70,
            reason: 'Solid technical acumen with clear path to full architectural competency.',
          },
        ],
        jobMatch: {
          matchPercent: 70,
          matchedKeywords: ['Docker', 'Linux', 'AWS'],
          missingKeywords: ['Terraform', 'Multi-Region', 'IAM'],
        },
      },
    },
    {
      resumeSource: 'profile',
      targetRole: '[DEMO] Machine Learning Engineer',
      overallScore: 54,
      resumeText:
        'Alex Demo-Rivera\n[DEMO Candidate Profile Resume]\nFull Stack developer interested in machine learning and data pipelines. Background in web engineering and databases.',
      jobDescription:
        'Senior Machine Learning Engineer needed with PyTorch, distributed training, and model serving experience.',
      result: {
        overallScore: 54,
        scoreBreakdown: {
          skills: 50,
          experience: 52,
          formatting: 65,
          impact: 49,
        },
        summary:
          '[OFFLINE EXHIBITION FIXTURE] Candidate has strong web and application programming foundations but shows significant skill gaps for specialized machine learning engineering positions.',
        strengths: [
          'Strong core algorithmic and data structure foundations',
          'High proficiency in API integration and asynchronous pipeline patterns',
        ],
        weaknesses: [
          'No documented experience with Python deep learning frameworks (PyTorch, TensorFlow)',
          'Absence of statistical modeling, feature engineering, and model evaluation projects',
        ],
        missingSkills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'CUDA'],
        recommendedSkills: [
          {
            skill: 'Python',
            priority: 'high',
            why: 'Primary programming language for AI/ML modeling and numerical computation.',
          },
          {
            skill: 'PyTorch',
            priority: 'high',
            why: 'Dominant research and industry deep learning library for modern architectures.',
          },
        ],
        careerSuggestions: [
          {
            role: 'Full Stack Engineer',
            matchPercent: 88,
            reason: 'Direct match with primary career experience and proven technical output.',
          },
          {
            role: 'Data Platform Engineer',
            matchPercent: 64,
            reason: 'Leverages database knowledge while transitioning toward data engineering.',
          },
          {
            role: 'Machine Learning Associate',
            matchPercent: 54,
            reason: 'Entry-level stepping stone with structured mentorship and Python training.',
          },
        ],
        jobMatch: {
          matchPercent: 52,
          matchedKeywords: ['Git', 'APIs'],
          missingKeywords: ['PyTorch', 'Distributed Training', 'Python'],
        },
      },
    },
  ];

  // Validate every precomputed analysis through the project's actual Zod schema
  for (const item of syntheticAnalyses) {
    aiOutputSchema.parse(item.result);
  }

  return {
    syntheticProfile,
    syntheticAnalyses,
  };
}

/**
 * Executes idempotent seeding of synthetic demo data.
 *
 * @param {Object} options
 * @param {string} [options.mongoUri]
 * @param {string} [options.allowDemoSeed]
 * @param {string} [options.nodeEnv]
 * @param {boolean} [options.isTTY]
 * @returns {Promise<{ email: string, password: string, userId: string, analysisCount: number }>}
 */
async function seedDemo({
  mongoUri = process.env.MONGODB_URI,
  allowDemoSeed = process.env.ALLOW_DEMO_SEED,
  nodeEnv = process.env.NODE_ENV,
  isTTY = process.stdout ? Boolean(process.stdout.isTTY) : false,
} = {}) {
  // 1. Enforce hard safety guards before opening any connection
  validateSeedGuards({
    nodeEnv,
    allowDemoSeed,
    mongoUri,
    isTTY,
    requireTTY: true,
  });

  // 2. Generate strong runtime password & hash with bcrypt
  const demoPassword = generateDemoPassword();
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  // 3. Prepare and schema-validate synthetic data
  const { syntheticProfile, syntheticAnalyses } = getSyntheticDemoData();

  // 4. Connect to local database with strict timeout
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

  try {
    // 5. Narrow, scoped cleanup for synthetic demo account only
    const existingUser = await User.findOne({ email: SYNTHETIC_DEMO_EMAIL });
    if (existingUser) {
      await Analysis.deleteMany({ userId: existingUser._id });
      await Profile.deleteOne({ userId: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
    }

    // 6. Create synthetic User record
    const user = await User.create({
      name: SYNTHETIC_DEMO_NAME,
      email: SYNTHETIC_DEMO_EMAIL,
      passwordHash,
    });

    // 7. Create synthetic Profile record
    await Profile.create({
      userId: user._id,
      ...syntheticProfile,
    });

    // 8. Create synthetic Analysis records
    for (const analysisData of syntheticAnalyses) {
      await Analysis.create({
        userId: user._id,
        resumeText: analysisData.resumeText,
        resumeSource: analysisData.resumeSource,
        targetRole: analysisData.targetRole,
        jobDescription: analysisData.jobDescription || '',
        overallScore: analysisData.overallScore,
        result: analysisData.result,
      });
    }

    return {
      email: user.email,
      password: demoPassword,
      userId: user._id.toString(),
      analysisCount: syntheticAnalyses.length,
    };
  } finally {
    await mongoose.disconnect();
  }
}

// Interactive CLI entry point
if (require.main === module) {
  require('dotenv').config();

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerlens';
  const allowDemoSeed = process.env.ALLOW_DEMO_SEED;
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isTTY = Boolean(process.stdout && process.stdout.isTTY);

  (async () => {
    try {
      const summary = await seedDemo({
        mongoUri,
        allowDemoSeed,
        nodeEnv,
        isTTY,
      });

      // Display one-time credential strictly on interactive TTY stdout
      process.stdout.write('\n===============================================================\n');
      process.stdout.write('  [CAREERLENS DEMO SEED COMPLETED SUCCESSFULLY]\n');
      process.stdout.write('===============================================================\n');
      process.stdout.write(`  Status:      3 synthetic demo analyses created (Paste, PDF, Profile)\n`);
      process.stdout.write(`  Candidate:   Alex Demo-Rivera\n`);
      process.stdout.write(`  Email:       ${summary.email}\n`);
      process.stdout.write(`  Password:    ${summary.password}\n`);
      process.stdout.write('---------------------------------------------------------------\n');
      process.stdout.write('  NOTE: This one-time password is shown ONLY here on terminal stdout.\n');
      process.stdout.write('  It is not saved in any file, .env, or log.\n');
      process.stdout.write('===============================================================\n\n');
      process.exit(0);
    } catch (err) {
      process.stderr.write(`\n[DEMO SEED ERROR] ${err.message}\n\n`);
      process.exit(1);
    }
  })();
}

module.exports = {
  SYNTHETIC_DEMO_EMAIL,
  SYNTHETIC_DEMO_NAME,
  validateSeedGuards,
  generateDemoPassword,
  getSyntheticDemoData,
  seedDemo,
};
