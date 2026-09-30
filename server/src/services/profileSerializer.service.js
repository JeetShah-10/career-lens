'use strict';

const MAX_RESUME_CHARS = 20000;

/**
 * Serializes a structured user Profile document into clean Markdown resume text.
 *
 * @param {Object} profile - Mongoose Profile document or plain object
 * @param {string} [userName='Candidate'] - Candidate name from User record
 * @returns {string} Formatted Markdown resume text, capped at 20,000 characters
 */
function serializeProfileToText(profile, userName = 'Candidate') {
  if (!profile) {
    return '';
  }

  const parts = [];

  // Header
  parts.push(`# ${userName.trim() || 'Candidate'}`);

  if (profile.headline && typeof profile.headline === 'string' && profile.headline.trim()) {
    parts.push(`**Headline:** ${profile.headline.trim()}`);
  }

  if (profile.targetRole && typeof profile.targetRole === 'string' && profile.targetRole.trim()) {
    parts.push(`**Target Role:** ${profile.targetRole.trim()}`);
  }

  // Skills
  if (Array.isArray(profile.skills) && profile.skills.length > 0) {
    const validSkills = profile.skills
      .map((s) => (typeof s === 'string' ? s.trim() : ''))
      .filter(Boolean);
    if (validSkills.length > 0) {
      parts.push(`\n## Skills\n${validSkills.join(', ')}`);
    }
  }

  // Experience
  if (Array.isArray(profile.experience) && profile.experience.length > 0) {
    const expBlocks = profile.experience
      .map((exp) => {
        if (!exp) return '';
        const role = (exp.role || '').trim();
        const company = (exp.company || '').trim();
        const duration = exp.duration && exp.duration.trim() ? ` (${exp.duration.trim()})` : '';
        const header = role && company ? `### ${role} at ${company}${duration}` : '';
        const desc = exp.description && exp.description.trim() ? exp.description.trim() : '';
        if (!header && !desc) return '';
        return header ? (desc ? `${header}\n${desc}` : header) : desc;
      })
      .filter(Boolean);

    if (expBlocks.length > 0) {
      parts.push(`\n## Experience\n${expBlocks.join('\n\n')}`);
    }
  }

  // Education
  if (Array.isArray(profile.education) && profile.education.length > 0) {
    const eduBlocks = profile.education
      .map((edu) => {
        if (!edu) return '';
        const degree = (edu.degree || '').trim();
        const inst = (edu.institution || '').trim();
        const year = edu.year && edu.year.trim() ? ` - ${edu.year.trim()}` : '';
        if (degree && inst) {
          return `- ${degree}, ${inst}${year}`;
        }
        return `- ${degree || inst}${year}`;
      })
      .filter(Boolean);

    if (eduBlocks.length > 0) {
      parts.push(`\n## Education\n${eduBlocks.join('\n')}`);
    }
  }

  return parts.join('\n\n').trim().slice(0, MAX_RESUME_CHARS);
}

module.exports = {
  serializeProfileToText,
  MAX_RESUME_CHARS,
};
