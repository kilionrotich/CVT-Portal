import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert, Button, FormField, Input } from '../../components/UI';
import styles from './Auth.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ identifier: '', password: '', otp_code: '' });
  const [otpRequired, setOtpRequired] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.identifier, form.password, otpRequired ? form.otp_code : undefined);
      // Redirect based on role
      const roleRoutes = {
        student: '/dashboard/student',
        lecturer: '/dashboard/lecturer',
        admin: '/dashboard/admin',
        parent: '/dashboard/parent',
        examiner: '/dashboard/examiner',
      };
      navigate(roleRoutes[user.role] || '/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.otp_required) {
        setOtpRequired(true);
        setError('Please enter your 2FA code from your authenticator app.');
      } else if (typeof data === 'string') {
        setError(data);
      } else if (data?.detail) {
        setError(data.detail);
      } else if (data?.non_field_errors) {
        setError(data.non_field_errors[0]);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🎓</span>
          <h1 className={styles.logoText}>CVT Portal</h1>
          <p className={styles.logoSubtext}>School Management System</p>
        </div>

        <h2 className={styles.heading}>Sign in to your account</h2>

        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          {!otpRequired ? (
            <>
              <FormField label="Email or Registration Number" required>
                <Input
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  placeholder="e.g. CVT/2024/001 or you@example.com"
                  value={form.identifier}
                  onChange={handleChange}
                  required
                />
              </FormField>

              <FormField label="Password" required>
                <Input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </FormField>

              <div className={styles.forgotLink}>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
            </>
          ) : (
            <FormField label="Authenticator Code" required>
              <Input
                name="otp_code"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="6-digit code"
                value={form.otp_code}
                onChange={handleChange}
                autoFocus
                required
              />
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
                Open your authenticator app and enter the 6-digit code.
              </p>
            </FormField>
          )}

          <Button
            type="submit"
            loading={loading}
            className={styles.submitBtn}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {otpRequired ? 'Verify & Sign In' : 'Sign In'}
          </Button>
        </form>

        <p className={styles.switchText}>
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
