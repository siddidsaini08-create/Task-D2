// The same basic checks run in the form and again in Express.
export function validatePost(input) {
  const data = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const errors = {};
  const postType = data.postType;
  const plan = data.plan;
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const questionDetails = typeof data.questionDetails === 'string' ? data.questionDetails.trim() : '';
  const abstract = typeof data.abstract === 'string' ? data.abstract.trim() : '';
  const articleText = typeof data.articleText === 'string' ? data.articleText.trim() : '';
  const tags = typeof data.tags === 'string'
    ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    : Array.isArray(data.tags)
      ? data.tags.map((tag) => typeof tag === 'string' ? tag.trim() : '').filter(Boolean)
      : [];

  if (!['Question', 'Article'].includes(postType)) errors.postType = 'Choose Question or Article.';
  if (!['Free', 'Paid'].includes(plan)) errors.plan = 'Choose Free or Paid.';
  if (title.length < 5 || title.length > 120) errors.title = 'Title must be 5–120 characters.';
  if (postType === 'Question' && (questionDetails.length < 20 || questionDetails.length > 3000)) {
    errors.questionDetails = 'Question must be 20–3,000 characters.';
  }
  if (postType === 'Article') {
    if (abstract.length < 20 || abstract.length > 500) errors.abstract = 'Abstract must be 20–500 characters.';
    if (articleText.length < 50 || articleText.length > 10000) errors.articleText = 'Article must be 50–10,000 characters.';
  }
  if (tags.length < 1 || tags.length > 3 || tags.some((tag) => tag.length < 2 || tag.length > 30)) {
    errors.tags = 'Use 1–3 tags, each 2–30 characters.';
  }
  if (new Set(tags.map((tag) => tag.toLowerCase())).size !== tags.length) {
    errors.tags = 'Do not repeat tags.';
  }
  return {
    errors,
    valid: Object.keys(errors).length === 0,
    post: { postType, plan, title, questionDetails, abstract, articleText, tags },
  };
}
