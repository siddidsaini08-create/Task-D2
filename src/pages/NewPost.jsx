import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authHeaders, apiUrl } from '../api.js';
import { validatePost } from '../../shared/postValidation.js';

const EMPTY_FORM = {
  title: '',
  questionDetails: '',
  abstract: '',
  articleText: '',
  tags: ''
};

export default function NewPost() {
  const { user, checkingAuth } = useAuth();
  const [postType, setPostType] = useState('Question');
  const [plan, setPlan] = useState('Free');
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [dialog, setDialog] = useState(null);

  useEffect(() => { document.title = 'New Post | DEV@Deakin'; }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const changePostType = (type) => {
    setPostType(type);
    setErrors({});
    setDialog(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setDialog(null);
    if (!user) {
      setDialog({ type: 'error', title: 'Log in first', message: 'Please log in before publishing a post.' });
      return;
    }

    const result = validatePost({ ...form, postType, plan });
    setErrors(result.errors);
    if (!result.valid) {
      setDialog({ type: 'error', title: 'Check your post', message: 'Please correct the highlighted fields.' });
      return;
    }

    setSending(true);
    try {
      const response = await fetch(apiUrl('/api/posts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...await authHeaders(user) },
        body: JSON.stringify(result.post),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrors(data.errors || {});
        throw new Error(data.message || 'Could not publish your post.');
      }
      setForm(EMPTY_FORM);
      setDialog({ type: 'success', title: 'Post published', message: `Your ${postType.toLowerCase()} was saved. You can see it on Browse Posts.` });
    } catch (error) {
      setDialog({ type: 'error', title: 'Could not publish', message: error.message || 'Check the backend and try again.' });
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setPostType('Question');
    setPlan('Free');
    setErrors({});
    setDialog(null);
  };

  return (
    <main className="new-post-page">
      <div className="new-post-shell">
        <header className="new-post-heading">
          <p className="new-post-eyebrow"><span className="new-post-dot" /> DEV@DEAKIN COMMUNITY</p>
          <h1>Create a new <span>post.</span></h1>
          <p className="new-post-intro">
            Share something useful with the community. Ask a question or write an article to get the conversation started.
          </p>
        </header>

        <section className="new-post-card" aria-labelledby="post-form-heading">
          <div className="new-post-card-top">
            <h2 id="post-form-heading">Choose what you want to post</h2>
          </div>

          {!checkingAuth && !user && (
            <div className="post-login-notice">
              Please <Link to="/login" state={{ from: '/post' }}>log in</Link> before submitting a post.
            </div>
          )}
          <div className="post-type-switch" role="group" aria-label="Choose post type">
            <button
              className={`post-type-option ${postType === 'Question' ? 'selected' : ''}`}
              type="button"
              aria-pressed={postType === 'Question'}
              onClick={() => changePostType('Question')}
            >
              <span className="post-type-icon" aria-hidden="true">?</span>
              <span>Question</span>
              <span className="post-type-radio" aria-hidden="true" />
            </button>
            <button
              className={`post-type-option ${postType === 'Article' ? 'selected' : ''}`}
              type="button"
              aria-pressed={postType === 'Article'}
              onClick={() => changePostType('Article')}
            >
              <span className="post-type-icon article-icon" aria-hidden="true">✎</span>
              <span>Article</span>
              <span className="post-type-radio" aria-hidden="true" />
            </button>
          </div>

          <div className="post-plan-block">
            <h3>Post plan</h3>
            <div className="post-plan-options" role="group" aria-label="Post plan">
              <label className={plan === 'Free' ? 'chosen' : ''}>
                <input type="radio" name="plan" value="Free" checked={plan === 'Free'} onChange={() => setPlan('Free')} />
                Free <small>Everyone can read</small>
              </label>
              <label className={plan === 'Paid' ? 'chosen' : ''}>
                <input type="radio" name="plan" value="Paid" checked={plan === 'Paid'} onChange={() => setPlan('Paid')} />
                Paid <small>Paid members only</small>
              </label>
            </div>
          </div>
          <form className="new-post-form" onSubmit={handleSubmit} noValidate>
            <h3 className="post-form-title">{postType} details</h3>

            <div className="post-field">
              <label htmlFor="post-title">Title <span aria-hidden="true">*</span></label>
              <input
                id="post-title"
                name="title"
                type="text"
                value={form.title}
                onChange={updateField}
                maxLength={120}
                placeholder={postType === 'Question' ? 'What would you like to ask?' : 'Give your article a clear title'}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {errors.title && <p id="title-error" className="post-field-error">{errors.title}</p>}
            </div>

            {postType === 'Question' ? (
              <div className="post-field">
                <label htmlFor="question-details">Question details <span aria-hidden="true">*</span></label>
                <textarea
                  id="question-details"
                  name="questionDetails"
                  rows={6}
                  value={form.questionDetails}
                  onChange={updateField}
                  maxLength={3000}
                  placeholder="Describe your question..."
                  aria-invalid={Boolean(errors.questionDetails)}
                  aria-describedby={errors.questionDetails ? 'question-details-error' : undefined}
                />
                {errors.questionDetails && <p id="question-details-error" className="post-field-error">{errors.questionDetails}</p>}
              </div>
            ) : (
              <>
                <div className="post-field">
                  <label htmlFor="post-abstract">Abstract <span aria-hidden="true">*</span></label>
                  <textarea
                    id="post-abstract"
                    name="abstract"
                    rows={3}
                    value={form.abstract}
                    onChange={updateField}
                    maxLength={500}
                    placeholder="Write a short summary of your article..."
                    aria-invalid={Boolean(errors.abstract)}
                    aria-describedby={errors.abstract ? 'abstract-error' : undefined}
                  />
                  {errors.abstract && <p id="abstract-error" className="post-field-error">{errors.abstract}</p>}
                </div>
                <div className="post-field">
                  <label htmlFor="post-article-text">Article text <span aria-hidden="true">*</span></label>
                  <textarea
                    id="post-article-text"
                    name="articleText"
                    rows={8}
                    value={form.articleText}
                    onChange={updateField}
                    maxLength={10000}
                    placeholder="Write your article here..."
                    aria-invalid={Boolean(errors.articleText)}
                    aria-describedby={errors.articleText ? 'article-text-error' : undefined}
                  />
                  {errors.articleText && <p id="article-text-error" className="post-field-error">{errors.articleText}</p>}
                </div>
              </>
            )}

            <div className="post-field">
              <label htmlFor="post-tags">Tags <span aria-hidden="true">*</span></label>
              <input
                id="post-tags"
                name="tags"
                type="text"
                value={form.tags}
                onChange={updateField}
                placeholder="e.g. React, Firebase, JavaScript (up to 3)"
                aria-invalid={Boolean(errors.tags)}
                aria-describedby={errors.tags ? 'tags-error' : undefined}
              />
              {errors.tags && <p id="tags-error" className="post-field-error">{errors.tags}</p>}
            </div>

            <div className="post-form-bottom">
              <button className="post-reset-button" type="button" onClick={resetForm}>Clear form</button>
              <button className="post-submit-button" type="submit" disabled={sending || checkingAuth || !user}>
                {sending ? 'Publishing…' : 'Publish post'} <span aria-hidden="true">↗</span>
              </button>
            </div>
          </form>
        </section>
      </div>

      {dialog && (
        <div
          className="post-dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDialog(null);
          }}
        >
          <section className={`post-dialog ${dialog.type}`} role="dialog" aria-modal="true" aria-labelledby="post-dialog-title" aria-describedby="post-dialog-message">
            <span className={`post-dialog-symbol ${dialog.type}`} aria-hidden="true">{dialog.type === 'success' ? '✓' : '!'}</span>
            <h2 id="post-dialog-title">{dialog.title}</h2>
            <p id="post-dialog-message">{dialog.message}</p>
            <button type="button" className="post-dialog-close" autoFocus onClick={() => setDialog(null)}>Close</button>
          </section>
        </div>
      )}
    </main>
  );
}
