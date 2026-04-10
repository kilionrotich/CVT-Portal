import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert, Button } from '../../components/UI';
import Setup2FAModal from './Setup2FAModal';
import styles from './Dashboard.module.css';

export function DashboardLayout({ title, icon, children, quickStats }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [show2FA, setShow2FA] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      setLogoutError('Logout failed. Please try again.');
    }
  };

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span style={{ fontSize: 28 }}>🎓</span>
          <span className={styles.sidebarTitle}>CVT Portal</span>
        </div>
        <nav className={styles.nav}>
          <span className={styles.navLabel}>NAVIGATION</span>
          {children.nav}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{user?.first_name?.[0]}{user?.last_name?.[0]}</div>
            <div>
              <div className={styles.userName}>{user?.first_name} {user?.last_name}</div>
              <div className={styles.userRole}>{user?.role}</div>
            </div>
          </div>
          <Button onClick={handleLogout} className={styles.logoutBtn}>
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>
              {icon} {title}
            </h1>
          </div>
          <div className={styles.headerActions}>
            {!user?.is_2fa_enabled && (
              <button className={styles.twoFABanner} onClick={() => setShow2FA(true)}>
                🔒 Enable 2FA for extra security
              </button>
            )}
          </div>
        </header>

        {logoutError && <Alert type="error">{logoutError}</Alert>}

        {quickStats && (
          <div className={styles.statsGrid}>
            {quickStats.map((s) => (
              <div key={s.label} className={styles.statCard}>
                <div className={styles.statIcon}>{s.icon}</div>
                <div>
                  <div className={styles.statValue}>{s.value}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.content}>{children.content}</div>
      </main>

      {show2FA && <Setup2FAModal onClose={() => setShow2FA(false)} />}
    </div>
  );
}
