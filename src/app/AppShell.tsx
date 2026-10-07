import { Link, Outlet } from "react-router-dom";
import styles from "./AppShell.module.css";

export function AppShell() {
  return (
    <>
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>
      <nav className={styles.topNav} aria-label="Portal">
        <Link to="/" className={styles.brand}>
          <svg className={styles.logo} viewBox="0 0 14 14" aria-hidden="true">
            <path d="M5 0h9L9 14H0z" fill="currentColor" />
          </svg>
          <span className={styles.divider} aria-hidden="true" />
          <span className={styles.brandText}>Facility Portal</span>
        </Link>
      </nav>
      <header className={styles.header}>
        <h1 className={styles.title}>Courses</h1>
        <p className={styles.subtitle}>Browse and add golf courses</p>
      </header>
      <main id="main" className={styles.main}>
        <Outlet />
      </main>
    </>
  );
}
