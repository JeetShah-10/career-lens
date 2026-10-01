import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { Save, Plus, Trash2, Tag, Check, Briefcase, GraduationCap, Sparkles } from 'lucide-react';

export default function Profile() {
  const [headline, setHeadline] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [formError, setFormError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  // Load existing profile
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setFormError(null);
      try {
        const res = await api.profile.get();
        const prof = res?.profile;
        if (prof) {
          setHeadline(prof.headline || '');
          setTargetRole(prof.targetRole || '');
          setSkills(Array.isArray(prof.skills) ? prof.skills : []);
          setEducation(Array.isArray(prof.education) ? prof.education : []);
          setExperience(Array.isArray(prof.experience) ? prof.experience : []);
        }
      } catch (err) {
        setFormError(err.message || 'Unable to load profile data.');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Skill management
  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillInput('');
      setSavedSuccess(false);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
    setSavedSuccess(false);
  };

  // Education management
  const handleAddEducation = () => {
    setEducation([
      ...education,
      { institution: '', degree: '', year: '' },
    ]);
    setSavedSuccess(false);
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
    setSavedSuccess(false);
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
    setSavedSuccess(false);
  };

  // Experience management
  const handleAddExperience = () => {
    setExperience([
      ...experience,
      { company: '', role: '', duration: '', description: '' },
    ]);
    setSavedSuccess(false);
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = [...experience];
    updated[index][field] = value;
    setExperience(updated);
    setSavedSuccess(false);
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
    setSavedSuccess(false);
  };

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setFormError(null);
    setErrorDetails(null);

    try {
      const payload = {
        headline: headline.trim(),
        targetRole: targetRole.trim(),
        skills: Array.isArray(skills) ? skills : [],
        education: (education || []).filter((e) => (e?.institution || '').trim() || (e?.degree || '').trim()),
        experience: (experience || []).filter((e) => (e?.company || '').trim() || (e?.role || '').trim()),
      };

      await api.profile.update(payload);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      setFormError(err.message || 'Failed to update profile.');
      setErrorDetails(err.details || null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '920px', margin: '0 auto', textAlign: 'center', padding: '4rem 1rem' }}>
        <LoadingSpinner message="Retrieving your executive career dossier..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '940px', margin: '0 auto' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e8e0d5',
          padding: '2.75rem 3rem',
          boxShadow: '0 12px 40px rgba(77, 31, 39, 0.05), 0 2px 6px rgba(0, 0, 0, 0.02)',
          position: 'relative',
        }}
      >
        {/* Header Ribbon */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #f0eae1',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.3rem 0.85rem',
                borderRadius: '9999px',
                backgroundColor: '#faf5ee',
                border: '1px solid #e8decb',
                color: '#c2410c',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              <Sparkles size={12} color="#c2410c" />
              <span>Talent Blueprint & Qualifications Matrix</span>
            </div>

            <h1
              style={{
                fontFamily: "'Taberna', 'Taberna Serif', 'Playfair Display', Georgia, serif",
                fontSize: '2.15rem',
                fontWeight: 600,
                color: '#4d1f27',
                letterSpacing: '-0.02em',
                margin: '0 0 0.45rem',
                lineHeight: 1.2,
              }}
            >
              Executive Career Profile
            </h1>

            <p style={{ fontSize: '0.92rem', color: '#574f4b', margin: 0, maxWidth: '640px', lineHeight: 1.55 }}>
              Maintain your structured credentials and track record. This profile connects directly to 1-click AI appraisals.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {savedSuccess && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#065f46',
                  backgroundColor: '#ecfdf5',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '12px',
                  border: '1px solid #a7f3d0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <Check size={15} color="#065f46" />
                <span>Profile Saved Successfully</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn btn-primary"
              style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                backgroundColor: '#4d1f27',
                borderRadius: '12px',
                padding: '0.5rem 1.25rem',
                boxShadow: '0 4px 14px rgba(77, 31, 39, 0.22)',
              }}
            >
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>

        {formError && (
          <div style={{ marginBottom: '1.5rem' }}>
            <Alert type="danger" message={formError} details={errorDetails} />
          </div>
        )}

        <form onSubmit={handleSaveProfile} noValidate>
          {/* Core Identity Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="profile-headline" style={{ fontSize: '0.875rem', fontWeight: 800, color: '#4d1f27' }}>
                Professional Headline
              </label>
              <input
                id="profile-headline"
                type="text"
                className="form-input"
                style={{ fontSize: '0.95rem', padding: '0.75rem 1rem', borderRadius: '12px' }}
                placeholder="e.g. Senior Backend Engineer specializing in High-Throughput Microservices"
                value={headline}
                onChange={(e) => {
                  setHeadline(e.target.value);
                  setSavedSuccess(false);
                }}
                disabled={saving}
              />
              <span className="form-helper">Concise title or thesis of your professional identity.</span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="profile-target-role" style={{ fontSize: '0.875rem', fontWeight: 800, color: '#4d1f27' }}>
                Default Target Job Role
              </label>
              <input
                id="profile-target-role"
                type="text"
                className="form-input"
                style={{ fontSize: '0.95rem', padding: '0.75rem 1rem', borderRadius: '12px' }}
                placeholder="e.g. Lead Software Architect, Staff Backend Engineer"
                value={targetRole}
                onChange={(e) => {
                  setTargetRole(e.target.value);
                  setSavedSuccess(false);
                }}
                disabled={saving}
              />
              <span className="form-helper">The benchmark role used when evaluating your saved profile.</span>
            </div>
          </div>

          {/* Verified Skills Section */}
          <div
            style={{
              backgroundColor: '#faf7f2',
              borderRadius: '18px',
              padding: '1.5rem 1.75rem',
              border: '1.5px solid rgba(77, 31, 39, 0.08)',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={16} color="#4d1f27" />
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#4d1f27' }}>
                  Core Competencies & Technology Stack ({skills.length})
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#8c827a' }}>Press Enter or click Add</span>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1rem' }}>
              <input
                id="new-skill-input"
                type="text"
                className="form-input"
                style={{ borderRadius: '12px', fontSize: '0.88rem', padding: '0.6rem 0.95rem', flex: 1, backgroundColor: '#ffffff' }}
                placeholder="Type a skill (e.g. TypeScript, Docker, PostgreSQL, Kubernetes) and add..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSkill(e);
                  }
                }}
                disabled={saving}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="btn btn-primary"
                style={{
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  backgroundColor: '#4d1f27',
                  borderRadius: '12px',
                }}
                disabled={saving || !newSkillInput.trim()}
              >
                <Plus size={15} />
                <span>Add Skill</span>
              </button>
            </div>

            {skills.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '0.35rem 0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      backgroundColor: '#ffffff',
                      color: '#4d1f27',
                      border: '1px solid #d5cbbe',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      style={{
                        padding: 0,
                        lineHeight: 1,
                        color: '#8c827a',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 700,
                      }}
                      aria-label={`Remove skill ${skill}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: '0.8rem', color: '#8c827a', fontStyle: 'italic' }}>
                No skills entered yet. Add technologies or leadership competencies above.
              </span>
            )}
          </div>

          {/* Work Experience */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={18} color="#4d1f27" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4d1f27', margin: 0, fontFamily: 'var(--font-serif)' }}>
                  Professional Milestones & Experience
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddExperience}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '0.4rem 0.95rem',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #d5cbbe',
                }}
                disabled={saving}
              >
                <Plus size={14} color="#4d1f27" />
                <span>Add Position</span>
              </button>
            </div>

            {experience.length === 0 ? (
              <div style={{ padding: '1.75rem', backgroundColor: '#faf7f2', borderRadius: '16px', border: '1px dashed #d5cbbe', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: '#776e6a', margin: 0 }}>
                  No roles listed yet. Click "+ Add Position" to detail your career trajectory.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {experience.map((exp, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid #e8e0d5',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      backgroundColor: '#faf7f2',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#4d1f27' }}>
                        Role #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        style={{ color: '#991b1b', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                        <span>Remove Role</span>
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4d1f27' }}>Organization / Company</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ borderRadius: '10px', fontSize: '0.88rem' }}
                          placeholder="e.g. Stripe, TechFlow Solutions"
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4d1f27' }}>Job Title</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ borderRadius: '10px', fontSize: '0.88rem' }}
                          placeholder="e.g. Lead Software Architect"
                          value={exp.role}
                          onChange={(e) => handleExperienceChange(idx, 'role', e.target.value)}
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4d1f27' }}>Duration / Dates</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ borderRadius: '10px', fontSize: '0.88rem' }}
                          placeholder="e.g. 2021 – Present"
                          value={exp.duration}
                          onChange={(e) => handleExperienceChange(idx, 'duration', e.target.value)}
                          disabled={saving}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4d1f27' }}>Key Impact & Accomplishments</label>
                      <textarea
                        className="form-textarea"
                        style={{ minHeight: '75px', fontSize: '0.82rem', borderRadius: '10px', lineHeight: 1.5 }}
                        placeholder="Bullet points describing your scale, technologies, optimizations, and results..."
                        value={exp.description}
                        onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GraduationCap size={18} color="#4d1f27" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4d1f27', margin: 0, fontFamily: 'var(--font-serif)' }}>
                  Academic Credentials & Certifications
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '0.4rem 0.95rem',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #d5cbbe',
                }}
                disabled={saving}
              >
                <Plus size={14} color="#4d1f27" />
                <span>Add Credential</span>
              </button>
            </div>

            {education.length === 0 ? (
              <div style={{ padding: '1.75rem', backgroundColor: '#faf7f2', borderRadius: '16px', border: '1px dashed #d5cbbe', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: '#776e6a', margin: 0 }}>
                  No academic credentials listed yet. Click "+ Add Credential" to include your degrees.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {education.map((edu, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid #e8e0d5',
                      borderRadius: '16px',
                      padding: '1.25rem 1.5rem',
                      backgroundColor: '#faf7f2',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4d1f27' }}>
                        Credential #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(idx)}
                        style={{ color: '#991b1b', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4d1f27' }}>Institution / University</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ borderRadius: '10px', fontSize: '0.88rem' }}
                          placeholder="e.g. Stanford University"
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4d1f27' }}>Degree / Field of Study</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ borderRadius: '10px', fontSize: '0.88rem' }}
                          placeholder="e.g. B.S. in Computer Science"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4d1f27' }}>Graduation Year</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ borderRadius: '10px', fontSize: '0.88rem' }}
                          placeholder="e.g. 2020"
                          value={edu.year}
                          onChange={(e) => handleEducationChange(idx, 'year', e.target.value)}
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Bottom Save Action */}
          <div
            style={{
              paddingTop: '1.5rem',
              borderTop: '1px solid #f0eae1',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{
                padding: '0.85rem 2rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                borderRadius: '14px',
                backgroundColor: '#4d1f27',
                boxShadow: '0 8px 24px rgba(77, 31, 39, 0.25)',
              }}
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Profile Changes ✦'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
