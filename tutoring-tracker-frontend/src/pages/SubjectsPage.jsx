import { useState, useEffect } from 'react';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../api/subjects';
import SubjectForm from '../components/SubjectForm';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await getSubjects();
      setSubjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleAdd = () => {
    setEditingSubject(null);
    setShowForm(true);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setShowForm(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.subject_id, formData);
      } else {
        await createSubject(formData);
      }
      setShowForm(false);
      setEditingSubject(null);
      loadSubjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject? This cannot be undone.')) return;
    try {
      await deleteSubject(id);
      loadSubjects();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-end mb-8 pb-4 border-b-2 border-gold">
        <h1 className="text-3xl font-display font-bold text-ink">Subjects</h1>
        {!showForm && (
          <button
            onClick={handleAdd}
            className="bg-ink text-white px-5 py-2.5 rounded-sm hover:bg-ink/90 transition font-medium text-sm tracking-wide"
          >
            + Add Subject
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
          <SubjectForm
            key={editingSubject?.subject_id ?? 'new'}
            initialData={editingSubject}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingSubject(null); }}
          />
        </div>
      )}

      {loading ? (
        <p className="text-slate/60 italic">Loading subjects...</p>
      ) : (
        <div className="bg-white border border-ink/10 rounded-sm overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-ink/10 bg-paper">
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Subject</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Hourly Rate</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider font-semibold text-ink/70">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.subject_id} className="border-b border-ink/5 last:border-0 hover:bg-paper transition">
                  <td className="px-5 py-4 font-medium text-ink">{s.subject_name}</td>
                  <td className="px-5 py-4 text-sm text-slate/70">R{Number(s.hourly_rate).toFixed(2)} / hour</td>
                  <td className="px-5 py-4 space-x-4 text-sm">
                    <button onClick={() => handleEdit(s)} className="text-ink hover:text-gold font-medium transition">Edit</button>
                    <button onClick={() => handleDelete(s.subject_id)} className="text-red-700/70 hover:text-red-700 font-medium transition">Delete</button>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-5 py-12 text-center text-slate/40 italic">
                    No subjects yet — add your first one to get started.
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