import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getBalances, getRevenueByMonth, getAttendanceSummary } from '../api/reports';

export default function ReportsPage() {
  const [balances, setBalances] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getBalances(), getRevenueByMonth(), getAttendanceSummary()])
      .then(([b, r, a]) => {
        setBalances(b);
        setRevenue(r.map((row) => ({ ...row, total: Number(row.total) })));
        setAttendance(a);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8 pb-4 border-b-2 border-gold">
        <h1 className="text-3xl font-display font-bold text-ink">Reports</h1>
      </div>

      {error && <div className="bg-red-50 border-l-4 border-red-400 text-red-800 px-4 py-3 mb-6 text-sm">{error}</div>}

      {loading ? (
        <p className="text-slate/60 italic">Loading reports...</p>
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="text-lg font-display font-bold text-ink mb-4">Revenue Over Time</h2>
            <div className="bg-white border border-ink/10 rounded-sm shadow-sm p-6 h-72">
              {revenue.length === 0 ? (
                <p className="text-slate/40 italic text-sm">No payments recorded yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2A4A" strokeOpacity={0.08} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#3D4451' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#3D4451' }} />
                    <Tooltip formatter={(value) => [`R${value.toFixed(2)}`, 'Revenue']} />
                    <Line type="monotone" dataKey="total" stroke="#C9A24B" strokeWidth={2} dot={{ fill: '#1E2A4A' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-ink mb-4">Attendance Summary</h2>
            <div className="bg-white border border-ink/10 rounded-sm overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-ink/10 bg-paper">
                    <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Learner</th>
                    <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Total Sessions</th>
                    <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Attended</th>
                    <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a) => (
                    <tr key={a.learner_id} className="border-b border-ink/5 last:border-0 hover:bg-paper transition">
                      <td className="px-5 py-4 font-medium text-ink">{a.first_name} {a.last_name}</td>
                      <td className="px-5 py-4 text-sm">{a.total_sessions}</td>
                      <td className="px-5 py-4 text-sm">{a.attended_sessions}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold border rounded-sm -rotate-1 ${
                          a.attendance_rate >= 80
                            ? 'border-sage text-sage bg-sage/5'
                            : a.attendance_rate >= 50
                            ? 'border-amber-400 text-amber-600 bg-amber-50'
                            : 'border-red-300 text-red-500 bg-red-50'
                        }`}>
                          {a.attendance_rate ?? 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {attendance.length === 0 && (
                    <tr><td colSpan="4" className="px-5 py-12 text-center text-slate/40 italic">No data yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-ink mb-4">Outstanding Balances</h2>
            <div className="bg-white border border-ink/10 rounded-sm overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-ink/10 bg-paper">
                    <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Learner</th>
                    <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Invoiced</th>
                    <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Paid</th>
                    <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((b) => (
                    <tr key={b.learner_id} className="border-b border-ink/5 last:border-0 hover:bg-paper transition">
                      <td className="px-5 py-4 font-medium text-ink">{b.first_name} {b.last_name}</td>
                      <td className="px-5 py-4 text-sm">R{Number(b.total_invoiced).toFixed(2)}</td>
                      <td className="px-5 py-4 text-sm text-sage">R{Number(b.total_paid).toFixed(2)}</td>
                      <td className={`px-5 py-4 text-sm font-semibold ${Number(b.balance) > 0 ? 'text-red-600' : 'text-ink'}`}>
                        R{Number(b.balance).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {balances.length === 0 && (
                    <tr><td colSpan="4" className="px-5 py-12 text-center text-slate/40 italic">No data yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}