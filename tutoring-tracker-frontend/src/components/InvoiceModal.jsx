import { useState, useEffect } from 'react';
import { getInvoiceById } from '../api/invoices';
import { createPayment } from '../api/payments';

function validatePayment(form, invoice) {
  const errors = {};
  const remaining = invoice.total_amount - (invoice.total_paid || 0);

  if (!form.amount) {
    errors.amount = 'Amount is required';
  } else {
    const amt = Number(form.amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      errors.amount = 'Amount must be greater than 0';
    } else if (amt > remaining) {
      errors.amount = `Amount cannot exceed the outstanding balance (R${remaining.toFixed(2)})`;
    }
  }

  if (!form.payment_date) {
    errors.payment_date = 'Payment date is required';
  } else {
    const today = new Date().toISOString().slice(0, 10);
    if (form.payment_date > today) {
      errors.payment_date = 'Payment date cannot be in the future';
    } else if (form.payment_date < invoice.issued_date?.slice(0, 10)) {
      errors.payment_date = "Payment date can't be before the invoice was issued";
    }
  }

  if (!form.payment_method) errors.payment_method = 'Please select a payment method';

  if (form.reference_number && form.reference_number.length > 50) {
    errors.reference_number = 'Reference number must be under 50 characters';
  }

  return errors;
}

export default function InvoiceModal({ invoiceId, onClose, onPaymentRecorded }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    amount: '',
    payment_date: new Date().toISOString().slice(0, 10),
    payment_method: '',
    reference_number: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const loadInvoice = async () => {
    setLoading(true);
    const data = await getInvoiceById(invoiceId);
    setInvoice(data);
    setLoading(false);
  };

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined });
    setServerError(null);
  };

  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
    setForm({ ...form, amount: value });
    if (errors.amount) setErrors({ ...errors, amount: undefined });
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    const validationErrors = validatePayment(form, invoice);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      await createPayment({
        invoice_id: invoice.invoice_id,
        learner_id: invoice.learner_id,
        amount: Number(form.amount),
        payment_date: form.payment_date,
        payment_method: form.payment_method,
        reference_number: form.reference_number.trim() || undefined,
      });
      await loadInvoice();
      setForm({ amount: '', payment_date: new Date().toISOString().slice(0, 10), payment_method: '', reference_number: '' });
      onPaymentRecorded?.();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full border-b-2 px-1 py-2 bg-transparent focus:outline-none transition ${
      errors[field] ? 'border-red-400 focus:border-red-500' : 'border-ink/15 focus:border-gold'
    }`;
  const labelClass = 'block text-xs uppercase tracking-wider font-semibold text-ink/60 mb-1.5';

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-sm shadow-lg max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {loading || !invoice ? (
          <p className="p-8 text-slate/60 italic">Loading invoice...</p>
        ) : (
          <div className="p-8">
            <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gold">
              <div>
                <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-1">{invoice.invoice_number}</p>
                <h2 className="text-2xl font-display font-bold text-ink">{invoice.first_name} {invoice.last_name}</h2>
              </div>
              <span className={`inline-block px-2.5 py-1 text-xs font-semibold border rounded-sm -rotate-1 ${
                invoice.status === 'paid'
                  ? 'border-sage text-sage bg-sage/5'
                  : invoice.status === 'partially_paid'
                  ? 'border-amber-400 text-amber-600 bg-amber-50'
                  : 'border-gray-300 text-gray-500 bg-gray-50'
              }`}>
                {invoice.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider font-semibold text-ink/60 mb-2">Line Items</p>
              <div className="border border-ink/10 rounded-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-paper border-b border-ink/10">
                      <th className="px-3 py-2 text-left text-xs uppercase text-ink/60">Description</th>
                      <th className="px-3 py-2 text-right text-xs uppercase text-ink/60">Hours</th>
                      <th className="px-3 py-2 text-right text-xs uppercase text-ink/60">Rate</th>
                      <th className="px-3 py-2 text-right text-xs uppercase text-ink/60">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.line_items.map((li) => (
                      <tr key={li.line_item_id} className="border-b border-ink/5 last:border-0">
                        <td className="px-3 py-2">{li.description}</td>
                        <td className="px-3 py-2 text-right">{li.quantity}</td>
                        <td className="px-3 py-2 text-right">R{Number(li.unit_price).toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">R{Number(li.line_total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-6 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate/60">Total</span><span className="font-semibold text-ink">R{Number(invoice.total_amount).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-slate/60">Paid</span><span className="text-sage font-semibold">R{Number(invoice.total_paid || 0).toFixed(2)}</span></div>
              <div className="flex justify-between border-t border-ink/10 pt-1"><span className="text-slate/60">Balance</span><span className="font-bold text-ink">R{(invoice.total_amount - (invoice.total_paid || 0)).toFixed(2)}</span></div>
            </div>

            {invoice.status !== 'paid' && (
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-ink/60 mb-3">Record a Payment</p>
                {serverError && <div className="bg-red-50 border-l-4 border-red-400 text-red-800 px-4 py-2 mb-4 text-sm">{serverError}</div>}
                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div>
                    <label className={labelClass}>Amount</label>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-slate/50">R</span>
                      <input name="amount" inputMode="decimal" value={form.amount} onChange={handleAmountChange} className={`${inputClass('amount')} max-w-[140px]`} />
                    </div>
                    {errors.amount && <p className="text-red-600 text-xs mt-1.5">{errors.amount}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Payment Date</label>
                    <input type="date" name="payment_date" max={new Date().toISOString().slice(0, 10)} min={invoice.issued_date?.slice(0, 10)} value={form.payment_date} onChange={handleChange} className={inputClass('payment_date')} />
                    {errors.payment_date && <p className="text-red-600 text-xs mt-1.5">{errors.payment_date}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Payment Method</label>
                    <select name="payment_method" value={form.payment_method} onChange={handleChange} className={inputClass('payment_method')}>
                      <option value="">Select method...</option>
                      <option value="cash">Cash</option>
                      <option value="eft">EFT</option>
                      <option value="card">Card</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.payment_method && <p className="text-red-600 text-xs mt-1.5">{errors.payment_method}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Reference Number (optional)</label>
                    <input name="reference_number" value={form.reference_number} onChange={handleChange} maxLength={50} className={inputClass('reference_number')} />
                    {errors.reference_number && <p className="text-red-600 text-xs mt-1.5">{errors.reference_number}</p>}
                  </div>

                  <button type="submit" disabled={submitting} className="bg-ink text-white px-5 py-2.5 rounded-sm hover:bg-gold transition font-medium text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed">
                    {submitting ? 'Recording...' : 'Record Payment'}
                  </button>
                </form>
              </div>
            )}

            <button onClick={onClose} className="mt-6 text-slate/60 hover:text-ink text-sm font-medium transition">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}