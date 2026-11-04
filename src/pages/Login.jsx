import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/firebase.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { document.title = 'Log in | DEV@Deakin'; }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ type: '', text: '' });

    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFeedback({ type: 'error', text: 'Enter a valid email address to continue.' });
      return;
    }
    if (!password) {
      setFeedback({ type: 'error', text: 'Enter your password to continue.' });
      return;
    }
    if (!isFirebaseConfigured || !auth) {
      setFeedback({ type: 'error', text: 'Firebase is not configured yet. Copy your existing P4 Firebase settings into .env, then restart the development server.' });
      return;
    }

    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      navigate(['/pricing', '/post', '/browse'].includes(location.state?.from) ? location.state.from : '/', { replace: true });
    } catch (error) {
      const messages = {
        'auth/invalid-credential': 'The email or password is incorrect. Try again or create a free account.',
        'auth/user-not-found': 'No account was found for that email. Create a free account to get started.',
        'auth/wrong-password': 'The email or password is incorrect. Try again or create a free account.',
        'auth/too-many-requests': 'Too many attempts. Please wait a little while and try again.',
        'auth/invalid-email': 'Enter a valid email address to continue.',
      };
      setFeedback({ type: 'error', text: messages[error.code] || 'We could not sign you in. Check your details and try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Google sign-in uses the same Firebase project as email/password login.
  const handleGoogleSignIn = async () => {
    setFeedback({ type: '', text: '' });
    if (!isFirebaseConfigured || !auth || !db) {
      setFeedback({ type: 'error', text: 'Connect your P4 Firebase project in the .env file first.' });
      return;
    }

    setSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const user = credential.user;

      // Register a Firestore profile only if this Google account is new.
      // Existing users keep their current profile data.
      try {
        const userRef = doc(db, 'users', user.uid);
        const savedUser = await getDoc(userRef);
        if (!savedUser.exists()) {
          const fullName = (user.displayName || '').trim();
          const [firstName = '', ...surnameParts] = fullName.split(/\s+/);
          await setDoc(userRef, {
            uid: user.uid,
            firstName,
            lastName: surnameParts.join(' '),
            fullName,
            email: user.email || '',
            plan: 'Free',
            createdAt: serverTimestamp(),
          });
        }
      } catch (profileError) {
        console.error('Google sign-in succeeded, but the user profile could not be saved:', profileError);
        setFeedback({ type: 'error', text: 'Google sign-in worked, but the user profile could not be saved to Firestore. Check the Firestore rules.' });
        return;
      }

      navigate(['/pricing', '/post', '/browse'].includes(location.state?.from) ? location.state.from : '/', { replace: true });
    } catch (error) {
      const messages = {
        'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
        'auth/cancelled-popup-request': 'Google sign-in was cancelled.',
        'auth/popup-blocked': 'Your browser blocked the Google window. Allow pop-ups and try again.',
        'auth/unauthorized-domain': 'Add localhost to Firebase Authentication authorised domains.',
        'auth/operation-not-allowed': 'Enable Google in Firebase Authentication > Sign-in method.',
        'auth/account-exists-with-different-credential': 'This email uses a different sign-in method. Log in with your email and password instead.',
      };
      setFeedback({ type: 'error', text: messages[error.code] || 'Google sign-in failed. Check your Firebase settings and try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFeedback({ type: 'error', text: 'Enter your email address above before requesting a password reset.' });
      return;
    }
    if (!isFirebaseConfigured || !auth) {
      setFeedback({ type: 'error', text: 'Password recovery will work after Firebase is configured in .env.' });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setFeedback({ type: 'info', text: 'If an account exists for this email, a password reset email has been sent.' });
    } catch {
      setFeedback({ type: 'error', text: 'We could not send a reset email. Check the address and Firebase email settings.' });
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <aside className="auth-aside login-aside">
          <p className="auth-overline"><span className="status-dot" /> YOUR NEXT CHAPTER STARTS HERE</p>
          <h1>Good to<br />have you <span>back.</span></h1>
          <p className="auth-aside-copy">Sign in to continue your journey. Your ideas, projects, and community are only a step away.</p>
          <div className="auth-aside-bottom"><span className="aside-line" /><p>MAKE SOMETHING MEANINGFUL.</p></div>
          <span className="auth-decoration decoration-one" aria-hidden="true">S</span>
          <span className="auth-decoration decoration-two" aria-hidden="true">+</span>
        </aside>

        <section className="auth-card" aria-labelledby="login-heading">
          <div className="auth-card-heading">
            {location.state?.registered && <p className="auth-feedback info" role="status">Account created successfully. Please log in.</p>}
            <p className="eyebrow">WELCOME BACK</p>
            <h2 id="login-heading">Log in to your account</h2>
            <p>Enter your details below to continue.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="login-email">Email address</label>
            <input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" autoComplete="email" required />

            <div className="field-label-row"><label htmlFor="login-password">Password</label><button type="button" className="text-button" onClick={handlePasswordReset}>Forgot password?</button></div>
            <div className="password-input-wrap">
              <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>

            {feedback.text && <p className={`auth-feedback ${feedback.type}`} role="status">{feedback.text}</p>}
            <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Log in'} <span aria-hidden="true">→</span></button>
          </form>

          <div className="google-login-divider"><span /> <p>OR</p> <span /></div>
          <button type="button" className="google-login-button" onClick={handleGoogleSignIn} disabled={submitting}>
            <span className="google-login-icon" aria-hidden="true">G</span>
            {submitting ? 'Please wait…' : 'Continue with Google'}
          </button>

          <div className="auth-divider"><span /> <p>NEW AROUND HERE?</p> <span /></div>
          <p className="auth-switch">Don't have an account? <Link to="/register">Create one for free</Link></p>
          <p className="auth-legal">By continuing, you agree to use this platform respectfully and responsibly.</p>
        </section>
      </div>
    </main>
  );
}
