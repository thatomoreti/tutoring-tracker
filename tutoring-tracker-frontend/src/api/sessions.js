const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getSessions(learnerId) {
  const url = learnerId ? `${BASE_URL}/sessions?learner_id=${learnerId}` : `${BASE_URL}/sessions`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function createSession(data) {
  const res = await fetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create session');
  return res.json();
}

export async function updateSession(id, data) {
  const res = await fetch(`${BASE_URL}/sessions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update session');
  return res.json();
}

export async function deleteSession(id) {
  const res = await fetch(`${BASE_URL}/sessions/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete session');
}