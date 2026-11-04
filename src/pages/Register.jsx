import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, deleteUser, signOut, updateProfile } from 'firebase/auth';
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/firebase.js';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const passwordStrong = form.password.length >= 8 && /[A-Z]/.test(form.password) && /[a-z]/.test(form.password) && /\d/.test(form.password);

  useEffect(() => { document.title = 'Create account | DEV@Deakin'; }, []);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    if (feedback.text) setFeedback({ type: '', text: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ type: '', text: '' });

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const cleanEmail = form.email.trim().toLowerCase();
    if (!firstName || !lastName) {
      setFeedback({ type: 'error', text: 'Enter both your first name and last name.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFeedback({ type: 'error', text: 'Enter a valid email address.' });
      return;
    }
    if (!passwordStrong) {
      setFeedback({ type: 'error', text: 'Use at least 8 characters, including uppercase, lowercase, and a number.' });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setFeedback({ type: 'error', text: 'The passwords do not match. Check both fields and try again.' });
      return;
    }
    if (!isFirebaseConfigured || !auth || !db) {
      setFeedback({ type: 'error', text: 'Firebase is not configured yet. Create your Firebase web app, enable Email/Password sign-in and Firestore, copy the values into .env, and restart the server.' });
      return;
    }

    setSubmitting(true);
    let createdUser = null;
    try {
      const credential = await createUserWithEmailAndPassword(auth, cleanEmail, form.password);
      createdUser = credential.user;
      await updateProfile(createdUser, { displayName: `${firstName} ${lastName}` });
      await setDoc(doc(db, 'users', createdUser.uid), {
        uid: createdUser.uid,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email: cleanEmail,
        plan: 'Free',
        createdAt: serverTimestamp(),
      });
      await signOut(auth);
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (error) {
      // If profile creation fails after Auth succeeds, attempt to avoid leaving an
      // account with no Firestore profile. Do not expose raw Firebase errors.
      if (createdUser) {
        try { await deleteDoc(doc(db, 'users', createdUser.uid)); } catch { /* the profile may not have been written */ }
        if (auth.currentUser?.uid === createdUser.uid) {
          try { await deleteUser(createdUser); } catch { /* handled by the friendly message below */ }
        }
      }
      const messages = {
        'auth/email-already-in-use': 'An account with this email already exists. Try logging in instead.',
        'auth/invalid-email': 'Enter a valid email address.',
        'auth/weak-password': 'Choose a stronger password with at least 8 characters.',
        'auth/operation-not-allowed': 'Email/password sign-in is not enabled in your Firebase Authentication settings.',
        'permission-denied': 'Firestore rejected the profile write. Check your Firestore security rules and try again.',
      };
      setFeedback({ type: 'error', text: messages[error.code] || 'We could not create your account. Check your Firebase setup and try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page register-page">
      <div className="auth-layout register-layout">
        <aside className="auth-aside register-aside">
          <p className="auth-overline"><span className="status-dot" /> A PLACE TO START</p>
          <h1>Your ideas<br />deserve a <span>home.</span></h1>
          <p className="auth-aside-copy">Create your account and get ready to share what you are learning, making, and discovering.</p>
          <div className="register-benefits">
            <p><span>01</span> Build your developer profile</p>
            <p><span>02</span> Keep your work connected</p>
            <p><span>03</span> Stay curious and keep growing</p>
          </div>
          <div className="auth-aside-bottom"><span className="aside-line" /><p>START WITH ONE SMALL STEP.</p></div>
          <span className="auth-decoration decoration-one" aria-hidden="true">+</span>
          <span className="auth-decoration decoration-two" aria-hidden="true">D</span>
        </aside>

        <section className="auth-card register-card" aria-labelledby="register-heading">
          <div className="auth-card-heading">
            <p className="eyebrow">GET STARTED — IT'S FREE</p>
            <h2 id="register-heading">Create your account</h2>
            <p>A few details and you're ready to go.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-name-grid">
              <div><label htmlFor="first-name">First name</label><input id="first-name" name="firstName" type="text" value={form.firstName} onChange={updateField} placeholder="First name" autoComplete="given-name" required /></div>
              <div><label htmlFor="last-name">Last name</label><input id="last-name" name="lastName" type="text" value={form.lastName} onChange={updateField} placeholder="Last name" autoComplete="family-name" required /></div>
            </div>

            <label htmlFor="register-email">Email address</label>
            <input id="register-email" name="email" type="email" value={form.email} onChange={updateField} placeholder="name@example.com" autoComplete="email" required />

            <label htmlFor="register-password">Create a password</label>
            <div className="password-input-wrap">
              <input id="register-password" name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={updateField} placeholder="At least 8 characters" autoComplete="new-password" required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
            <div className="password-strength" aria-live="polite"><span className={form.password.length ? 'strength-track has-value' : 'strength-track'}><i className={passwordStrong ? 'strong' : form.password.length >= 5 ? 'medium' : ''} /></span><small>{!form.password ? 'Use 8+ characters with upper- and lowercase letters and a number.' : passwordStrong ? 'Password meets the basic requirements.' : 'Add length, upper- and lowercase letters, and a number.'}</small></div>

            <label htmlFor="confirm-password">Confirm password</label>
            <input id="confirm-password" name="confirmPassword" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={updateField} placeholder="Re-enter your password" autoComplete="new-password" required />

            {feedback.text && <p className={`auth-feedback ${feedback.type}`} role="status">{feedback.text}</p>}
            <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'} <span aria-hidden="true">→</span></button>
          </form>

          <p className="auth-switch register-switch">Already have an account? <Link to="/login">Log in</Link></p>
          <p className="auth-legal">Your password should be unique to this account. Never reuse a password from another service.</p>
        </section>
      </div>
    </main>
  );
}
