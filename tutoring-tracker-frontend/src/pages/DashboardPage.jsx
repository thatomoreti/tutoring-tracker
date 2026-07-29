import { useState, useEffect } from 'react';
import { getDashboardStats } from '../api/reports';
import { usePageTitle } from '../hooks/usePageTitles';
export default function DashboardPage() {
    usePageTitle('Dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

 

  const cards = stats
    ? [
        { label: 'Active Learners', value: stats.active_learners },
        { label: 'Sessions This Month', value: stats.sessions_this_month },
        { label: 'Outstanding Balance', value: `R${Number(stats.outstanding_balance).toFixed(2)}` },
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8 pb-4 border-b-2 border-gold">
        <h1 className="text-3xl font-display font-bold text-ink">Dashboard</h1>
      </div>

      {error && <div className="bg-red-50 border-l-4 border-red-400 text-red-800 px-4 py-3 mb-6 text-sm">{error}</div>}

      {loading ? (
        <p className="text-slate/60 italic">Loading dashboard...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.label} className="bg-white border border-ink/10 rounded-sm shadow-sm p-6">
              <p className="text-xs uppercase tracking-wider font-semibold text-ink/50 mb-2">{card.label}</p>
              <p className="text-3xl font-display font-bold text-ink">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}