const DRAFT_KEY = 'review_draft';

export const saveReviewDraft = (draft) => {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
};

export const loadReviewDraft = () => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearReviewDraft = () => sessionStorage.removeItem(DRAFT_KEY);
