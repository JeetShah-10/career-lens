import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FileText,
  Upload,
  User,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Target,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const SUGGESTED_ROLES = [
  'Senior Full-Stack Engineer',
  'Frontend Architect',
  'Machine Learning Engineer',
  'DevOps & Cloud Engineer',
  'Product Manager',
  'Data Scientist',
];

export default function NewAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();

  const [source, setSource] = useState('paste'); // 'paste' | 'pdf' | 'profile'
  const [targetRole, setTargetRole] = useState(location.state?.prefillRole || '');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [showJobDescription, setShowJobDescription] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const handleSourceChange = async (newSource) => {
    setSource(newSource);
    setFormError(null);

    if (newSource === 'profile') {
      setLoadingProfile(true);
      try {
        const res = await api.profile.get();
        const profile = res?.profile;
        if (profile) {
          if (!targetRole && profile.targetRole) {
            setTargetRole(profile.targetRole);
          }
          // Serialize profile to resume text
          const lines = [];
          if (profile.headline) lines.push(`Headline: ${profile.headline}`);
          if (profile.targetRole) lines.push(`Target Role: ${profile.targetRole}`);
          if (profile.skills && profile.skills.length > 0) {
            lines.push(`Skills: ${profile.skills.join(', ')}`);
          }
          if (profile.experience && profile.experience.length > 0) {
            lines.push('\nProfessional Experience:');
            profile.experience.forEach((exp) => {
              lines.push(`- ${exp.role} at ${exp.company} (${exp.duration || 'Present'}): ${exp.description || ''}`);
            });
          }
          if (profile.education && profile.education.length > 0) {
            lines.push('\nEducation:');
            profile.education.forEach((edu) => {
              lines.push(`- ${edu.degree} from ${edu.institution} (${edu.year || 'N/A'})`);
            });
          }
          setResumeText(lines.join('\n'));
        }
      } catch (err) {
        setFormError(err.message || 'Could not retrieve your saved profile.');
      } finally {
        setLoadingProfile(false);
      }
    }
  };

  const handleFileChange = (e) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setFileError('Invalid file format. Please upload a PDF document (.pdf).');
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('File exceeds 5MB limit. Please upload a smaller PDF file.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const validate = () => {
    if (!targetRole.trim()) {
      setFormError('Target Role is required. Please specify the job title you are targeting.');
      return false;
    }

    if (source === 'pdf') {
      if (!selectedFile) {
        setFileError('Please select a PDF document to evaluate.');
        return false;
      }
    } else if (source === 'profile') {
      // Target role is checked above; backend validates profile completeness
    } else {
      if (!resumeText.trim()) {
        setFormError('Resume content is required. Please provide your qualifications.');
        return false;
      }
      if (resumeText.trim().length < 50) {
        setFormError('Resume content is too brief. Provide at least 50 characters for meaningful analysis.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setErrorDetails(null);
    setFileError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      let res;
      if (source === 'pdf') {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('targetRole', targetRole.trim());
        if (jobDescription.trim()) {
          formData.append('jobDescription', jobDescription.trim());
        }
        res = await api.analyses.create(formData);
      } else if (source === 'profile') {
        res = await api.analyses.createFromProfile({
          targetRole: targetRole.trim() || undefined,
          ...(jobDescription.trim() ? { jobDescription: jobDescription.trim() } : {}),
        });
      } else {
        const payload = {
          resumeText: resumeText.trim(),
          targetRole: targetRole.trim(),
          resumeSource: 'paste',
          ...(jobDescription.trim() ? { jobDescription: jobDescription.trim() } : {}),
        };
        res = await api.analyses.create(payload);
      }

      const createdId = res?.analysis?.id || res?.analysis?._id;
      if (createdId) {
        navigate(`/analyses/${createdId}`);
      } else {
        navigate('/history');
      }
    } catch (err) {
      setFormError(err.message || 'Analysis generation failed. Please try again.');
      setErrorDetails(err.details || null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        style={{
          marginBottom: '2.5rem',
          paddingBottom: '1.75rem',
          borderBottom: '1px solid rgba(77, 31, 39, 0.1)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.95rem',
            borderRadius: '9999px',
            backgroundColor: '#f2ece2',
            border: '1px solid #e0d5c4',
            color: '#c2410c',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
          }}
        >
          <Sparkles size={12} color="#c2410c" />
          <span>AI Neural Engine • Gemini Flash Ladder</span>
        </div>

        <h1
          style={{
            fontFamily: "'Taberna', 'Taberna Serif', 'Playfair Display', Georgia, serif",
            fontSize: '2.45rem',
            fontWeight: 600,
            color: '#4d1f27',
            letterSpacing: '-0.02em',
            margin: '0 0 0.5rem',
            lineHeight: 1.15,
          }}
        >
          Executive Resume Appraisal
        </h1>

        <p style={{ fontSize: '0.96rem', color: '#574f4b', margin: 0, maxWidth: '640px', lineHeight: 1.6 }}>
          Submit your resume and specify your target career role. Our grounded AI evaluation pipeline audits dimensional alignment, identifies competency gaps, and designs your strategic upskilling roadmap.
        </p>
      </div>

      {formError && <Alert type="danger" message={formError} details={errorDetails} />}

      <form onSubmit={handleSubmit} noValidate>
        {/* Main Workstation Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid rgba(77, 31, 39, 0.08)',
            padding: '2.25rem 2.5rem',
            boxShadow: '0 8px 30px rgba(77, 31, 39, 0.04)',
            marginBottom: '2rem',
          }}
        >
          {/* Target Role Field */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Target size={16} color="#4d1f27" />
              <label htmlFor="target-role" style={{ fontSize: '0.92rem', fontWeight: 700, color: '#4d1f27' }}>
                Target Role or Position <span style={{ color: '#c2410c' }}>*</span>
              </label>
            </div>

            <input
              id="target-role"
              type="text"
              placeholder="e.g. Senior Full-Stack Engineer, AI Researcher, Product Lead..."
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              disabled={submitting}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1.5px solid #dcd3c5',
                fontSize: '0.95rem',
                backgroundColor: '#faf7f2',
                color: '#1a1817',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#4d1f27')}
              onBlur={(e) => (e.target.style.borderColor = '#dcd3c5')}
            />

            {/* Role Suggestion Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.74rem', color: '#8c827a', fontWeight: 600 }}>Common Targets:</span>
              {SUGGESTED_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setTargetRole(role)}
                  style={{
                    backgroundColor: targetRole === role ? '#4d1f27' : '#faf7f2',
                    color: targetRole === role ? '#faf7f2' : '#574f4b',
                    border: '1px solid #dcd3c5',
                    borderRadius: '9999px',
                    padding: '3px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Input Method Selector Tabs */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#4d1f27', marginBottom: '0.75rem' }}>
              Resume Submission Format <span style={{ color: '#c2410c' }}>*</span>
            </label>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                backgroundColor: '#f5ede4',
                padding: '5px',
                borderRadius: '16px',
                border: '1px solid #e0d5c4',
              }}
            >
              <button
                type="button"
                onClick={() => handleSourceChange('paste')}
                disabled={submitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '11px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  backgroundColor: source === 'paste' ? '#ffffff' : 'transparent',
                  color: source === 'paste' ? '#4d1f27' : '#70665f',
                  boxShadow: source === 'paste' ? '0 2px 8px rgba(77, 31, 39, 0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <FileText size={16} />
                <span>Paste Text</span>
              </button>

              <button
                type="button"
                onClick={() => handleSourceChange('pdf')}
                disabled={submitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '11px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  backgroundColor: source === 'pdf' ? '#ffffff' : 'transparent',
                  color: source === 'pdf' ? '#4d1f27' : '#70665f',
                  boxShadow: source === 'pdf' ? '0 2px 8px rgba(77, 31, 39, 0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Upload size={16} />
                <span>Upload PDF</span>
              </button>

              <button
                type="button"
                onClick={() => handleSourceChange('profile')}
                disabled={submitting || loadingProfile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '11px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  backgroundColor: source === 'profile' ? '#ffffff' : 'transparent',
                  color: source === 'profile' ? '#4d1f27' : '#70665f',
                  boxShadow: source === 'profile' ? '0 2px 8px rgba(77, 31, 39, 0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <User size={16} />
                <span>Saved Profile</span>
              </button>
            </div>
          </div>

          {/* Conditional Input Body */}
          {source === 'paste' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#574f4b', fontWeight: 600 }}>
                  Paste full resume markdown, plain text, or structured bullet points:
                </span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: resumeText.length > 12000 ? '#991b1b' : '#8c827a',
                    fontWeight: 700,
                  }}
                >
                  {resumeText.length.toLocaleString()} / 12,000 characters
                </span>
              </div>

              <textarea
                rows={12}
                placeholder="Paste your resume content here (summary, work history, technical proficiencies, education)..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid #dcd3c5',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  backgroundColor: '#faf7f2',
                  color: '#1a1817',
                  outline: 'none',
                  resize: 'vertical',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#4d1f27')}
                onBlur={(e) => (e.target.style.borderColor = '#dcd3c5')}
              />
            </div>
          )}

          {source === 'pdf' && (
            <div>
              <div
                style={{
                  border: '2px dashed #c8beaf',
                  borderRadius: '18px',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  backgroundColor: '#faf7f2',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = '#4d1f27';
                  e.currentTarget.style.backgroundColor = '#f5ede4';
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = '#c8beaf';
                  e.currentTarget.style.backgroundColor = '#faf7f2';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = '#c8beaf';
                  e.currentTarget.style.backgroundColor = '#faf7f2';
                  if (e.dataTransfer.files?.[0]) {
                    handleFileChange({ target: { files: e.dataTransfer.files } });
                  }
                }}
                onClick={() => document.getElementById('pdf-upload-input')?.click()}
              >
                <input
                  id="pdf-upload-input"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  disabled={submitting}
                  style={{ display: 'none' }}
                />

                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '16px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4d1f27',
                    margin: '0 auto 1rem',
                    boxShadow: '0 4px 12px rgba(77, 31, 39, 0.08)',
                  }}
                >
                  <Upload size={24} />
                </div>

                {selectedFile ? (
                  <div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                      <CheckCircle2 size={18} />
                      {selectedFile.name}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#574f4b' }}>
                      {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop a different file to replace
                    </span>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#4d1f27', display: 'block', marginBottom: '0.35rem' }}>
                      Click to choose PDF or drag & drop here
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#8c827a' }}>
                      PDF document up to 5MB maximum file size
                    </span>
                  </div>
                )}
              </div>

              {fileError && (
                <div style={{ marginTop: '0.75rem' }}>
                  <Alert type="danger" message={fileError} />
                </div>
              )}
            </div>
          )}

          {source === 'profile' && (
            <div>
              {loadingProfile ? (
                <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                  <LoadingSpinner message="Synchronizing your saved profile dossier..." />
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                    <CheckCircle2 size={16} color="#065f46" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065f46' }}>
                      Successfully synchronized with your saved Profile Dossier.
                    </span>
                  </div>

                  <textarea
                    rows={8}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    disabled={submitting}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #dcd3c5',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      backgroundColor: '#faf7f2',
                      color: '#1a1817',
                      outline: 'none',
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Optional Job Description Toggle */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f0eae1' }}>
            <button
              type="button"
              onClick={() => setShowJobDescription((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileCheck size={18} color="#c2410c" />
                <div>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#4d1f27', display: 'block' }}>
                    Optional: Match against specific Job Description
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#8c827a' }}>
                    Unlocks precise ATS keyword matching and missing skill analysis
                  </span>
                </div>
              </div>

              {showJobDescription ? <ChevronUp size={18} color="#4d1f27" /> : <ChevronDown size={18} color="#4d1f27" />}
            </button>

            {showJobDescription && (
              <div style={{ marginTop: '1.25rem' }}>
                <textarea
                  rows={6}
                  placeholder="Paste the target job description or requirements listing here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid #dcd3c5',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    backgroundColor: '#faf7f2',
                    color: '#1a1817',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#4d1f27')}
                  onBlur={(e) => (e.target.style.borderColor = '#dcd3c5')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Security & Action Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#70665f', fontSize: '0.82rem' }}>
            <ShieldCheck size={18} color="#065f46" />
            <span>Strict data minimization: Raw resume content is evaluated securely & never redistributed.</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '1rem',
              fontWeight: 800,
              backgroundColor: submitting ? '#6e3e46' : '#4d1f27',
              color: '#faf7f2',
              border: 'none',
              padding: '0.95rem 2.25rem',
              borderRadius: '16px',
              cursor: submitting ? 'wait' : 'pointer',
              boxShadow: '0 8px 24px rgba(77, 31, 39, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.currentTarget.style.backgroundColor = '#38141b';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                e.currentTarget.style.backgroundColor = '#4d1f27';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {submitting ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>✦</span>
                <span>Synthesizing AI appraisal...</span>
              </>
            ) : (
              <>
                <span>Execute AI Appraisal</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
