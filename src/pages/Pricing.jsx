import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiUrl } from '../api.js';
import { formatCardNumber, formatExpiry, validateDemoPayment } from '../utils/demoPayment.js';

const freeFeatures = [
  ['5 posts per month', true],
  ['Access to community posts', true],
  ['2 MB image uploads', true],
  ['Premium articles and guides', false],
  ['Priority member support', false],
];
const paidFeatures = [
  ['Unlimited posts each month', true],
  ['Access to community posts', true],
  ['10 MB image uploads', true],
  ['Premium articles and guides', true],
  ['Priority member support', true],
];

const emptyPayment = { name: '', cardNumber: '', expiry: '', cvv: '' };

function FeatureList({ features }) {
  return (
    <ul className="d1-feature-list">
      {features.map(([feature, offered]) => (
        <li key={feature} className={!offered ? 'not-included' : ''}>
          <span className="d1-feature-icon" aria-hidden="true">{offered ? '✓' : '—'}</span>
          {feature}
        </li>
      ))}
    </ul>
  );
}

function UpgradeModal({ onClose, onSuccess, user }) {
  const [payment, setPayment] = useState(emptyPayment);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    nameRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); if (!submitting) onClose(); }
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = [...dialogRef.current.querySelectorAll('button:not(:disabled),input:not(:disabled)')];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus?.();
    };
  }, [onClose, submitting]);

  const update = (key, value) => {
    setError('');
    setPayment((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const errorMessage = validateDemoPayment(payment);
    if (errorMessage) { setError(errorMessage); return; }

    setSubmitting(true);
    setError('');
    try {
      const token = await user.getIdToken();
      // IMPORTANT: Card number, expiry and CVV are NEVER included in this request.
      // This is a simulated payment for coursework, not a real transaction.
      const response = await fetch(apiUrl('/api/upgrade'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: payment.name.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || 'Could not upgrade the subscription.');
      setPayment(emptyPayment);
      onSuccess(data.message || 'Your account now has the Paid plan.');
    } catch (failure) {
      setError(failure.message || 'Something went wrong. Check the backend and Firebase configuration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d1-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onClose(); }}>
      <div ref={dialogRef} className="d1-modal" role="dialog" aria-modal="true" aria-labelledby="d1-modal-title" aria-describedby="d1-modal-description">
        <div className="d1-modal-header">
          <div>
            <p className="d1-eyebrow">MEMBERSHIP UPGRADE</p>
            <h2 id="d1-modal-title">Upgrade to Paid</h2>
          </div>
          <button className="d1-close" type="button" onClick={onClose} disabled={submitting} aria-label="Close upgrade window">×</button>
        </div>
        <p className="d1-modal-lead" id="d1-modal-description">Unlock a preview of the premium DEV@Deakin experience.</p>
        <div className="d1-demo-warning" role="note">
          <strong>Demo only — no real payments.</strong> Use only 4242 4242 4242 4242, a future expiry date and any 3-digit demo CVV. Never enter your own card. Card information is only checked in this browser and is not sent or saved.
        </div>
        <form className="d1-payment-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="d1-payer">Name on test card</label>
          <input ref={nameRef} id="d1-payer" type="text" autoComplete="off" maxLength={80} value={payment.name} onChange={(e) => update('name', e.target.value)} placeholder="Example Student" required />
          <label htmlFor="d1-card-number">Test card number</label>
          <input id="d1-card-number" type="text" inputMode="numeric" autoComplete="off" maxLength={23} value={payment.cardNumber} onChange={(e) => update('cardNumber', formatCardNumber(e.target.value))} placeholder="4242 4242 4242 4242" required />
          <div className="d1-form-columns">
            <div>
              <label htmlFor="d1-expiry">Expiry (MM/YY)</label>
              <input id="d1-expiry" type="text" inputMode="numeric" autoComplete="off" maxLength={5} value={payment.expiry} onChange={(e) => update('expiry', formatExpiry(e.target.value))} placeholder="12/30" required />
            </div>
            <div>
              <label htmlFor="d1-cvv">Test CVV</label>
              <input id="d1-cvv" type="password" inputMode="numeric" autoComplete="off" maxLength={4} value={payment.cvv} onChange={(e) => update('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" required />
            </div>
          </div>
          {error && <p className="d1-form-error" role="alert">{error}</p>}
          <button className="d1-button d1-button-primary d1-confirm" type="submit" disabled={submitting}>
            {submitting ? 'Updating your plan…' : 'Confirm demo upgrade'} <span aria-hidden="true">→</span>
          </button>
          <p className="d1-fine-print">This is a coursework simulation. No amount will be charged and no recurring subscription will be created.</p>
        </form>
      </div>
    </div>
  );
}

export default function Pricing() {
  const { user, profile, plan, checkingAuth, checkingProfile, profileError } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => { document.title = 'Pricing | DEV@Deakin'; }, []);
  useEffect(() => {
    if (!user || plan === 'Paid') setModalOpen(false);
  }, [user, plan]);

  const handleOpen = () => {
    setSuccess('');
    if (user && plan === 'Free' && !checkingProfile && !profileError) setModalOpen(true);
  };

  const paidButton = () => {
    if (checkingAuth || (user && checkingProfile)) return <button className="d1-button d1-button-primary" type="button" disabled>Checking your account…</button>;
    if (!user) return <Link className="d1-button d1-button-primary" to="/login" state={{ from: '/pricing' }}>Log in to upgrade <span aria-hidden="true">→</span></Link>;
    if (profileError) return <button className="d1-button d1-button-primary" type="button" disabled>Account temporarily unavailable</button>;
    if (plan === 'Paid') return <button className="d1-button d1-button-primary is-current-plan" type="button" disabled>✓ Your current plan</button>;
    return <button className="d1-button d1-button-primary" type="button" onClick={handleOpen}>Upgrade Plan <span aria-hidden="true">→</span></button>;
  };

  return (
    <main className="d1-pricing-page">
      <div className="d1-pricing-container">
        <div className="d1-pricing-header">
          <span className="d1-kicker"><span className="d1-kicker-dot" /> MADE FOR GROWING DEVELOPERS</span>
          <h1>Find your <em>next level.</em></h1>
          <p>Start building for free. Explore what's possible with a premium membership as your projects grow.</p>
        </div>

        <div className="d1-account-strip" aria-live="polite">
          <div className="d1-account-identity">
            <span className="d1-account-icon" aria-hidden="true">{user ? '✓' : '◎'}</span>
            <div>
              <strong>{checkingAuth ? 'Checking account…' : user ? `Welcome, ${profile?.firstName || user.displayName?.split(' ')[0] || 'developer'}` : 'Exploring as a guest'}</strong>
              <span>{user ? (user.email || 'Signed in') : 'Log in to manage your subscription'}</span>
            </div>
          </div>
          <span className={`d1-account-plan ${user && plan === 'Paid' ? 'is-paid' : ''}`}>
            {checkingAuth || (user && checkingProfile) ? 'Loading plan' : user ? `${plan} member` : 'Guest access'}
          </span>
        </div>

        {profileError && <p className="d1-banner-error" role="alert">{profileError}</p>}
        {success && <div className="d1-success-banner" role="status"><span>✓</span> {success}</div>}

        <div className="d1-pricing-grid">
          <article className={`d1-plan-card ${user && plan === 'Free' ? 'd1-selected-plan' : ''}`}>
            <div className="d1-plan-top">
              <p className="d1-plan-label">THE ESSENTIALS</p>
              <h2>Free</h2>
              <p className="d1-plan-summary">Your space to explore, share and grow.</p>
              <p className="d1-plan-price"><span>₹0</span><small>/ forever</small></p>
            </div>
            <FeatureList features={freeFeatures} />
            <div className="d1-plan-cta">
              {user && plan === 'Free' ? <button className="d1-button d1-button-outline" type="button" disabled>✓ Your current plan</button> : (
                <Link className="d1-button d1-button-outline" to={user ? '/browse' : '/register'}>{user ? 'Explore community posts' : 'Get started free'} <span aria-hidden="true">→</span></Link>
              )}
              <p>No card details required.</p>
            </div>
          </article>

          <article className={`d1-plan-card d1-plan-featured ${user && plan === 'Paid' ? 'd1-selected-plan' : ''}`}>
            <div className="d1-featured-banner"><span>✦</span> MORE ROOM TO CREATE</div>
            <div className="d1-plan-top">
              <p className="d1-plan-label">FOR THE AMBITIOUS</p>
              <h2>Paid <span className="d1-premium-tag">PRO</span></h2>
              <p className="d1-plan-summary">Extra possibilities for your next big idea.</p>
              <p className="d1-plan-price"><span>₹499</span><small>/ month*</small></p>
            </div>
            <FeatureList features={paidFeatures} />
            <div className="d1-plan-cta">
              {paidButton()}
              <p>*Illustrative price. Demonstration upgrade only.</p>
            </div>
          </article>
        </div>

        <div className="d1-pricing-footer-note">
          <span aria-hidden="true">ⓘ</span>
          <p>All feature limits and prices shown here are illustrative for SIT313 Task D1. No real payment is taken, and these limits are not enforced by the demo.</p>
        </div>

        <div className="d1-pricing-bottom">
          <div><p className="d1-eyebrow">BUILT ON YOUR EXISTING PLATFORM</p><h2>Your workspace. More possibilities.</h2></div>
          <p>DEV@Deakin continues to include the P5 newsletter, authentication, portfolio and contact features, with session-aware membership and Firestore plan tracking added for D1.</p>
        </div>
      </div>
      {modalOpen && user && <UpgradeModal user={user} onClose={() => setModalOpen(false)} onSuccess={(message) => { setModalOpen(false); setSuccess(message); }} />}
    </main>
  );
}
