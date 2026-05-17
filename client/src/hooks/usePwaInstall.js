import { useEffect, useState, useCallback } from 'react';

// Module-scoped — the browser fires beforeinstallprompt at most once per page
// load, so we cache the event globally and let any hook consumer access it.
let cachedPrompt = null;
const listeners = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    cachedPrompt = e;
    listeners.forEach((cb) => cb(e));
  });

  window.addEventListener('appinstalled', () => {
    cachedPrompt = null;
    listeners.forEach((cb) => cb(null));
  });
}

export function usePwaInstall() {
  const [prompt, setPrompt] = useState(cachedPrompt);

  useEffect(() => {
    listeners.add(setPrompt);
    return () => listeners.delete(setPrompt);
  }, []);

  const install = useCallback(async () => {
    if (!prompt) {
      // Fallback: show platform-specific instructions when the browser hasn't
      // fired beforeinstallprompt (iOS Safari never does, for example).
      alert(
        "To install ShopTracker Pro:\n\n" +
        "• Desktop Chrome/Edge — click the install icon in the URL bar.\n" +
        "• iOS Safari — tap the Share icon, then 'Add to Home Screen'.\n" +
        "• Android Chrome — open the 3-dot menu, then 'Add to Home screen'."
      );
      return { outcome: 'unavailable' };
    }
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      cachedPrompt = null;
      setPrompt(null);
    }
    return { outcome };
  }, [prompt]);

  return { canInstall: !!prompt, install };
}
