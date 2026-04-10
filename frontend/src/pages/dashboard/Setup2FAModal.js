import React, { useEffect, useState } from 'react';
import { authAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Alert, Button, FormField, Input, Spinner } from '../../components/UI';

export default function Setup2FAModal({ onClose }) {
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState('loading'); // loading | setup | confirm | done
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authAPI
      .get2FASetup()
      .then(({ data }) => {
        setQrCode(data.qr_code);
        setSecret(data.secret);
        setStep('setup');
      })
      .catch(() => setStep('error'));
  }, []);

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.enable2FA(otpCode);
      await refreshProfile();
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.otp_code || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const cardStyle = {
    background: 'white',
    borderRadius: 12,
    padding: 32,
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  };

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Set Up Two-Factor Authentication</h2>

        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spinner size={40} />
          </div>
        )}

        {step === 'error' && (
          <Alert type="error">Failed to load 2FA setup. Please try again.</Alert>
        )}

        {step === 'setup' && (
          <>
            <p style={{ fontSize: 14, color: '#374151' }}>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.),
              then enter the 6-digit code to confirm.
            </p>
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <img src={qrCode} alt="2FA QR Code" style={{ width: 200, height: 200 }} />
            </div>
            <p style={{ fontSize: 12, color: '#6b7280', wordBreak: 'break-all', background: '#f3f4f6', padding: 10, borderRadius: 6 }}>
              Manual key: <strong>{secret}</strong>
            </p>
            {error && <Alert type="error">{error}</Alert>}
            <form onSubmit={handleConfirm}>
              <FormField label="Verification Code" required>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  autoFocus
                  required
                />
              </FormField>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button
                  type="submit"
                  loading={loading}
                  style={{
                    flex: 1,
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer',
                    justifyContent: 'center',
                  }}
                >
                  Activate 2FA
                </Button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '1px solid #d1d5db',
                    padding: '10px 20px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: '#374151',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'done' && (
          <>
            <Alert type="success">
              🎉 Two-factor authentication is now active on your account!
            </Alert>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 12,
              }}
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}
