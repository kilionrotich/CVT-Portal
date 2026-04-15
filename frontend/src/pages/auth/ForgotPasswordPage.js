import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../api';
import { Alert, Button, FormField, Input } from '../../components/UI';
import styles from './Auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.requestPasswordReset(email);
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
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
        </div>

        <h2 className={styles.heading}>Reset your password</h2>

        {submitted ? (
          <Alert type="success">
            If that email is registered, a reset link has been sent. Check your inbox and
            follow the instructions. The link expires in 1 hour.
          </Alert>
        ) : (
          <>
            {error && <Alert type="error">{error}</Alert>}
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
              Enter your registered email address and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} noValidate>
              <FormField label="Email Address" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </FormField>
              <Button
                type="submit"
                loading={loading}
                className={styles.submitBtn}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Send Reset Link
              </Button>
            </form>
          </>
        )}

        <p className={styles.switchText}>
          <Link to="/login">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
