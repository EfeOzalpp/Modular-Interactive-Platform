const TUTORIAL_SEEN_KEY = 'rock-escapade:tutorial-seen:v1';

export function hasSeenRockEscapadeTutorial() {
  if (typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(TUTORIAL_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markRockEscapadeTutorialSeen() {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
  } catch {
  }
}
