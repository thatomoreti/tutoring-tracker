const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getLearners() {
  const res = await fetch(`${BASE_URL}/learners`);
  if (!res.ok) throw new Error('Failed to fetch learners');
  return res.json();
}

export async function createLearner(data) {
  const res = await fetch(`${BASE_URL}/learners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create learner');
  return res.json();
}

export async function updateLearner(id, data) {
  const res = await fetch(`${BASE_URL}/learners/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update learner');
  return res.json();
}

export async function deleteLearner(id) {
  const res = await fetch(`${BASE_URL}/learners/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete learner');
}