import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase.js';
import { useAuth } from '../context/AuthContext.jsx';

const sections = [
  ['About', 'about'], ['Work', 'work'], ['Tutorials', 'tutorials'],
  ['Gallery', 'gallery'], ['Contact', 'contact'], ['Subscribe', 'subscribe'],
];

export default function Navbar() {
  const { user, plan, checkingAuth, checkingProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  async function logout() {
    if (!auth) return;
    setLoggingOut(true);
    try {
      await signOut(auth);
      closeMenu();
      navigate('/login');
    } catch {
      window.alert('Could not log out. Try again.');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Main navigation">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-mark">DEV</span><span className="brand-at">@</span><span className="brand-name">Deakin</span>
        </Link>
        <button className="nav-menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <span aria-hidden="true">☰</span> Menu
        </button>
        <div className={`nav-menu-content ${menuOpen ? 'is-open' : ''}`}>
          {location.pathname === '/' ? (
            <div className="nav-section-links">
              {sections.map(([label, id]) => <a key={id} href={`/#${id}`} onClick={closeMenu}>{label}</a>)}
            </div>
          ) : <Link className="nav-back-home" to="/" onClick={closeMenu}>Back to home</Link>}
          <div className="nav-actions">
            <Link className="nav-post" to="/post" onClick={closeMenu}>Post</Link>
            <Link className="nav-browse" to="/browse" onClick={closeMenu}>Browse Posts</Link>
            <Link className="nav-pricing" to="/pricing" onClick={closeMenu}>Pricing</Link>
            {!checkingAuth && user && !checkingProfile && <span className={`nav-plan-badge ${plan === 'Paid' ? 'is-paid' : ''}`}>{plan} plan</span>}
            {!checkingAuth && (user ? (
              <button className="nav-logout" type="button" disabled={loggingOut} onClick={logout}>{loggingOut ? 'Logging out…' : 'Log out'}</button>
            ) : <>
              <Link className="nav-login" to="/login" onClick={closeMenu}>Log in</Link>
              <Link className="nav-register" to="/register" onClick={closeMenu}>Create account</Link>
            </>)}
          </div>
        </div>
      </nav>
    </header>
  );
}
