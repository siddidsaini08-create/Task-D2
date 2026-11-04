import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePost } from '../shared/postValidation.js';
import { publicPost, visiblePosts } from '../postAccess.js';

const article = {
  postType: 'Article', plan: 'Paid', title: 'Getting started with React',
  abstract: 'A short introduction to components and state.',
  articleText: 'React components help organize a frontend app. This article describes how state changes the interface.',
  questionDetails: '', tags: ['react', 'frontend'],
};

test('valid article and valid question can be published', () => {
  assert.equal(validatePost(article).valid, true);
  assert.equal(validatePost({ ...article, postType: 'Question', plan: 'Free', questionDetails: 'How do I use React state to update a form?' }).valid, true);
});

test('server rejects an invalid plan, short content, and too many tags', () => {
  const result = validatePost({ ...article, plan: 'VIP', articleText: 'abc', tags: ['a', 'b', 'c', 'd'] });
  assert.equal(result.valid, false);
  assert.ok(result.errors.plan && result.errors.articleText && result.errors.tags);
});

test('only paid members receive premium documents', () => {
  const all = [
    { id: 'free', plan: 'Free' },
    { id: 'premium', plan: 'Paid' },
    { id: 'legacy' },
  ];
  assert.deepEqual(visiblePosts(all, 'Free').map((item) => item.id), ['free', 'legacy']);
  assert.deepEqual(visiblePosts(all, 'Paid').map((item) => item.id), ['free', 'premium', 'legacy']);
});

test('backend sends only expected fields and treats old D1 posts as free', () => {
  const doc = publicPost('older', { authorId: 'private', title: 'Earlier post', body: 'Earlier body', internal: 'secret' });
  assert.equal(doc.plan, 'Free');
  assert.equal(doc.body, 'Earlier body');
  assert.equal(doc.authorId, undefined);
  assert.equal(doc.internal, undefined);
});
