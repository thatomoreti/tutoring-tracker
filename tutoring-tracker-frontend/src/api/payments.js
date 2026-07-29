const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function createPayment(data) {
  const res = await fetch(`${BASE_URL}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Failed to record payment');
  }
  return res.json();
}

export async function getPayments(invoiceId) {
  const url = invoiceId ? `${BASE_URL}/payments?invoice_id=${invoiceId}` : `${BASE_URL}/payments`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
}