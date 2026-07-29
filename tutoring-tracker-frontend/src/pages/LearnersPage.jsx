import { useState, useEffect } from 'react';
import { getLearners, createLearner, updateLearner, deleteLearner } from '../api/learners';
import { usePageTitle } from '../hooks/usePageTitles';
import LearnerForm from '../components/LearnerForm';

export default function LearnersPage() {
  usePageTitle('Learners');
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLearner, setEditingLearner] = useState(null);

  const loadLearners = async () => {
    try {
      setLoading(true);
      const data = await getLearners();
      setLearners(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLearners();
  }, []);

  const handleAdd = () => {
    setEditingLearner(null);
    setShowForm(true);
  };

  const handleEdit = (learner) => {
    setEditingLearner(learner);
    setShowForm(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingLearner) {
        await updateLearner(editingLearner.learner_id, formData);
      } else {
        await createLearner(formData);
      }
      setShowForm(false);
      setEditingLearner(null);
      loadLearners();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this learner? This cannot be undone.')) return;
    try {
      await deleteLearner(id);
      loadLearners();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-end mb-8 pb-4 border-b-2 border-gold">
        <h1 className="text-3xl font-display font-bold text-ink">Learners</h1>
        {!showForm && (
          <button
            onClick={handleAdd}
            className="bg-ink text-white px-5 py-2.5 rounded-sm hover:bg-ink/90 transition font-medium text-sm tracking-wide"
          >
            + Add Learner
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
          <LearnerForm
            key={editingLearner?.learner_id ?? 'new'}
            initialData={editingLearner}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingLearner(null); }}
          />
        </div>
      )}

      {loading ? (
        <p className="text-slate/60 italic">Loading learners...</p>
      ) : (
        <div className="bg-white border border-ink/10 rounded-sm overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-ink/10 bg-paper">
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Name</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Grade</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Status</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Start Date</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Actions</th>
              </tr>
            </thead>
            <tbody>
              {learners.map((l) => (
                <tr key={l.learner_id} className="border-b border-ink/5 last:border-0 hover:bg-paper transition">
                  <td className="px-5 py-4 font-medium text-ink">{l.first_name} {l.last_name}</td>
                  <td className="px-5 py-4 text-sm">{l.grade_level || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-semibold border rounded-sm -rotate-1 ${
                      l.status === 'active'
                        ? 'border-sage text-sage bg-sage/5'
                        : 'border-gray-300 text-gray-400 bg-gray-50'
                    }`}>
                      {l.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate/70">{new Date(l.start_date).toLocaleDateString()}</td>
                  <td className="px-5 py-4 space-x-4 text-sm">
                    <button onClick={() => handleEdit(l)} className="text-ink hover:text-gold font-medium transition">Edit</button>
                    <button onClick={() => handleDelete(l.learner_id)} className="text-red-700/70 hover:text-red-700 font-medium transition">Delete</button>
                  </td>
                </tr>
              ))}
              {learners.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-slate/40 italic">
                    No learners yet — add your first one to get started.
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