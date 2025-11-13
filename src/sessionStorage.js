// src/sessionStorage.js

const STORAGE_KEY = "oreos-hifi-sessions";

function loadSessionsMap() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveSessionsMap(map) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function saveSession(partial) {
  if (!partial.id) return;

  const sessions = loadSessionsMap();
  const existing = sessions[partial.id] || {};

  const merged = {
    ...existing,
    ...partial,
  };

  // Default metadata
  if (!merged.createdAt) {
    merged.createdAt = new Date().toISOString();
  }
  if (!merged.title) {
    merged.title = partial.originalFileName || partial.id;
  }
  if (!merged.subtitle) {
    const d = new Date(merged.createdAt);
    merged.subtitle = d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  sessions[partial.id] = merged;
  saveSessionsMap(sessions);
}

export function getSession(id) {
  const sessions = loadSessionsMap();
  return sessions[id];
}

export function getSessionList() {
  const sessions = loadSessionsMap();
  return Object.values(sessions).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}
