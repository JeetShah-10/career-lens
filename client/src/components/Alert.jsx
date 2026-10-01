import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export default function Alert({ type = 'danger', message, details = null, className = '' }) {
  if (!message) return null;

  const icons = {
    danger: <AlertCircle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />,
    warning: <AlertTriangle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />,
    success: <CheckCircle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />,
    info: <Info size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />,
  };

  return (
    <div
      role="alert"
      className={`alert alert-${type} ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
      }}
    >
      {icons[type] || icons.danger}
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 500 }}>{message}</p>
        {details && Array.isArray(details) && details.length > 0 && (
          <ul style={{ margin: '0.375rem 0 0 1.25rem', padding: 0, fontSize: '0.8125rem' }}>
            {details.map((d, index) => (
              <li key={index}>
                {d.field ? <strong>{d.field}: </strong> : null}
                {d.message || JSON.stringify(d)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
