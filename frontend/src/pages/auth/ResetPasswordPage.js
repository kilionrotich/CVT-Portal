import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authAPI } from '../../api';
import { Alert, Button, FormField, Input } from '../../components/UI';
import styles from './Auth.module.css';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ new_password: '', new_password_confirm: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setErrors({});
    setLoading(true);
    try {
      await authAPI.confirmPasswordReset({ token, ...form });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrors = {};
        Object.entries(data).forEach(([key, val]) => {
          fieldErrors[key] = Array.isArray(val) ? val[0] : val;
        });
        setErrors(fieldErrors);
        if (fieldErrors.token) setGlobalError(fieldErrors.token);
      } else {
        setGlobalError('Password reset failed. Please try again.');
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
        </div>

        <h2 className={styles.heading}>Set new password</h2>

        {success ? (
          <Alert type="success">
            Password reset successfully! Redirecting you to the sign in page…
          </Alert>
        ) : (
          <>
            {globalError && <Alert type="error">{globalError}</Alert>}
            <form onSubmit={handleSubmit} noValidate>
              <FormField label="New Password" required error={errors.new_password}>
                <Input
                  name="new_password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={form.new_password}
                  onChange={handleChange}
                  required
                />
              </FormField>
              <FormField label="Confirm New Password" required error={errors.new_password_confirm}>
                <Input
                  name="new_password_confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat new password"
                  value={form.new_password_confirm}
                  onChange={handleChange}
                  required
                />
              </FormField>
              <Button
                type="submit"
                loading={loading}
                className={styles.submitBtn}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Reset Password
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
