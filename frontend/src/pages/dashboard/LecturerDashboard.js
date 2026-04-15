import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from './DashboardLayout';
import styles from './Dashboard.module.css';

export default function LecturerDashboard() {
  const { user } = useAuth();

  const quickStats = [
    { icon: '📚', label: 'Courses Teaching', value: '4' },
    { icon: '👥', label: 'Total Students', value: '186' },
    { icon: '📝', label: 'Pending Grades', value: '12' },
    { icon: '📋', label: 'Assignments Active', value: '7' },
  ];

  const nav = (
    <>
      <a href="#overview" className={styles.navItem}>📊 Overview</a>
      <a href="#courses" className={styles.navItem}>📚 My Courses</a>
      <a href="#grades" className={styles.navItem}>✅ Grade Submission</a>
      <a href="#attendance" className={styles.navItem}>📋 Attendance</a>
      <a href="#resources" className={styles.navItem}>📁 Upload Resources</a>
      <a href="#announcements" className={styles.navItem}>📣 Announcements</a>
      <a href="#profile" className={styles.navItem}>👤 Profile</a>
    </>
  );

  const content = (
    <>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>👋 Welcome, {user?.first_name}!</h3>
        <ul className={styles.infoList}>
          <li className={styles.infoItem}>
            <span className={styles.infoLabel}>Staff ID</span>
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
                : <span className={`${styles.badge} ${styles.badgeWarning}`}>Disabled</span>}
            </span>
          </li>
        </ul>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>📚 Current Course Allocation</h3>
        <ul className={styles.infoList}>
          {[
            { code: 'CSC 301', name: 'Data Structures & Algorithms', students: 52 },
            { code: 'CSC 311', name: 'Software Engineering', students: 48 },
            { code: 'CSC 401', name: 'Database Systems', students: 44 },
            { code: 'CSC 421', name: 'Computer Networks', students: 42 },
          ].map((c) => (
            <li key={c.code} className={styles.infoItem}>
              <span className={styles.infoLabel}>{c.code}</span>
              <span className={styles.infoValue}>
                {c.name} — <span style={{ color: '#6b7280' }}>{c.students} students</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>📝 Pending Grade Submissions</h3>
        <ul className={styles.infoList}>
          {[
            { course: 'CSC 301', item: 'CAT 1', deadline: 'Apr 14, 2026' },
            { course: 'CSC 311', item: 'Assignment 2', deadline: 'Apr 16, 2026' },
            { course: 'CSC 401', item: 'Lab 3', deadline: 'Apr 18, 2026' },
          ].map((g) => (
            <li key={`${g.course}-${g.item}`} className={styles.infoItem}>
              <span className={styles.infoLabel}>{g.deadline}</span>
              <span className={styles.infoValue}>
                {g.course} – {g.item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  return (
    <DashboardLayout title="Lecturer Dashboard" icon="👩‍🏫" quickStats={quickStats}>
      {{ nav, content }}
    </DashboardLayout>
  );
}
