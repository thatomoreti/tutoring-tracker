const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getInvoices(learnerId) {
  const url = learnerId ? `${BASE_URL}/invoices?learner_id=${learnerId}` : `${BASE_URL}/invoices`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
}

export async function getInvoiceById(id) {
  const res = await fetch(`${BASE_URL}/invoices/${id}`);
  if (!res.ok) throw new Error('Failed to fetch invoice');
  return res.json();
}

export async function generateInvoice(data) {
  const res = await fetch(`${BASE_URL}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Failed to generate invoice');
  }
  return res.json();
}

export async function updateInvoiceStatus(id, status) {
  const res = await fetch(`${BASE_URL}/invoices/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update invoice status');
  return res.json();
}