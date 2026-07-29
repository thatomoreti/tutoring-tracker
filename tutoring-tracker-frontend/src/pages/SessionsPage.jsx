import { useState, useEffect } from 'react';
import { getSessions, createSession, updateSession, deleteSession } from '../api/sessions';
import { usePageTitle } from '../hooks/usePageTitles';
import SessionForm from '../components/SessionForm';

function formatDuration(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins} min`;
  if (mins === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
  return `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} min`;
}

export default function SessionsPage() {
  usePageTitle('Sessions');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await getSessions();
      setSessions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleAdd = () => {
    setEditingSession(null);
    setShowForm(true);
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setShowForm(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingSession) {
        await updateSession(editingSession.session_id, formData);
      } else {
        await createSession(formData);
      }
      setShowForm(false);
      setEditingSession(null);
      loadSessions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session? This cannot be undone.')) return;
    try {
      await deleteSession(id);
      loadSessions();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-end mb-8 pb-4 border-b-2 border-gold">
        <h1 className="text-3xl font-display font-bold text-ink">Sessions</h1>
        {!showForm && (
          <button
            onClick={handleAdd}
            className="bg-ink text-white px-5 py-2.5 rounded-sm hover:bg-ink/90 transition font-medium text-sm tracking-wide"
          >
            + Log Session
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-800 px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-8">
          <SessionForm
            key={editingSession?.session_id ?? 'new'}
            initialData={editingSession}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingSession(null); }}
          />
        </div>
      )}

      {loading ? (
        <p className="text-slate/60 italic">Loading sessions...</p>
      ) : (
        <div className="bg-white border border-ink/10 rounded-sm overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-ink/10 bg-paper">
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Learner</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Subject</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Date</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Duration</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Attended</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.session_id} className="border-b border-ink/5 last:border-0 hover:bg-paper transition">
                  <td className="px-5 py-4 font-medium text-ink">{s.first_name} {s.last_name}</td>
                  <td className="px-5 py-4 text-sm">{s.subject_name}</td>
                  <td className="px-5 py-4 text-sm text-slate/70">{new Date(s.session_date).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-sm text-slate/70">{formatDuration(s.duration_minutes)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-semibold border rounded-sm -rotate-1 ${
                      s.attended
                        ? 'border-sage text-sage bg-sage/5'
                        : 'border-red-300 text-red-500 bg-red-50'
                    }`}>
                      {s.attended ? 'YES' : 'NO'}
                    </span>
                  </td>
                  <td className="px-5 py-4 space-x-4 text-sm">
                    <button onClick={() => handleEdit(s)} className="text-ink hover:text-gold font-medium transition">Edit</button>
                    <button onClick={() => handleDelete(s.session_id)} className="text-red-700/70 hover:text-red-700 font-medium transition">Delete</button>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-slate/40 italic">
                    No sessions logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}