import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from './DashboardLayout';
import styles from './Dashboard.module.css';

export default function ExaminerDashboard() {
  const { user } = useAuth();

  const quickStats = [
    { icon: '📝', label: 'Assigned Modules', value: '3' },
    { icon: '📋', label: 'Scripts to Review', value: '148' },
    { icon: '✅', label: 'Reviewed', value: '96' },
    { icon: '📅', label: 'Report Deadline', value: 'May 10' },
  ];

  const nav = (
    <>
      <a href="#overview" className={styles.navItem}>📊 Overview</a>
      <a href="#modules" className={styles.navItem}>📝 Assigned Modules</a>
      <a href="#scripts" className={styles.navItem}>📋 Exam Scripts</a>
      <a href="#reports" className={styles.navItem}>📁 Submit Report</a>
      <a href="#profile" className={styles.navItem}>👤 Profile</a>
    </>
  );

  const content = (
    <>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>👋 Welcome, External Examiner {user?.first_name}!</h3>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          Access your assigned examination modules, review scripts, and submit moderation reports
          through this secure portal.
        </p>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>📝 Assigned Modules</h3>
        <ul className={styles.infoList}>
          {[
            { code: 'CSC 401', name: 'Database Systems', scripts: 44, reviewed: 32 },
            { code: 'CSC 421', name: 'Computer Networks', scripts: 42, reviewed: 36 },
            { code: 'CSC 451', name: 'Artificial Intelligence', scripts: 62, reviewed: 28 },
          ].map((m) => (
            <li key={m.code} className={styles.infoItem}>
              <span className={styles.infoLabel}>{m.code}</span>
              <span className={styles.infoValue}>
                {m.name}
                <br />
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  {m.reviewed} / {m.scripts} reviewed
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>📅 Key Deadlines</h3>
        <ul className={styles.infoList}>
          {[
            { event: 'Script review completion', date: 'May 5, 2026' },
            { event: 'Moderation report submission', date: 'May 10, 2026' },
            { event: 'Examiners Board meeting', date: 'May 20, 2026' },
          ].map((d) => (
            <li key={d.event} className={styles.infoItem}>
              <span className={styles.infoLabel}>{d.date}</span>
              <span className={styles.infoValue}>{d.event}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  return (
    <DashboardLayout title="External Examiner Portal" icon="🔬" quickStats={quickStats}>
      {{ nav, content }}
    </DashboardLayout>
  );
}
