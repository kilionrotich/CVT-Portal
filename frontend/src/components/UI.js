import React from 'react';

export function Spinner({ size = 24 }) {
  return (
    <svg
      className="spin"
      style={{ width: size, height: size }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        style={{ opacity: 0.25 }}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        style={{ opacity: 0.75 }}
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function Alert({ type = 'error', children }) {
  const styles = {
    error: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c' },
    success: { background: '#f0fdf4', border: '1px solid #86efac', color: '#15803d' },
    info: { background: '#eff6ff', border: '1px solid #93c5fd', color: '#1d4ed8' },
  };
  return (
    <div
      role="alert"
      style={{
        ...styles[type],
        borderRadius: 6,
        padding: '10px 14px',
        fontSize: 14,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

export function Button({ children, loading, disabled, style, ...props }) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.7 : 1,
        ...style,
      }}
      {...props}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}

export function FormField({ label, error, children, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 14 }}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
        </label>
      )}
      {children}
      {error && (
        <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{error}</p>
      )}
    </div>
  );
}

export function Input(props) {
  return (
    <input
      style={{
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #d1d5db',
        borderRadius: 6,
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
      }}
      {...props}
    />
  );
}
