import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from './DashboardLayout';
import styles from './Dashboard.module.css';

export default function StudentDashboard() {
  const { user } = useAuth();

  const quickStats = [
    { icon: '📚', label: 'Enrolled Courses', value: '6' },
    { icon: '📝', label: 'Pending Assignments', value: '3' },
    { icon: '🏆', label: 'Current GPA', value: '3.75' },
    { icon: '💰', label: 'Fee Balance (KES)', value: '12,500' },
  ];

  const nav = (
    <>
      <a href="#overview" className={styles.navItem}>📊 Overview</a>
      <a href="#courses" className={styles.navItem}>📚 My Courses</a>
      <a href="#results" className={styles.navItem}>🏆 Results & GPA</a>
      <a href="#fees" className={styles.navItem}>💰 Fee Statement</a>
      <a href="#timetable" className={styles.navItem}>📅 Timetable</a>
      <a href="#library" className={styles.navItem}>📖 Library</a>
      <a href="#profile" className={styles.navItem}>👤 Profile</a>
    </>
  );

  const content = (
    <>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>👋 Welcome back, {user?.first_name}!</h3>
        <ul className={styles.infoList}>
          <li className={styles.infoItem}>
            <span className={styles.infoLabel}>Registration No.</span>
            <span className={styles.infoValue}>{user?.registration_number || '—'}</span>
          </li>
          <li className={styles.infoItem}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{user?.email}</span>
          </li>
          <li className={styles.infoItem}>
            <span className={styles.infoLabel}>Role</span>
            <span className={styles.infoValue}>
              <span className={`${styles.badge} ${styles.badgeSuccess}`}>Student</span>
            </span>
          </li>
          <li className={styles.infoItem}>
            <span className={styles.infoLabel}>2FA Status</span>
            <span className={styles.infoValue}>
              {user?.is_2fa_enabled
                ? <span className={`${styles.badge} ${styles.badgeSuccess}`}>Enabled</span>
                : <span className={`${styles.badge} ${styles.badgeWarning}`}>Disabled</span>}
            </span>
          </li>
        </ul>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>📅 Upcoming Deadlines</h3>
        <ul className={styles.infoList}>
          {[
            { course: 'CSC 301 – Data Structures', task: 'Assignment 2', due: 'Apr 15, 2026' },
            { course: 'MAT 201 – Calculus II', task: 'CAT 1', due: 'Apr 17, 2026' },
            { course: 'CSC 311 – Software Engineering', task: 'Project Proposal', due: 'Apr 22, 2026' },
          ].map((d) => (
            <li key={d.task} className={styles.infoItem}>
              <span className={styles.infoLabel}>{d.due}</span>
              <span className={styles.infoValue}>
                <strong>{d.task}</strong>
                <br />
                <span style={{ fontSize: 12, color: '#6b7280' }}>{d.course}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>🔔 Recent Notifications</h3>
        <ul className={styles.infoList}>
          {[
            'Fee payment deadline: April 30, 2026.',
            'Semester exam timetable has been published.',
            'Library: 2 books due for return by April 12.',
          ].map((n) => (
            <li key={n} className={styles.infoItem} style={{ display: 'block', paddingLeft: 0 }}>
              {n}
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  return (
    <DashboardLayout title="Student Dashboard" icon="🎓" quickStats={quickStats}>
      {{ nav, content }}
    </DashboardLayout>
  );
}
