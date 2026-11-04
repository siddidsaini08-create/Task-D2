// Run on the backend only: never send paid content to a free browser.
export function visiblePosts(posts, userPlan) {
  return posts.filter((post) => {
    const postPlan = post.plan === 'Paid' ? 'Paid' : 'Free';
    return postPlan === 'Free' || userPlan === 'Paid';
  });
}

export function publicPost(id, data) {
  const date = data.createdAt?.toDate?.();
  const postType = data.postType === 'Question' ? 'Question' : 'Article';
  return {
    id,
    authorName: typeof data.authorName === 'string' ? data.authorName : 'Member',
    title: typeof data.title === 'string' ? data.title : 'Untitled',
    postType,
    plan: data.plan === 'Paid' ? 'Paid' : 'Free',
    body: typeof data.body === 'string' ? data.body : '',
    abstract: typeof data.abstract === 'string' ? data.abstract : '',
    tags: Array.isArray(data.tags) ? data.tags.filter((tag) => typeof tag === 'string').slice(0, 3) : [],
    createdAt: date ? date.toISOString() : null,
  };
}
