import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(Boolean(auth));
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (!auth || !db) {
      setCheckingAuth(false);
      setCheckingProfile(false);
      return undefined;
    }

    let stopProfile = () => {};
    const legacyUpdated = new Set();

    const stopAuth = onAuthStateChanged(auth, (nextUser) => {
      stopProfile();
      stopProfile = () => {};
      setUser(nextUser);
      setProfile(null);
      setProfileError('');
      setCheckingAuth(false);

      if (!nextUser) {
        setCheckingProfile(false);
        return;
      }

      setCheckingProfile(true);
      const profileRef = doc(db, 'users', nextUser.uid);
      stopProfile = onSnapshot(profileRef, (snapshot) => {
        const data = snapshot.exists() ? snapshot.data() : null;
        setProfile(data);
        setCheckingProfile(false);
        setProfileError('');

        // P5 profiles did not contain a plan. Backfill only the initial Free
        // value (one time per login). Firestore rules prohibit client upgrades.
        if (data && !Object.hasOwn(data, 'plan') && !legacyUpdated.has(nextUser.uid)) {
          legacyUpdated.add(nextUser.uid);
          updateDoc(profileRef, { plan: 'Free', updatedAt: serverTimestamp() })
            .catch((error) => console.warn('Could not initialise the legacy Free plan. Deploy D1 Firestore rules.', error));
        }
      }, (error) => {
        console.error('Unable to load Firestore user profile:', error);
        setCheckingProfile(false);
        setProfileError('Your account profile could not be loaded. Check Firestore rules and connectivity.');
      });
    }, (error) => {
      console.error('Firebase authentication state error:', error);
      setUser(null);
      setProfile(null);
      setCheckingAuth(false);
      setCheckingProfile(false);
      setProfileError('Could not check your sign-in state.');
    });

    return () => { stopProfile(); stopAuth(); };
  }, []);

  const value = useMemo(() => ({
    user,
    profile,
    plan: profile?.plan === 'Paid' ? 'Paid' : 'Free',
    checkingAuth,
    checkingProfile,
    profileError,
  }), [user, profile, checkingAuth, checkingProfile, profileError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
