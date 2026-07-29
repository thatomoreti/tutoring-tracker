import { useState, useEffect } from 'react';
import { getLearners } from '../api/learners';

function validate(form) {
  const errors = {};

  if (!form.learner_id) errors.learner_id = 'Please select a learner';

  if (!form.period_start) {
    errors.period_start = 'Period start is required';
  }
  if (!form.period_end) {
    errors.period_end = 'Period end is required';
  } else if (form.period_start && form.period_end < form.period_start) {
    errors.period_end = 'Period end must be after period start';
  }

  if (!form.due_date) {
    errors.due_date = 'Due date is required';
  } else if (form.period_end && form.due_date < form.period_end) {
    errors.due_date = 'Due date should be on or after the period end';
  }

  return errors;
}

export default function GenerateInvoiceForm({ onSubmit, onCancel }) {
  const [learners, setLearners] = useState([]);
  const [loadingLearners, setLoadingLearners] = useState(true);
  const [form, setForm] = useState({
    learner_id: '',
    period_start: '',
    period_end: '',
    due_date: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    getLearners().then(setLearners).finally(() => setLoadingLearners(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined });
    setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      await onSubmit({ ...form, learner_id: Number(form.learner_id) });
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

  if (loadingLearners) {
    return <p className="text-slate/60 italic max-w-md mx-auto">Loading learners...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-ink/10 p-8 rounded-sm shadow-sm space-y-5 max-w-md mx-auto">
      {serverError && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-800 px-4 py-3 text-sm">
          {serverError}
        </div>
      )}

      <div>
        <label className={labelClass}>Learner</label>
        <select name="learner_id" value={form.learner_id} onChange={handleChange} className={inputClass('learner_id')}>
          <option value="">Select a learner...</option>
          {learners.map((l) => (
            <option key={l.learner_id} value={l.learner_id}>{l.first_name} {l.last_name}</option>
          ))}
        </select>
        {errors.learner_id && <p className="text-red-600 text-xs mt-1.5">{errors.learner_id}</p>}
      </div>

      <div>
        <label className={labelClass}>Period Start</label>
        <input type="date" name="period_start" value={form.period_start} onChange={handleChange} className={inputClass('period_start')} />
        {errors.period_start && <p className="text-red-600 text-xs mt-1.5">{errors.period_start}</p>}
      </div>

      <div>
        <label className={labelClass}>Period End</label>
        <input type="date" name="period_end" value={form.period_end} onChange={handleChange} className={inputClass('period_end')} />
        {errors.period_end && <p className="text-red-600 text-xs mt-1.5">{errors.period_end}</p>}
      </div>

      <div>
        <label className={labelClass}>Due Date</label>
        <input type="date" name="due_date" value={form.due_date} onChange={handleChange} className={inputClass('due_date')} />
        {errors.due_date && <p className="text-red-600 text-xs mt-1.5">{errors.due_date}</p>}
      </div>

      <div className="flex gap-3 pt-3">
        <button type="submit" disabled={submitting} className="bg-ink text-white px-5 py-2.5 rounded-sm hover:bg-gold transition font-medium text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed">
          {submitting ? 'Generating...' : 'Generate Invoice'}
        </button>
        <button type="button" onClick={onCancel} disabled={submitting} className="text-slate/60 px-5 py-2.5 hover:text-ink transition font-medium text-sm disabled:opacity-40">
          Cancel
        </button>
      </div>
    </form>
  );
}