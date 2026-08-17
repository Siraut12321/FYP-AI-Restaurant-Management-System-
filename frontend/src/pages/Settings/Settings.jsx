import styles from '../../styles/AdminPage.module.css';

function Settings() {
  return (
    <div className={styles.adminShell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Hot & Spicy Admin</div>
        <div className={styles.navList}>
          <a className={styles.navLink} href='/admin/dashboard'>Dashboard</a>
          <a className={styles.navLink} href='/admin/orders'>Orders</a>
          <a className={styles.navLink} href='/admin/customers'>Customers</a>
          <a className={styles.navLink} href='/admin/settings'>Settings</a>
        </div>
      </aside>
      <main className={styles.contentArea}>
        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Control center</p>
              <h2>Settings</h2>
            </div>
            <span className={styles.pill}>Configuration</span>
          </div>
          <div className={styles.settingsGrid}>
            <div className={styles.settingBox}>
              <h3>Restaurant profile</h3>
              <p>Manage branding, contact info, and service identity.</p>
            </div>
            <div className={styles.settingBox}>
              <h3>Voice assistant</h3>
              <p>Adjust greeting tones, availability, and language behavior.</p>
            </div>
            <div className={styles.settingBox}>
              <h3>Security</h3>
              <p>Control admin access and authentication preferences.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Settings;
