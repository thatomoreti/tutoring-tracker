import { useState } from 'react';

const CAPS_SUBJECTS = [
  'Mathematics',
  'Mathematical Literacy',
  'Physical Sciences',
  'Life Sciences',
  'English Home Language',
  'English First Additional Language',
  'Afrikaans',
  'isiZulu',
  'isiXhosa',
  'Sepedi',
  'Setswana',
  'Sesotho',
  'Geography',
  'History',
  'Accounting',
  'Business Studies',
  'Economics',
  'Life Orientation',
  'Information Technology',
  'Computer Applications Technology',
  'Agricultural Sciences',
  'Tourism',
  'Consumer Studies',
  'Engineering Graphics and Design',
  'Visual Arts',
  'Dramatic Arts',
  'Music',
];

const MIN_RATE = 1;
const MAX_RATE = 5000;

function validate(form) {
  const errors = {};

  if (!form.subject_name) {
    errors.subject_name = 'Please select a subject';
  }

  if (!form.hourly_rate) {
    errors.hourly_rate = 'Hourly rate is required';
  } else {
    const rate = Number(form.hourly_rate);
    if (!Number.isFinite(rate) || rate < MIN_RATE || rate > MAX_RATE) {
      errors.hourly_rate = `Rate must be between R${MIN_RATE} and R${MAX_RATE}`;
    } else if (!/^\d+(\.\d{1,2})?$/.test(form.hourly_rate)) {
      errors.hourly_rate = 'Rate can have at most 2 decimal places';
    }
  }

  return errors;
}

export default function SubjectForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    subject_name: initialData?.subject_name || '',
    hourly_rate: initialData?.hourly_rate || '',
  }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const handleRateChange = (e) => {
    // Digits, and at most one decimal point — blocks "12.34.56" and stray characters
    let value = e.target.value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    // Strip leading zeros unless it's "0." (e.g. someone typing "0.5")
    value = value.replace(/^0+(?=\d)/, '');
    setForm({ ...form, hourly_rate: value });
    if (errors.hourly_rate) {
      setErrors({ ...errors, hourly_rate: undefined });
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
      subject_name: form.subject_name,
      hourly_rate: Number(form.hourly_rate),
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

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-ink/10 p-8 rounded-sm shadow-sm space-y-5 max-w-md mx-auto">
      <div>
        <label className={labelClass}>Subject</label>
        <select
          name="subject_name"
          value={form.subject_name}
          onChange={handleChange}
          className={inputClass('subject_name')}
        >
          <option value="">Select a subject...</option>
          {CAPS_SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
        {errors.subject_name && <p className="text-red-600 text-xs mt-1.5">{errors.subject_name}</p>}
      </div>

      <div>
        <label className={labelClass}>Hourly Rate</label>
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-slate/50 font-medium">R</span>
          <input
            name="hourly_rate"
            inputMode="decimal"
            value={form.hourly_rate}
            onChange={handleRateChange}
            placeholder="150"
            className={`${inputClass('hourly_rate')} max-w-[120px]`}
          />
          <span className="text-sm text-slate/50">/ hour</span>
        </div>
        {errors.hourly_rate && <p className="text-red-600 text-xs mt-1.5">{errors.hourly_rate}</p>}
      </div>

      <div className="flex gap-3 pt-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-ink text-white px-5 py-2.5 rounded-sm hover:bg-gold transition font-medium text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving...' : initialData ? 'Update Subject' : 'Add Subject'}
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