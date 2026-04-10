import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api';
import { Alert, Button, FormField, Input } from '../../components/UI';
import styles from './Auth.module.css';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'lecturer', label: 'Lecturer' },
  { value: 'admin', label: 'Administrator' },
  { value: 'parent', label: 'Parent / Guardian' },
  { value: 'examiner', label: 'External Examiner' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    registration_number: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'student',
    password: '',
    password_confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setErrors({});
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      const roleRoutes = {
        student: '/dashboard/student',
        lecturer: '/dashboard/lecturer',
        admin: '/dashboard/admin',
        parent: '/dashboard/parent',
        examiner: '/dashboard/examiner',
      };
      navigate(roleRoutes[data.user.role] || '/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrors = {};
        Object.entries(data).forEach(([key, val]) => {
          fieldErrors[key] = Array.isArray(val) ? val[0] : val;
        });
        setErrors(fieldErrors);
        if (fieldErrors.non_field_errors) {
          setGlobalError(fieldErrors.non_field_errors);
        }
      } else {
        setGlobalError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard} style={{ maxWidth: 520 }}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🎓</span>
          <h1 className={styles.logoText}>CVT Portal</h1>
          <p className={styles.logoSubtext}>School Management System</p>
        </div>

        <h2 className={styles.heading}>Create your account</h2>

        {globalError && <Alert type="error">{globalError}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormField label="First Name" required error={errors.first_name}>
              <Input name="first_name" value={form.first_name} onChange={handleChange} required />
            </FormField>
            <FormField label="Last Name" required error={errors.last_name}>
              <Input name="last_name" value={form.last_name} onChange={handleChange} required />
            </FormField>
          </div>

          <FormField label="Email Address" required error={errors.email}>
            <Input name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
          </FormField>

          <FormField label="Registration Number" error={errors.registration_number}>
            <Input
              name="registration_number"
              placeholder="e.g. CVT/2024/001 (students & staff)"
              value={form.registration_number}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Phone Number" error={errors.phone_number}>
            <Input
              name="phone_number"
              type="tel"
              placeholder="+254700000000"
              value={form.phone_number}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Role" required error={errors.role}>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 14,
                background: 'white',
                boxSizing: 'border-box',
              }}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Password" required error={errors.password}>
            <Input
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="Confirm Password" required error={errors.password_confirm}>
            <Input
              name="password_confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={form.password_confirm}
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
            Create Account
          </Button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
