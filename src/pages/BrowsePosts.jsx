import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiUrl, authHeaders } from '../api.js';

const emptyFilters = { type: 'All', plan: 'All', tag: 'All', date: '', query: '' };

export default function BrowsePosts() {
  const { user, plan, checkingAuth } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [hidden, setHidden] = useState([]);
  const [resetCount, setResetCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessPlan, setAccessPlan] = useState('Free');

  useEffect(() => { document.title = 'Browse Posts | DEV@Deakin'; }, []);
  useEffect(() => {
    if (checkingAuth) return;
    const controller = new AbortController();
    async function loadPosts() {
      setLoading(true);
      setError('');
      setPosts([]); // Avoid showing posts from a previous user while switching accounts.
      try {
        const response = await fetch(apiUrl('/api/posts'), {
          headers: await authHeaders(user),
          signal: controller.signal,
          cache: 'no-store',
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Unable to load posts.');
        if (!controller.signal.aborted) {
          setAccessPlan(result.plan);
          setPosts(result.posts);
          setHidden([]);
          setFilters(emptyFilters);
          setResetCount((count) => count + 1);
        }
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure.message || 'Could not connect to the backend.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadPosts();
    return () => controller.abort();
  }, [user, plan, checkingAuth]);

  const tags = useMemo(() => [...new Set(posts.flatMap((post) => post.tags || []))].sort(), [posts]);
  const shownPosts = posts.filter((post) => {
    if (hidden.includes(post.id)) return false;
    if (filters.type !== 'All' && post.postType !== filters.type) return false;
    if (filters.plan !== 'All' && post.plan !== filters.plan) return false;
    if (filters.tag !== 'All' && !(post.tags || []).includes(filters.tag)) return false;
    if (filters.date && post.createdAt?.slice(0, 10) !== filters.date) return false;
    const search = filters.query.trim().toLowerCase();
    if (search && !`${post.title} ${post.body} ${(post.tags || []).join(' ')}`.toLowerCase().includes(search)) return false;
    return true;
  });

  function reset() {
    setFilters(emptyFilters);
    setHidden([]);
    setResetCount((count) => count + 1);
  }
  function update(name, value) { setFilters((current) => ({ ...current, [name]: value })); }

  return (
    <main className="browse-page">
      <div className="browse-shell">
        <div className="browse-heading">
          <div>
            <p className="browse-eyebrow">DEV@DEAKIN / COMMUNITY</p>
            <h1>Browse posts</h1>
            <p>Read questions and articles shared by the community.</p>
          </div>
          <Link className="browse-create" to="/post">+ Create a post</Link>
        </div>

        <div className="browse-access">
          <div><strong>{!user ? 'Guest access' : `${accessPlan} member`}</strong>
            <p>{!user || accessPlan !== 'Paid' ? 'Showing free posts only.' : 'Showing free and paid posts.'}</p>
          </div>
          {accessPlan !== 'Paid' && <Link to={user ? '/pricing' : '/login'}>{user ? 'View Paid plan →' : 'Log in →'}</Link>}
        </div>

        <section className="browse-filters" aria-label="Filter posts">
          <div className="browse-filter-title"><h2>Filters</h2><button type="button" onClick={reset}>Reset all</button></div>
          <div className="browse-filter-grid">
            <label>Search<input type="search" placeholder="Search posts" value={filters.query} onChange={(e) => update('query', e.target.value)} /></label>
            <label>Post type<select value={filters.type} onChange={(e) => update('type', e.target.value)}><option>All</option><option>Question</option><option>Article</option></select></label>
            <label>Post plan<select value={filters.plan} onChange={(e) => update('plan', e.target.value)}><option>All</option><option>Free</option><option>Paid</option></select></label>
            <label>Tag<select value={filters.tag} onChange={(e) => update('tag', e.target.value)}><option>All</option>{tags.map((tag) => <option key={tag}>{tag}</option>)}</select></label>
            <label>Created date<input type="date" value={filters.date} onChange={(e) => update('date', e.target.value)} /></label>
          </div>
        </section>

        <div className="browse-results-bar"><h2>Community posts</h2><span>{loading ? 'Loading…' : `${shownPosts.length} shown`}</span></div>
        {loading && <p className="browse-empty" role="status">Loading posts from Firestore…</p>}
        {error && <div className="browse-error" role="alert">{error}<p>Check the Express backend and Firebase Admin setup.</p></div>}
        {!loading && !error && shownPosts.length === 0 && (
          <div className="browse-empty">No matching posts. Try another filter or <button type="button" onClick={reset}>reset the list</button>.</div>
        )}
        <div className="browse-list" key={resetCount}>
          {!loading && shownPosts.map((post) => (
            <article className="browse-card" key={post.id}>
              <div className="browse-card-meta"><span className="browse-pill">{post.postType}</span><span className={`browse-pill ${post.plan === 'Paid' ? 'is-paid' : ''}`}>{post.plan}</span><span>{post.authorName}</span><time dateTime={post.createdAt || undefined}>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently'}</time></div>
              <h3>{post.title}</h3>
              <p className="browse-preview">{(post.abstract || post.body || '').slice(0, 170)}{(post.abstract || post.body || '').length > 170 ? '…' : ''}</p>
              <div className="browse-tags">{(post.tags || []).map((tag) => <span key={tag}>#{tag}</span>)}</div>
              <div className="browse-card-actions">
                <details>
                  <summary>Read full post</summary>
                  {post.abstract && <p className="browse-abstract"><strong>Abstract:</strong> {post.abstract}</p>}
                  <p className="browse-full-text">{post.body}</p>
                </details>
                <button type="button" onClick={() => setHidden((current) => [...current, post.id])}>Hide post</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
