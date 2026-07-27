const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getSubjects() {
  const res = await fetch(`${BASE_URL}/subjects`);
  if (!res.ok) throw new Error('Failed to fetch subjects');
  return res.json();
}

export async function createSubject(data) {
  const res = await fetch(`${BASE_URL}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create subject');
  return res.json();
}

export async function updateSubject(id, data) {
  const res = await fetch(`${BASE_URL}/subjects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update subject');
  return res.json();
}

export async function deleteSubject(id) {
  const res = await fetch(`${BASE_URL}/subjects/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete subject');
}