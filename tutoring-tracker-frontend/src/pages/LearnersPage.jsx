import { useState, useEffect } from 'react';
import { getLearners, createLearner, updateLearner, deleteLearner } from '../api/learners';
import LearnerForm from '../components/LearnerForm';

export default function LearnersPage() {
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Learners</h1>
        {!showForm && (
          <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
            + Add Learner
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-md mb-4">{error}</div>}

      {showForm && (
        <div className="mb-6">
<LearnerForm
  key={editingLearner?.learner_id ?? 'new'}
  initialData={editingLearner}
  onSubmit={handleSubmit}
  onCancel={() => { setShowForm(false); setEditingLearner(null); }}
/>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Grade</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Start Date</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {learners.map((l) => (
                <tr key={l.learner_id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">{l.first_name} {l.last_name}</td>
                  <td className="px-4 py-3">{l.grade_level || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${l.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(l.start_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 space-x-3">
                    <button onClick={() => handleEdit(l)} className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button onClick={() => handleDelete(l.learner_id)} className="text-red-600 hover:underline text-sm">Delete</button>
                  </td>
                </tr>
              ))}
              {learners.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-gray-400">No learners yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}