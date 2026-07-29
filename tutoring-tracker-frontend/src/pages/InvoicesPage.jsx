import { useState, useEffect } from 'react';
import { getInvoices, generateInvoice } from '../api/invoices';
import { usePageTitle } from '../hooks/usePageTitles';
import GenerateInvoiceForm from '../components/GenerateInvoiceForm';
import InvoiceModal from '../components/InvoiceModal';

export default function InvoicesPage() {
    usePageTitle('Invoices');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await getInvoices();
      setInvoices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleGenerate = async (formData) => {
    await generateInvoice(formData);
    setShowForm(false);
    loadInvoices();
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-end mb-8 pb-4 border-b-2 border-gold">
        <h1 className="text-3xl font-display font-bold text-ink">Invoices</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="bg-ink text-white px-5 py-2.5 rounded-sm hover:bg-ink/90 transition font-medium text-sm tracking-wide">
            + Generate Invoice
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 border-l-4 border-red-400 text-red-800 px-4 py-3 mb-6 text-sm">{error}</div>}

      {showForm && (
        <div className="mb-8">
          <GenerateInvoiceForm onSubmit={handleGenerate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {loading ? (
        <p className="text-slate/60 italic">Loading invoices...</p>
      ) : (
        <div className="bg-white border border-ink/10 rounded-sm overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-ink/10 bg-paper">
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Invoice #</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Learner</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Period</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Total</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.invoice_id}
                  onClick={() => setSelectedInvoiceId(inv.invoice_id)}
                  className="border-b border-ink/5 last:border-0 hover:bg-paper transition cursor-pointer"
                >
                  <td className="px-5 py-4 font-medium text-ink">{inv.invoice_number}</td>
                  <td className="px-5 py-4 text-sm">{inv.first_name} {inv.last_name}</td>
                  <td className="px-5 py-4 text-sm text-slate/70">{inv.period_start} – {inv.period_end}</td>
                  <td className="px-5 py-4 text-sm text-slate/70">R{Number(inv.total_amount).toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-semibold border rounded-sm -rotate-1 ${
                      inv.status === 'paid'
                        ? 'border-sage text-sage bg-sage/5'
                        : inv.status === 'partially_paid'
                        ? 'border-amber-400 text-amber-600 bg-amber-50'
                        : 'border-gray-300 text-gray-500 bg-gray-50'
                    }`}>
                      {inv.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-slate/40 italic">No invoices yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedInvoiceId && (
        <InvoiceModal
          invoiceId={selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
          onPaymentRecorded={loadInvoices}
        />
      )}
    </div>
  );
}