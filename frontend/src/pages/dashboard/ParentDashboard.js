import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from './DashboardLayout';
import styles from './Dashboard.module.css';

export default function ParentDashboard() {
  const { user } = useAuth();

  const quickStats = [
    { icon: '👦', label: 'Linked Students', value: '1' },
    { icon: '💰', label: 'Outstanding (KES)', value: '12,500' },
    { icon: '📊', label: 'Current GPA', value: '3.75' },
    { icon: '🔔', label: 'New Alerts', value: '2' },
  ];

  const nav = (
    <>
      <a href="#overview" className={styles.navItem}>📊 Overview</a>
      <a href="#fees" className={styles.navItem}>💰 Fee Statements</a>
      <a href="#progress" className={styles.navItem}>📊 Academic Progress</a>
      <a href="#alerts" className={styles.navItem}>🔔 Alerts</a>
      <a href="#profile" className={styles.navItem}>👤 Profile</a>
    </>
  );

  const content = (
    <>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>👋 Welcome, {user?.first_name}!</h3>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          This portal lets you monitor your child's academic progress, fee balance, and receive
          important notifications from the institution.
        </p>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>👦 Linked Student</h3>
        <ul className={styles.infoList}>
          <li className={styles.infoItem}>
            <span className={styles.infoLabel}>Name</span>
            <span className={styles.infoValue}>James Kariuki</span>
          </li>
          <li className={styles.infoItem}>
            <span className={styles.infoLabel}>Registration No.</span>
            <span className={styles.infoValue}>CVT/2024/042</span>
          </li>
          <li className={styles.infoItem}>
            <span className={styles.infoLabel}>Programme</span>
            <span className={styles.infoValue}>BSc. Computer Science — Year 2</span>
          </li>
          <li className={styles.infoItem}>
            <span className={styles.infoLabel}>Current GPA</span>
            <span className={styles.infoValue}>3.75 / 4.00</span>
          </li>
          <li className={styles.infoItem}>
            <span className={styles.infoLabel}>Fee Balance</span>
            <span className={styles.infoValue} style={{ color: '#dc2626', fontWeight: 700 }}>
              KES 12,500
            </span>
          </li>
        </ul>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>🔔 Notifications</h3>
        <ul className={styles.infoList}>
          {[
            'Semester 2 fee payment deadline: April 30, 2026.',
            'James achieved a distinction in CSC 301 CAT 1.',
          ].map((n) => (
            <li key={n} className={styles.infoItem} style={{ display: 'block' }}>
              {n}
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  return (
    <DashboardLayout title="Parent / Guardian Portal" icon="👨‍👩‍👧" quickStats={quickStats}>
      {{ nav, content }}
    </DashboardLayout>
  );
}
