import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from './DashboardLayout';
import styles from './Dashboard.module.css';

export default function AdminDashboard() {
  const { user } = useAuth();

  const quickStats = [
    { icon: '🎓', label: 'Enrolled Students', value: '1,284' },
    { icon: '👩‍🏫', label: 'Academic Staff', value: '87' },
    { icon: '📚', label: 'Active Courses', value: '142' },
    { icon: '💰', label: 'Revenue (KES)', value: '4.2M' },
  ];

  const nav = (
    <>
      <a href="#overview" className={styles.navItem}>📊 Overview</a>
      <a href="#students" className={styles.navItem}>🎓 Students</a>
      <a href="#staff" className={styles.navItem}>👩‍🏫 Staff</a>
      <a href="#courses" className={styles.navItem}>📚 Courses</a>
      <a href="#fees" className={styles.navItem}>💰 Finance</a>
      <a href="#exams" className={styles.navItem}>📝 Examinations</a>
      <a href="#reports" className={styles.navItem}>📈 Reports</a>
      <a href="#settings" className={styles.navItem}>⚙️ Settings</a>
    </>
  );

  const content = (
    <>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>👋 Welcome, Administrator {user?.first_name}!</h3>
        <ul className={styles.infoList}>
          <li className={styles.infoItem}>
            <span className={styles.infoLabel}>Admin ID</span>
            <span className={styles.infoValue}>{user?.registration_number || '—'}</span>
          </li>
          <li className={styles.infoItem}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{user?.email}</span>
          </li>
          <li className={styles.infoItem}>
            <span className={styles.infoLabel}>2FA Status</span>
            <span className={styles.infoValue}>
              {user?.is_2fa_enabled
                ? <span className={`${styles.badge} ${styles.badgeSuccess}`}>Enabled</span>
                : <span className={`${styles.badge} ${styles.badgeWarning}`}>Disabled — recommended for admins</span>}
            </span>
          </li>
        </ul>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>📈 Enrollment Summary</h3>
        <ul className={styles.infoList}>
          {[
            { dept: 'Computer Science', count: 320 },
            { dept: 'Business Administration', count: 280 },
            { dept: 'Engineering', count: 240 },
            { dept: 'Health Sciences', count: 200 },
            { dept: 'Education', count: 244 },
          ].map((d) => (
            <li key={d.dept} className={styles.infoItem}>
              <span className={styles.infoLabel}>{d.dept}</span>
              <span className={styles.infoValue}>{d.count} students</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>⚡ Pending Actions</h3>
        <ul className={styles.infoList}>
          {[
            'Review 14 new student admission applications.',
            'Approve semester 2 exam timetable draft.',
            'Resolve 3 pending fee dispute requests.',
            'Generate Q1 financial report for the board.',
          ].map((a) => (
            <li key={a} className={styles.infoItem} style={{ display: 'block' }}>
              {a}
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  return (
    <DashboardLayout title="Admin Dashboard" icon="🏫" quickStats={quickStats}>
      {{ nav, content }}
    </DashboardLayout>
  );
}
