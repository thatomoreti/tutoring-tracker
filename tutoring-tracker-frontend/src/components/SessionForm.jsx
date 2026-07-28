import { useState, useEffect } from 'react';
import { getLearners } from '../api/learners';
import { getSubjects } from '../api/subjects';

const DURATION_OPTIONS = [30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240];
const MAX_NOTES_LENGTH = 500;

function formatDuration(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins} min`;
  if (mins === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
  return `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} min`;
}

function validate(form) {
  const errors = {};

  if (!form.learner_id) errors.learner_id = 'Please select a learner';
  if (!form.subject_id) errors.subject_id = 'Please select a subject';

  if (!form.session_date) {
    errors.session_date = 'Session date is required';
  } else {
    const today = new Date().toISOString().slice(0, 10);
    if (form.session_date > today) {
      errors.session_date = 'Session date cannot be in the future';
    }
  }

  if (!form.duration_minutes) {
    errors.duration_minutes = 'Please select a duration';
  }

  if (form.notes && form.notes.length > MAX_NOTES_LENGTH) {
    errors.notes = `Notes must be under ${MAX_NOTES_LENGTH} characters`;
  }

  return errors;
}

export default function SessionForm({ initialData, onSubmit, onCancel }) {
  const [learners, setLearners] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [form, setForm] = useState(() => ({
    learner_id: initialData?.learner_id || '',
    subject_id: initialData?.subject_id || '',
    session_date: initialData?.session_date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    duration_minutes: initialData?.duration_minutes || '',
    attended: initialData?.attended ?? true,
    notes: initialData?.notes || '',
  }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getLearners(), getSubjects()])
      .then(([learnersData, subjectsData]) => {
        setLearners(learnersData);
        setSubjects(subjectsData);
      })
      .finally(() => setLoadingOptions(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      learner_id: Number(form.learner_id),
      subject_id: Number(form.subject_id),
      session_date: form.session_date,
      duration_minutes: Number(form.duration_minutes),
      attended: form.attended,
      notes: form.notes.trim(),
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full border-b-2 px-1 py-2 bg-transparent focus:outline-none transition ${
      errors[field]
        ? 'border-red-400 focus:border-red-500'
        : 'border-ink/15 focus:border-gold'
    }`;

  const labelClass = 'block text-xs uppercase tracking-wider font-semibold text-ink/60 mb-1.5';

  if (loadingOptions) {
    return <p className="text-slate/60 italic max-w-md mx-auto">Loading learners and subjects...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-ink/10 p-8 rounded-sm shadow-sm space-y-5 max-w-md mx-auto">
      <div>
        <label className={labelClass}>Learner</label>
        <select
          name="learner_id"
          value={form.learner_id}
          onChange={handleChange}
          className={inputClass('learner_id')}
        >
          <option value="">Select a learner...</option>
          {learners.map((l) => (
            <option key={l.learner_id} value={l.learner_id}>{l.first_name} {l.last_name}</option>
          ))}
        </select>
        {errors.learner_id && <p className="text-red-600 text-xs mt-1.5">{errors.learner_id}</p>}
      </div>

      <div>
        <label className={labelClass}>Subject</label>
        <select
          name="subject_id"
          value={form.subject_id}
          onChange={handleChange}
          className={inputClass('subject_id')}
        >
          <option value="">Select a subject...</option>
          {subjects.map((s) => (
            <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
          ))}
        </select>
        {errors.subject_id && <p className="text-red-600 text-xs mt-1.5">{errors.subject_id}</p>}
      </div>

      <div>
        <label className={labelClass}>Session Date</label>
        <input
          type="date"
          name="session_date"
          max={new Date().toISOString().slice(0, 10)}
          value={form.session_date}
          onChange={handleChange}
          className={inputClass('session_date')}
        />
        {errors.session_date && <p className="text-red-600 text-xs mt-1.5">{errors.session_date}</p>}
      </div>

      <div>
        <label className={labelClass}>Duration</label>
        <select
          name="duration_minutes"
          value={form.duration_minutes}
          onChange={handleChange}
          className={inputClass('duration_minutes')}
        >
          <option value="">Select duration...</option>
          {DURATION_OPTIONS.map((mins) => (
            <option key={mins} value={mins}>{formatDuration(mins)}</option>
          ))}
        </select>
        {errors.duration_minutes && <p className="text-red-600 text-xs mt-1.5">{errors.duration_minutes}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="attended"
          name="attended"
          checked={form.attended}
          onChange={handleChange}
          className="w-4 h-4 accent-ink"
        />
        <label htmlFor="attended" className="text-sm text-ink font-medium">Learner attended this session</label>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          maxLength={MAX_NOTES_LENGTH}
          rows={3}
          placeholder="What was covered in this session..."
          className={`${inputClass('notes')} resize-none`}
        />
        <p className="text-xs text-slate/40 mt-1">{form.notes.length}/{MAX_NOTES_LENGTH}</p>
        {errors.notes && <p className="text-red-600 text-xs mt-1.5">{errors.notes}</p>}
      </div>

      <div className="flex gap-3 pt-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-ink text-white px-5 py-2.5 rounded-sm hover:bg-gold transition font-medium text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving...' : initialData ? 'Update Session' : 'Log Session'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="text-slate/60 px-5 py-2.5 hover:text-ink transition font-medium text-sm disabled:opacity-40"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}