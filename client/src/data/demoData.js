import defaultCandidates from './defaultCandidates.json';

export const DEFAULT_CANDIDATES = defaultCandidates;

export function getCandidateById(id) {
  return DEFAULT_CANDIDATES.find((c) => c.id === id) || DEFAULT_CANDIDATES[0];
}

// Convert default candidates into mock Analysis records for testing History filters
export const MOCK_ANALYSES = DEFAULT_CANDIDATES.map((cand) => ({
  _id: cand.id,
  targetRole: cand.targetRole,
  overallScore: cand.overallScore,
  resumeSource: 'paste',
  resumeText: cand.resumeText,
  jobDescription: cand.jobDescription,
  result: cand.result,
  createdAt: cand.createdAt,
  candidateName: cand.name,
  candidateAvatar: cand.avatar,
  candidateHeadline: cand.headline,
}));
